"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader } from "../components/Loader";
import { DishImage } from "../components/DishImage";
import { IngredientItem } from "../components/IngredientItem";
import { LocationChip } from "../components/LocationChip";
import { BackButton } from "../components/BackButton";

type IngredientEntry = { name: string; swaps?: string[] };

type RecipeResponse = {
  recipeName: string;
  description: string;
  ingredients: (string | IngredientEntry)[];
  steps: string[];
  culturalBackground?: string;
  imagePrompt?: string;
  location?: string;
  substitutions?: Record<string, string[]>;
  city?: string;
  region?: string;
  country?: string;
  imageUrl?: string;
};

export default function RecipePageClient() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const lat = useMemo(() => parseFloat(searchParams.get("lat") || ""), [searchParams]);
  const lng = useMemo(() => parseFloat(searchParams.get("lng") || ""), [searchParams]);
  const hasCoords = !Number.isNaN(lat) && !Number.isNaN(lng);

  const [recipe, setRecipe] = useState<RecipeResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageData, setImageData] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);

  const fetchRecipe = useCallback(
    async (latVal: number, lngVal: number) => {
      setLoading(true);
      setError(null);
      setImageData(null);
      setImageError(null);
      try {
        const res = await fetch(`/api/recipe?lat=${latVal}&lng=${lngVal}`);
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || "Unable to fetch recipe");
        }
        const data = (await res.json()) as RecipeResponse;
        setRecipe(data);
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
    }
  }, [fetchRecipe, hasCoords, lat, lng]);

  const handleRandomSpot = useCallback(() => {
    const nextLat = parseFloat((Math.random() * 180 - 90).toFixed(4));
    const nextLng = parseFloat((Math.random() * 360 - 180).toFixed(4));
    router.push(`/recipe?lat=${nextLat}&lng=${nextLng}`);
  }, [router]);

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
            `A warmly lit appetizing photo of ${recipe.recipeName}, styled for a cozy cookbook, centered dish.`
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

  const parsedIngredients: { name: string; swaps?: string[] }[] = (recipe?.ingredients || []).map((item) => {
    if (typeof item === "string") return { name: item };
    return { name: item.name, swaps: item.swaps };
  });

  const locParts = recipe?.location?.split(",") ?? [];
  const locationCity = recipe?.city || locParts[0]?.trim();
  const locationRegion = recipe?.region || locParts[1]?.trim();
  const locationCountry = recipe?.country || locParts[2]?.trim();

  return (
    <main className="min-h-screen flex flex-col items-center px-6 py-12 bg-[var(--background)]">
      <div className="w-full max-w-4xl space-y-6">
        <div className="flex items-center gap-2">
          <BackButton />
          <LocationChip city={locationCity} region={locationRegion} country={locationCountry} />
        </div>

        {error && <div className="glass-panel p-4 text-sm text-destructive">{error}</div>}

        {loading ? (
          <Loader />
        ) : recipe ? (
          <div className="space-y-6">
            <div className="space-y-1">
              <h1 className="text-3xl sm:text-4xl font-semibold text-foreground">{recipe.recipeName}</h1>
              <p className="text-sm text-muted-foreground">Traditional dish from {locationRegion || locationCountry || "this region"}</p>
            </div>

            <DishImage src={imageData || recipe.imageUrl || undefined} alt={recipe.recipeName} />
            {imageError && <p className="text-sm text-destructive">{imageError}</p>}
            <div className="flex gap-2 flex-wrap">
              <Button variant="secondary" onClick={() => router.push("/")}>Pick another spot</Button>
              <Button variant="ghost" onClick={handleRandomSpot}>Random spot</Button>
              <Button variant="outline" onClick={handleGenerateImage} disabled={imageLoading}>
                {imageLoading ? "Rendering..." : "Render image"}
              </Button>
            </div>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-foreground">Ingredients</h2>
              <div className="space-y-2">
                {parsedIngredients.map((ing, idx) => (
                  <IngredientItem key={`${ing.name}-${idx}`} name={ing.name} swaps={ing.swaps} />
                ))}
              </div>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-foreground">Steps</h2>
              <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                {recipe.steps.map((step, idx) => (
                  <li key={`${idx}-${step.slice(0, 6)}`}>{step}</li>
                ))}
              </ol>
            </section>
          </div>
        ) : hasCoords ? (
          <div className="glass-panel p-4 text-sm text-muted-foreground">Fetching your recipe...</div>
        ) : (
          <div className="glass-panel p-4 text-sm text-muted-foreground">Pick a spot first.</div>
        )}
      </div>
    </main>
  );
}
