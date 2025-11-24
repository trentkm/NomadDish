import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { reverseGeocode } from "@/lib/geocode";
import { getOpenAIClient } from "@/lib/openai";

export const dynamic = "force-dynamic";

type RecipePayload = {
  recipeName: string;
  description: string;
  ingredients: string[];
  steps: string[];
  culturalBackground: string;
  imagePrompt?: string;
  location?: string;
};

const model = process.env.OPENAI_MODEL ?? "gpt-4o-mini";

const toStringArray = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.map((item) => String(item)).filter(Boolean);
  }
  return [];
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lat = parseFloat(searchParams.get("lat") || "");
  const lng = parseFloat(searchParams.get("lng") || "");

  if (Number.isNaN(lat) || Number.isNaN(lng)) {
    return NextResponse.json({ error: "lat and lng query parameters are required." }, { status: 400 });
  }

  try {
    const geo = await reverseGeocode(lat, lng);
    const locationLabel = [geo.city, geo.region, geo.country].filter(Boolean).join(", ") || geo.formatted;

    const client = getOpenAIClient();

    const prompt = [
      `Give me a traditional popular recipe from ${locationLabel}.`,
      "Return JSON with recipeName, description, ingredients, steps, culturalBackground, imagePrompt.",
      "Ingredients should be short bullet-ready strings. Steps should be concise, ordered actions.",
      "Avoid alcohol unless it is central to the dish."
    ].join(" ");

    const completion = await client.chat.completions.create({
      model,
      temperature: 0.7,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You are a culinary guide. Respond ONLY with minified JSON and no extra commentary. Keep recipes approachable and culturally authentic."
        },
        { role: "user", content: prompt }
      ]
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error("OpenAI returned an empty response");
    }

    const parsed = JSON.parse(content);
    const recipe: RecipePayload = {
      recipeName: parsed.recipeName || "Regional Dish",
      description: parsed.description || `A staple dish from ${locationLabel}.`,
      ingredients: toStringArray(parsed.ingredients),
      steps: toStringArray(parsed.steps),
      culturalBackground: parsed.culturalBackground || `A taste of ${locationLabel}.`,
      imagePrompt: parsed.imagePrompt,
      location: locationLabel
    };

    return NextResponse.json(recipe);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
