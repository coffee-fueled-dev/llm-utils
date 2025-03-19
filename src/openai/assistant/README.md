# Assistant

The `Assistant` class is a wrapper around OpenAI's Assistant API, providing a convenient interface for creating, managing, and interacting with OpenAI Assistants.

## Overview

This class encapsulates an assistant, its conversation thread, and the available toolkit. It handles sending messages to the thread, processing any tool calls, and can provide incremental progress updates via an event handler.

## Features

- Create and manage OpenAI Assistants
- Send and receive messages in threads
- Process function calls using integrated toolkits
- Track assistant states and handle runs
- Switch conversation threads
- Report progress during assistant operations

## Usage

### Creating an Assistant

```typescript
import { Assistant, openai } from '@coffee-fueled-dev/llm-utils';

const assistant = await Assistant.create({
  openai,
  name: "My Assistant",
  assistantParams: {
    // Use existing assistant ID
    id: "asst_abc123"
    // OR create a new assistant
    model: "gpt-4o",
    instructions: "You are a helpful assistant."
  },
  threadParams: {
    // Use existing thread ID
    id: "thread_xyz789"
    // OR create a new thread
    messages: [
      { role: "user", content: "Let's start a conversation." }
    ]
  }
});
```

### Sending Messages

```typescript
const response = await assistant.message({
  content: "What's the weather like today?",
});

// Access the response content
if (response.response) {
  console.log(response.response.content);
} else {
  console.error("Errors:", response.errors);
}
```

### Working with Toolkits

```typescript
import { Assistant, Toolkit, openai } from "@coffee-fueled-dev/llm-utils";

// Create a toolkit (see Toolkit documentation)
const myToolkit = new Toolkit();
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
  toolkit: myToolkit,
});

// The assistant will now have access to the tools in the toolkit
const response = await assistant.message({
  content: "Please use one of your tools.",
});
```

### Changing Threads

```typescript
import { createOrRetrieveThread } from "@coffee-fueled-dev/llm-utils";

// Create a new thread
const newThread = await createOrRetrieveThread({});

// Set the assistant to use the new thread
assistant.setThread(newThread);

// Now the assistant will use the new thread for conversations
const response = await assistant.message({
  content: "This is a message in the new thread.",
});
```

### Progress Reporting

```typescript
const assistant = await Assistant.create({
  // ... other parameters
  reportProgress: (progress) => {
    console.log(`Status: ${progress.status}`);
    if (progress.toolCalls) {
      console.log("Tool calls:", progress.toolCalls);
    }
  },
});
```

## Properties

- `busy`: Boolean indicating if the assistant is currently processing a run
- `run`: The current run object, if available
- `openai`: The OpenAI instance being used
- `assistant`: The underlying OpenAI Assistant object
- `thread`: The current conversation thread
- `name`: The name of the assistant
- `toolkit`: Optional toolkit for handling function calls

## Methods

- `static create()`: Creates a new Assistant instance
- `message()`: Sends a message to the assistant and returns the response
- `setThread()`: Sets a new thread for the assistant to use for subsequent messages
