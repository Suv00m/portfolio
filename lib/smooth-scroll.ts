type LenisLike = {
  scrollTo: (target: number | HTMLElement, options?: Record<string, unknown>) => void;
};

export function smoothScrollTo(target: number | HTMLElement) {
  const lenis = (window as unknown as { __lenis?: LenisLike }).__lenis;
  if (lenis) {
    lenis.scrollTo(target);
    return;
  }
  const top = typeof target === "number" ? target : target.offsetTop;
  window.scrollTo({ top, behavior: "smooth" });
}
