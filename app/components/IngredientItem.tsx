"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../../components/ui/collapsible";
import { Button } from "@/components/ui/button";

type IngredientItemProps = {
  name: string;
  swaps?: string[];
};

export function IngredientItem({ name, swaps = [] }: IngredientItemProps) {
  const [open, setOpen] = useState(false);
  const hasSwaps = swaps.length > 0;

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <div className="flex items-center justify-between gap-3 rounded-[10px] border border-[#E4DFD4] bg-[#F0E8DA]/60 px-3 py-2">
        <div className="flex items-start gap-2 text-[#2B2114]">
          <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary/70" />
          <span>{name}</span>
        </div>
        {hasSwaps && (
          <CollapsibleTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="text-xs border-[#E4DFD4] hover:bg-primary/10"
              aria-expanded={open}
            >
              Swap
              <ChevronDown className="ml-1 h-4 w-4" />
            </Button>
          </CollapsibleTrigger>
        )}
      </div>
      {hasSwaps && (
        <CollapsibleContent className="mt-2 rounded-[10px] border border-[#E4DFD4] bg-card px-3 py-2 text-sm text-muted-foreground space-y-1">
          {swaps.map((swap) => (
            <div key={swap} className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-secondary/80" />
              <span>{swap}</span>
            </div>
          ))}
        </CollapsibleContent>
      )}
    </Collapsible>
  );
}
