import { forwardRef, useCallback, useEffect, useRef } from 'react';

// hue base and how far the hue drifts across the card, so coral stays coral to amber
const GLOW_COLORS = {
  coral: { base: 14, spread: 30 },
  blue: { base: 210, spread: 60 },
  purple: { base: 268, spread: 50 },
  green: { base: 140, spread: 50 },
  red: { base: 2, spread: 36 },
  orange: { base: 28, spread: 34 },
};

// the glow reaches past the card edge, so a card next to the pointer still lights up
const GLOW_REACH = 380;

const cards = new Set();
let frameId = 0;
let pointer = null;
let active = false;

function paint() {
  frameId = 0;
  if (!pointer) return;

  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  cards.forEach((card) => {
    const rect = card.node.getBoundingClientRect();
    if (
      rect.bottom < -GLOW_REACH ||
      rect.top > viewportHeight + GLOW_REACH ||
      rect.right < -GLOW_REACH ||
      rect.left > viewportWidth + GLOW_REACH
    ) {
      return;
    }

    // coordinates stay local to the card, so floats, transforms and sticky panels stay correct
    const x = pointer.x - rect.left;
    const y = pointer.y - rect.top;
    const across = rect.width ? Math.min(1, Math.max(0, x / rect.width)) : 0;

    card.node.style.setProperty('--mx', `${x.toFixed(1)}px`);
    card.node.style.setProperty('--my', `${y.toFixed(1)}px`);
    card.node.style.setProperty('--spot-hue', (card.base + across * card.spread).toFixed(1));
  });
}

function schedule() {
  if (frameId) return;
  frameId = requestAnimationFrame(paint);
}

function setActive(nextActive) {
  if (active === nextActive) return;
  active = nextActive;

  cards.forEach((card) => {
    if (nextActive) card.node.setAttribute('data-spotlight', 'on');
    else card.node.removeAttribute('data-spotlight');
  });
}

function handlePointerMove(event) {
  pointer = { x: event.clientX, y: event.clientY };
  setActive(true);
  schedule();
}

function handlePointerLeave() {
  pointer = null;
  setActive(false);
}

function register(card) {
  cards.add(card);
  if (active) card.node.setAttribute('data-spotlight', 'on');
  if (pointer) schedule();

  if (cards.size === 1) {
    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('scroll', schedule, { passive: true });
    document.addEventListener('pointerleave', handlePointerLeave);
    window.addEventListener('blur', handlePointerLeave);
  }
}

function unregister(card) {
  cards.delete(card);
  card.node.removeAttribute('data-spotlight');
  card.node.style.removeProperty('--mx');
  card.node.style.removeProperty('--my');
  card.node.style.removeProperty('--spot-hue');

  if (cards.size > 0) return;

  window.removeEventListener('pointermove', handlePointerMove);
  window.removeEventListener('scroll', schedule);
  document.removeEventListener('pointerleave', handlePointerLeave);
  window.removeEventListener('blur', handlePointerLeave);

  if (frameId) cancelAnimationFrame(frameId);
  frameId = 0;
  pointer = null;
  active = false;
}

const SpotlightCard = forwardRef(function SpotlightCard(
  { as: Tag = 'div', glowColor = 'coral', variant = 'full', className = '', children, ...rest },
  forwardedRef,
) {
  const nodeRef = useRef(null);
  const glow = GLOW_COLORS[glowColor] || GLOW_COLORS.coral;

  const setNode = useCallback(
    (node) => {
      nodeRef.current = node;
      if (typeof forwardedRef === 'function') forwardedRef(node);
      else if (forwardedRef) forwardedRef.current = node;
    },
    [forwardedRef],
  );

  useEffect(() => {
    const node = nodeRef.current;
    if (!node) return undefined;

    const card = { node, base: glow.base, spread: glow.spread };
    register(card);
    return () => unregister(card);
  }, [glow.base, glow.spread]);

  return (
    <Tag
      {...rest}
      ref={setNode}
      className={`spotlight-card ${className}`.trim()}
      data-spotlight-variant={variant}
    >
      {children}
    </Tag>
  );
});

export { SpotlightCard };
export default SpotlightCard;
