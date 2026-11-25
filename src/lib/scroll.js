let smoothScroller = null;

export function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function setSmoothScroller(scroller) {
  smoothScroller = scroller;
}

export function scrollToId(id) {
  const target = document.getElementById(id);
  if (!target) return;

  if (smoothScroller) {
    smoothScroller.scrollTo(target);
    return;
  }

  target.scrollIntoView({
    behavior: prefersReducedMotion() ? 'auto' : 'smooth',
    block: 'start',
  });
}
