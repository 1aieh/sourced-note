import type { SVGProps } from 'react';

/** Shared attributes for the 16px stroke icons. */
export const iconBase = {
  width: 16,
  height: 16,
  viewBox: '0 0 16 16',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
} satisfies SVGProps<SVGSVGElement>;
