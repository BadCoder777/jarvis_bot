import { Bot, Context, InlineKeyboard, type NextFunction } from "grammy";
import type { State } from "../state/state";
import { sendMessage } from "./utils/agent/sendMessageToJarvis";
import { mediaToBase64 } from "./utils/system/mediaToBase64";
import { filePart } from "./utils/agent/filePart";
import { textPart } from "./utils/agent/textPart";
import { getText } from "./utils/agent/extractTextFromResponse";
import { getTextFromAudio } from "./integrations/audio/textTranscription";
import { saveFile } from "./utils/system/saveDocument";
import { genModelsKeyboard } from "./utils/telegram/genModelsKeyboard";
import { sendTgMessage } from "./utils/telegram/sendTgMessage";

export const startBot = async (state: State): Promise<void> => {
  const bot = state.getBot();

  bot.use(async (ctx: Context, next: NextFunction) => {
    if (String(ctx.from?.id) !== process.env.USER_TELEGRAM_ID) return;
    await next();
  });
  bot.use(async (ctx: Context, next: NextFunction) => {
    const currentSession = state.getCurrentSessionId();
    if (!currentSession) {
      try {
        const session = await opencode.session.create();
        state.setCurrentSessionId(session.data!.id);
      } catch (error) {
        ctx.reply("Error while creating the session");
        console.log("error while creatin a session: " + error);
      }
    }
    next();
  });

  const opencode = state.getOpencodeClient();

  await bot.api.setMyCommands([
    { command: "start", description: "Start the bot" },
    { command: "clear", description: "Clear the context" },
    { command: "model", description: "Choose a model" },
    { command: "id", description: "Get telegram ID" },
  ]);

  bot.command("start", async (ctx: Context): Promise<void> => {
    await sendTgMessage(ctx, "You started Jarvis successfully!");
  });

  bot.command("clear", async (ctx: Context): Promise<void> => {
    try {
      await opencode.session.delete({
        path: { id: state.getCurrentSessionId() },
      });
      const session = await opencode.session.create();
      state.setCurrentSessionId(session.data!.id);
      await ctx.reply("You started a new chat");
    } catch (err) {
      console.error("Clear command failed:", err);
      await ctx.reply("Failed to clear the session, Sir.");
    }
  });

  bot.command("id", (ctx) => {
    ctx.reply(String(ctx.from?.id));
  });

  bot.command("model", async (ctx) => {
    ctx.reply("Choose your model:", {
      reply_markup: genModelsKeyboard(state),
    });
  });

  bot.on("message:photo", async (ctx) => {
    const photo = ctx.message.photo.pop();
    if (!photo) return;

    const mediaGroupId = ctx.message.media_group_id;

    if (!state.getAlbumCache().has(mediaGroupId!)) {
      state.getAlbumCache().set(mediaGroupId!, { timer: null!, fileIds: [] });
    }

    const bucket = state.getAlbumCache().get(mediaGroupId!)!;
    bucket.fileIds.push(photo.file_id);

    clearTimeout(bucket.timer);

    bucket.timer = setTimeout(async () => {
      const finalFileIds = bucket.fileIds;
      state.getAlbumCache().delete(mediaGroupId!);

      try {
        const userPrompt =
          ctx.message.caption || "Describe this image in detail.";

        const dataUrls = await Promise.all(
          finalFileIds.map((id) => mediaToBase64(id, bot)),
        );

        const response = await sendMessage(state, [
          textPart(userPrompt),
          ...dataUrls.map((url) => {
            return filePart(url, "image/jpeg");
          }),
        ]);
        const text = getText(response);
        await sendTgMessage(ctx, text);
      } catch (error: any) {
        console.error("❌ Album pipeline failed:", error.message);
        await ctx.reply("Failed to process the uploaded album.");
      }
    }, 500);
  });

  bot.on("message:voice", async (ctx) => {
    try {
      const text = await getTextFromAudio(
        ctx.message.voice.file_id,
        bot,
        state,
      );
      console.log(text);
      const response = await sendMessage(state, [textPart(text)]);
      const textAnswer = getText(response);
      await sendTgMessage(ctx, textAnswer);
    } catch (err) {
      ctx.reply("error occured.");
      console.log(err);
    }
  });

  bot.on("message:document", async (ctx) => {
    const document = ctx.message.document;
    if (!document) return;

    const mediaGroupId = ctx.message.media_group_id;

    if (!state.getAlbumCache().has(mediaGroupId!)) {
      state.getAlbumCache().set(mediaGroupId!, { timer: null!, fileIds: [] });
    }

    const bucket = state.getAlbumCache().get(mediaGroupId!)!;
    bucket.fileIds.push(document.file_id);

    clearTimeout(bucket.timer);

    bucket.timer = setTimeout(async () => {
      const finalFileIds = bucket.fileIds;
      state.getAlbumCache().delete(mediaGroupId!);

      try {
        const userPrompt =
          ctx.message.caption || "Describe this document in detail.";

        const filePaths = await Promise.all(
          finalFileIds.map((id) => saveFile(id, bot, ctx)),
        );

        const response = await sendMessage(state, [
          textPart(userPrompt),
          ...filePaths.map((path) => {
            return textPart(`USER SENT A FILE: ${path}`);
          }),
        ]);
        const text = getText(response);
        await sendTgMessage(ctx, text);
      } catch (error: any) {
        console.error("❌ Album pipeline failed:", error.message);
        await ctx.reply("Failed to process the uploaded album.");
      }
    }, 500);
  });

  bot.on("message:text", async (ctx) => {
    const response = await sendMessage(state, [textPart(ctx.message.text)]);
    const text = getText(response);
    await sendTgMessage(ctx, text);
  });

  bot.callbackQuery(/^model_(.+)$/, async (ctx) => {
    const selectedId = ctx.match[1];
    if (!selectedId) {
      await ctx.reply("No model id provided");
      return;
    }

    state.setModel(selectedId);

    await ctx.answerCallbackQuery({ text: "Good :)" });

    await ctx.deleteMessage();
  });

  bot.start();
};
