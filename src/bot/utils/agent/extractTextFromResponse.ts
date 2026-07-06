export const getText = (response: any) => {
  const text: string = response.data?.parts
    .filter((part: any) => part.type === "text")
    .map((part: any) => part.text.replace(/[\u4e00-\u9fa5]/g, "").trim())
    .join("\n");
  console.log("=== КРИВОЙ ТЕКСТ ДЛЯ ТЕЛЕГРАМА ===");
  console.log(text);
  console.log("==================================");
  return text;
};
