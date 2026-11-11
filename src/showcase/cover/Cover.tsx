import { Suspense, lazy, useState } from 'react';
import { Microphone } from '@phosphor-icons/react';
import { motion } from 'motion/react';
import { NoteParts } from '@/features/note';
import { EASE_OUT } from '@/shared/motion';
import { AuthorPill } from '../AuthorPill';
import { glideTo } from '../glide';
import { AuthorLinks } from '../OutLink';
import type { CoverTune } from './coverConfig';
import { COVER_BG, COVER_COPY, COVER_SPACE, coverVars } from './coverConfig';
import classes from './Cover.module.css';

const CoverShader = lazy(() => import('./CoverShader'));
const TunedCover = lazy(() => import('./TunedCover'));

/** The cover that sits in the prototype's frame. One button starts the visit. */
export function Cover({ tune, reduce, onStart }: { tune: boolean; reduce: boolean; onStart: () => void }) {
  const [tuned, setTuned] = useState<CoverTune>(() => ({
    copy: COVER_COPY[0]!.text,
    style: coverVars(COVER_SPACE),
  }));
  return (
    <motion.section
      className={classes.cover}
      style={tuned.style}
      exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.985, filter: 'blur(10px)' }}
      transition={{ duration: 0.45, ease: EASE_OUT }}
    >
      <Suspense fallback={null}>
        {tune ? (
          <TunedCover reduce={reduce} onTune={setTuned} />
        ) : (
          <CoverShader settings={COVER_BG} reduce={reduce} />
        )}
      </Suspense>
      <div className={classes.inner}>
        <AuthorPill
          href="#about"
          onClick={(e) => {
            e.preventDefault();
            glideTo('about', reduce);
          }}
        >
          Prototype by <b>Laieh</b> for Everi Labs
        </AuthorPill>
        <h1 className={classes.title}>Sourced note</h1>
        <p className={classes.sub}>{tuned.copy}</p>
        <NoteParts.ActionButton
          className={classes.cta}
          onClick={onStart}
          leftSection={<Microphone size={18} weight="fill" />}
          rightSection={<span className={classes.ctaTime}>2 min</span>}
        >
          Start the visit
        </NoteParts.ActionButton>
      </div>
      <nav className={classes.links} aria-label="About the author">
        <AuthorLinks />
      </nav>
    </motion.section>
  );
}
