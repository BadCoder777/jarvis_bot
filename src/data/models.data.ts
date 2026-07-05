import type { IModel } from "../types/model.type";

export const MODELS: IModel[] = [
  {
    id: 1,
    name: "DeepSeek v4 flash",
    modelID: "deepseek-v4-flash-free",
    provider: {
      name: "OpenCode",
      id: "opencode",
    },
  },
  {
    id: 2,
    name: "MiniMax M3",
    modelID: "@preset/mini-max-m3",
    provider: {
      id: "custom",
      name: "Open-Router",
    },
  },
  {
    id: 3,
    name: "DeepSeek v4 pro",
    modelID: "deepseek-v4-pro",
    provider: {
      id: "deepseek",
      name: "DeepSeek",
    },
  },
];
