/** Shared easing curves, as cubic-bezier control points for Motion. */
export const EASE_OUT = [0.23, 1, 0.32, 1] as const;
export const EASE_IN_OUT = [0.77, 0, 0.175, 1] as const;
export const EASE_DRAWER = [0.32, 0.72, 0, 1] as const;

/** A soft entrance: up a little, out of a blur. With reduced motion, a fade. */
export function softIn(reduce: boolean, y = 6, blur = 4) {
  return reduce
    ? { initial: { opacity: 0 }, animate: { opacity: 1 } }
    : {
        initial: { opacity: 0, y, filter: `blur(${blur}px)` },
        animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
      };
}

/** Stagger variants for lists that settle in one item after another. */
export function staggerItem(reduce: boolean) {
  return reduce
    ? { hidden: { opacity: 0 }, shown: { opacity: 1 } }
    : {
        hidden: { opacity: 0, y: 10, filter: 'blur(4px)' },
        shown: { opacity: 1, y: 0, filter: 'blur(0px)' },
      };
}
