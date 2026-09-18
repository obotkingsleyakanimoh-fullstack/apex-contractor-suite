export interface Coords {
  latitude: number;
  longitude: number;
}

/** Great-circle distance in kilometres. */
export function haversineKm(a: Coords, b: Coords): number {
  const R = 6371;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.sin(dLon / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * R * Math.asin(Math.sqrt(h));
}

export type GeoErrorKind = "unsupported" | "denied" | "unavailable" | "timeout" | "unknown";

export interface GeoFailure {
  kind: GeoErrorKind;
  message: string;
}

const MESSAGES: Record<GeoErrorKind, string> = {
  unsupported: "Your browser does not support location lookup. Please contact us instead.",
  denied:
    "Location permission was declined. You can still contact us and we will confirm coverage.",
  unavailable: "We could not determine your location right now. Please try again shortly.",
  timeout: "The location request took too long. Please try again.",
  unknown: "Something went wrong while checking your location. Please try again.",
};

/** Requests browser geolocation only when explicitly called by a user action. */
export function requestUserLocation(): Promise<
  { ok: true; coords: Coords; accuracy: number } | { ok: false; error: GeoFailure }
> {
  return new Promise((resolve) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      resolve({ ok: false, error: { kind: "unsupported", message: MESSAGES.unsupported } });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        resolve({
          ok: true,
          coords: { latitude: pos.coords.latitude, longitude: pos.coords.longitude },
          accuracy: pos.coords.accuracy,
        }),
      (err) => {
        const kind: GeoErrorKind =
          err.code === err.PERMISSION_DENIED
            ? "denied"
            : err.code === err.POSITION_UNAVAILABLE
              ? "unavailable"
              : err.code === err.TIMEOUT
                ? "timeout"
                : "unknown";
        resolve({ ok: false, error: { kind, message: MESSAGES[kind] } });
      },
      { enableHighAccuracy: false, timeout: 12000, maximumAge: 300000 },
    );
  });
}

export function directionsUrl(
  office: { latitude?: number | null; longitude?: number | null; google_maps_url?: string | null },
  from?: Coords,
): string {
  if (office.latitude != null && office.longitude != null) {
    const dest = `${office.latitude},${office.longitude}`;
    const origin = from ? `&origin=${from.latitude},${from.longitude}` : "";
    return `https://www.google.com/maps/dir/?api=1&destination=${dest}${origin}`;
  }
  return office.google_maps_url ?? "https://www.google.com/maps";
}

export function mapEmbedUrl(office: {
  latitude?: number | null;
  longitude?: number | null;
}): string | null {
  if (office.latitude == null || office.longitude == null) return null;
  const d = 0.01;
  const bbox = `${office.longitude - d},${office.latitude - d},${office.longitude + d},${office.latitude + d}`;
  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${office.latitude},${office.longitude}`;
}
