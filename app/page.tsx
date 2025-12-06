"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Globe } from "./components/Globe";

export default function Home() {
  const router = useRouter();

  const handleSelect = useCallback(
    (lat: number, lng: number) => {
      router.push(`/recipe?lat=${lat}&lng=${lng}`);
    },
    [router]
  );

  const handleRandomSpot = useCallback(() => {
    const lat = parseFloat((Math.random() * 180 - 90).toFixed(4));
    const lng = parseFloat((Math.random() * 360 - 180).toFixed(4));
    handleSelect(lat, lng);
  }, [handleSelect]);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-12 bg-[var(--background)]">
      <div className="w-full max-w-2xl text-center space-y-4">
        <p className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground">NomadDish</p>
        <h1 className="text-3xl sm:text-4xl font-semibold text-foreground">Pick a place on the globe</h1>
        <p className="text-base text-muted-foreground">Tap anywhere to explore a regional dish.</p>
      </div>

      <div className="w-full max-w-5xl mt-10">
        <Globe onSelect={handleSelect} className="w-full aspect-[4/3] md:aspect-[16/9] min-h-[440px] mx-auto" />
      </div>

      <div className="mt-6 flex flex-col items-center gap-3">
        <Button onClick={handleRandomSpot}>Random Spot</Button>
        <p className="text-xs text-muted-foreground">Powered by reverse-geocoding + AI recipes</p>
      </div>
    </main>
  );
}
