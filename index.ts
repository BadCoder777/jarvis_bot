import { createOpencodeClient } from "@opencode-ai/sdk";
import { startBot } from "./src/bot/bot";
import { State } from "./src/state/state";
import { startServer } from "./src/server/server";

const app = () => {
  const opencode = createOpencodeClient({
    baseUrl: process.env.OPEN_CODE_BASE_URL,
  });

  const apiKey: string | undefined = process.env.TELEGRAM_BOT_API_KEY;

  if (!apiKey) return;

  const state = new State(null, apiKey, opencode);

  startBot(state);
  startServer(state);
};

app();
