import { Suspense, lazy, useEffect, useRef } from 'react';
import GlobeProfileCard from './GlobeProfileCard';

const HeroGlobe = lazy(() => import('./HeroGlobe'));

const STOPS = [
  { at: 0, x: 0, y: 0, scale: 1, opacity: 1 },
  { at: 0.3, x: 0.22, y: -0.18, scale: 0.7, opacity: 0.6 },
  { at: 0.65, x: -0.22, y: -0.26, scale: 0.65, opacity: 0.5 },
  { at: 1, x: 0, y: 0.04, scale: 0.8, opacity: 0.4 },
];

function clampProgress(value) {
  return Math.min(1, Math.max(0, value));
}

function smoothStep(value) {
  return value * value * (3 - 2 * value);
}

function sampleStops(progress) {
  for (let index = 1; index < STOPS.length; index += 1) {
    const from = STOPS[index - 1];
    const to = STOPS[index];

    if (progress <= to.at) {
      const amount = smoothStep((progress - from.at) / (to.at - from.at));
      return {
        x: from.x + (to.x - from.x) * amount,
        y: from.y + (to.y - from.y) * amount,
        scale: from.scale + (to.scale - from.scale) * amount,
        opacity: from.opacity + (to.opacity - from.opacity) * amount,
      };
    }
  }

  return STOPS[STOPS.length - 1];
}

export default function GlobeStage({ executives, nextSlots, spinRef }) {
  const stageRef = useRef(null);
  const cardsRef = useRef(null);

  useEffect(() => {
    const stage = stageRef.current;
    const cards = cardsRef.current;
    if (!stage || !cards) return undefined;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) return undefined;

    let progress = null;
    let frameId = null;
    let lastTime = 0;
    let cardsHidden = false;

    function setCardsHidden(nextHidden) {
      cardsHidden = nextHidden;
      cards.style.visibility = nextHidden ? 'hidden' : '';
      cards.toggleAttribute('inert', nextHidden);
      if (nextHidden) cards.setAttribute('aria-hidden', 'true');
      else cards.removeAttribute('aria-hidden');
    }

    function update(now) {
      if (frameId === null) return;

      const delta = lastTime ? Math.min((now - lastTime) / 1000, 0.1) : 1 / 60;
      lastTime = now;

      const limit = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
      const target = limit > 0 ? clampProgress(window.scrollY / limit) : 0;

      if (progress === null) progress = target;
      else {
        progress += (target - progress) * (1 - Math.exp(-3 * delta));
        if (Math.abs(target - progress) < 0.0004) progress = target;
      }

      const stop = sampleStops(progress);
      const sideways = window.innerWidth < 768 ? 0.4 : 1;
      const x = stop.x * window.innerWidth * sideways;
      const y = stop.y * window.innerHeight;

      stage.style.transform = `translate(-50%, -42%) translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) scale(${stop.scale.toFixed(3)})`;
      stage.style.opacity = stop.opacity.toFixed(3);

      if (spinRef && spinRef.current) {
        spinRef.current.extra = progress * Math.PI * 2 * 1.2;
      }

      const cardOpacity = clampProgress(1 - progress / 0.2);
      cards.style.opacity = cardOpacity.toFixed(3);

      if (cardOpacity <= 0.01 && !cardsHidden) setCardsHidden(true);
      else if (cardOpacity > 0.01 && cardsHidden) setCardsHidden(false);

      frameId = requestAnimationFrame(update);
    }

    function start() {
      if (frameId !== null) return;
      lastTime = performance.now();
      frameId = requestAnimationFrame(update);
    }

    function stop() {
      if (frameId !== null) {
        cancelAnimationFrame(frameId);
        frameId = null;
      }
      lastTime = 0;
    }

    function handleVisibility() {
      if (document.hidden) stop();
      else start();
    }

    document.addEventListener('visibilitychange', handleVisibility);
    start();

    return () => {
      stop();
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [spinRef]);

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div
        ref={stageRef}
        className="absolute left-1/2 top-full aspect-square w-[168vw] max-w-[1400px] -translate-x-1/2 -translate-y-[42%]"
      >
        <Suspense fallback={null}>
          <HeroGlobe spinRef={spinRef} />
        </Suspense>

        <div ref={cardsRef} className="absolute inset-0">
          <GlobeProfileCard
            exec={executives[0]}
            nextSlot={nextSlots[executives[0].id]}
            className="globe-float-slow absolute left-[26%] top-[12%] sm:left-[16%] sm:top-[22%] lg:left-[9%] lg:top-[27%]"
          />
          <GlobeProfileCard
            exec={executives[1]}
            nextSlot={nextSlots[executives[1].id]}
            className="globe-float-slower absolute right-[14%] top-[30%] hidden sm:block lg:right-[8%]"
          />
        </div>
      </div>
    </div>
  );
}
