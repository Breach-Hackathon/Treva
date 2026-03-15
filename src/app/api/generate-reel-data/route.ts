import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export async function POST(req: Request) {
  if (!ai) {
    return NextResponse.json(
      { error: "GEMINI_API_KEY is not configured" },
      { status: 500 }
    );
  }

  try {
    const { destinations } = await req.json();

    // The genai package expects an array of strings or {inlineData: {mimeType, data}} objects
    const promptParts = [];

    for (const dest of destinations) {
      if (dest.photoUrl) {
        // If it's a base64 string provided by the frontend
        if (dest.photoUrl.startsWith("data:image/")) {
          const mimeType = dest.photoUrl.split(";")[0].split(":")[1];
          const base64Data = dest.photoUrl.split(",")[1];
          
          promptParts.push({
            inlineData: {
              data: base64Data,
              mimeType: mimeType
            }
          });
        }
        promptParts.push(`This is a photo from "${dest.name}". Analyze the actual scene, colors, mood, and landmarks visible in this photo.`);
      } else {
        promptParts.push(`Destination: "${dest.name}" (no photo provided).`);
      }
    }

    const destNames = destinations.map((d: any) => d.name).join(", ");
    promptParts.push(`Based on the ACTUAL photos above (not generic assumptions), generate for each destination:
1. A short poetic caption (max 6 words) that describes what you SEE in the specific photo — the colors, scenery, architecture, mood, lighting
2. 3 relevant aesthetic sticker suggestions (emoji + short text) inspired by the visual elements in the photo (e.g. "🌅 golden hour" if sunset, "🏛️ ancient walls" if ruins visible, "🌊 azure waves" if ocean)  
3. A recommended transition effect (one of: "zoom-in", "slide-left", "fade", "scale-up")

Destinations in order: ${destNames}

Return ONLY a JSON array:
[{"destination": "name", "caption": "...", "stickers": ["...", "...", "..."], "transition": "..."}]`);

    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: promptParts,
      config: {
        systemInstruction: "You are a creative travel content assistant with keen visual analysis skills. You analyze actual photos to generate captions that match what's visible in the image — not generic travel quotes. Always respond with valid JSON only."
      }
    });

    const text = result.text || "[]";
    let parsed;
    try {
      const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, text];
      parsed = JSON.parse(jsonMatch[1].trim());
    } catch {
      console.error("Failed to parse AI response:", text);
      parsed = destinations.map((d: any) => ({
        destination: d.name,
        caption: "Wanderlust awaits here",
        stickers: ["✨ magic", "📸 snap", "🌍 explore"],
        transition: "fade",
      }));
    }

    return NextResponse.json({ data: parsed });
  } catch (error: any) {
    console.error("Error generating reel data:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate reel data" },
      { status: 500 }
    );
  }
}
