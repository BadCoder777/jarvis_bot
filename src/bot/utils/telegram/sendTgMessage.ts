import type { Context } from "grammy";

export const sendTgMessage = async (ctx: Context, message: string | null) => {
  if (!message) {
    await ctx.reply("No text answer from AI :(");
    return;
  }
  try {
    await ctx.replyWithRichMessage({
      markdown: message,
    });
  } catch (error) {
    console.error(error);
    await ctx.reply("Error while sending the ai's answer:");
    await ctx.reply(message);
  }
};
