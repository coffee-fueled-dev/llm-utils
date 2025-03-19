import type OpenAI from "openai";
import { createOrRetrieveAssistant, createOrRetrieveThread } from "../lib";
import { getAssistantResponse } from "./lib";
import type { CreateAssistantProps, ProgressHandler } from "./interfaces";
import { Toolkit } from "../toolkit";
export * from "./lib";

/**
 * The Assistant class encapsulates an assistant, its conversation thread, and the available toolkit.
 * It sends messages to the thread, processes any tool calls, and pipes incremental progress
 * messages via an event handler.
 */
export class Assistant<T extends Toolkit = Toolkit> {
  public busy: boolean = false;
  public run: OpenAI.Beta.Threads.Run | undefined;

  private constructor(
    public readonly openai: OpenAI,
    public readonly assistant: OpenAI.Beta.Assistant,
    public thread: OpenAI.Beta.Thread,
    public readonly name: string,
    public readonly toolkit?: T,
    public reportProgress?: ProgressHandler
  ) {}

  /**
   * @description Creates an instance of Assistant.
   * @param param0
   * @returns An instance of an Assistant
   */
  static async create<T extends Toolkit>({
    openai,
    assistantParams,
    threadParams,
    toolkit,
    name,
    requestOptions,
    reportProgress,
  }: CreateAssistantProps<T>): Promise<Assistant<T>> {
    const [assistant, thread] = await Promise.all([
      createOrRetrieveAssistant(assistantParams, requestOptions),
      createOrRetrieveThread(threadParams, requestOptions),
    ]);

    return new Assistant<T>(
      openai,
      assistant,
      thread,
      name,
      toolkit,
      reportProgress
    );
  }

  /**
   * @description Sends a message to the assistant and returns the assistant's response.
   * @param message
   * @param requestOptions
   * @returns A response containing the response message or error messages
   */
  public async message(
    message: OpenAI.Beta.Threads.Messages.MessageCreateParams,
    requestOptions?: OpenAI.RequestOptions
  ): Promise<
    | {
        response: OpenAI.Beta.Threads.Message;
        errors?: undefined;
      }
    | {
        response?: undefined;
        errors: string[];
      }
  > {
    if (this.busy) return { errors: [ERROR_MESSAGES.MESSAGE.RUN_IN_PROGRESS] };
    try {
      const response = await getAssistantResponse({
        assistant: this,
        message,
        requestOptions,
        setActiveRun: this.setActiveRun,
      });
      return { response };
    } finally {
      this.busy = false;
    }
  }

  /**
   * @description Sets a new thread for an assistant to use for subsequent messages.
   * @param thread
   * @returns The thread that was set or undefined if setThread was called while the assistant was busy.
   */
  public setThread(thread: OpenAI.Beta.Thread) {
    try {
      if (this.busy) throw new Error(ERROR_MESSAGES.SET_THREAD.RUN_IN_PROGRESS);
      this.thread = thread;
      return thread;
    } catch (error) {
      console.error(error);
      return undefined;
    }
  }

  private setActiveRun(run: OpenAI.Beta.Threads.Run) {
    this.run = run;
  }
}

const ERROR_MESSAGES = {
  SET_THREAD: {
    RUN_IN_PROGRESS: "Cannot set a new thread while a run is in progress.",
  },
  MESSAGE: {
    RUN_IN_PROGRESS: "Cannot send a new message while a run is in progress.",
  },
};
