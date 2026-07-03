import { Bot, Context, type NextFunction } from "grammy";
import type { State } from "../state/state";
import { sendMessage } from "./sendMessageToJarvis";
import { mediaToBase64 } from "./mediaToBase64";
import { filePart } from "./filePart";
import { textPart } from "./textPart";
import { getText } from "./extractTextFromResponse";
import { getTextFromAudio } from "./textTranscription";

export const startBot = async (state: State): Promise<void> => {
  const bot = state.getBot();

  bot.use(async (ctx: Context, next: NextFunction) => {
    if (String(ctx.from?.id) !== process.env.USER_TELEGRAM_ID) return;
    await next();
  });

  const opencode = state.getOpencodeClient();

  await bot.api.setMyCommands([
    { command: "start", description: "Start the bot" },
    { command: "clear", description: "Clears the context" },
    { command: "test", description: "Test for developer" },
    { command: "id", description: "Get my telegram ID" },
  ]);

  bot.command("start", async (ctx: Context): Promise<void> => {
    const session = await opencode.session.create();
    state.setCurrentSessionId(session.data!.id);
    const response = await sendMessage(state, [
      { type: "text", text: "Джарвис.." },
    ]);
    console.log(response);
    const text = getText(response);
    await ctx.replyWithRichMessage({
      markdown: text || "hi Sir",
    });
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

  bot.command("test", async (ctx) => {
    const response = await opencode.session.prompt({
      path: { id: state.getCurrentSessionId() },
      body: {
        model: { providerID: "opencode", modelID: "mimo-v2.5-free" },
        system: "You are an ocr module",
        parts: [
          { type: "text", text: "What can you see on the picture?" },
          {
            type: "file",
            url: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fwww.naturalhistoryonthenet.com%2Fwp-content%2Fuploads%2F2016%2F12%2FDomestic-Cat.jpg&f=1&nofb=1&ipt=89eb3eec4db330f35d4b346a16153916468483537b96449d884bbe255d65b049",
            mime: "image/jpeg",
          },
        ],
      },
    });
    const text = response.data?.parts
      .filter((part: any) => part.type === "text")
      .map((part: any) => part.text)
      .join("\n");
    await ctx.replyWithRichMessage({ markdown: text || "No response." });
  });

  bot.on("message:photo", async (ctx) => {
    const photo = ctx.message.photo.pop();
    if (!photo) return;

    const mediaGroupId = ctx.message.media_group_id;

    /* if (!mediaGroupId) {
      try {
        const userPrompt =
          ctx.message.caption || "Describe this image in detail.";
        const dataUrl = await mediaToBase64(photo.file_id, bot);
        const response = await sendMessage(state, [
          filePart(dataUrl, "image/jpeg"),
          textPart(userPrompt),
        ]);
        //console.log(JSON.stringify(response));
        const text = getText(response);
        await ctx.replyWithRichMessage({
          markdown: text || "hi Sir",
        });
      } catch (error: any) {
        console.error("❌ Single image pipeline failed:", error.message);
        ctx.reply("An error occured.");
      }
      } */

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
        await ctx.replyWithRichMessage({
          markdown: text || "Error",
        });
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
      await ctx.replyWithRichMessage({
        markdown: getText(response) || "Error",
      });
    } catch (err) {
      ctx.reply("error occured.");
      console.log(err);
    }
  });

  bot.on("message:text", async (ctx) => {
    const response = await sendMessage(state, [textPart(ctx.message.text)]);
    const text = getText(response);
    await ctx.replyWithRichMessage({
      markdown: text,
    });
  });

  bot.start();
};
