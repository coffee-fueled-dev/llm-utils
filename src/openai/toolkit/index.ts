import type { Tool, Registry } from "./interfaces";
import { mergeTools, registerToolWithName } from "./lib";
export * from "./lib";

export class Toolkit {
  private registry: Record<string, Tool> = {};

  /**
   * Registers a new tool by name using the provided tool factory and arguments.
   * Delegates to the registerToolWithName function, then merges the result.
   */
  public registerTool<N extends string, A extends any[], T extends Tool>(
    name: N,
    toolFactory: (name: N, ...args: A) => T,
    ...args: A
  ): void {
    const toolObject = registerToolWithName(name, toolFactory, ...args);
    // Merge the new tool into the registry using the mergeTools function.
    this.registry = mergeTools(this.registry, toolObject);
  }

  /**
   * Merges another tool registry into the current one.
   * Delegates to the mergeTools function.
   */
  public merge(registry: Registry): void {
    this.registry = mergeTools(this.registry, registry);
  }

  /**
   * Retrieves a tool by name from the registry.
   */
  public getTool(name: string): Tool | undefined {
    return this.registry[name];
  }

  /**
   * Lists all registered tools.
   */
  public listTools(): Registry {
    return this.registry;
  }
}
