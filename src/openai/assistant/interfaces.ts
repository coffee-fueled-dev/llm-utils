import OpenAI from "openai";
import type {
  AssistantCreateOrRetrieveParams,
  ThreadCreateOrRetrieveParams,
} from "../lib";
import type { Assistant } from ".";
import { Toolkit } from "../toolkit";

export interface AssistantCreateParams<
  T extends Toolkit | undefined = undefined
> {
  assistantCreateOrRetrieveParams: AssistantCreateOrRetrieveParams;
  threadCreateOrRetrieveParams: ThreadCreateOrRetrieveParams;
  toolkit?: T;
}

export interface ProgressMessage {
  message: string;
  type: "assistant-response" | "tool-call" | "tool-response" | "error";
  errors?: Error[];
}
export type ProgressHandler = (props: ProgressMessage) => void;

export interface AssistantAsToolDefinition<T extends string = string> {
  name: T;
  description: string;
  messageDescription: string;
}

export interface CreateAssistantProps<T extends Toolkit> {
  openai: OpenAI;
  assistantParams: AssistantCreateOrRetrieveParams;
  threadParams: ThreadCreateOrRetrieveParams;
  toolkit?: T;
  name: string;
  requestOptions?: OpenAI.RequestOptions;
  reportProgress?: ProgressHandler;
}

export interface GetAssistantResponseProps {
  message: OpenAI.Beta.Threads.Messages.MessageCreateParams;
  assistant: Assistant;
  requestOptions?: OpenAI.RequestOptions;
  setActiveRun: (run: OpenAI.Beta.Threads.Run) => void;
}
export type GetAssistantResponse = (
  props: GetAssistantResponseProps
) => Promise<OpenAI.Beta.Threads.Message>;

export interface ResolveToolCallsProps {
  run: OpenAI.Beta.Threads.Run;
  toolCalls: OpenAI.Beta.Threads.Runs.RequiredActionFunctionToolCall[];
  openai: OpenAI;
  assistant: Assistant;
  toolkit: Toolkit;
}
export type ResolveToolCalls = (
  props: ResolveToolCallsProps
) => Promise<OpenAI.Beta.Threads.Run>;

export interface GetToolCallOutputProps {
  call: OpenAI.Beta.Threads.Runs.RequiredActionFunctionToolCall;
  toolkit: Toolkit;
}
export type GetToolCallOutput = (
  props: GetToolCallOutputProps
) => Promise<OpenAI.Beta.Threads.Runs.RunSubmitToolOutputsParams.ToolOutput>;
