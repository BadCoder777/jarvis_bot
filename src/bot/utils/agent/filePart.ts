import type { FilePartInput } from "@opencode-ai/sdk";

export const filePart = (base64: string, mime: string): FilePartInput => {
  return { type: "file", url: base64, mime };
};
