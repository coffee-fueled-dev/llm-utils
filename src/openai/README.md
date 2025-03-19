# OpenAI Utilities

A collection of helper functions and utilities for working with the OpenAI API, particularly focused on assistants, threads, messages, and vector stores.

## Overview

These utilities provide simplified interfaces for common operations with the OpenAI API, reducing boilerplate code and making it easier to work with OpenAI's various services.

## Core Functions

### OpenAI Instance

```typescript
import { openai } from "@coffee-fueled-dev/llm-utils";

// Pre-configured OpenAI instance using process.env.OPENAI_API_KEY
const response = await openai.chat.completions.create({
  model: "gpt-4o",
  messages: [{ role: "user", content: "Hello!" }],
});
```

### Assistants

```typescript
import { createOrRetrieveAssistant } from "@coffee-fueled-dev/llm-utils";

// Create a new assistant
const newAssistant = await createOrRetrieveAssistant({
  model: "gpt-4o",
  instructions: "You are a helpful assistant.",
});

// Retrieve an existing assistant
const existingAssistant = await createOrRetrieveAssistant({
  id: "asst_abc123",
});
```

### Threads

```typescript
import { createOrRetrieveThread } from "@coffee-fueled-dev/llm-utils";

// Create a new thread
const newThread = await createOrRetrieveThread({
  messages: [{ role: "user", content: "Hello, assistant!" }],
});

// Retrieve an existing thread
const existingThread = await createOrRetrieveThread({
  id: "thread_xyz789",
});
```

### Vector Stores

```typescript
import {
  createOrRetrieveVectorStore,
  uploadFile,
} from "@coffee-fueled-dev/llm-utils";

// Upload a file and create a vector store from it
const fileBlob = new Blob(["content to embed"], { type: "text/plain" });
const vectorStore = await uploadFile({
  file: fileBlob,
  purpose: "vector_store",
});

// Create a new vector store
const newVectorStore = await createOrRetrieveVectorStore({
  file_ids: ["file_abc123"],
});

// Retrieve an existing vector store
const existingVectorStore = await createOrRetrieveVectorStore({
  id: "vs_xyz789",
});
```

### Message Handling

```typescript
import {
  textContent,
  getMessage,
  getExpectedLastMessage,
} from "@coffee-fueled-dev/llm-utils";

// Extract text content from a message
const content = textContent(message.content[0]);
if (content) {
  console.log(content.text.value);
}

// Get a specific message from a thread's message history
const firstUserMessage = getMessage({
  messages: threadMessages,
  specifier: {
    run: currentRun,
    role: "user",
    n: "first",
  },
});

// Get the last assistant message from a run
const lastAssistantMessage = getExpectedLastMessage({
  messages: threadMessages,
  run: currentRun,
});
```

## Advanced Usage

### Working with Run States

The utilities provide several functions for working with OpenAI Assistant runs, including handling tool calls, checking run statuses, and retrieving messages associated with runs.

### Error Handling

The utility functions include comprehensive error handling, with descriptive error messages to help diagnose issues when working with the OpenAI API.

## Function Reference

### Assistant and Thread Management

- `createOrRetrieveAssistant`: Create a new assistant or retrieve an existing one
- `createOrRetrieveThread`: Create a new thread or retrieve an existing one
- `createOrRetrieveVectorStore`: Create a new vector store or retrieve an existing one
- `uploadFile`: Upload a file to OpenAI and create a vector store from it

### Message Handling

- `textContent`: Extract text content from a message
- `getMessage`: Get a specific message from a thread based on criteria
- `getExpectedLastMessage`: Get the expected last message by an assistant from a run

### Constants

- `openai`: Pre-configured OpenAI instance using the API key from environment
- `embeddingModel`: Default embedding model ("text-embedding-3-small")
