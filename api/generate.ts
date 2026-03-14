import { GoogleGenAI } from "@google/genai";
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt, aspectRatio } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: "Prompt is required" });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "GEMINI_API_KEY is not configured on the server." });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-image-preview',
      contents: {
        parts: [{ text: prompt }],
      },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio || "1:1",
          imageSize: "1K"
        },
      },
    });

    if (!response.candidates || response.candidates.length === 0) {
      throw new Error("No image generated.");
    }

    let imageData = null;
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        imageData = `data:image/png;base64,${part.inlineData.data}`;
        break;
      }
    }

    if (!imageData) {
      throw new Error("No image data found in response.");
    }

    res.status(200).json({ imageUrl: imageData });
  } catch (error: any) {
    console.error("Server-side generation error:", error);
    res.status(500).json({ error: error.message || "Failed to generate image" });
  }
}
