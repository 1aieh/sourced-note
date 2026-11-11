import { useState } from 'react';
import type { CSSProperties } from 'react';
import { useComputedColorScheme } from '@mantine/core';
import {
  ChromaFlow,
  FilmGrain,
  FlowingGradient,
  FlutedGlass,
  MeshGradient,
  Shader,
  Swirl,
} from 'shaders/react';
import type { CoverBgSettings } from './coverConfig';
import classes from './Cover.module.css';

/**
 * A quiet WebGPU background for the cover (shaders.com, MIT). It sits behind
 * the text with a soft veil of paper over the middle, so the type stays as
 * legible as on a plain cover. Without WebGPU the canvas stays empty and the
 * plain cover shows. Loaded lazily: it is the heaviest code on the page.
 */

const DARK = { a: '#14172a', b: '#2b2a6e', c: '#1b2550', d: '#3a3290', glow: '#5b4bff' };

function Layers({ s, dark, reduce }: { s: CoverBgSettings; dark: boolean; reduce: boolean }) {
  const p = dark ? DARK : { a: s.light, b: s.tone, c: '#dfe6ff', d: '#b7c4ff', glow: s.glow };
  const k = reduce ? 0 : s.speed;
  const cursor = s.cursor && !reduce && (
    <ChromaFlow
      baseColor={p.b}
      upColor={p.glow}
      downColor={p.d}
      leftColor={p.glow}
      rightColor={p.b}
      intensity={0.6}
      radius={3}
      momentum={30}
    />
  );
  if (s.look === 'glass') {
    return (
      <>
        <Swirl
          stops={[
            { color: p.a, position: 0 },
            { color: p.b, position: 1 },
          ]}
          blend={50}
          detail={1.7}
          speed={0.6 * k}
        />
        {cursor}
        <FlutedGlass
          angle={30}
          frequency={8}
          softness={0.5}
          refraction={4}
          aberration={0.25}
          highlight={dark ? 0.08 : 0.2}
          highlightColor="#ffffff"
          speed={0.15 * k}
        />
      </>
    );
  }
  if (s.look === 'mist') {
    return (
      <>
        <MeshGradient
          stops={[
            { color: p.a, position: 0 },
            { color: p.c, position: 0.35 },
            { color: p.b, position: 0.7 },
            { color: p.d, position: 1 },
          ]}
          count={5}
          smoothness={2.4}
          swirl={0.4}
          drift={0.5}
          speed={0.5 * k}
          seed={3}
        />
        {cursor}
      </>
    );
  }
  return (
    <>
      <FlowingGradient
        colorA={p.a}
        colorB={p.b}
        colorC={p.c}
        colorD={p.d}
        speed={0.35 * k}
        distortion={0.5}
        seed={7}
      />
      {cursor}
      <FilmGrain strength={dark ? 0.12 : 0.18} bias={1} />
    </>
  );
}

export default function CoverShader({ settings: s, reduce }: { settings: CoverBgSettings; reduce: boolean }) {
  const dark = useComputedColorScheme('light') === 'dark';
  const [unavailable, setUnavailable] = useState(false);
  if (s.look === 'off') return null;
  return (
    <div className={classes.bg} aria-hidden style={{ '--veil': s.veil } as CSSProperties}>
      {!unavailable && (
        <Shader
          key={s.look + (dark ? 'd' : 'l')}
          className={classes.bgCanvas}
          style={{ opacity: s.strength, filter: `brightness(${s.brightness}) saturate(${s.saturation})` }}
          disableTelemetry
          onUnavailable={() => setUnavailable(true)}
        >
          <Layers s={s} dark={dark} reduce={reduce} />
        </Shader>
      )}
      <div className={classes.veil} />
    </div>
  );
}
