import { iconBase as base } from './iconBase';

/** 16px stroke icons drawn for the product's own controls. Phosphor covers the rest. */

export const IconTranscript = () => (
  <svg {...base}>
    <path d="M3 4h10M3 7h7M3 10h10M3 13h5" />
  </svg>
);
export const IconClose = () => (
  <svg {...base}>
    <path d="M4 4l8 8M12 4l-8 8" />
  </svg>
);
export const IconUndo = () => (
  <svg {...base} width={13} height={13}>
    <path d="M5.5 4L3 6.5 5.5 9" />
    <path d="M3 6.5h6.5a3 3 0 010 6H7" />
  </svg>
);
export const IconMic = () => (
  <svg {...base}>
    <rect x="5.75" y="1.75" width="4.5" height="8" rx="2.25" />
    <path d="M3.5 7.5a4.5 4.5 0 009 0M8 12v2.25" />
  </svg>
);
export const IconBack = () => (
  <svg {...base}>
    <path d="M9.5 3.5L5 8l4.5 4.5" />
  </svg>
);
export const IconCheck = () => (
  <svg {...base}>
    <path d="M3.5 8.5l3 3 6-7" />
  </svg>
);
export const IconDoc = () => (
  <svg {...base}>
    <path d="M4 1.75h5.25L12 4.5v9.75H4z" />
    <path d="M9 1.75V4.75h3" />
  </svg>
);
export const IconChevron = () => (
  <svg {...base}>
    <path d="M6 3.5L10.5 8 6 12.5" />
  </svg>
);
export const IconPause = () => (
  <svg {...base}>
    <path d="M5.75 3.75v8.5M10.25 3.75v8.5" strokeWidth={2} />
  </svg>
);
