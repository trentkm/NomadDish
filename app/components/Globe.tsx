'use client';

import "maplibre-gl/dist/maplibre-gl.css";
import { useEffect, useRef } from "react";
import type { Map as MapLibreMap } from "maplibre-gl";
import { Map, NavigationControl } from "maplibre-gl";
import { cn } from "@/lib/utils";

type GlobeProps = {
  onSelect?: (lat: number, lng: number) => void;
  className?: string; // applied to the outer wrapper
};

export function Globe({ onSelect, className }: GlobeProps) {
  const mapRef = useRef<MapLibreMap | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (mapRef.current || !containerRef.current) return;

    const style = process.env.NEXT_PUBLIC_MAP_STYLE_URL;

    if (!style) {
      console.error(
        "[Globe] No style available. Provide NEXT_PUBLIC_MAP_STYLE_URL."
      );
      return;
    }

    const map = new Map({
      container: containerRef.current,
      style,
      center: [0, 20],
      zoom: 1.1,
      pitch: 0,
      bearing: 0,
      pitchWithRotate: true,
      dragRotate: true,
      maxPitch: 85
    });

    map.addControl(new NavigationControl({ visualizePitch: false, showZoom: true }), "top-right");

    map.on("style.load", () => {
      console.log("[Globe] style loaded, current projection", map.getProjection());
      console.log("[Globe] projection after setProjection", map.getProjection());
      map.resize();
    });

    map.on("click", (e) => {
      const { lat, lng } = e.lngLat;
      onSelect?.(lat, lng);
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [onSelect]);

  return (
    <div
      className={cn(
        "relative w-full min-h-[420px] aspect-[4/3] sm:aspect-[3/2] rounded-[14px] border border-[#E4DFD4] shadow-[0_8px_20px_rgba(0,0,0,0.04)] overflow-hidden",
        className
      )}
    >
      <div
        ref={containerRef}
        className="absolute inset-0"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%"
        }}
      />
    </div>
  );
}
