import { useState, useEffect } from "react";
import { getUserRegion, requiresStrictConsent } from "../services/geolocation";
import type { Region } from "../services/geolocation";

interface GeolocationState {
  region: Region;
  loading: boolean;
  requiresStrictConsent: boolean;
}

export function useGeolocation(): GeolocationState {
  const [state, setState] = useState<GeolocationState>({
    region: "OTHER",
    loading: true,
    requiresStrictConsent: false,
  });

  useEffect(() => {
    let mounted = true;
    getUserRegion().then((region) => {
      if (mounted) {
        setState({
          region,
          loading: false,
          requiresStrictConsent: requiresStrictConsent(region),
        });
      }
    });
    return () => { mounted = false; };
  }, []);

  return state;
}
