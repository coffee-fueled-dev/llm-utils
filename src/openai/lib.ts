import OpenAI from "openai";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const ERROR_MESSAGES = {
  GET_EXPECTED_LAST_MESSAGE: {
    FAILED_TO_GET_EXPECTED_LAST_MESSAGE: (error: unknown) =>
      `Failed to get text response:\n${
        error instanceof Error ? error.message : String(error)
      }`,
  },
  GET_MESSAGE: {
    FAILED_TO_GET_MESSAGE: (
      { run, role, n }: MessageSpecifier,
      error: unknown
    ) =>
      `Failed to get message, ${n} in run, ${run.id} by role, ${role}:\n${
        error instanceof Error ? error.message : String(error)
      }`,
    NO_MESSAGES_IN_RUN: "No messages in run.",
    NO_MESSAGES_BY_ROLE: "No messages in run by role.",
    NO_MESSAGE_N: "No message N in run by role.",
  },
} as const;

export const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

export const embeddingModel: OpenAI.EmbeddingModel = "text-embedding-3-small";

export async function uploadFile(params: OpenAI.FileCreateParams) {
  try {
    // Upload the file using the OpenAI Files API.
    // Wrap the blob in an async function that returns it.
    const fileResponse = await openai.files.create(params);

    // Use the uploaded file to create a vector store.
    const vectorStoreResponse = await openai.vectorStores.create({
      file_ids: [fileResponse.id],
    });

    return vectorStoreResponse;
  } catch (error) {
    console.error("Error uploading file as blob:", error);
    throw error;
  }
}

export type AssistantCreateOrRetrieveParams =
  | OpenAI.Beta.Assistants.AssistantCreateParams
  | { id: string };
export const createOrRetrieveAssistant = async (
  params: AssistantCreateOrRetrieveParams,
  requestOptions?: OpenAI.RequestOptions
): Promise<OpenAI.Beta.Assistant> => {
  let a: OpenAI.Beta.Assistants.Assistant;
  if ("id" in params) {
    a = await openai.beta.assistants.retrieve(params.id);
  } else {
    a = await openai.beta.assistants.create(params, requestOptions);
  }
  return a;
};

export type ThreadCreateOrRetrieveParams =
  | OpenAI.Beta.ThreadCreateParams
  | { id: string };
export const createOrRetrieveThread = async (
  params: ThreadCreateOrRetrieveParams,
  requestOptions?: OpenAI.RequestOptions
): Promise<OpenAI.Beta.Thread> => {
  let t: OpenAI.Beta.Thread;
  if ("id" in params) {
    t = await openai.beta.threads.retrieve(params.id);
  } else {
    t = await openai.beta.threads.create(params, requestOptions);
  }
  return t;
};

export type VectorStoreCreateOrRetrieveParams =
  | OpenAI.VectorStores.VectorStoreCreateParams
  | { id: string };
export const createOrRetrieveVectorStore = async (
  params: VectorStoreCreateOrRetrieveParams,
  requestOptions?: OpenAI.RequestOptions
): Promise<OpenAI.VectorStores.VectorStore> => {
  let v: OpenAI.VectorStores.VectorStore;
  if ("id" in params) {
    v = await openai.vectorStores.retrieve(params.id);
  } else {
    v = await openai.vectorStores.create(params, requestOptions);
  }
  return v;
};

// Get the text content from a message, assuming that message was of type text
export const textContent = (
  messagecontent?: OpenAI.Beta.Threads.Messages.MessageContent
): OpenAI.Beta.Threads.Messages.TextContentBlock | undefined =>
  messagecontent?.type === "text" ? messagecontent : undefined;

// Get the expected last message by an assistant from a run
export interface GetExpectedLastMessageProps {
  messages: OpenAI.Beta.Threads.Messages.MessagesPage;
  run: OpenAI.Beta.Threads.Run;
}
export function getExpectedLastMessage({
  messages,
  run,
}: GetExpectedLastMessageProps): OpenAI.Beta.Threads.Message {
  try {
    const lastMessageForRun = getMessage({
      messages,
      specifier: { n: "last", role: "assistant", run: run },
    });
    return lastMessageForRun;
  } catch (error) {
    throw new Error(
      ERROR_MESSAGES.GET_EXPECTED_LAST_MESSAGE.FAILED_TO_GET_EXPECTED_LAST_MESSAGE(
        error
      )
    );
  }
}

// Get a specific message from a run using a specifier
export interface MessageSpecifier {
  n: number | "first" | "last";
  role: OpenAI.Beta.Threads.Message["role"];
  run: OpenAI.Beta.Threads.Run;
}
export interface GetMessageProps {
  messages: OpenAI.Beta.Threads.Messages.MessagesPage;
  specifier: MessageSpecifier;
}
export const getMessage = ({
  messages,
  specifier,
}: GetMessageProps): OpenAI.Beta.Threads.Messages.Message => {
  const { role, n, run } = specifier;
  let filteredMessages: OpenAI.Beta.Threads.Messages.Message[] = [];
  try {
    filteredMessages = messages.data.filter(
      (message) => message.run_id === run.id
    );
    if (!(filteredMessages.length > 0))
      throw new Error(ERROR_MESSAGES.GET_MESSAGE.NO_MESSAGES_IN_RUN);
    filteredMessages = messages.data.filter((message) => message.role === role);
    if (!(filteredMessages.length > 0))
      throw new Error(ERROR_MESSAGES.GET_MESSAGE.NO_MESSAGES_BY_ROLE);

    if (n === "first") {
      return filteredMessages.shift()!;
    } else if (n === "last") {
      return filteredMessages.pop()!;
    } else {
      if (!filteredMessages[n])
        throw new Error(ERROR_MESSAGES.GET_MESSAGE.NO_MESSAGE_N);
      return filteredMessages[n];
    }
  } catch (error) {
    throw new Error(
      ERROR_MESSAGES.GET_MESSAGE.FAILED_TO_GET_MESSAGE({ run, role, n }, error)
    );
  }
};
