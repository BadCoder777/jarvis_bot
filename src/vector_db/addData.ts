import type { State } from "../state/state"

export const addData = async (state: State) => {
  const qdrant = state.getQdrant()

  await qdrant.createCollection("knowledge", {})
}
