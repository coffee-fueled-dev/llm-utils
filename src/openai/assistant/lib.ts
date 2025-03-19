import type OpenAI from "openai";
import { getExpectedLastMessage } from "../lib";
import type {
  GetAssistantResponse,
  GetToolCallOutput,
  ResolveToolCalls,
} from "./interfaces";

const ERROR_MESSAGES = {
  GET_MESSAGE_RESPONSE: {
    FAILED_TO_GET_MESSAGE_RESPONSE: (error: unknown) =>
      `Run failed:\n${error instanceof Error ? error.message : String(error)}`,
    MISSING_TOOLS: "Run requires tool calls but no tools were available.",
  },
  RESOLVE_TOOL_CALLS: {
    FAILED_TO_RESOLVE_TOOL_CALLS: (error: unknown) =>
      `Failed to complete tool call:\n${
        error instanceof Error ? error.message : String(error)
      }`,
    NO_ACTION_PROVIDED:
      "A message status had requires_action but provided no action.",
  },
  GET_TOOL_CALL_OUTPUT: {
    UNRECOGNIZED_TOOL: (toolName: string) =>
      `Unrecognized tool call: ${toolName}`,
    FAILED_TOOL_CALL: (error: unknown) =>
      `Failed to complete tool call: ${
        error instanceof Error ? error.message : String(error)
      }`,
    NO_RESPONSE: (toolName: string) =>
      `Received no output from tool ${toolName}`,
  },
} as const;

export const getAssistantResponse: GetAssistantResponse = async ({
  message,
  assistant,
  requestOptions,
  setActiveRun,
}) => {
  try {
    await assistant.openai.beta.threads.messages.create(
      assistant.thread.id,
      message,
      requestOptions
    );

    setActiveRun(
      await assistant.openai.beta.threads.runs.createAndPoll(
        assistant.thread.id,
        {
          assistant_id: assistant.assistant.id,
        }
      )
    );

    // If the assistant requires tool calls, resolve them.
    if (assistant.run?.status === "requires_action") {
      const toolCalls =
        assistant.run?.required_action?.submit_tool_outputs.tool_calls!;
      const toolkit = assistant.toolkit;
      if (!toolkit)
        throw new Error(ERROR_MESSAGES.GET_MESSAGE_RESPONSE.MISSING_TOOLS);

      setActiveRun(
        await resolveToolCalls({
          run: assistant.run!,
          toolCalls,
          assistant,
          toolkit,
          openai: assistant.openai,
        })
      );
    }

    // Retrieve all messages from the thread and return the last assistant message.
    const messages = await assistant.openai.beta.threads.messages.list(
      assistant.thread.id
    );
    return getExpectedLastMessage({ messages, run: assistant.run! });
  } catch (error) {
    throw new Error(
      ERROR_MESSAGES.GET_MESSAGE_RESPONSE.FAILED_TO_GET_MESSAGE_RESPONSE(error)
    );
  }
};

export const resolveToolCalls: ResolveToolCalls = async (props) => {
  const { run, toolCalls, openai, assistant, toolkit } = props;
  try {
    const toolOutputs: OpenAI.Beta.Threads.Runs.RunSubmitToolOutputsParams.ToolOutput[] =
      [];

    for (const call of toolCalls) {
      const toolCallMsg = `\nTOOL CALL: ${call.function.name}\nARGUMENTS: ${call.function.arguments}\nBY ASSISTANT: ${assistant.name}`;
      assistant.reportProgress?.({ message: toolCallMsg, type: "tool-call" });

      const output = await getToolCallOutput({ call, toolkit });
      toolOutputs.push(output);

      assistant.reportProgress?.({
        message: output.output!,
        type: "tool-response",
      });
    }

    const toolResponse =
      await openai.beta.threads.runs.submitToolOutputsAndPoll(
        assistant.thread.id,
        run.id,
        { tool_outputs: toolOutputs }
      );

    if (toolResponse.status === "requires_action") {
      const newToolCalls =
        toolResponse.required_action?.submit_tool_outputs.tool_calls;
      if (!newToolCalls)
        throw new Error(ERROR_MESSAGES.RESOLVE_TOOL_CALLS.NO_ACTION_PROVIDED);

      return await resolveToolCalls({
        ...props,
        run: toolResponse,
        toolCalls: newToolCalls,
      });
    }
    return toolResponse;
  } catch (error) {
    await assistant.openai.beta.threads.runs.cancel(
      assistant.thread.id,
      run.id
    );
    throw new Error(
      ERROR_MESSAGES.RESOLVE_TOOL_CALLS.FAILED_TO_RESOLVE_TOOL_CALLS(error)
    );
  }
};

const getToolCallOutput: GetToolCallOutput = async ({ call, toolkit }) => {
  const toolOutput: OpenAI.Beta.Threads.Runs.RunSubmitToolOutputsParams.ToolOutput =
    { tool_call_id: call.id, output: undefined };
  try {
    const tool = toolkit.getTool(call.function.name);
    if (!tool) {
      throw new Error(
        ERROR_MESSAGES.GET_TOOL_CALL_OUTPUT.UNRECOGNIZED_TOOL(
          call.function.name
        )
      );
    }
    const unvalidatedArgs = JSON.parse(call.function.arguments);
    const output = await tool.method(
      tool.validateArgs?.(unvalidatedArgs) || unvalidatedArgs
    );
    const nullResponseMessage = ERROR_MESSAGES.GET_TOOL_CALL_OUTPUT.NO_RESPONSE(
      call.function.name
    );
    const cleanOutput =
      output === null || output === undefined ? nullResponseMessage : output;

    toolOutput.output = cleanOutput;
  } catch (error) {
    const errOutput =
      ERROR_MESSAGES.GET_TOOL_CALL_OUTPUT.FAILED_TOOL_CALL(error);
    toolOutput.output = errOutput;
  } finally {
    return toolOutput;
  }
};
