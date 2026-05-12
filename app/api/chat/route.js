import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export async function POST(req) {
  try {
    const { messages } = await req.json();
    if (!messages || !Array.isArray(messages)) {
      return Response.json({ error: "Invalid messages" }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-pro",
      generationConfig: { maxOutputTokens: 1500 },
    });

    const history = messages.slice(0, -1).map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    const lastMessage = messages[messages.length - 1];

    for (let i = 0; i < 3; i++) {
      try {
        const chat = model.startChat({ history });
        const result = await chat.sendMessage(lastMessage.content);
        const text = result.response.text();
        return Response.json({ text });
      } catch (err) {
        const isRate = err.message?.includes("429") || err.message?.includes("retry");
        if (isRate && i < 2) {
          await sleep(65000);
          continue;
        }
        throw err;
      }
    }
  } catch (err) {
    const isRate = err.message?.includes("429") || err.message?.includes("retry");
    if (isRate) {
      return Response.json({
        error: "Rate limit hit. The app will auto-retry in 65 seconds. Please wait…",
      }, { status: 429 });
    }
    return Response.json({ error: err.message }, { status: 500 });
  }
}
