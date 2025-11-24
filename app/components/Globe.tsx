"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState, type ForwardRefExoticComponent, type MutableRefObject, type RefAttributes } from "react";

type GlobeInstance = {
  controls: () => { autoRotate: boolean; autoRotateSpeed: number };
  pointOfView: (view: { lat: number; lng: number; altitude?: number }, ms?: number) => void;
};

const Globe = dynamic(() => import("react-globe.gl"), { ssr: false }) as ForwardRefExoticComponent<
  RefAttributes<GlobeInstance> & Record<string, unknown>
>;

type GlobeProps = {
  onSelect?: (lat: number, lng: number) => void;
};

type GlobePoint = { lat: number; lng: number; altitude?: number };

export function GlobeCanvas({ onSelect }: GlobeProps) {
  const globeRef = useRef<GlobeInstance | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const globe = globeRef.current;
    if (!globe) return;
    const controls = globe.controls?.();
    if (controls) {
      controls.autoRotate = true;
      controls.autoRotateSpeed = 0.45;
    }
    globe.pointOfView({ lat: 15, lng: 30, altitude: 2 }, 1000);
    setReady(true);
  }, []);

  return (
    <div className="relative w-full glass-panel overflow-hidden border border-border/60">
      <div className="absolute inset-0 bg-gradient-to-b from-white/70 via-transparent to-white/70 pointer-events-none z-10" />
      <div className="absolute top-4 left-4 z-20 rounded-full bg-white/85 px-3 py-1 text-xs uppercase tracking-[0.2em] text-amber-900 border border-amber-100 shadow">
        Tap the map to pick a spot
      </div>
      <div className="h-[420px] sm:h-[520px]">
        <Globe
          ref={globeRef as unknown as MutableRefObject<GlobeInstance>}
          onGlobeClick={(coords: [number, number] | GlobePoint, _event: unknown, point: GlobePoint) => {
            const lat = point?.lat ?? (Array.isArray(coords) ? coords[0] : (coords as GlobePoint)?.lat);
            const lng = point?.lng ?? (Array.isArray(coords) ? coords[1] : (coords as GlobePoint)?.lng);
            if (typeof lat === "number" && typeof lng === "number") {
              onSelect?.(lat, lng);
            }
          }}
          globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
          bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
          backgroundColor="rgba(0,0,0,0)"
          showGraticules
          width={undefined}
          height={undefined}
          animateIn={ready}
          rendererConfig={{
            alpha: true,
            antialias: true,
            powerPreference: "high-performance"
          }}
        />
      </div>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(251,191,36,0.16),transparent_35%),radial-gradient(circle_at_70%_60%,rgba(52,211,153,0.14),transparent_30%)]" />
      <div className="absolute bottom-4 left-4 right-4 z-20 flex items-center justify-between text-xs text-stone-600">
        <span>Auto-rotating globe, ready for curious cooks.</span>
        <span className="hidden sm:inline-flex items-center gap-2 text-primary">
          <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
          Live coordinate picker
        </span>
      </div>
    </div>
  );
}
