import type { IProvider } from "./provider.type";

export interface IModel {
  modelID: string;
  name: string;
  id: number;
  provider: IProvider;
}
