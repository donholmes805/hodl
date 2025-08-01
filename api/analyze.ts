
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, Type } from "@google/genai";

// This is a Vercel Serverless Function, rebuilt for robustness.

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
      console.error("SERVER ERROR: API_KEY is not configured in Vercel Environment Variables.");
      return res.status(500).json({ error: { message: "Server configuration error. API key is missing." } });
    }
    
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    // 2. Validate request body
    const { coinName, coinSymbol, description } = req.body;
    if (!coinName || !coinSymbol) {
        return res.status(400).json({ error: { message: "Bad Request: Missing coinName or coinSymbol." } });
    }

    // 3. Define the expected JSON structure
    const analysisSchema = {
      type: Type.OBJECT,
      properties: {
          bullCase: { type: Type.STRING, description: "A compelling, optimistic reason to 'HODL' (max 20 words)." },
          bearCase: { type: Type.STRING, description: "A compelling, pessimistic reason to 'DUMP' (max 20 words)." },
      },
      required: ["bullCase", "bearCase"],
    };

    // 4. Create the prompt
    const prompt = `Analyze "${coinName}" (${coinSymbol}). Description: "${description || 'N/A'}". Provide a concise bull case and bear case.`;

    // 5. Call the Gemini API
    console.log(`[${coinName}] Calling Gemini API...`);
    const genAIResponse = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: analysisSchema,
            temperature: 0.7,
        },
    });
    console.log(`[${coinName}] Received Gemini API response.`);
    
    // 6. Process the response
    const rawText = genAIResponse.text;
    if (!rawText) {
      console.error(`[${coinName}] AI returned an empty response. Full response object:`, JSON.stringify(genAIResponse));
      throw new Error("The analysis service returned an empty response.");
    }
    
    // The SDK should return a clean JSON string due to the schema.
    // Let's parse it safely.
    let analysis;
    try {
        analysis = JSON.parse(rawText);
    } catch(parseError) {
        console.error(`[${coinName}] Failed to parse JSON from AI. Raw text: "${rawText}"`);
        throw new Error("The analysis service returned a malformed response.");
    }

    // 7. Send the successful response
    console.log(`[${coinName}] Successfully sending analysis to client.`);
    return res.status(200).json(analysis);

  } catch (error: any) {
    // 8. Catch all errors and send a detailed error response
    console.error(`[${req.body?.coinName || 'Unknown Coin'}] Final catch block error:`, error);
    const errorMessage = error.message || "An unknown error occurred on the server.";
    return res.status(500).json({ error: { message: errorMessage } });
  }
}