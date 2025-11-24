"use client";

import { useCallback, useEffect, useState } from "react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { GlobeCanvas } from "./components/Globe";
import { Loader } from "./components/Loader";
import { RecipeCard, type Recipe } from "./components/RecipeCard";

type RecipeResponse = Recipe & { imagePrompt?: string };

export default function Home() {
  const [recipe, setRecipe] = useState<RecipeResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [adaptLoading, setAdaptLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [adaptError, setAdaptError] = useState<string | null>(null);
  const [lastQuery, setLastQuery] = useState<string | null>(null);

  useEffect(() => {
    setAdaptError(null);
  }, [recipe]);

  const fetchRecipe = useCallback(async (lat: number, lng: number) => {
    setLoading(true);
    setError(null);
    setAdaptError(null);
    setLastQuery(`Lat ${lat.toFixed(2)}, Lng ${lng.toFixed(2)}`);
    try {
      const response = await fetch(`/api/recipe?lat=${lat}&lng=${lng}`);
      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "Unable to fetch recipe");
      }
      const data: RecipeResponse = await response.json();
      setRecipe(data);
      if (data.location) {
        setLastQuery(`${data.location} (${lat.toFixed(2)}, ${lng.toFixed(2)})`);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unexpected error";
      setError(message);
      setRecipe(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleAdapt = useCallback(
    async (ingredient: string, replacement: string) => {
    if (!recipe) return;
    if (!ingredient || !replacement.trim()) {
      setAdaptError("Please pick a swap option.");
      return;
    }
    setAdaptLoading(true);
    setAdaptError(null);
    try {
        const response = await fetch("/api/recipe/substitute", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            recipe,
            replaceIngredient: ingredient,
            newIngredient: replacement.trim()
          })
        });
        if (!response.ok) {
          const text = await response.text();
          throw new Error(text || "Unable to adapt recipe");
        }
        const updated: RecipeResponse = await response.json();
        setRecipe(updated);
        setLastQuery((prev) => (prev ? `${prev} · adapted` : "Adapted recipe"));
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unexpected error while adapting recipe";
        setAdaptError(message);
      } finally {
        setAdaptLoading(false);
      }
    },
    [recipe]
  );

  return (
    <main className="container w-full max-w-screen-xl flex flex-col gap-8 py-10 overflow-x-hidden">
      <section className="grid items-start justify-items-stretch gap-8 lg:grid-cols-2 min-w-0">
        <div className="space-y-6 min-w-0">
          <div className="glass-panel p-6 lg:p-8">
            <p className="text-xs uppercase tracking-[0.3em] text-primary">NomadDish</p>
            <h1 className="mt-3 text-4xl font-semibold leading-tight sm:text-5xl text-amber-900">
              Spin the globe and find a comforting recipe from anywhere.
            </h1>
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
              Tap a spot to reverse-geocode with OpenCage, then we&apos;ll ask OpenAI for a cozy, regional dish
              with ingredients, steps, and a pinch of cultural story.
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-2 rounded-full bg-muted/60 px-3 py-1">
                <span className="h-2 w-2 rounded-full bg-secondary animate-pulse" />
                Friendly geocoding
              </span>
              <span className="flex items-center gap-2 rounded-full bg-muted/60 px-3 py-1">
                <span className="h-2 w-2 rounded-full bg-primary/80" />
                Recipe stories by AI
              </span>
            </div>
          </div>

          <GlobeCanvas onSelect={fetchRecipe} />
        </div>

        <div className="space-y-4 min-w-0">
          <div className="glass-panel p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-primary">Your picks</p>
                <p className="text-lg font-semibold text-foreground mt-1">
                  {lastQuery ? lastQuery : "Click the globe to get started"}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setRecipe(null);
                  setLastQuery(null);
                  setError(null);
                }}
              >
                Reset
              </Button>
            </div>
            <Separator className="my-4" />
            <p className="text-sm text-muted-foreground">
              We will reverse-geocode your chosen point, then craft a structured recipe with
              ingredients, steps, and a bit of cultural flavor.
            </p>
          </div>

          {error && (
            <div className="glass-panel border-destructive/60 p-4 text-sm text-destructive">
              {error}
            </div>
          )}

          {loading ? (
            <Loader />
          ) : recipe ? (
            <>
              <RecipeCard recipe={recipe} onSwap={handleAdapt} isSwapping={adaptLoading} />
              {adaptError && <div className="glass-panel border-destructive/60 p-4 text-sm text-destructive">{adaptError}</div>}
            </>
          ) : (
            <div className="glass-panel p-6 text-sm text-muted-foreground leading-relaxed">
              Choose a spot on the globe to fetch a recipe rooted in that place. Try coastal regions,
              mountain towns, or island nations to see how flavors change with geography.
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
