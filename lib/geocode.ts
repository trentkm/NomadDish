type GeocodeComponents = {
  city?: string;
  town?: string;
  village?: string;
  state?: string;
  county?: string;
  country?: string;
  [key: string]: unknown;
};

export type GeocodeResult = {
  city?: string;
  region?: string;
  country?: string;
  formatted: string;
};

export async function reverseGeocode(lat: number, lng: number): Promise<GeocodeResult> {
  const apiKey = process.env.OPENCAGE_API_KEY;
  if (!apiKey) {
    throw new Error("Missing OPENCAGE_API_KEY");
  }

  const query = `${lat}+${lng}`;
  const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(query)}&key=${apiKey}`;

  const response = await fetch(url, { next: { revalidate: 0 } });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`OpenCage request failed: ${response.status} ${text}`);
  }

  const data = await response.json();
  const result = data?.results?.[0];
  const components: GeocodeComponents | undefined = result?.components;

  const city = components?.city || components?.town || components?.village;
  const region = components?.state || components?.county;
  const country = components?.country;
  const fallback = result?.formatted || [city, region, country].filter(Boolean).join(", ") || "This spot";

  return {
    city,
    region,
    country,
    formatted: fallback || "this area"
  };
}
