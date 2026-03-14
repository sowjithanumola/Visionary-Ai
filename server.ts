import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // API Route for Image Generation
  app.post("/api/generate", async (req, res) => {
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

      res.json({ imageUrl: imageData });
    } catch (error: any) {
      console.error("Server-side generation error:", error);
      res.status(500).json({ error: error.message || "Failed to generate image" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
