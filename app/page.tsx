'use client';

import { useCallback, useState } from "react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { GlobeCanvas } from "./components/Globe";
import { Loader } from "./components/Loader";
import { RecipeCard, type Recipe } from "./components/RecipeCard";

type RecipeResponse = Recipe & { imagePrompt?: string };

export default function Home() {
  const [recipe, setRecipe] = useState<RecipeResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastQuery, setLastQuery] = useState<string | null>(null);

  const fetchRecipe = useCallback(async (lat: number, lng: number) => {
    setLoading(true);
    setError(null);
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

  return (
    <main className="container flex flex-col gap-8 py-10">
      <section className="grid items-start gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <div className="glass-panel p-6 lg:p-8">
            <p className="text-xs uppercase tracking-[0.3em] text-primary">NomadDish</p>
            <h1 className="mt-3 text-4xl font-semibold leading-tight sm:text-5xl">
              Spin the planet and uncover dishes beloved in every corner.
            </h1>
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
              Tap a location to reverse-geocode it with OpenCage, then we&apos;ll ask OpenAI for a
              classic regional recipe. You get ingredients, steps, and cultural context instantly.
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-2 rounded-full bg-muted/40 px-3 py-1">
                <span className="h-2 w-2 rounded-full bg-secondary animate-pulse" />
                Live geocoding
              </span>
              <span className="flex items-center gap-2 rounded-full bg-muted/40 px-3 py-1">
                <span className="h-2 w-2 rounded-full bg-primary/80" />
                OpenAI-crafted recipes
              </span>
            </div>
          </div>

          <GlobeCanvas onSelect={fetchRecipe} />
        </div>

        <div className="space-y-4">
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
            <RecipeCard recipe={recipe} />
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
