const units = [
  "cup",
  "cups",
  "tablespoon",
  "tablespoons",
  "tbsp",
  "teaspoon",
  "teaspoons",
  "tsp",
  "kg",
  "g",
  "gram",
  "grams",
  "ml",
  "l",
  "liter",
  "liters",
  "pound",
  "pounds",
  "lb",
  "lbs",
  "ounce",
  "ounces",
  "oz",
  "pinch",
  "dash",
  "medium",
  "large",
  "small",
  "clove",
  "cloves",
  "piece",
  "pieces",
  "can",
  "cans",
  "slice",
  "slices"
];

export const normalizeIngredientKey = (input: string): string =>
  input
    .toLowerCase()
    .replace(/[\d/.,-]+/g, " ")
    .replace(new RegExp(`\\b(${units.join("|")})\\b`, "g"), " ")
    .replace(/[^a-z\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
