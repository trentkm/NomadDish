"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

type DishImageProps = {
  src?: string | null;
  alt?: string;
  className?: string;
};

export function DishImage({ src, alt, className }: DishImageProps) {
  if (!src) return null;
  return (
    <div
      className={cn(
        "relative aspect-video w-full overflow-hidden rounded-[12px] border border-[#E4DFD4] shadow-[0_8px_20px_rgba(0,0,0,0.04)] bg-[#F8F5EF]",
        className
      )}
    >
      <Image src={src} alt={alt || "Dish image"} fill className="object-cover" />
    </div>
  );
}
