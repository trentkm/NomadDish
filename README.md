# NomadDish

Interactive Next.js app that lets you spin a 3D globe, pick any point, reverse-geocode the spot with OpenCage, and ask OpenAI for a regional recipe. Results are rendered with shadcn/ui components.

## Setup

1. Install dependencies: `npm install`
2. Create `.env.local` with your keys:
   ```
   NEXT_PUBLIC_MAP_STYLE_URL=YOUR_MAP_STYLE_JSON_URL # e.g. https://api.maptiler.com/maps/streets-v2/style.json?key=YOUR_KEY
   OPENAI_API_KEY=YOUR_OPENAI_KEY
   OPENCAGE_API_KEY=YOUR_OPENCAGE_KEY
   ```
3. Run the dev server: `npm run dev`

## How it works

- `app/components/Globe.tsx` renders an interactive `react-globe.gl` globe and emits clicked coordinates.
- `app/api/recipe/route.ts` reverse-geocodes via OpenCage then calls OpenAI (model `gpt-4o-mini` by default) for a structured recipe.
- The UI shows a skeleton loader while fetching and displays the recipe in a shadcn `Card` once loaded.

## Notes

- Tailwind and shadcn are configured in `tailwind.config.js` and `components.json`.
- Adjust the OpenAI model by setting `OPENAI_MODEL` if you prefer a different one.
- Deploying to Vercel: add `OPENAI_API_KEY` and `OPENCAGE_API_KEY` in the Vercel project environment (Production and Preview). Without them the build will fail when bundling the API route.
