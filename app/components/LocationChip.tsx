"use client";

import { MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

type LocationChipProps = {
  city?: string | null;
  region?: string | null;
  country?: string | null;
  className?: string;
};

export function LocationChip({ city, region, country, className }: LocationChipProps) {
  const label = [city, region, country].filter(Boolean).join(", ");
  if (!label) return null;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-[#E4DFD4] bg-[#F0E8DA] px-3 py-1 text-xs text-[#5B5142]",
        className
      )}
    >
      <MapPin className="h-4 w-4" />
      {label}
    </span>
  );
}
