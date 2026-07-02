import type { State } from "../state/state";

export const imageToText = async (base64: string, state: State) => {
  const openrouter = state.getOpenRouter();

  const response = await openrouter.chat.send({
    chatRequest: {
      model: process.env.OCR_MODEL!,
      provider: {
        only: ["alibaba"],
      },
      messages: [
        {
          role: "system",
          content: state.getOcrPrompt(),
        },
        {
          role: "user",
          content: [
            {
              type: "image_url",
              imageUrl: {
                url: base64,
              },
            },
          ],
        },
      ],
    },
  });

  console.log(response.choices[0]?.message.content);
  console.log(response);
  return (
    response.choices[0]?.message.content || "error while proccessing the image."
  );
};
