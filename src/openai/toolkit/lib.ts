import type OpenAI from "openai";
import type { Tool, ToolConfigOptions, Registry } from "./interfaces";

export function registerToolWithName<
  N extends string,
  A extends any[],
  T extends Tool
>(
  name: N,
  toolFactory: (name: N, ...args: A) => T,
  ...args: A
): { [K in N]: T } {
  return { [name]: toolFactory(name, ...args) } as { [K in N]: T };
}

export function createToolConfig<TName extends string>(
  toolName: TName,
  options: ToolConfigOptions
): OpenAI.Beta.Assistants.AssistantTool {
  return {
    type: "function",
    function: {
      name: toolName,
      description: options.description,
      parameters: options.parameters,
    },
  };
}

export function mergeTools(...registries: Registry[]): Registry {
  return registries.reduce((acc, reg) => ({ ...acc, ...reg }), {} as Registry);
}
