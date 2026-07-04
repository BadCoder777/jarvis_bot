import type { State } from "../../../state/state";
import type { Part } from "../../types/parts.type";

export const sendMessage = async (
  state: State,
  parts: Part[],
  model = state.getModel(),
) => {
  const response = await state.getOpencodeClient().session.prompt({
    path: { id: state.getCurrentSessionId() },
    body: {
      model: state.getModel(),
      system: state.getSystemPrompt(),
      parts,
    },
  });
  console.log("opencode-response: " + response);
  return response;
};
