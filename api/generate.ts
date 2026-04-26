import OpenAI from "openai";
import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { prompt, size } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: "Prompt is required" });
  }

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return res.status(401).json({
      error: "OPENAI_API_KEY not found in Vercel Environment Variables"
    });
  }

  try {
    const openai = new OpenAI({
      apiKey: apiKey,
    });

    const response = await openai.images.generate({
      model: "gpt-image-1",
      prompt: prompt,
      size: size || "1024x1024"
    });

    const imageBase64 = response.data?.[0]?.b64_json;

    if (!imageBase64) {
      throw new Error("No image generated");
    }

    const imageUrl = `data:image/png;base64,${imageBase64}`;

    return res.status(200).json({ imageUrl });

  } catch (error: any) {
    console.error(error);
    return res.status(500).json({
      error: error.message || "Failed to generate image"
    });
  }
}
