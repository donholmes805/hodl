
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from "@google/genai";

// This interface matches the structure sent from the client and returned to it.
interface ChatMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // --- CORS Preflight Handling ---
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  // --- Main Logic ---
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: { message: `Method ${req.method} Not Allowed` } });
  }

  try {
    // 1. Check for API key
    if (!process.env.API_KEY) {
      console.error("SERVER ERROR: API_KEY is not configured.");
      return res.status(500).json({ error: { message: "Server configuration error." } });
    }
    
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    // 2. Validate request body
    const { history, coinName, coinSymbol, description } = req.body;
    if (!history || !Array.isArray(history) || history.length === 0) {
        return res.status(400).json({ error: { message: "Bad Request: Missing or invalid 'history'." } });
    }
    if (!coinName || !coinSymbol) {
        return res.status(400).json({ error: { message: "Bad Request: Missing coin info." } });
    }

    // Separate the history from the last message.
    const lastMessage = history[history.length - 1];
    const precedingHistory = history.slice(0, -1);

    // 3. Create the chat instance with a system instruction and the preceding history.
    const chat = ai.chats.create({
        model: "gemini-2.5-flash",
        history: precedingHistory,
        config: {
          systemInstruction: `You are a concise crypto analyst. The user is asking about ${coinName} (${coinSymbol}). The coin's description is: "${description}". Keep your answers under 40 words.`,
        },
    });

    // 4. Send the last message from the history to the chat
    if (lastMessage.role !== 'user') {
      return res.status(400).json({ error: { message: "Bad Request: Last history message must be from user." } });
    }
    
    const result = await chat.sendMessage({
      message: lastMessage.parts[0].text
    });

    // 5. Send the successful response back
    const responseMessage: ChatMessage = {
        role: 'model',
        parts: [{ text: result.text }]
    };

    return res.status(200).json(responseMessage);

  } catch (error: any) {
    // 6. Catch all errors
    console.error(`[Chat API Error]`, error);
    const errorMessage = error.message || "An unknown error occurred on the server.";
    return res.status(500).json({ error: { message: errorMessage } });
  }
}
