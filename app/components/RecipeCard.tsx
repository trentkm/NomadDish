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
};

type RecipeCardProps = {
  recipe: Recipe;
};

export function RecipeCard({ recipe }: RecipeCardProps) {
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
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
            {recipe.ingredients.map((item, idx) => (
              <li key={`${item}-${idx}`} className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary/70" />
                <span>{item}</span>
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
