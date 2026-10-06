import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Slide {
  image: string;
  title: string;
  subtitle: string;
  ctaLabel?: string;
  onCtaClick?: () => void;
}

interface HomeSlideshowProps {
  slides: Slide[];
  intervalMs?: number;
}

export const HomeSlideshow: React.FC<HomeSlideshowProps> = ({ slides, intervalMs = 5000 }) => {
  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goTo = useCallback(
    (i: number) => {
      setIndex(((i % slides.length) + slides.length) % slides.length);
    },
    [slides.length]
  );

  const next = useCallback(() => goTo(index + 1), [goTo, index]);
  const prev = useCallback(() => goTo(index - 1), [goTo, index]);

  useEffect(() => {
    if (isPaused || slides.length <= 1) return;
    timerRef.current = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, intervalMs);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, intervalMs, slides.length]);

  if (slides.length === 0) return null;

  return (
    <div
      className="relative rounded-2xl overflow-hidden border border-gray-200 shadow-xs bg-gray-900 group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="relative w-full aspect-[16/7] sm:aspect-[21/8]">
        {slides.map((slide, i) => (
          <div
            key={slide.image}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              i === index ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
            aria-hidden={i !== index}
          >
            <img
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-cover"
              loading={i === 0 ? 'eager' : 'lazy'}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-5 sm:p-8 text-white">
              <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#C9952A] mb-1">
                {slide.subtitle}
              </p>
              <h3 className="font-serif text-lg sm:text-2xl md:text-3xl font-bold leading-tight mb-3 max-w-xl">
                {slide.title}
              </h3>
              {slide.ctaLabel && slide.onCtaClick && (
                <button
                  onClick={slide.onCtaClick}
                  className="inline-flex items-center gap-1.5 bg-white text-gray-900 text-xs sm:text-sm font-bold px-4 py-2 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  {slide.ctaLabel}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {slides.length > 1 && (
        <>
          <button
            onClick={prev}
            aria-label="Previous slide"
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={next}
            aria-label="Next slide"
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          <div className="absolute bottom-3 right-4 z-20 flex items-center gap-1.5">
            {slides.map((slide, i) => (
              <button
                key={slide.image}
                onClick={() => goTo(i)}
                aria-label={`Go to slide ${i + 1}`}
                className={`h-1.5 rounded-full transition-all cursor-pointer ${
                  i === index ? 'w-6 bg-white' : 'w-1.5 bg-white/50 hover:bg-white/80'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};
