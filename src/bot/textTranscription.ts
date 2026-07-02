import type { Bot } from "grammy";
import type { State } from "../state/state";
import OpenAI from "openai";

export const getTextFromAudio = async (
  fileID: string,
  bot: Bot,
  state: State,
) => {
  const openrouter = state.getOpenRouter();

  const fileMetadata = await bot.api.getFile(fileID);

  if (!fileMetadata.file_path) {
    throw new Error("Telegram не предоставил путь для скачивания файла");
  }
  const ext = fileMetadata.file_path.split(".").pop()?.toLowerCase() || "";

  const telegramCdnUrl = `https://api.telegram.org/file/bot${bot.token}/${fileMetadata.file_path}`;
  const response = await fetch(telegramCdnUrl);

  const arrayBuffer = await response.arrayBuffer();
  const audioBuffer = Buffer.from(arrayBuffer).toBase64();

  /*const audioBlob = await response.blob();
  const fileObject = new File([audioBlob], `voice.${ext}`, {
    type: audioBlob.type,
    });*/

  const transcription = await openrouter.stt.createTranscription({
    //file: sdkFile,
    //model: process.env.AUDIO_MODEL!,
    //temperature: 0.0,
    sttRequest: {
      inputAudio: {
        data: audioBuffer,
        format: "ogg",
      },
      model: "qwen/qwen3-asr-flash-2026-02-10",
    },
  });
  return transcription.text;
};
