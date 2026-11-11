# Sourced Note

A clinical encounter note that writes itself from a visit transcript, where every line shows the words it came from. When the draft cannot know something (a conflict between sources, a gap nobody talked about, or a clinical judgment), it asks one clear question instead of guessing. The clinician answers, then holds to sign.

Live: [sourced-note.vercel.app](https://sourced-note.vercel.app)

> **Demo only.** The patient, clinician, clinic and transcript are synthetic. The "AI" is simulated: the draft is scripted data, played back with realistic pacing. Nothing here is affiliated with any company or product.

## Stack

React 19, [Mantine 9](https://mantine.dev), TypeScript (strict), Vite, Motion, Vitest with Testing Library.

```bash
nvm use            # Node 22
npm ci
npm run dev        # http://localhost:5173
npm run check      # typecheck, lint, format check, tests, production build
```

| Script                      | Does                                            |
| --------------------------- | ----------------------------------------------- |
| `dev` / `build` / `preview` | Vite                                            |
| `typecheck`                 | `tsc -b`                                        |
| `lint`                      | ESLint, including the React Compiler hook rules |
| `format` / `format:check`   | Prettier                                        |
| `test` / `test:watch`       | Vitest                                          |
| `check`                     | Everything CI runs                              |

CI (`.github/workflows/ci.yml`) runs the same steps on every push and pull request.

## Layout

```
src/
  app/         Entry wiring: Mantine theme, design tokens, colour scheme, global CSS
  features/
    note/      The product. Self-contained, never imports from showcase/
      model/       Pure types, state machine and selectors (unit tested)
      data/        The synthetic demo encounter
      hooks/       Timing and layout: transcript stream, drafting sequence, column flip
      components/  One folder per component, CSS Module beside it
      index.ts     Public API
  showcase/    The page around the product: cover, case study, kit, footer, playground
  shared/      Motion curves, scroll helpers, hash routing
  test/        Test setup and render helpers
```

The rule that keeps this pluggable: `features/note` depends only on `shared/` and its own files. The showcase is the portfolio wrapper and could be deleted without touching the product.

## How the note works

**One reducer owns the note.** `model/noteReducer.ts` is a pure state machine: `recording → transcribed → drafting → review → signing → filed ⇄ note`. Every field is `empty`, `drafted`, `edited`, `needs` (an open question) or `decided`. It has no timers, DOM or clock (the signing time is passed in), so every transition is tested in isolation. Actions that don't fit the current phase are ignored, so stray clicks or late timers can't corrupt the note.

**Data drives everything.** An `Encounter` (`model/types.ts`) holds the transcript as turns of segments. A segment can carry a `span` id, and each field cites the spans it came from. Fields come in four kinds:

- `cited`: drafted from the transcript, editable, shows its sources
- `conflict`: sources disagree, the clinician picks one, and the note then cites only the chosen side
- `gap`: nobody covered it, so the note says "Not assessed" or takes a typed value
- `judgment`: a clinical call, shown with the lines that can help, decided by the clinician

`validateEncounter()` catches broken references (a field citing a span that doesn't exist, a question with no options) and runs in the test suite against the demo data.

**Timing lives in hooks.** Components dispatch; hooks own the clock.

## Plugging in a real backend

The simulated parts sit behind two hooks with narrow contracts:

| Seam                           | Today                                      | With a real service                                             |
| ------------------------------ | ------------------------------------------ | --------------------------------------------------------------- |
| `hooks/useTranscriptStream.ts` | Plays the scripted transcript word by word | Append turns as a speech-to-text stream delivers them           |
| `hooks/useDraftingSequence.ts` | Reveals fields on a stagger                | Dispatch `reveal` per field as the drafting response streams in |

Map the service's output to the `Encounter` type (turns with cited spans, fields with sources and options) and the rest of the workspace is unchanged. `onSigned(time)` on `NoteWorkspace` is where a host app would persist the signed note.

```tsx
import { NoteWorkspace, validateEncounter } from '@/features/note';

<NoteWorkspace encounter={encounter} onSigned={(at) => save(encounter, at)} />;
```

`startAt` (`recording`, `review`, `ready`, `filed`) opens the workspace mid-flow, which the case study and tests use.

## Mantine usage

- `MantineProvider` with a custom theme and `cssVariablesResolver` (`app/theme.ts`). Product tokens are `--sn-*` variables with light and dark values, so components never hard-code colours.
- Colour scheme is stored by `localStorageColorSchemeManager`; a small inline script in `index.html` applies it before first paint, so dark mode never flashes.
- Only the Mantine styles in use are imported, as `*.layer.css` (`app/mantine.css`). They sit in a cascade layer, so the app's CSS Modules win without `!important`.
- Mantine components where they fit: `Button`, `ActionIcon`, `UnstyledButton`, `Switch`, `TextInput`, `Tooltip`, `Badge`, `Avatar`, `Kbd`, plus `useFocusTrap`, `useFocusReturn` and `useWindowEvent` for the source sheet.

## Conventions

- **CSS Modules** beside each component. Cross-component hooks use `data-*` attributes (`data-field`, `data-span`, `data-scroll-area`, `data-note-compact`) instead of class names, so styles can be renamed freely.
- **Reduced motion** is respected everywhere through `useNote().reduce`.
- **Accessibility:** questions answer with number keys or clicks, signing works with a held Space or Enter, the source sheet traps and returns focus, and status changes are announced.
- **TypeScript** is strict with `noUncheckedIndexedAccess`. ESLint includes the React Compiler rules, so no state is set inside effects and no refs are read during render.

## Routes

- `/`: the case study page with the working prototype
- `/#tune`: the cover with live tuning controls
- `/#play`: a playground for the workspace settings
