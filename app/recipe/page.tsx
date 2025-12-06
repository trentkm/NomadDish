import { Suspense } from "react";
import RecipePageClient from "./RecipePageClient";

export default function RecipePage() {
  return (
    <Suspense fallback={null}>
      <RecipePageClient />
    </Suspense>
  );
}
