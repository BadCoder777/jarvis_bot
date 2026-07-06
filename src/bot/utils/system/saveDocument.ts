import { Bot } from "grammy";
import { join } from "node:path";

export const saveFile = async (fileID: string, fileName: string, bot: Bot) => {
  const fileMetadata = await bot.api.getFile(fileID);

  if (!fileMetadata.file_path) {
    throw new Error("Telegram не предоставил путь для скачивания файла");
  }

  const telegramCdnUrl = `https://api.telegram.org/file/bot${bot.token}/${fileMetadata.file_path}`;
  const response = await fetch(telegramCdnUrl);

  if (!response.ok) {
    throw new Error(
      `Не удалось скачать файл с серверов Telegram: ${response.statusText}`,
    );
  }

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const targetPath = join(process.env.DOWNLOAD_DIR!, fileName);
  await Bun.write(targetPath, buffer);

  await bot.api.sendMessage(
    process.env.USER_TELEGRAM_ID!,
    `✅ File saved as: ${fileName}`,
  );
  console.log(`[Storage] File saved to: ${targetPath}`);
  return targetPath;
};
