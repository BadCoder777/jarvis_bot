import type { TextPartInput } from "@opencode-ai/sdk";

export const textPart = (text: string): TextPartInput => {
  return { type: "text", text };
};
