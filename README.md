# LLM Utilities (@coffee-fueled-dev/llm-utils)

A TypeScript library providing utilities for working with Large Language Models (LLMs), with a focus on OpenAI's API. This package simplifies the process of creating, managing, and interacting with OpenAI assistants, threads, tools, and vector stores.

## Installation

```bash
# Using npm
npm install @coffee-fueled-dev/llm-utils

# Using yarn
yarn add @coffee-fueled-dev/llm-utils

# Using bun
bun add @coffee-fueled-dev/llm-utils
```

## Features

- **OpenAI API Integration**: Simplified interfaces for working with OpenAI models
- **Assistant Management**: Create, retrieve, and interact with OpenAI Assistants
- **Toolkit System**: Extensible toolkit framework for function calling
- **Vector Store Utilities**: Helper functions for working with embeddings and vector stores
- **Message Handling**: Utility functions for processing assistant messages and responses

## Usage

### Basic Example

```typescript
import { Assistant, openai } from "@coffee-fueled-dev/llm-utils";

// Create a new assistant
const assistant = await Assistant.create({
  openai,
  name: "My Assistant",
  assistantParams: {
    model: "gpt-4o",
    instructions: "You are a helpful assistant.",
  },
  threadParams: {},
});

// Send a message to the assistant
const response = await assistant.message({
  content: "Hello, how can you help me today?",
});

console.log(response.response.content);
```

### Using Toolkits

```typescript
import { Assistant, Toolkit, openai } from "@coffee-fueled-dev/llm-utils";

// Create a custom toolkit
const myToolkit = new Toolkit();
myToolkit.registerTool("calculator", (name) => ({
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
    return { result: eval(expression) };
  },
}));

// Create an assistant with the toolkit
const assistantWithTools = await Assistant.create({
  openai,
  name: "Calculator Assistant",
  assistantParams: {
    model: "gpt-4o",
    instructions: "You are an assistant that can perform calculations.",
  },
  threadParams: {},
  toolkit: myToolkit,
});
```

## Modules

- [Assistant](./src/openai/assistant/README.md): Class for managing OpenAI assistants and threads
- [Toolkit](./src/openai/toolkit/README.md): Class for creating and managing function tools
- [OpenAI Utilities](./src/openai/README.md): Helper functions for working with OpenAI APIs

## Development

```bash
# Install dependencies
bun install

# Build the project
bun run build

# Run tests
bun run test
```

## License

MIT
