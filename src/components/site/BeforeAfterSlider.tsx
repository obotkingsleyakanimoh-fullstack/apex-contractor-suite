import { useRef, useState } from "react";

export function BeforeAfterSlider({
  before,
  after,
  label = "Project",
}: {
  before: string;
  after: string;
  label?: string;
}) {
  const [position, setPosition] = useState(50);
  const frame = useRef<HTMLDivElement>(null);

  return (
    <figure className="w-full">
      <div
        ref={frame}
        className="relative aspect-[16/10] w-full select-none overflow-hidden rounded-lg border border-border bg-secondary"
      >
        <img
          src={after}
          alt={`${label} after`}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 overflow-hidden" style={{ width: `${position}%` }}>
          <img
            src={before}
            alt={`${label} before`}
            loading="lazy"
            className="h-full w-full object-cover"
            style={{ width: frame.current?.clientWidth ?? undefined }}
          />
        </div>
        <div
          className="pointer-events-none absolute inset-y-0 w-0.5 bg-accent"
          style={{ left: `${position}%` }}
          aria-hidden
        />
        <span className="pointer-events-none absolute left-3 top-3 rounded bg-primary/85 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-primary-foreground">
          Before
        </span>
        <span className="pointer-events-none absolute right-3 top-3 rounded bg-accent px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-accent-foreground">
          After
        </span>
        <input
          type="range"
          min={0}
          max={100}
          value={position}
          aria-label="Compare before and after"
          onChange={(e) => setPosition(Number(e.target.value))}
          className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0"
        />
      </div>
      <figcaption className="mt-2 text-xs text-muted-foreground">
        Drag the slider to compare before and after.
      </figcaption>
    </figure>
  );
}
