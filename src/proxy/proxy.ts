import type { State } from "../state/state";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "*",
};

export const proxy = (state: State) => {
  const port = Number(process.env.LOCAL_TUNNEL_PORT);

  if (isNaN(port)) {
    throw new Error("LOCAL_TUNNEL_PORT must be a valid number");
  }

  return Bun.serve({
    port,
    async fetch(req) {
      if (req.method === "OPTIONS") {
        return new Response(null, { status: 204, headers: CORS_HEADERS });
      }

      const url = new URL(req.url);

      if (url.pathname.startsWith("/media/")) {
        const uuid = url.pathname.split("/")[2];

        if (!uuid) {
          return new Response("Missing UUID in request path", { status: 400, headers: CORS_HEADERS });
        }

        const tgLink = state.getMedia(uuid);

        if (!tgLink) {
          return new Response("File expired or not found", { status: 404, headers: CORS_HEADERS });
        }

        try {
          const tgResponse = await fetch(tgLink);

          if (!tgResponse.ok) {
            state.deleteMedia(uuid);
            return new Response("Telegram API rejected the file request", {
              status: 502,
              headers: CORS_HEADERS,
            });
          }

          return new Response(tgResponse.body, {
            headers: {
              ...CORS_HEADERS,
              "Content-Type":
                tgResponse.headers.get("Content-Type") || "application/octet-stream",
              "Cache-Control": "public, max-age=300",
              "Content-Length": tgResponse.headers.get("Content-Length") || "",
            },
          });
        } catch (fetchError) {
          console.error(`Proxy fetch crash for UUID ${uuid}:`, fetchError);
          return new Response("Internal Gateway Error", { status: 502, headers: CORS_HEADERS });
        }
      }

      return new Response("Not Found", { status: 404, headers: CORS_HEADERS });
    },
  });
};
