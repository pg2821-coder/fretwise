export type Dot = { string: number; fret: number; root?: boolean; label?: string };

type Base = { prompt: string; note: string; hint?: string };

export type Exercise =
  | (Base & {
      kind: "chord";
      /** index 0 = low E ... 5 = high E. -1 muted, 0 open, n = fret */
      shape: number[];
      baseFret?: number;
      options: string[];
      answer: string;
    })
  | (Base & {
      kind: "ear";
      notes: string[];
      options: string[];
      answer: string;
    })
  | (Base & {
      kind: "shape";
      dots: Dot[];
      baseFret: number;
      options: string[];
      answer: string;
    })
  | (Base & {
      kind: "rhythm";
      bpm: number;
      beats: number;
      /** 0 = downbeats, 0.5 = offbeat "and", 0.25 = second 16th */
      offset?: number;
      tolerance?: number;
    })
  | (Base & {
      kind: "order";
      items: string[];
      answer: string[];
    });

/** The short teaching card shown before the questions. */
export type Brief = {
  concept: string;
  why: string;
  points: string[];
  tip: string;
};

export type Unit = {
  id: string;
  title: string;
  subtitle: string;
  icon: "chords" | "ear" | "scale" | "rhythm" | "song";
  status: "done" | "active" | "locked";
  lessonsDone: number;
  lessons: number;
  /** Title of the lesson you'd play next in this unit. */
  next: string;
  brief: Brief;
  exercises: Exercise[];
};

// ---------------------------------------------------------------- exercises

const D_A_SHAPE: Exercise = {
  kind: "chord",
  prompt: "Which CAGED shape is this D major?",
  shape: [-1, 5, 7, 7, 7, 5],
  baseFret: 5,
  options: ["A shape", "C shape", "E shape", "G shape"],
  answer: "A shape",
  hint: "Find the lowest note that isn't muted. Which open chord has its root on the 5th string?",
  note: "Root on the 5th string at the 5th fret — the open A chord dragged up the neck. Move the same grip to fret 7 and you get E major.",
};

const G_E_SHAPE: Exercise = {
  kind: "chord",
  prompt: "Which CAGED shape is this G major?",
  shape: [3, 5, 5, 4, 3, 3],
  baseFret: 3,
  options: ["E shape", "A shape", "D shape", "C shape"],
  answer: "E shape",
  hint: "Six strings ringing with the root on the low E string narrows it to one shape.",
  note: "A full barre with the root on string 6 is the E shape. Same fingering as open E moved up three frets.",
};

const C_C_SHAPE: Exercise = {
  kind: "chord",
  prompt: "Which CAGED shape is this F major?",
  shape: [-1, 8, 10, 10, 9, -1],
  baseFret: 8,
  options: ["C shape", "A shape", "G shape", "D shape"],
  answer: "C shape",
  hint: "Root on the 5th string, but the top note is a 3rd rather than a root — and one string is muted.",
  note: "The open C grip moved to fret 8. The C shape is the most awkward of the five, which is exactly why it's worth drilling.",
};

const CAGED_ORDER: Exercise = {
  kind: "order",
  prompt: "Order the CAGED shapes for A major, lowest position first",
  items: ["E shape (fret 5)", "C shape (fret 9)", "G shape (fret 2)", "A shape (open)"],
  answer: ["A shape (open)", "G shape (fret 2)", "E shape (fret 5)", "C shape (fret 9)"],
  hint: "The shapes always appear in the order C–A–G–E–D as you climb. Start from the one that needs no frets.",
  note: "C–A–G–E–D is a loop: whatever shape you're on, the next one up the neck is the next letter. That's the whole trick.",
};

const MAJ7_EAR: Exercise = {
  kind: "ear",
  prompt: "Name the chord quality",
  notes: ["C3", "E3", "G3", "B3"],
  options: ["Major 7", "Dominant 7", "Minor 7", "Half-diminished"],
  hint: "Listen to the top note against the bass. Does it feel restful and dreamy, or does it want to move?",
  answer: "Major 7",
  note: "That soft, floating top note is the major 7th (B over C). Dominant 7 would drop it a semitone to Bb and demand resolution.",
};

const DOM7_EAR: Exercise = {
  kind: "ear",
  prompt: "Name the chord quality",
  notes: ["G3", "B3", "D4", "F4"],
  options: ["Dominant 7", "Major 7", "Minor 7", "Diminished 7"],
  answer: "Dominant 7",
  hint: "Major 3rd underneath, but the top note grinds. That tension is the sound of wanting to go home.",
  note: "Major 3rd plus minor 7th — the bluesy, unresolved sound of a V chord. Here it's G7 pulling to C.",
};

const M7B5_EAR: Exercise = {
  kind: "ear",
  prompt: "Name the chord quality",
  notes: ["B3", "D4", "F4", "A4"],
  options: ["Half-diminished", "Minor 7", "Diminished 7", "Minor 6"],
  answer: "Half-diminished",
  hint: "Minor and unstable — but the top note is a whole step below the octave, not a minor 3rd above the 5th.",
  note: "m7b5: minor 3rd, flat 5th, natural 7th below the octave. Fully diminished would drop that A to Ab.",
};

const M7_EAR: Exercise = {
  kind: "ear",
  prompt: "Name the chord quality",
  notes: ["A3", "C4", "E4", "G4"],
  options: ["Minor 7", "Minor 6", "Major 7", "Half-diminished"],
  answer: "Minor 7",
  hint: "Minor and stable. Nothing in it is begging to resolve.",
  note: "Am7 — minor 3rd with a flat 7th. Compare with Am6, where that G lifts to F# and instantly sounds jazzier.",
};

const QUALITY_ORDER: Exercise = {
  kind: "order",
  prompt: "Order these qualities from most restful to most unstable",
  items: ["Dominant 7", "Major 7", "Diminished 7", "Minor 7"],
  answer: ["Major 7", "Minor 7", "Dominant 7", "Diminished 7"],
  hint: "Count how many notes in each chord are pulling somewhere else.",
  note: "Maj7 and m7 sit still, dominant 7 leans, and diminished 7 is nothing but tension — it can resolve four different ways.",
};

const DORIAN_SHAPE: Exercise = {
  kind: "shape",
  prompt: "Which mode is this shape?",
  baseFret: 4,
  dots: [
    { string: 0, fret: 5, root: true },
    { string: 0, fret: 7 },
    { string: 0, fret: 8 },
    { string: 1, fret: 5 },
    { string: 1, fret: 7 },
    { string: 2, fret: 4, label: "6" },
    { string: 2, fret: 5 },
    { string: 2, fret: 7 },
    { string: 3, fret: 4 },
    { string: 3, fret: 5 },
    { string: 3, fret: 7 },
    { string: 4, fret: 5 },
    { string: 4, fret: 7 },
    { string: 4, fret: 8 },
    { string: 5, fret: 5, root: true },
    { string: 5, fret: 7 },
    { string: 5, fret: 8 },
  ],
  options: ["A Dorian", "A Aeolian", "A Mixolydian", "A Phrygian"],
  answer: "A Dorian",
  hint: "It's clearly minor. Now check the 6th degree — is it natural or flat?",
  note: "The F# on the 4th string, 4th fret is the giveaway: a natural 6 over a minor 3rd. Aeolian would flatten it to F.",
};

const PENT_BOX2: Exercise = {
  kind: "shape",
  prompt: "Name this pentatonic box",
  baseFret: 7,
  dots: [
    { string: 0, fret: 8 },
    { string: 0, fret: 10 },
    { string: 1, fret: 7 },
    { string: 1, fret: 10 },
    { string: 2, fret: 7, root: true },
    { string: 2, fret: 10 },
    { string: 3, fret: 7 },
    { string: 3, fret: 9 },
    { string: 4, fret: 8 },
    { string: 4, fret: 10, root: true },
    { string: 5, fret: 8 },
    { string: 5, fret: 10 },
  ],
  options: [
    "A minor pentatonic, box 2",
    "A minor pentatonic, box 4",
    "E minor pentatonic, box 1",
    "D minor pentatonic, box 3",
  ],
  answer: "A minor pentatonic, box 2",
  hint: "Ignore the frets for a second and look only at the marked roots.",
  note: "Same five notes as C major pentatonic box 1 — the grid can't tell you the key, only the roots (marked A) can.",
};

const MODE_ORDER: Exercise = {
  kind: "order",
  prompt: "Order these modes brightest to darkest",
  items: ["Dorian", "Lydian", "Phrygian", "Mixolydian"],
  answer: ["Lydian", "Mixolydian", "Dorian", "Phrygian"],
  hint: "Major-sounding modes first. Then within the minor ones, the flatter the 2nd and 6th, the darker.",
  note: "Brightness tracks the altered degrees: #4, then natural 3 with b7, then minor 3 with natural 6, then b2.",
};

const MIXO_SHAPE: Exercise = {
  kind: "shape",
  prompt: "Which mode is this shape?",
  baseFret: 4,
  dots: [
    { string: 0, fret: 5, root: true },
    { string: 0, fret: 7 },
    { string: 1, fret: 4 },
    { string: 1, fret: 5 },
    { string: 1, fret: 7 },
    { string: 2, fret: 4 },
    { string: 2, fret: 6, label: "3" },
    { string: 2, fret: 7 },
    { string: 3, fret: 4 },
    { string: 3, fret: 5 },
    { string: 3, fret: 7 },
    { string: 4, fret: 5 },
    { string: 4, fret: 7 },
    { string: 5, fret: 5, root: true },
    { string: 5, fret: 7 },
  ],
  options: ["A Mixolydian", "A Ionian", "A Dorian", "A Lydian"],
  answer: "A Mixolydian",
  hint: "There's a major 3rd in there (C# on string 3). So which major-ish mode has a flat 7?",
  note: "Major 3rd plus a G natural instead of G# — Mixolydian. It's the mode that matches a dominant 7 chord, which is why blues and funk live here.",
};

const DORIAN_VS_AEOLIAN: Exercise = {
  kind: "ear",
  prompt: "Dorian or Aeolian?",
  notes: ["A3", "B3", "C4", "D4", "E4", "F#4", "G4", "A4"],
  options: ["Dorian", "Aeolian", "Phrygian", "Melodic minor"],
  answer: "Dorian",
  hint: "Focus on the sixth note of the run — the one just before the last two.",
  note: "That raised 6th (F#) lifts the whole scale. Aeolian's F natural is the sadder, heavier option.",
};

const OFFBEATS: Exercise = {
  kind: "rhythm",
  prompt: 'Tap the offbeats — the four "ands"',
  bpm: 92,
  beats: 4,
  offset: 0.5,
  tolerance: 110,
  hint: "Count 1-and-2-and out loud during the count-in, then tap only on the ands.",
  note: "Feel the click as the downbeat and place your hand exactly between two clicks. Offbeat security is what makes funk and reggae parts sit.",
};

const SIXTEENTH: Exercise = {
  kind: "rhythm",
  prompt: 'Tap the "e" of each beat — the second 16th',
  bpm: 76,
  beats: 4,
  offset: 0.25,
  tolerance: 95,
  hint: "Say 1-e-and-a. You want the syllable right after the number, not the halfway point.",
  note: "The 'e' is the hardest placement to internalise, and it's the backbone of 16th-note funk strumming.",
};

const DOWNBEATS_FAST: Exercise = {
  kind: "rhythm",
  prompt: "Hold the downbeats at 132",
  bpm: 132,
  beats: 4,
  tolerance: 85,
  hint: "Don't chase the click. Breathe, and let your hand fall with it rather than reacting to it.",
  note: "Faster tempos punish late taps. If you drift forward, you're reacting to the click instead of predicting it.",
};

const SUBDIVISION_ORDER: Exercise = {
  kind: "order",
  prompt: "Order these subdivisions from slowest to fastest",
  items: ["16th notes", "Quarter notes", "8th triplets", "8th notes"],
  answer: ["Quarter notes", "8th notes", "8th triplets", "16th notes"],
  hint: "Count how many of each fits inside one beat: one, two, three, four.",
  note: "One, two, three, four per beat. Knowing where triplets sit between 8ths and 16ths is what lets you swing on demand.",
};

const RHYTHM_CHANGES: Exercise = {
  kind: "order",
  prompt: "Build the first four bars of rhythm changes in Bb",
  items: ["Cm7", "Bb6", "F7", "G7"],
  answer: ["Bb6", "G7", "Cm7", "F7"],
  hint: "Start on the tonic and finish on the chord that pulls back to it.",
  note: "I → VI7 → ii7 → V7. The G7 is a secondary dominant: it borrows a B natural to pull hard into Cm7.",
};

const II_V_I: Exercise = {
  kind: "order",
  prompt: "Order a ii–V–I turnaround in C, plus its secondary dominant",
  items: ["Dm7", "G7", "A7", "Cmaj7"],
  answer: ["A7", "Dm7", "G7", "Cmaj7"],
  hint: "The secondary dominant comes before the chord it targets — and it targets Dm7.",
  note: "A7 is V of ii: it tonicises Dm7 for a bar before the regular ii–V–I lands. This is half of all jazz standards.",
};

const FUNCTION_QUIZ: Exercise = {
  kind: "order",
  prompt: "Order these by harmonic function: tonic, subdominant, dominant, tonic",
  items: ["G7", "Cmaj7", "Fmaj7", "Am7"],
  answer: ["Cmaj7", "Fmaj7", "G7", "Am7"],
  hint: "Am7 also works as a tonic substitute — it shares two notes with Cmaj7.",
  note: "Tonic → subdominant → dominant → tonic substitute. Function matters more than the chord name; Am7 stands in for C.",
};

const SECONDARY_EAR: Exercise = {
  kind: "ear",
  prompt: "Is this a diatonic ii7 or a secondary dominant?",
  notes: ["A3", "C#4", "E4", "G4"],
  options: ["Secondary dominant", "Diatonic ii7", "Diatonic vi7", "Tonic maj7"],
  answer: "Secondary dominant",
  hint: "In the key of C, one of these notes isn't in the scale.",
  note: "The C# is borrowed from outside C major — that makes it A7, V of Dm, not the diatonic Am7.",
};

const LITTLE_WING_CHORD: Exercise = {
  kind: "chord",
  prompt: "Which voicing opens the tune?",
  shape: [0, 2, 2, 0, 0, 0],
  baseFret: 1,
  options: ["Em", "Em7", "E7", "Emaj7"],
  answer: "Em",
  hint: "Only two fingers down, and every note belongs to the plain minor triad.",
  note: "Plain Em — then the melody moves on top while the shape stays put. That's the chord-melody idea in one bar.",
};

const LITTLE_WING_ORDER: Exercise = {
  kind: "order",
  prompt: "Order the first four chords of the verse",
  items: ["Bm", "F#m", "Em", "G"],
  answer: ["Em", "G", "Bm", "F#m"],
  hint: "It starts on the minor tonic and walks up before the two other minor chords arrive.",
  note: "Em → G → Bm → F#m. The G in the middle is what stops it feeling like a straight minor loop.",
};

const MELODY_EAR: Exercise = {
  kind: "ear",
  prompt: "Which interval does the melody rise by?",
  notes: ["B3", "D4"],
  options: ["Minor 3rd", "Major 3rd", "Perfect 4th", "Major 2nd"],
  answer: "Minor 3rd",
  hint: "Sing it back. Is it the sad-sounding gap or the happy one?",
  note: "A minor 3rd — three semitones. Recognising it instantly is how you find melodies by ear instead of by tab.",
};

const TOP_NOTE_ORDER: Exercise = {
  kind: "order",
  prompt: "Order these top-string melody notes as they appear over Em",
  items: ["G (fret 3)", "E (open)", "B (open)", "D (fret 10)"],
  answer: ["E (open)", "G (fret 3)", "B (open)", "D (fret 10)"],
  hint: "Lowest pitch first — the open E string is the bottom of the group.",
  note: "Each note is a chord tone or the b7. Keeping the melody on string 1 lets the voicing underneath keep ringing.",
};

// ---------------------------------------------------------------- units

export const UNITS: Unit[] = [
  {
    id: "caged",
    title: "CAGED System",
    subtitle: "One chord, five shapes, whole neck",
    icon: "chords",
    status: "done",
    lessonsDone: 5,
    lessons: 5,
    next: "Shape recognition above fret 5",
    brief: {
      concept:
        "Every major chord can be played five ways, using the shapes of the open C, A, G, E and D chords moved up the neck.",
      why: "Once you see the five shapes, you stop hunting for chords and start choosing a voicing for its sound and position.",
      points: [
        "The shapes always appear in the order C–A–G–E–D as you climb.",
        "Identify a shape by its root string: E shape roots on string 6, A and C shapes on string 5, D shape on string 4.",
        "Each shape carries an arpeggio and a scale position with it.",
      ],
      tip: "Say the shape name out loud before you name the chord — that link is what you're building.",
    },
    exercises: [D_A_SHAPE, G_E_SHAPE, C_C_SHAPE, CAGED_ORDER],
  },
  {
    id: "ear",
    title: "Chord Quality by Ear",
    subtitle: "maj7 vs 7 vs m7 vs m7b5",
    icon: "ear",
    status: "done",
    lessonsDone: 4,
    lessons: 4,
    next: "Four qualities, no context",
    brief: {
      concept:
        "Four seventh chords cover most music you'll play. Telling them apart by ear is a matter of hearing two things: the 3rd and the 7th.",
      why: "Naming a quality by ear means you can follow a song's changes without tab, and you can hear when your own voicing is wrong.",
      points: [
        "Major 3rd + major 7th = restful maj7. Major 3rd + flat 7th = restless dominant 7.",
        "Minor 3rd + flat 7th = stable m7. Add a flat 5th and it becomes the uneasy m7b5.",
        "Sing the top note against the bass — that gap is the answer.",
      ],
      tip: "Replay each arpeggio twice: once to hear the whole colour, once to isolate the top note.",
    },
    exercises: [MAJ7_EAR, DOM7_EAR, M7_EAR, M7B5_EAR, QUALITY_ORDER],
  },
  {
    id: "modes",
    title: "Modes over One Root",
    subtitle: "Dorian, Mixolydian, Aeolian shapes",
    icon: "scale",
    status: "active",
    lessonsDone: 2,
    lessons: 5,
    next: "Dorian vs Aeolian, and the box behind them",
    brief: {
      concept:
        "Keep the root fixed on A and change one or two notes. Every mode is the A minor or A major scale with a single degree moved.",
      why: "Thinking in one root instead of seven parent keys is what lets you change flavour mid-solo without shifting position.",
      points: [
        "Dorian = minor with a natural 6. Aeolian = minor with a flat 6.",
        "Mixolydian = major with a flat 7 — the sound of a dominant chord.",
        "Pentatonic boxes sit inside every one of these; the mode just adds two notes.",
      ],
      tip: "When you see a shape, find the roots first. The frets alone never tell you the key.",
    },
    exercises: [DORIAN_SHAPE, DORIAN_VS_AEOLIAN, MIXO_SHAPE, PENT_BOX2, MODE_ORDER],
  },
  {
    id: "rhythm",
    title: "Syncopation & Subdivision",
    subtitle: "Offbeats, 16ths, staying in the pocket",
    icon: "rhythm",
    status: "locked",
    lessonsDone: 0,
    lessons: 4,
    next: "Offbeats and the 'e' of the beat",
    brief: {
      concept:
        "A beat splits into halves, thirds and quarters. Syncopation is simply landing on the parts that aren't the number.",
      why: "Most intermediate players have the notes and lose the groove. Placement is what makes a part sound professional.",
      points: [
        'Count "1 e and a" out loud and you can name any 16th placement.',
        "Offbeats are the halfway point between two clicks — feel them, don't calculate them.",
        "Drift forward means you're reacting to the click instead of predicting it.",
      ],
      tip: "Keep your foot on the downbeat even when your hand is playing between them.",
    },
    exercises: [OFFBEATS, SIXTEENTH, DOWNBEATS_FAST, SUBDIVISION_ORDER],
  },
  {
    id: "theory",
    title: "Functional Harmony",
    subtitle: "ii–V–I, secondary dominants, turnarounds",
    icon: "song",
    status: "locked",
    lessonsDone: 0,
    lessons: 6,
    next: "Turnarounds and borrowed dominants",
    brief: {
      concept:
        "Chords have jobs. Tonic is home, subdominant moves away, dominant pulls back — and any chord can be temporarily treated as home.",
      why: "Hearing function rather than chord names is how you transpose on the fly, reharmonise, and improvise over changes.",
      points: [
        "ii–V–I is the engine: Dm7 → G7 → Cmaj7 in the key of C.",
        "A secondary dominant is a V chord aimed at something other than the tonic (A7 → Dm7).",
        "One note outside the key usually signals a borrowed dominant.",
      ],
      tip: "Label chords with numbers, not letters. The numbers survive a key change.",
    },
    exercises: [II_V_I, SECONDARY_EAR, RHYTHM_CHANGES, FUNCTION_QUIZ],
  },
  {
    id: "song",
    title: 'Chord Melody: "Little Wing"',
    subtitle: "Melody on top of moving voicings",
    icon: "song",
    status: "locked",
    lessonsDone: 0,
    lessons: 6,
    next: "The verse, melody on string 1",
    brief: {
      concept:
        "Chord melody keeps a voicing ringing underneath while the top string carries the tune. Everything you've drilled shows up here at once.",
      why: "This is the payoff: shapes, modes and function turned into an arrangement you can play alone and it still sounds complete.",
      points: [
        "Hold the shape, move only the melody finger.",
        "Melody notes are usually chord tones — the b7 and 9 are the spice.",
        "The verse walks Em → G → Bm → F#m before the fills start.",
      ],
      tip: "Play the melody alone first, then add the chord underneath. Never the other way round.",
    },
    exercises: [LITTLE_WING_CHORD, MELODY_EAR, LITTLE_WING_ORDER, TOP_NOTE_ORDER],
  },
];

/** The daily mix — one question pulled from each area of the path. */
export const SESSION: Exercise[] = [
  D_A_SHAPE,
  MAJ7_EAR,
  DORIAN_SHAPE,
  PENT_BOX2,
  OFFBEATS,
  MODE_ORDER,
  RHYTHM_CHANGES,
];

export const DAILY_BRIEF: Brief = {
  concept:
    "A mixed set: one question from each area you're working on, so nothing you've learned goes stale.",
  why: "Spaced review is why a skill you drilled last month is still there today — mixing topics beats repeating one.",
  points: [
    "Two shape reads, one ear check, one timing drill and two ordering puzzles.",
    "Every answer comes with the reason, not just right or wrong.",
    "The timer runs while you play; real minutes feed your streak.",
  ],
  tip: "Guitar in hand. Play each answer before you tap it — that's the point.",
};
