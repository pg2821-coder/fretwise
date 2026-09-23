# Fretwise — gamified guitar practice for intermediate players

A polished single-page prototype that takes Duolingo's daily-streak learning loop and rebuilds it for intermediate guitarists: ear training, chord changes, scale fluency, and song sections instead of vocabulary.

## Screens (one page, three states)

1. **Landing screen** — bold hero with the promise ("15 minutes a day to finally break out of the campfire chords"), a fretboard-inspired visual, three value points, and a single "Start today's session" call to action. Includes a small demo of the streak ring and skill path.
2. **Home / path** — the main hub after entering:
   - Top bar: streak counter with flame, weekly XP, gem-style "practice tokens", and a level badge.
   - Daily goal ring showing minutes practiced today.
   - Vertical skill path of units (Chord Changes, Ear Training, Pentatonic Fluency, Rhythm & Strumming, Song: "Little Wing" intro) with locked, in-progress, and completed nodes.
   - Side panels: 7-day streak calendar, daily quests ("Play 60 clean chord changes"), and a friends leaderboard with invented users.
3. **Lesson flow** — end-to-end, working:
   - Progress bar + heart/attempt counter.
   - 5 mixed exercise types: name-the-chord from a fretboard diagram, interval ear-training multiple choice, "which scale shape is this" picker, tap-the-beat rhythm timing exercise, and reorder-the-chord-progression drag/tap.
   - Immediate correct/incorrect feedback with a short teaching note.
   - Session summary: XP earned, accuracy, streak incremented, "continue" back to the path with the unit visibly progressed.

## Feel

Modern, dark, warm-wood-and-neon: deep charcoal surfaces, amber/copper primary (guitar tonewood), a cool teal accent for correct answers. Confident geometric display type for headings, clean sans for UI. Rounded cards, soft glows on active nodes, snappy micro-animations for streak increments, node completion, and answer feedback. No purple-gradient default look.

## Content

All invented but realistic: unit names, exercise questions with real music theory (intervals, CAGED shapes, pentatonic boxes, common progressions), teaching notes, leaderboard names and XP, quest copy, streak history.

## Technical notes

- Single route at `/` (replacing the placeholder index), split into presentational components under `src/components/`.
- State held in React (`useState`/`useReducer`) — screen state, session progress, XP/streak. No backend, no persistence; refresh resets. Say so if you want progress to survive a reload later.
- Fretboard diagrams, streak ring, and rhythm meter drawn as inline SVG/CSS, no image or audio dependencies.
- All colors added as semantic tokens in `src/styles.css`; animations via Tailwind and Motion.
- Route `head()` gets an app-specific title, description, and og/twitter tags.
