const EEA_COUNTRIES = new Set([
  "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR",
  "DE", "GR", "HU", "IE", "IT", "LV", "LT", "LU", "MT", "NL",
  "PL", "PT", "RO", "SK", "SI", "ES", "SE", "IS", "LI", "NO",
]);

export type Region = "EEA" | "UK" | "CH" | "OTHER";

interface CachedRegion {
  region: Region;
  timestamp: number;
}

const CACHE_KEY = "geo-region-cache";
const CACHE_TTL = 30 * 24 * 60 * 60 * 1000; // 30 days

function getCached(): Region | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const cached: CachedRegion = JSON.parse(raw);
    if (Date.now() - cached.timestamp > CACHE_TTL) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }
    return cached.region;
  } catch {
    return null;
  }
}

function mapCountry(code: string): Region {
  const upper = code.toUpperCase();
  if (EEA_COUNTRIES.has(upper)) return "EEA";
  if (upper === "GB") return "UK";
  if (upper === "CH") return "CH";
  return "OTHER";
}

export async function getUserRegion(): Promise<Region> {
  const cached = getCached();
  if (cached) return cached;

  try {
    const res = await fetch("https://get.geojs.io/v1/ip/country.json");
    const data = await res.json();
    const region = mapCountry(data.country ?? "");
    localStorage.setItem(CACHE_KEY, JSON.stringify({ region, timestamp: Date.now() }));
    return region;
  } catch {
    return "OTHER";
  }
}

export function requiresStrictConsent(region: Region): boolean {
  return region === "EEA" || region === "UK" || region === "CH";
}
