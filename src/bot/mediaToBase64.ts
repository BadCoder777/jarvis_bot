import type { Bot } from "grammy";

const MIME_MAP: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  ogg: "audio/ogg",
  oga: "audio/ogg",
  mp3: "audio/mpeg",
};

export const mediaToBase64 = async (
  fileID: string,
  bot: Bot,
): Promise<string> => {
  const fileMetadata = await bot.api.getFile(fileID);

  if (!fileMetadata.file_path) {
    throw new Error("Telegram не предоставил путь для скачивания файла");
  }

  const ext = fileMetadata.file_path.split(".").pop()?.toLowerCase() || "";

  const mimeType = MIME_MAP[ext] || "application/octet-stream";

  if (mimeType === "application/octet-stream") {
    console.warn(
      `⚠️ Не удалось определить точный MIME-тип для расширения: .${ext}. Использован дефолтный стрим.`,
    );
  }

  const telegramCdnUrl = `https://api.telegram.org/file/bot${bot.token}/${fileMetadata.file_path}`;
  const response = await fetch(telegramCdnUrl);

  if (!response.ok) {
    throw new Error(
      `Не удалось скачать файл с серверов Telegram: ${response.statusText}`,
    );
  }

  const arrayBuffer = await response.arrayBuffer();
  const base64String = Buffer.from(arrayBuffer).toString("base64");

  return `data:${mimeType};base64,${base64String}`;
};
