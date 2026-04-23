const ACCESS_KEY = process.env.EXPO_PUBLIC_UNSPLASH_ACCESS_KEY ?? '';

const FALLBACK =
  'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=900&auto=format&fit=crop';

/**
 * Returns the `regular` URL of the first Unsplash search result for `query`.
 * Falls back to FALLBACK if the key is absent, the query returns nothing, or
 * the network call fails.
 */
export async function fetchUnsplashImage(query: string): Promise<string> {
  if (!ACCESS_KEY) {
    console.warn('[Unsplash] EXPO_PUBLIC_UNSPLASH_ACCESS_KEY is not set');
    return FALLBACK;
  }
  try {
    const url =
      `https://api.unsplash.com/search/photos` +
      `?query=${encodeURIComponent(query)}` +
      `&per_page=1` +
      `&orientation=landscape` +
      `&client_id=${ACCESS_KEY}`;
    const res  = await fetch(url);
    const json = await res.json() as { results?: { urls?: { regular?: string } }[] };
    return json.results?.[0]?.urls?.regular ?? FALLBACK;
  } catch (e) {
    console.warn('[Unsplash] fetch failed:', e);
    return FALLBACK;
  }
}
