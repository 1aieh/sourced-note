import { useEffect } from 'react';
import { DialRoot, useDialKit } from 'dialkit';
import 'dialkit/styles.css';
import CoverShader from './CoverShader';
import type { CoverTune, Look } from './coverConfig';
import { COVER_BG, COVER_COPY, COVER_SPACE, LOOKS, coverVars } from './coverConfig';

/** The cover background with a DialKit panel, at `#tune`: look, colour, spacing and copy. */
export default function TunedCover({ reduce, onTune }: { reduce: boolean; onTune: (t: CoverTune) => void }) {
  const v = useDialKit('Cover', {
    copy: {
      type: 'select',
      options: COVER_COPY.map(({ value, label }) => ({ value, label })),
      default: COVER_COPY[0]!.value,
    },
    background: {
      look: { type: 'select', options: [...LOOKS], default: COVER_BG.look },
      strength: [COVER_BG.strength, 0, 1, 0.05],
      brightness: [COVER_BG.brightness, 0.6, 1.4, 0.02],
      saturation: [COVER_BG.saturation, 0, 2, 0.05],
      speed: [COVER_BG.speed, 0, 3, 0.1],
      veil: [COVER_BG.veil, 0, 1, 0.05],
      cursor: COVER_BG.cursor,
    },
    colour: {
      light: { type: 'color', default: COVER_BG.light },
      tone: { type: 'color', default: COVER_BG.tone },
      glow: { type: 'color', default: COVER_BG.glow },
    },
    spacing: {
      pill: [COVER_SPACE.pill, 0, 64, 1],
      title: [COVER_SPACE.title, 0, 64, 1],
      cta: [COVER_SPACE.cta, 8, 80, 1],
      links: [COVER_SPACE.links, 16, 120, 1],
      titleSize: [COVER_SPACE.titleSize, 44, 112, 1],
      subWidth: [COVER_SPACE.subWidth, 20, 40, 0.5],
    },
  });
  const copy = COVER_COPY.find((c) => c.value === v.copy)?.text ?? COVER_COPY[0]!.text;
  const key = JSON.stringify([copy, v.spacing]);
  useEffect(() => {
    onTune({ copy, style: coverVars(v.spacing) });
    // `key` stands for copy and spacing; the panel hands back a new object every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return (
    <>
      <CoverShader
        settings={{ ...v.background, ...v.colour, look: v.background.look as Look }}
        reduce={reduce}
      />
      <DialRoot position="top-left" defaultOpen productionEnabled />
    </>
  );
}
