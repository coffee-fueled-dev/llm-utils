# Toolkit

The `Toolkit` class provides a registry system for managing OpenAI function tools. It allows you to create, register, and organize tools that can be used by an OpenAI Assistant for function calling.

## Overview

This class serves as a container for tools that can be passed to an Assistant. It provides methods for registering new tools, merging toolkits, and retrieving tools by name.

## Features

- Register function tools with a simple API
- Merge multiple toolkits together
- Retrieve specific tools by name
- Get a list of all registered tools

## Usage

### Creating a Basic Toolkit

```typescript
import { Toolkit } from "@coffee-fueled-dev/llm-utils";

// Create a new toolkit
const toolkit = new Toolkit();

// Register a simple tool
toolkit.registerTool("hello_world", (name) => ({
  type: "function",
  function: {
    name,
    description: "Say hello to someone",
    parameters: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description: "The name of the person to greet",
        },
      },
      required: ["name"],
    },
  },
  execute: async ({ name }) => {
    return { message: `Hello, ${name}!` };
  },
}));
```

### Creating a Tool with Custom Logic

```typescript
import { Toolkit } from "@coffee-fueled-dev/llm-utils";

const toolkit = new Toolkit();

// Register a calculator tool
toolkit.registerTool("calculator", (name) => ({
  type: "function",
  function: {
    name,
    description: "Perform basic calculations",
    parameters: {
      type: "object",
      properties: {
        expression: {
          type: "string",
          description: "The mathematical expression to evaluate",
        },
      },
      required: ["expression"],
    },
  },
  execute: async ({ expression }) => {
    try {
      // Note: eval is used for demonstration purposes only
      // In production, use a safer method to evaluate expressions
      const result = eval(expression);
      return { result };
    } catch (error) {
      return { error: "Invalid expression" };
    }
  },
}));
```

### Using the Toolkit with an Assistant

```typescript
import { Assistant, Toolkit, openai } from "@coffee-fueled-dev/llm-utils";

// Create a toolkit with tools
const toolkit = new Toolkit();
// Register tools...

// Create an assistant with the toolkit
const assistant = await Assistant.create({
  openai,
  name: "Tool-enabled Assistant",
  assistantParams: {
    model: "gpt-4o",
    instructions: "You are an assistant with access to tools.",
  },
  threadParams: {},
  toolkit: toolkit,
});

// The assistant will now be able to use the registered tools
const response = await assistant.message({
  content: "Calculate 2 + 2",
});
```

### Merging Multiple Toolkits

```typescript
import { Toolkit } from "@coffee-fueled-dev/llm-utils";

// Create separate toolkits for different purposes
const mathToolkit = new Toolkit();
// Register math-related tools...

const weatherToolkit = new Toolkit();
// Register weather-related tools...

// Create a combined toolkit
const combinedToolkit = new Toolkit();

// Merge the separate toolkits into the combined one
combinedToolkit.merge(mathToolkit.listTools());
combinedToolkit.merge(weatherToolkit.listTools());

// Now combinedToolkit has all the tools from both mathToolkit and weatherToolkit
```

### Retrieving Tools

```typescript
import { Toolkit } from "@coffee-fueled-dev/llm-utils";

const toolkit = new Toolkit();
// Register tools...

// Get a specific tool by name
const calculatorTool = toolkit.getTool("calculator");
if (calculatorTool) {
  // Use the tool directly
  const result = await calculatorTool.execute({ expression: "2 + 2" });
  console.log(result); // { result: 4 }
}

// List all available tools
const allTools = toolkit.listTools();
console.log(Object.keys(allTools)); // ["calculator", ...]
```

## Methods

- `registerTool()`: Registers a new tool with the toolkit
- `merge()`: Merges another tool registry into the current one
- `getTool()`: Retrieves a tool by name from the registry
- `listTools()`: Returns all registered tools as a registry object
