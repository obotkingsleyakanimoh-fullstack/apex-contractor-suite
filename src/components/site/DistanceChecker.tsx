import { useState } from "react";
import { Compass, ExternalLink, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { directionsUrl, haversineKm, requestUserLocation, type Coords } from "@/lib/geo";
import type { OfficeLocation } from "@/types/db";

interface Outcome {
  km: number;
  within: boolean;
  approximate: boolean;
  coords: Coords;
}

export function DistanceChecker({ office }: { office: OfficeLocation }) {
  const [busy, setBusy] = useState(false);
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const hasCoords = office.latitude != null && office.longitude != null;

  async function check() {
    setBusy(true);
    setMessage(null);
    const result = await requestUserLocation();
    setBusy(false);

    if (!result.ok) {
      setOutcome(null);
      setMessage(result.error.message);
      return;
    }
    if (!hasCoords) {
      setMessage("Our office coordinates are not configured yet. Please contact us directly.");
      return;
    }
    const km = haversineKm(result.coords, {
      latitude: office.latitude as number,
      longitude: office.longitude as number,
    });
    setOutcome({
      km,
      within: km <= Number(office.service_radius_km),
      approximate: result.accuracy > 2000,
      coords: result.coords,
    });
  }

  return (
    <div className="surface-panel p-5 sm:p-6">
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-accent/15 text-accent">
          <Compass className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <h3 className="font-display text-base font-semibold text-foreground">
            Distance from our office
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            We only check your location when you press the button, and we do not store it.
          </p>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2.5">
        <Button onClick={() => void check()} disabled={busy}>
          {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Find My Distance
        </Button>
        <Button asChild variant="outline">
          <a
            href={directionsUrl(office, outcome?.coords)}
            target="_blank"
            rel="noreferrer noopener"
          >
            Get Directions
            <ExternalLink className="ml-2 h-4 w-4" />
          </a>
        </Button>
      </div>

      {message ? (
        <p className="mt-4 rounded-md border border-border bg-muted/60 px-3 py-2.5 text-sm text-muted-foreground">
          {message}
        </p>
      ) : null}

      {outcome ? (
        <div className="mt-4 space-y-2 rounded-md border border-border bg-muted/50 px-4 py-3.5">
          <p className="text-sm font-semibold text-foreground">
            You are approximately {outcome.km.toFixed(1)} km from our office.
            {outcome.approximate ? " (approximate location)" : ""}
          </p>
          <p className="text-sm text-muted-foreground">
            {outcome.within
              ? "We currently serve your area."
              : "Your location is outside our standard service area. Contact us to confirm availability."}
          </p>
        </div>
      ) : null}
    </div>
  );
}
