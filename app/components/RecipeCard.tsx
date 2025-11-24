"use client";

import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export type Recipe = {
  recipeName: string;
  description: string;
  ingredients: string[];
  steps: string[];
  culturalBackground: string;
  imagePrompt?: string;
  location?: string;
  substitutions?: Record<string, string[]>;
};

type RecipeCardProps = {
  recipe: Recipe;
  onSwap?: (ingredient: string, replacement: string) => void;
  isSwapping?: boolean;
};

const normalizeKey = (text: string) => {
  const units = [
    "cup",
    "cups",
    "tablespoon",
    "tablespoons",
    "tbsp",
    "teaspoon",
    "teaspoons",
    "tsp",
    "kg",
    "g",
    "gram",
    "grams",
    "ml",
    "l",
    "liter",
    "liters",
    "pound",
    "pounds",
    "lb",
    "lbs",
    "ounce",
    "ounces",
    "oz",
    "pinch",
    "dash",
    "medium",
    "large",
    "small",
    "clove",
    "cloves",
    "piece",
    "pieces",
    "can",
    "cans",
    "slice",
    "slices"
  ];

  return text
    .toLowerCase()
    .replace(/[\d/.,-]+/g, " ")
    .replace(new RegExp(`\\b(${units.join("|")})\\b`, "g"), " ")
    .replace(/[^a-z\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
};

const normalizeMap = (subs: Record<string, string[]>) =>
  Object.fromEntries(Object.entries(subs).map(([k, v]) => [normalizeKey(k), v]));

export function RecipeCard({ recipe, onSwap, isSwapping }: RecipeCardProps) {
  const normalizedSubs = recipe.substitutions ? normalizeMap(recipe.substitutions) : {};

  return (
    <Card className="glass-panel border-border/80 shadow-2xl">
      <CardHeader className="pb-4">
        <CardDescription className="uppercase tracking-[0.2em] text-xs text-primary">
          {recipe.location ? `Inspired by ${recipe.location}` : "Regional recipe"}
        </CardDescription>
        <CardTitle className="text-3xl font-semibold">{recipe.recipeName}</CardTitle>
        <p className="text-muted-foreground leading-relaxed">{recipe.description}</p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-primary mb-2">Ingredients</h3>
          <Separator className="mb-3" />
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-muted-foreground">
            {recipe.ingredients.map((item, idx) => (
              <li key={`${item}-${idx}`} className="flex flex-col gap-1 rounded-md bg-muted/40 p-3">
                <div className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary/70" />
                  <span>{item}</span>
                </div>
                {onSwap && recipe.substitutions && (normalizedSubs[normalizeKey(item)] || []).length > 0 && (
                  <div className="flex flex-wrap items-center gap-2 pl-5">
                    {(normalizedSubs[normalizeKey(item)] || []).map((swap) => (
                      <button
                        key={`${item}-${swap}`}
                        type="button"
                        onClick={() => onSwap(item, swap)}
                        className="text-xs px-2 py-1 rounded-full border border-primary/40 text-primary hover:bg-primary/10 transition"
                        disabled={isSwapping}
                        title={`Swap with ${swap}`}
                      >
                        Swap for {swap}
                      </button>
                    ))}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-secondary mb-2">Steps</h3>
          <Separator className="mb-3" />
          <ol className="space-y-3 text-sm leading-relaxed text-muted-foreground list-decimal list-inside">
            {recipe.steps.map((step, idx) => (
              <li key={`${idx}-${step.slice(0, 8)}`} className="pl-1">
                {step}
              </li>
            ))}
          </ol>
        </div>

        <div className="rounded-xl border border-dashed border-muted/60 bg-muted/20 p-4">
          <h4 className="text-sm font-semibold text-foreground mb-2">Cultural Context</h4>
          <p className="text-sm text-muted-foreground leading-relaxed">{recipe.culturalBackground}</p>
        </div>
      </CardContent>
    </Card>
  );
}
