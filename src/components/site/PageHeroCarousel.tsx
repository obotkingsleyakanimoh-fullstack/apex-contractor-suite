import { useEffect, useMemo, useState } from "react";
import { ArrowRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import type { HeroContent } from "@/types/db";

type Props = {
  hero: HeroContent;
  fallbackSlides: HeroContent["slides"];
  primaryHref?: string;
  secondaryHref?: string;
  primaryLabel?: string;
  secondaryLabel?: string;
  minHeight?: string;
};

export function PageHeroCarousel({
  hero,
  fallbackSlides = [],
  primaryHref = "/request-quote",
  secondaryHref = "/services",
  primaryLabel = "Get a solar assessment",
  secondaryLabel = "Explore solar solutions",
  minHeight = "min-h-[720px] sm:min-h-[780px] lg:min-h-[820px]",
}: Props) {
  const slides = useMemo(() => {
    const configured = Array.isArray(hero.slides) ? hero.slides.filter((s) => s?.image_url) : [];
    if (configured.length) return configured;
    return fallbackSlides?.filter((s) => s?.image_url) ?? [];
  }, [hero, fallbackSlides]);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [dragStart, setDragStart] = useState<number | null>(null);
  const intervalMs = Math.max(2.5, Number(hero.autoplay_seconds ?? 4.5)) * 1000;

  useEffect(() => {
    if (slides.length < 2 || paused) return;
    const id = window.setInterval(() => setActive((value) => (value + 1) % slides.length), intervalMs);
    return () => window.clearInterval(id);
  }, [slides.length, paused, intervalMs]);

  useEffect(() => {
    if (active >= slides.length) setActive(0);
  }, [active, slides.length]);

  if (!slides.length) return null;
  const slide = slides[active] ?? slides[0];
  const go = (delta: number) => setActive((value) => (value + delta + slides.length) % slides.length);

  return (
    <section
      className={`relative overflow-hidden bg-[var(--hero-overlay)] text-white ${minHeight}`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={(event) => setDragStart(event.touches[0].clientX)}
      onTouchEnd={(event) => {
        if (dragStart === null) return;
        const delta = event.changedTouches[0].clientX - dragStart;
        if (Math.abs(delta) > 50) go(delta < 0 ? 1 : -1);
        setDragStart(null);
      }}
    >
      {slides.map((item, index) => (
        <div
          key={`${item.image_url}-${index}`}
          className={`absolute inset-0 transition-all duration-[1400ms] ease-out ${index === active ? "opacity-100 scale-100" : "pointer-events-none opacity-0 scale-[1.035]"}`}
          aria-hidden={index !== active}
        >
          <img src={item.image_url} alt="" className="h-full w-full object-cover" />
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(90deg, color-mix(in srgb, var(--hero-overlay) 96%, transparent), color-mix(in srgb, var(--hero-overlay) 66%, transparent), color-mix(in srgb, var(--hero-overlay) 18%, transparent))`,
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(0deg, color-mix(in srgb, var(--hero-overlay) 86%, transparent), transparent 58%, color-mix(in srgb, var(--hero-overlay) 12%, transparent))`,
            }}
          />
        </div>
      ))}

      <div className={`container-page relative flex ${minHeight} items-end py-20 sm:py-24 lg:items-center`}>
        <div key={active} className="max-w-5xl animate-in fade-in slide-in-from-bottom-5 duration-700">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-[var(--color-accent)] sm:text-sm">
            {slide.eyebrow || hero.eyebrow || "Solar energy • Zitso Energy"}
          </p>
          <h1 className="mt-5 max-w-5xl font-display text-5xl font-bold leading-[0.98] tracking-[-0.045em] sm:text-6xl lg:text-[6.2rem]">
            {slide.headline || hero.headline || "Power your home with energy you can depend on."}
          </h1>
          <p className="mt-7 max-w-2xl text-base leading-7 text-white/80 sm:text-xl sm:leading-8">
            {slide.subheadline || hero.subheadline}
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Button asChild size="lg" className="h-13 rounded-full bg-[var(--color-accent)] px-7 text-[var(--heading-color)] shadow-xl hover:bg-accent/90">
              <Link to={(hero.primary_cta_url || primaryHref) as never}>{slide.primary_cta || hero.primary_cta || primaryLabel}<ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-13 rounded-full border-white/30 bg-white/10 px-7 text-white backdrop-blur hover:bg-white/15">
              <Link to={(hero.secondary_cta_url || secondaryHref) as never}>{slide.secondary_cta || hero.secondary_cta || secondaryLabel}</Link>
            </Button>
          </div>
          {slides.length > 1 ? (
            <div className="mt-10 flex items-center gap-4">
              <div className="flex gap-2">
                {slides.map((_, index) => (
                  <button key={index} type="button" onClick={() => setActive(index)} className={`h-1.5 rounded-full transition-all ${index === active ? "w-10 bg-[var(--color-accent)]" : "w-5 bg-white/40 hover:bg-white/70"}`} aria-label={`Show slide ${index + 1}`} />
                ))}
              </div>
              <span className="text-xs text-white/55">Swipe to explore</span>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
