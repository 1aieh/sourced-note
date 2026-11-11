import { useState } from 'react';
import { AnimatePresence, useReducedMotion } from 'motion/react';
import { NoteWorkspace, demoEncounter } from '@/features/note';
import { CaseStudy } from './caseStudy/CaseStudy';
import { Cover } from './cover/Cover';
import { ThemeToggle } from './ThemeToggle';
import classes from './Site.module.css';

/**
 * The shareable page. A cover sits in the prototype's frame; one button
 * starts the visit and the cover dissolves into the recording. A short case
 * study follows, made from the prototype's own parts.
 */
export function Site({ tune = false }: { tune?: boolean }) {
  const [begun, setBegun] = useState(false);
  const reduce = useReducedMotion() ?? false;
  return (
    <div className={classes.page}>
      <div className={classes.top}>
        <ThemeToggle />
      </div>
      <div className={classes.stage}>
        {begun && <NoteWorkspace encounter={demoEncounter} />}
        <AnimatePresence>
          {!begun && <Cover key="cover" tune={tune} reduce={reduce} onStart={() => setBegun(true)} />}
        </AnimatePresence>
      </div>
      <CaseStudy tune={tune} />
    </div>
  );
}
