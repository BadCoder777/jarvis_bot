import type { State } from "../../../state/state";
import type { IModel } from "../../../types/model.type";
import type { Part } from "../../types/parts.type";

export const sendMessage = async (
  state: State,
  parts: Part[],
  model: IModel = state.getModel(),
) => {
  const response = await state.getOpencodeClient().session.prompt({
    path: { id: state.getCurrentSessionId() },
    body: {
      model: { modelID: model.modelID, providerID: model.provider.id },
      system: state.getSystemPrompt(),
      parts,
    },
  });
  return response;
};
