import type { ReactNode } from 'react';
import { NoteProvider, demoEncounter } from '@/features/note';
import { Keyboard, Quotes, SealQuestion, Signature, Stack, Waveform } from '@phosphor-icons/react';
import { AuthorPill } from '../AuthorPill';
import { Footer } from '../footer/Footer';
import { Kit } from '../kit/Kit';
import { PORTFOLIO } from '../links';
import {
  CiteSpecimen,
  FillSpecimen,
  KeysSpecimen,
  QuestionSpecimen,
  SignSpecimen,
  StatesSpecimen,
  SystemSpecimen,
} from './Specimens';
import classes from './CaseStudy.module.css';

/** A short case study under the prototype, illustrated with the prototype's own parts. */
export function CaseStudy({ tune }: { tune: boolean }) {
  return (
    <NoteProvider encounter={demoEncounter}>
      <CaseStudyBody tune={tune} />
    </NoteProvider>
  );
}

function CaseStudyBody({ tune }: { tune: boolean }) {
  return (
    <main id="case-study" className={classes.body}>
      <section className={classes.intro}>
        <AuthorPill href={PORTFOLIO} target="_blank" rel="noreferrer">
          Case study by <b>Laieh</b>
        </AuthorPill>
        <h2 className={classes.h2}>A drafted note you can trust, and sign quickly</h2>
        <p className={classes.lede}>
          The note drafts itself from the visit, and every line points back to what was said. What it cannot
          decide becomes a question, so the clinician signs a note they have checked.
        </p>
      </section>

      <Section n="01" title="A draft you can check">
        <Proof
          icon={<Quotes weight="duotone" />}
          title="Each line shows its source"
          body="Point at a field and the transcript moves its source next to it."
        >
          <CiteSpecimen />
        </Proof>
        <Proof
          icon={<SealQuestion weight="duotone" />}
          title="If it is not sure, it asks"
          body="Conflicts, gaps and clinical decisions become questions. It guesses none."
        >
          <QuestionSpecimen />
        </Proof>
        <Proof
          icon={<Signature weight="duotone" />}
          title="The clinician signs, not the draft"
          body="Signing opens only when no question is open, and sends nothing."
        >
          <SignSpecimen />
        </Proof>
      </Section>

      <Section n="02" title="A form made for review">
        <Proof
          icon={<Stack weight="duotone" />}
          title="Five states, five shapes"
          body="Shape shows the state. Colour agrees: green is done, red is open."
        >
          <StatesSpecimen />
        </Proof>
        <Proof
          icon={<Waveform weight="duotone" />}
          title="Nothing jumps while it writes"
          body="Each value fills a placeholder in the shape of its words."
        >
          <FillSpecimen />
        </Proof>
        <Proof
          icon={<Keyboard weight="duotone" />}
          title="Fast for daily use"
          body="Number keys answer, Enter holds to sign, the pill finds what is open."
        >
          <KeysSpecimen />
        </Proof>
      </Section>

      <Section n="03" title="Design system" wide>
        <Kit />
        <SystemSpecimen />
      </Section>

      <Footer tune={tune} />
    </main>
  );
}

function Section({
  n,
  title,
  wide,
  children,
}: {
  n: string;
  title: string;
  wide?: boolean;
  children: ReactNode;
}) {
  return (
    <section className={classes.section}>
      <h3 className={classes.h3}>
        <span className={classes.n}>{n}</span>
        <span>{title}</span>
      </h3>
      <div className={wide ? classes.stack : classes.grid}>{children}</div>
    </section>
  );
}

function Proof({
  icon,
  title,
  body,
  children,
}: {
  icon: ReactNode;
  title: string;
  body: string;
  children: ReactNode;
}) {
  return (
    <article className={classes.proof}>
      <div className={classes.specimen} aria-hidden>
        {children}
      </div>
      <div className={classes.caption}>
        <span className={classes.icon}>{icon}</span>
        <div>
          <h4 className={classes.h4}>{title}</h4>
          <p className={classes.small}>{body}</p>
        </div>
      </div>
    </article>
  );
}
