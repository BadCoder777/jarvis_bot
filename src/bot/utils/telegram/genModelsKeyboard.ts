import { InlineKeyboard } from "grammy";
import { State } from "../../../state/state";
import { MODELS } from "../../../data/models.data";

export const genModelsKeyboard = (state: State) => {
  const inlineKeyboard = new InlineKeyboard();

  for (const item of MODELS) {
    const marker = state.getModel().id === item.id ? " ☑️" : "";
    inlineKeyboard.text(item.name + marker, `model_${item.id}`).row();
  }

  inlineKeyboard.text("Close", "model_close");

  return inlineKeyboard;
};
