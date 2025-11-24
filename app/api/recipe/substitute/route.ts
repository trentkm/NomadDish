import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
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

type IngredientObject = {
  name?: string;
  item?: string;
  ingredient?: string;
  amount?: string;
  quantity?: string;
  unit?: string;
};

const normalizeIngredients = (value: unknown): string[] => {
  if (!Array.isArray(value)) return [];
  return value
    .map((entry) => {
      if (typeof entry === "string") return entry;
      if (typeof entry === "object" && entry) {
        const ing = (entry as IngredientObject).ingredient || (entry as IngredientObject).name || (entry as IngredientObject).item;
        const qty = (entry as IngredientObject).amount || (entry as IngredientObject).quantity;
        const unit = (entry as IngredientObject).unit;
        const parts = [qty, unit, ing].filter(Boolean);
        if (parts.length) return parts.join(" ");
      }
      return null;
    })
    .filter((s): s is string => Boolean(s));
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { recipe, replaceIngredient, newIngredient } = body || {};

    if (!recipe || !Array.isArray(recipe.ingredients) || !Array.isArray(recipe.steps)) {
      return NextResponse.json({ error: "Invalid recipe payload" }, { status: 400 });
    }
    if (!replaceIngredient || !newIngredient) {
      return NextResponse.json({ error: "replaceIngredient and newIngredient are required" }, { status: 400 });
    }

    const client = getOpenAIClient();
    const locationLabel = recipe.location || "this region";

    const prompt = [
      "You are adapting a recipe to swap one ingredient.",
      `Original recipe JSON: ${JSON.stringify(recipe)}`,
      `Swap "${replaceIngredient}" with "${newIngredient}".`,
      "Return JSON with recipeName, description, ingredients (include quantities/units), steps, culturalBackground, imagePrompt, location.",
      "Preserve the spirit of the dish and adjust steps or amounts as needed for the substitution.",
      "Respond with minified JSON only."
    ].join(" ");

    const completion = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
      temperature: 0.4,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You are a helpful culinary adapter. Respond ONLY with valid JSON matching the requested fields. Keep quantities realistic and steps concise."
        },
        { role: "user", content: prompt }
      ]
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error("OpenAI returned an empty response");
    }

    const parsed = JSON.parse(content);
    const adapted: RecipePayload = {
      recipeName: parsed.recipeName || `${recipe.recipeName || "Recipe"} (adapted)`,
      description: parsed.description || recipe.description,
      ingredients: normalizeIngredients(parsed.ingredients),
      steps: Array.isArray(parsed.steps) ? parsed.steps.map((step: unknown) => String(step)).filter(Boolean) : recipe.steps,
      culturalBackground: parsed.culturalBackground || recipe.culturalBackground || `Adapted from ${locationLabel}`,
      imagePrompt: parsed.imagePrompt || recipe.imagePrompt,
      location: parsed.location || locationLabel
    };

    return NextResponse.json(adapted);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
