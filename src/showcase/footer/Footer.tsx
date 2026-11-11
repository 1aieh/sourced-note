import { useState } from 'react';
import photo from '../assets/laieh.jpg';
import { AuthorLinks } from '../OutLink';
import classes from './Footer.module.css';

export const PITCHES = [
  { id: 'card', label: 'Made by' },
  { id: 'note', label: 'A note' },
  { id: 'proof', label: 'Proof' },
  { id: 'line', label: 'One line' },
] as const;
export type PitchId = (typeof PITCHES)[number]['id'];

/** The self-pitch and the small print. At `#tune` a switcher compares the pitch variants. */
export function Footer({ tune }: { tune: boolean }) {
  const [variant, setVariant] = useState<PitchId>('note');
  return (
    <>
      {tune && (
        <div className={classes.switch} role="tablist" aria-label="Footer variant">
          {PITCHES.map((f) => (
            <button key={f.id} role="tab" aria-selected={variant === f.id} onClick={() => setVariant(f.id)}>
              {f.label}
            </button>
          ))}
        </div>
      )}
      <Pitch variant={variant} />
      <footer className={classes.foot}>
        <p>Built with React, Mantine, Motion and Phosphor. For Everi Labs.</p>
        <p>Not affiliated with Everi. The patient is not real, and no AI runs here.</p>
        <p>Laieh · Stockholm · 2026</p>
      </footer>
    </>
  );
}

/** "card" is Laieh's own sketch; the others take different angles on the same ask. */
export function Pitch({ variant }: { variant: PitchId }) {
  if (variant === 'card') return <CardPitch />;
  if (variant === 'proof') return <ProofPitch />;
  if (variant === 'line') return <LinePitch />;
  return <NotePitch />;
}

function Avatar({ size }: { size: number }) {
  return <img className={classes.avatar} src={photo} alt="" width={size} height={size} />;
}

function CardPitch() {
  return (
    <section id="about" className={`${classes.pitch} ${classes.card}`} aria-label="About the author">
      <p className={classes.eyebrow}>Made by</p>
      <Avatar size={88} />
      <h2 className={classes.name}>Laieh Jwella</h2>
      <p className={classes.role}>
        Design Engineer <span>(at Everi Labs?)</span>
      </p>
      <AuthorLinks className={classes.links} big />
    </section>
  );
}

/** A short first-person note, like the end of a cover letter. */
function NotePitch() {
  return (
    <section id="about" className={`${classes.pitch} ${classes.note}`} aria-label="About the author">
      <div className={classes.noteHead}>
        <Avatar size={48} />
        <div>
          <p className={classes.noteName}>Laieh Jwella</p>
          <p className={classes.noteRole}>Design Engineer · Stockholm</p>
        </div>
      </div>
      <p className={classes.noteText}>
        I design products and build them myself, from the first sketch to the last few milliseconds of a
        transition.
        <strong> I made this to show how I would work at Everi:</strong> start from a real clinical moment,
        make the AI earn trust, and sweat the details until it feels calm.
      </p>
      <AuthorLinks className={classes.links} />
    </section>
  );
}

/** Two results from shipped work, then the ask. */
function ProofPitch() {
  return (
    <section id="about" className={`${classes.pitch} ${classes.proof}`} aria-label="About the author">
      <div className={classes.proofWho}>
        <Avatar size={64} />
        <h2 className={classes.name}>Laieh Jwella</h2>
        <p className={classes.role}>Design Engineer. I design how products grow, then build them.</p>
      </div>
      <div className={classes.stats}>
        <div className={classes.stat}>
          <span className={classes.statN}>+74%</span>
          <span className={classes.statL}>free trial starts from a new onboarding ending at Truecaller</span>
        </div>
        <div className={classes.stat}>
          <span className={classes.statN}>+800K</span>
          <span className={classes.statL}>
            app download clicks a month from two changes to truecaller.com
          </span>
        </div>
      </div>
      <AuthorLinks className={`${classes.links} ${classes.proofLinks}`} />
    </section>
  );
}

/** One large two-tone sentence with the photo set inline. */
function LinePitch() {
  return (
    <section id="about" className={`${classes.pitch} ${classes.line}`} aria-label="About the author">
      <p className={classes.lineText}>
        <span className={classes.lineWho}>
          <Avatar size={56} />
        </span>
        <strong>Laieh</strong> designs products and builds them, down to the last detail.{' '}
        <strong>Let’s make the real one together.</strong>
      </p>
      <AuthorLinks className={classes.links} big />
    </section>
  );
}
