import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getOpenAIClient } from "@/lib/openai";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();
    const finalPrompt = typeof prompt === "string" && prompt.trim().length > 0 ? prompt.trim() : null;

    if (!finalPrompt) {
      return NextResponse.json({ error: "prompt is required" }, { status: 400 });
    }

    const client = getOpenAIClient();
    const generation = await client.images.generate({
      model: process.env.OPENAI_IMAGE_MODEL ?? "gpt-image-1",
      prompt: finalPrompt,
      size: "1024x1024"
    });

    const img = generation.data?.[0];
    const src = img?.b64_json ? `data:image/png;base64,${img.b64_json}` : img?.url;
    if (!src) {
      throw new Error("OpenAI image response missing data");
    }

    return NextResponse.json({ image: src });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error generating image";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
