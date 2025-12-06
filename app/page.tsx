"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { GlobeCanvas } from "./components/Globe";

export default function Home() {
  const router = useRouter();

  const handleSelect = useCallback(
    (lat: number, lng: number) => {
      router.push(`/recipe?lat=${lat}&lng=${lng}`);
    },
    [router]
  );

  return (
    <main className="card-stage px-4 py-12">
      <div className="stage-card swipe-in-right">
        <div className="relative z-10 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <p className="text-xs uppercase tracking-[0.3em] text-primary">NomadDish</p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="flex h-8 items-center gap-2 rounded-full bg-muted/70 px-3 py-1">
                <span className="h-2 w-2 rounded-full bg-secondary animate-pulse" />
                Map ready
              </span>
              <span className="flex h-8 items-center gap-2 rounded-full bg-muted/70 px-3 py-1">
                <span className="h-2 w-2 rounded-full bg-primary/80" />
                Auto-rotating globe
              </span>
            </div>
          </div>
          <h1 className="text-4xl font-semibold leading-tight sm:text-5xl text-amber-900">
            Pick your place on the globe
          </h1>
          <p className="text-lg leading-relaxed text-muted-foreground max-w-3xl">
            Spin, zoom, and tap anywhere on Earth. We&apos;ll reverse-geocode the spot and carry those coordinates into a
            cozy regional recipe page with ingredients, steps, swaps, and an optional image.
          </p>
          <div className="flex items-center gap-3 pt-2">
            <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold uppercase text-xs tracking-[0.2em]">
              Map
            </div>
            <div className="text-sm text-muted-foreground">
              Tap anywhere to jump forward. You can also skip ahead to the recipe canvas.
            </div>
          </div>
        </div>

        <div className="relative z-10 mt-8 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-primary">Globe</p>
              <p className="text-lg font-semibold text-foreground">Choose a spot</p>
              <p className="text-sm text-muted-foreground mt-1">We&apos;ll send the coordinates to the recipe page.</p>
            </div>
            <Button variant="secondary" onClick={() => router.push("/recipe")}>
              Go to recipe page
            </Button>
          </div>
          <GlobeCanvas onSelect={handleSelect} />
        </div>
      </div>
    </main>
  );
}
