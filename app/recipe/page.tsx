"use client";

import Image from "next/image";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader } from "../components/Loader";
import { RecipeCard, type Recipe } from "../components/RecipeCard";

type RecipeResponse = Recipe & { imagePrompt?: string };

export default function RecipePage() {
  return (
    <Suspense
      fallback={
        <main className="card-stage px-4 py-12">
          <Loader />
        </main>
      }
    >
      <RecipePageContent />
    </Suspense>
  );
}

function RecipePageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const lat = useMemo(() => parseFloat(searchParams.get("lat") || ""), [searchParams]);
  const lng = useMemo(() => parseFloat(searchParams.get("lng") || ""), [searchParams]);

  const hasCoords = !Number.isNaN(lat) && !Number.isNaN(lng);

  const [recipe, setRecipe] = useState<RecipeResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [adaptLoading, setAdaptLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [adaptError, setAdaptError] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [lastQuery, setLastQuery] = useState<string | null>(null);
  const [imageData, setImageData] = useState<string | null>(null);

  useEffect(() => {
    setAdaptError(null);
    setImageError(null);
    setImageData(null);
  }, [recipe]);

  const fetchRecipe = useCallback(
    async (latVal: number, lngVal: number) => {
      setLoading(true);
      setError(null);
      setAdaptError(null);
      setImageError(null);
      setImageData(null);
      setLastQuery(`Lat ${latVal.toFixed(2)}, Lng ${lngVal.toFixed(2)}`);
      try {
        const response = await fetch(`/api/recipe?lat=${latVal}&lng=${lngVal}`);
        if (!response.ok) {
          const text = await response.text();
          throw new Error(text || "Unable to fetch recipe");
        }
        const data: RecipeResponse = await response.json();
        setRecipe(data);
        if (data.location) {
          setLastQuery(`${data.location} (${latVal.toFixed(2)}, ${lngVal.toFixed(2)})`);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unexpected error";
        setError(message);
        setRecipe(null);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    if (hasCoords) {
      fetchRecipe(lat, lng);
    } else {
      setRecipe(null);
      setLastQuery(null);
    }
  }, [fetchRecipe, hasCoords, lat, lng]);

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
        setImageData(null);
        setImageError(null);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unexpected error while adapting recipe";
        setAdaptError(message);
      } finally {
        setAdaptLoading(false);
      }
    },
    [recipe]
  );

  const handleGenerateImage = useCallback(async () => {
    if (!recipe) return;
    setImageLoading(true);
    setImageError(null);
    setImageData(null);
    try {
      const response = await fetch("/api/recipe/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt:
            recipe.imagePrompt ||
            `A warmly lit appetizing photo of ${recipe.recipeName}, styled for a cozy cookbook, centered dish, shallow depth of field.`
        })
      });
      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "Unable to generate image");
      }
      const { image } = (await response.json()) as { image: string };
      const normalized = image.startsWith("data:") ? image : image.startsWith("http") ? image : `data:image/png;base64,${image}`;
      setImageData(normalized);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unexpected error generating image";
      setImageError(message);
    } finally {
      setImageLoading(false);
    }
  }, [recipe]);

  return (
    <main className="card-stage px-4 py-12">
      <div className="stage-card swipe-in-left">
        <div className="relative z-10 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <p className="text-xs uppercase tracking-[0.3em] text-primary">NomadDish</p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="flex h-8 items-center gap-2 rounded-full bg-muted/70 px-3 py-1">
                <span className="h-2 w-2 rounded-full bg-primary/80" />
                Recipe stage
              </span>
              <span className="flex h-8 items-center gap-2 rounded-full bg-muted/70 px-3 py-1">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Swipe-in card
              </span>
            </div>
          </div>
          <h1 className="text-4xl font-semibold leading-tight sm:text-5xl text-amber-900">
            Ingredients and recipe details
          </h1>
          <p className="text-lg leading-relaxed text-muted-foreground max-w-3xl">
            We take your coordinates, reverse-geocode the region, and craft a structured recipe with ingredients, steps,
            substitutions, and a cozy image preview.
          </p>
          <div className="flex items-center gap-3 pt-2">
            <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold uppercase text-xs tracking-[0.2em]">
              Dish
            </div>
            <div className="text-sm text-muted-foreground">
              {hasCoords ? "Loaded from your globe selection." : "Pick a spot on the map first."}
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" size="sm" onClick={() => router.push("/")}>
              Back to map
            </Button>
            {hasCoords && (
              <Button variant="secondary" size="sm" onClick={() => fetchRecipe(lat, lng)} disabled={loading}>
                {loading ? "Refreshing..." : "Refetch recipe"}
              </Button>
            )}
          </div>
        </div>

        <div className="relative z-10 mt-8 space-y-4">
          {!hasCoords && (
            <div className="glass-panel p-6 text-sm text-muted-foreground leading-relaxed border-dashed border-muted/70">
              Add `lat` and `lng` by tapping the globe on the map page. You&apos;ll be routed here automatically with the
              coordinates.
            </div>
          )}

          {error && (
            <div className="glass-panel border-destructive/60 p-4 text-sm text-destructive">
              {error}
            </div>
          )}

          {loading ? (
            <Loader />
          ) : recipe ? (
            <>
              <div className="glass-panel p-5">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div>
                    <p className="text-xs uppercase tracking-[0.25em] text-primary">Your pick</p>
                    <p className="text-lg font-semibold text-foreground">{lastQuery ?? "Unknown location"}</p>
                    <p className="text-sm text-muted-foreground mt-1">Coordinates sent from the globe.</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setRecipe(null);
                      setLastQuery(null);
                      setError(null);
                      setAdaptError(null);
                      setImageError(null);
                      setImageData(null);
                      router.push("/");
                    }}
                  >
                    Pick another spot
                  </Button>
                </div>
              </div>

              <RecipeCard recipe={recipe} onSwap={handleAdapt} isSwapping={adaptLoading} />

              <div className="glass-panel p-5 space-y-3">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-primary">Dish preview</p>
                    <p className="text-sm text-muted-foreground">Generate a cozy image of this dish.</p>
                  </div>
                  <Button onClick={handleGenerateImage} disabled={imageLoading} size="sm" variant="secondary">
                    {imageLoading ? "Rendering..." : "Render image"}
                  </Button>
                </div>
                {imageError && <p className="text-sm text-destructive">{imageError}</p>}
                {imageLoading && (
                  <div className="aspect-square w-full rounded-xl bg-muted/50 animate-pulse border border-border/60" />
                )}
                {imageData && (
                  <div className="relative aspect-square w-full overflow-hidden rounded-xl border border-border/60 bg-muted/30">
                    <Image src={imageData} alt={`Dish preview for ${recipe.recipeName}`} fill className="object-cover" />
                  </div>
                )}
              </div>
              {adaptError && <div className="glass-panel border-destructive/60 p-4 text-sm text-destructive">{adaptError}</div>}
            </>
          ) : hasCoords && !error ? (
            <div className="glass-panel p-6 text-sm text-muted-foreground leading-relaxed">
              Fetching your recipe details... If nothing appears, try refreshing or pick another spot.
            </div>
          ) : null}
        </div>
      </div>
    </main>
  );
}
