import type OpenAI from "openai";

export interface Tool<TArgs extends any[] = any> {
  config: OpenAI.Beta.Assistants.AssistantTool;
  method: (...args: TArgs) => Promise<string>;
  validateArgs?: (...args: any[]) => TArgs;
}

export type Registry<N extends string = string, T extends Tool = Tool> = Record<
  N,
  T
>;

export interface ToolConfigOptions {
  description: string;
  parameters: OpenAI.Beta.Assistants.FunctionTool["function"]["parameters"];
}
