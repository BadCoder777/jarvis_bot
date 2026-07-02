import type {
  AgentPartInput,
  FilePartInput,
  SubtaskPartInput,
  TextPartInput,
} from "@opencode-ai/sdk";

export type Part =
  TextPartInput | FilePartInput | AgentPartInput | SubtaskPartInput;
