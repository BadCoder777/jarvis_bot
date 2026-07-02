import type { OpencodeClient } from "@opencode-ai/sdk";
import prompt from "./systemPrompt.txt";
import { OpenRouter } from "@openrouter/sdk";
import ocrPrompt from "./systemOcr.txt";

interface AlbumBucket {
  timer: Timer;
  fileIds: string[];
}

export class State {
  private currentSessionId: string;
  private telegramBotApiKey: string;
  private opencodeClient: OpencodeClient;
  private openRouterClient = new OpenRouter({
    apiKey: process.env.OPEN_ROUTER_API_KEY,
  });
  private systemPrompt: string;
  private ocrPrompt: string;
  private albumCache = new Map<string, AlbumBucket>();
  private tunnelURL: string | null = null;
  private model: { providerID: string; modelID: string };

  public constructor(
    currentSessionId: string | null,
    telegramBotApiKey: string,
    opencodeClient: OpencodeClient,
  ) {
    this.currentSessionId = currentSessionId || "";
    this.opencodeClient = opencodeClient;
    this.telegramBotApiKey = telegramBotApiKey;
    this.systemPrompt = prompt;
    this.ocrPrompt = ocrPrompt;
    this.model = {
      providerID: "opencode",
      modelID: "mimo-v2.5-free",
    };
  }

  public getOcrPrompt() {
    return this.ocrPrompt;
  }

  public getOpenRouter() {
    return this.openRouterClient;
  }

  public getCurrentSessionId() {
    return this.currentSessionId;
  }

  public setCurrentSessionId(newId: string) {
    this.currentSessionId = newId;
  }

  public getTelegramBotApiKey() {
    return this.telegramBotApiKey;
  }

  public getOpencodeClient() {
    return this.opencodeClient;
  }

  public getSystemPrompt() {
    return this.systemPrompt;
  }

  public addAlbumCache() {}

  public getAlbumCache() {
    return this.albumCache;
  }

  public deleteAlbomCash(id: string) {}

  public setTunnelUrl(url: string) {
    this.tunnelURL = url;
  }

  public getTunnelUrl() {
    return this.tunnelURL;
  }

  public getModel() {
    return this.model;
  }

  public setModel(model: { providerID: string; modelID: string }) {
    this.model = model;
  }
}
