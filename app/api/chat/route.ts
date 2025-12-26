import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();
    const lastMessage = messages[messages.length - 1]?.content || "";

    // Create a combined prompt for the AI
    const prompt = `
You are Phantom Guard, an AI for detecting suspicious or fraudulent messages while chatting safely with users.
Rules:
1. If the message is suspicious or fraudulent (e.g., asking for OTP, account info, codes), respond ONLY with "🚨 Fraud Alert: <reason>".
2. If the message is safe, respond naturally AND also start with "🟢 Safe Interaction: <reason>".
3. Make safe conversations friendly, helpful, and context-aware.
4. Do not provide any real sensitive data.

User's message: "${lastMessage}"
`;

    const response = await fetch("http://127.0.0.1:11434/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama3",
        messages: [
          { role: "user", content: prompt }
        ]
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error("Ollama API error: " + text);
    }

    const data = await response.json();
    const reply = data.choices[0].message.content;

    return NextResponse.json({ reply });

  } catch (e: any) {
    return NextResponse.json(
      { error: e.message ?? "bad request" },
      { status: 400 }
    );
  }
}
