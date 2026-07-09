import { randomUUIDv7 } from "bun";
import type { State } from "../state/state";
import type { ChunkPayload } from "../types/chunkPayload.type";

export class VectorDbManager {
  private client;

  constructor(state: State) {
    this.client = state.getQdrant()
  }

  async createCollection(collectionName: string, dimensions: number) {
    const collections = await this.client.getCollections()
    const exist = collections.collections.some(c => c.name === collectionName)

    if (!exist) {
      await this.client.createCollection(collectionName, {
        vectors: {
          size: {
            size: dimensions,
            distance: 'Cosine'
          },
        },
        optimizers_config: {
          default_segment_number: 2
        }
      })
    }
  }

  async upsertChunk(collectionName: string, vector: number[], payload: ChunkPayload) {
    await this.client.upsert(collectionName, {
      wait: true,
      points: [
        {
          id: randomUUIDv7(),
          vector,
          payload: {
            text: payload.text,
            filePath: payload.filePath
          }
        }
      ]
    })
  }
}
