import { useEffect, useMemo, useRef, useState } from "react";
import {
  Heart,
  X,
  Volume2,
  Check,
  ArrowRight,
  RotateCcw,
  Hand,
  Timer,
  Lightbulb,
  BookOpen,
  Sparkles,
} from "lucide-react";
import type { Brief, Exercise } from "@/lib/fretwise-data";
import { noteToFreq, playClick, playSequence, resumeAudio } from "@/lib/audio";
import { NowPlay } from "./NowPlay";
import { ChordDiagram, ScaleDiagram } from "./Diagrams";

export type LessonResult = { xp: number; correct: number; total: number; seconds: number; drillsOnly?: boolean };

export const fmtClock = (seconds: number) =>
  `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;

export function Lesson({
  unitId,
  title,
  subtitle,
  brief,
  exercises,
  onExit,
  onFinish,
  onDrill,
  sequential = false,
}: {
  unitId: string | null;
  title: string;
  subtitle: string;
  brief: Brief;
  exercises: Exercise[];
  onExit: () => void;
  onFinish: (r: LessonResult) => void;
  onDrill?: ((index: number, correct: boolean) => void) | undefined;
  sequential?: boolean;
}) {
  const [started, setStarted] = useState(false);
  const [drillResult, setDrillResult] = useState<LessonResult | null>(null);

  if (drillResult) return <NowPlay unitId={unitId} onDone={(playSeconds, skipped) => onFinish({
    ...drillResult,
    seconds: drillResult.seconds + playSeconds,
    xp: drillResult.xp - Math.round((drillResult.seconds / 60) * 10) + Math.round(((drillResult.seconds + playSeconds) / 60) * 10),
    drillsOnly: skipped,
  })} />;

  if (!started)
    return (
      <BriefCard
        title={title}
        subtitle={subtitle}
        brief={brief}
        count={exercises.length}
        onExit={onExit}
        onStart={() => setStarted(true)}
      />
    );

  return (
    <Questions
      title={title}
      brief={brief}
      exercises={exercises}
      onExit={onExit}
      onFinish={setDrillResult}
      onDrill={onDrill}
      sequential={sequential}
    />
  );
}

function BriefCard({
  title,
  subtitle,
  brief,
  count,
  onExit,
  onStart,
}: {
  title: string;
  subtitle: string;
  brief: Brief;
  count: number;
  onExit: () => void;
  onStart: () => void;
}) {
  return (
    <div className="mx-auto flex min-h-screen max-w-3xl flex-col px-6 py-8">
      <header className="flex items-center gap-4">
        <button
          onClick={onExit}
          aria-label="Exit lesson"
          className="grid h-9 w-9 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-secondary"
        >
          <X className="h-5 w-5" />
        </button>
        <span className="text-xs uppercase tracking-widest text-muted-foreground">Before you play</span>
      </header>

      <div className="animate-rise mt-8 flex-1">
        <p className="max-sm:min-h-14 max-sm:w-full max-sm:justify-center inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          <BookOpen className="h-3.5 w-3.5 text-accent" /> {subtitle}
        </p>
        <h1 className="mt-4 font-display text-4xl font-bold leading-tight">{title}</h1>
        <p className="mt-4 text-lg text-muted-foreground">{brief.concept}</p>

        <div className="mt-8 rounded-3xl border border-border bg-surface p-6">
          <h2 className="font-display text-sm font-bold uppercase tracking-widest text-accent">
            Why it matters
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">{brief.why}</p>

          <h2 className="mt-6 font-display text-sm font-bold uppercase tracking-widest text-accent">
            Keep in mind
          </h2>
          <ul className="mt-3 space-y-3">
            {brief.points.map((p) => (
              <li key={p} className="flex gap-3 text-sm">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="mt-6 flex items-start gap-3 rounded-3xl border border-primary/30 bg-primary/10 p-5 text-sm">
          <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <span>
            <span className="font-display font-bold">Practice tip · </span>
            {brief.tip}
          </span>
        </p>
      </div>

      <footer className="sticky bottom-0 -mx-6 mt-8 flex flex-wrap items-center gap-4 border-t border-border bg-background/90 px-6 py-5 backdrop-blur">
        <button
          onClick={onStart}
          className="max-sm:min-h-14 max-sm:w-full max-sm:justify-center inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-display font-bold text-primary-foreground shadow-glow transition-transform hover:-translate-y-0.5"
        >
          Start the {count} drills <ArrowRight className="h-4 w-4" />
        </button>
        <span className="text-sm text-muted-foreground">The timer starts when you do.</span>
      </footer>
    </div>
  );
}

function Questions({
  title,
  brief,
  exercises,
  onExit,
  onFinish,
  onDrill,
  sequential = false,
}: {
  title: string;
  brief: Brief;
  exercises: Exercise[];
  onExit: () => void;
  onFinish: (r: LessonResult) => void;
  onDrill?: ((index: number, correct: boolean) => void) | undefined;
  sequential?: boolean;
}) {
  const [step, setStep] = useState(0);
  const [attempt, setAttempt] = useState(0);
  const [hearts, setHearts] = useState(3);
  const [correct, setCorrect] = useState(0);
  const firstAnswers = useRef(new Map<number, boolean>());
  const submittedAttempt = useRef<string | null>(null);
  const [state, setState] = useState<"idle" | "right" | "wrong">("idle");
  const [seconds, setSeconds] = useState(0);
  const [hinted, setHinted] = useState(false);
  const ex = exercises[step]!;

  useEffect(() => {
    const started = Date.now();
    const id = window.setInterval(() => setSeconds(Math.round((Date.now() - started) / 1000)), 1000);
    return () => window.clearInterval(id);
  }, []);

  const submit = (ok: boolean) => {
    const attemptKey = `${step}-${attempt}`;
    if (state !== "idle" || submittedAttempt.current === attemptKey) return;
    submittedAttempt.current = attemptKey;
    if (!firstAnswers.current.has(step)) firstAnswers.current.set(step, ok);
    setState(ok ? "right" : "wrong");
    if (ok) setCorrect((c) => c + 1);
    else setHearts((h) => Math.max(0, h - 1));
    onDrill?.(step, ok);
  };

  const next = () => {
    if (sequential && state === "wrong") {
      setState("idle");
      setHinted(false);
      setAttempt((a) => a + 1);
      return;
    }
    if (step + 1 >= exercises.length) {
      const minutes = seconds / 60;
      onFinish({
        xp: correct * 12 + Math.round(minutes * 10),
        correct: [...firstAnswers.current.values()].filter(Boolean).length,
        total: exercises.length,
        seconds,
      });
      return;
    }
    setState("idle");
    setHinted(false);
    setStep((s) => s + 1);
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-3xl flex-col px-6 py-8">
      <header className="flex items-center gap-4">
        <button
          onClick={onExit}
          aria-label="Exit lesson"
          className="grid h-9 w-9 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-secondary"
        >
          <X className="h-5 w-5" />
        </button>
        <div className="h-3 flex-1 rounded-full bg-secondary">
          <div
            className="h-full rounded-full bg-primary transition-[width] duration-500"
            style={{ width: `${(step / exercises.length) * 100}%` }}
          />
        </div>
        <span
          aria-label="Time practiced"
          className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 font-display text-sm font-bold tabular-nums text-foreground"
        >
          <Timer className="h-4 w-4 text-accent" /> {fmtClock(seconds)}
        </span>
        <div className="flex items-center gap-1">
          {[0, 1, 2].map((i) => (
            <Heart
              key={i}
              className={`h-5 w-5 ${i < hearts ? "fill-destructive text-destructive" : "text-muted-foreground"}`}
            />
          ))}
        </div>
      </header>

      <div key={`${step}-${attempt}`} className="animate-rise mt-10 flex-1">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">
          {title} · question {step + 1} of {exercises.length}
        </p>
        <h2 className="mt-2 font-display text-3xl font-bold">{ex.prompt}</h2>
        <div className="mt-8">
          <ExerciseBody ex={ex} locked={state !== "idle"} onAnswer={submit} />
        </div>

        {state === "idle" && (
          <div className="mt-6">
            {hinted ? (
              <p className="animate-rise flex items-start gap-3 rounded-2xl border border-accent/30 bg-accent/10 p-4 text-sm">
                <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                <span>{ex.hint ?? brief.tip}</span>
              </p>
            ) : (
              <button
                onClick={() => setHinted(true)}
                className="inline-flex items-center gap-2 text-sm font-semibold text-accent hover:underline"
              >
                <Lightbulb className="h-4 w-4" /> Show me a hint
              </button>
            )}
          </div>
        )}
      </div>

      <footer className="sticky bottom-0 -mx-6 mt-8 border-t border-border bg-background/90 px-6 py-5 backdrop-blur">
        {state === "idle" ? (
          <p className="text-sm text-muted-foreground">
            {ex.kind === "rhythm" ? "Tap along with the click." : "Pick your answer."}
          </p>
        ) : (
          <div className={state === "wrong" ? "animate-shake" : "animate-pop"}>
            <p
              className={`font-display text-lg font-bold ${state === "right" ? "text-success" : "text-destructive"}`}
            >
              {state === "right" ? "Clean." : "Not quite."}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">{ex.note}</p>
            <button
              onClick={next}
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-display font-bold text-primary-foreground transition-transform hover:-translate-y-0.5"
            >
              {sequential && state === "wrong" ? "Try again" : step + 1 >= exercises.length ? "Now play it" : "Continue"} <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </footer>
    </div>
  );
}

function ExerciseBody({
  ex,
  locked,
  onAnswer,
}: {
  ex: Exercise;
  locked: boolean;
  onAnswer: (ok: boolean) => void;
}) {
  if (ex.kind === "rhythm") return <RhythmDrill ex={ex} locked={locked} onAnswer={onAnswer} />;
  if (ex.kind === "order") return <OrderDrill ex={ex} locked={locked} onAnswer={onAnswer} />;

  return (
    <div className="space-y-8">
      {ex.kind === "chord" && (
        <div className="flex justify-center rounded-3xl border border-border bg-surface py-6">
          <ChordDiagram shape={ex.shape} baseFret={ex.baseFret ?? 1} />
        </div>
      )}
      {ex.kind === "shape" && (
        <div className="flex justify-center rounded-3xl border border-border bg-surface p-6">
          <ScaleDiagram dots={ex.dots} baseFret={ex.baseFret} />
        </div>
      )}
      {ex.kind === "ear" && (
        <div className="flex flex-col items-center gap-4 rounded-3xl border border-border bg-surface p-8">
          <button
            onClick={() => { void resumeAudio().then(() => playSequence(ex.notes.map(noteToFreq), 0.7)); }}
            className="max-sm:min-h-14 max-sm:w-full max-sm:justify-center inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 font-display font-bold text-accent-foreground transition-transform hover:-translate-y-0.5"
          >
            <Volume2 className="h-5 w-5" /> {ex.notes.length > 2 ? "Play the arpeggio" : "Play the two notes"}
          </button>
          <p className="text-sm text-muted-foreground">Replay as many times as you need.</p>

        </div>
      )}
      <Choices options={ex.options} answer={ex.answer} locked={locked} onAnswer={onAnswer} />
    </div>
  );
}

function Choices({
  options,
  answer,
  locked,
  onAnswer,
}: {
  options: string[];
  answer: string;
  locked: boolean;
  onAnswer: (ok: boolean) => void;
}) {
  const [picked, setPicked] = useState<string | null>(null);

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {options.map((o) => {
        const isPicked = picked === o;
        const reveal = locked && o === answer;
        return (
          <button
            key={o}
            disabled={locked}
            onClick={() => {
              setPicked(o);
              onAnswer(o === answer);
            }}
            className={[
              "max-sm:min-h-14 max-sm:w-full rounded-2xl border px-5 py-4 text-left font-medium transition-all",
              reveal
                ? "border-success bg-success/15 text-success"
                : isPicked
                  ? "border-destructive bg-destructive/15 text-destructive"
                  : "border-border bg-surface hover:border-primary hover:bg-surface-raised",
            ].join(" ")}
          >
            <span className="flex items-center justify-between gap-3">
              {o}
              {reveal && <Check className="h-4 w-4" />}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function OrderDrill({
  ex,
  locked,
  onAnswer,
}: {
  ex: Extract<Exercise, { kind: "order" }>;
  locked: boolean;
  onAnswer: (ok: boolean) => void;
}) {
  const [chosen, setChosen] = useState<string[]>([]);
  const pool = useMemo(() => ex.items.filter((i) => !chosen.includes(i)), [ex.items, chosen]);
  const full = chosen.length === ex.answer.length;

  return (
    <div className="space-y-6">
      <div className="flex min-h-20 flex-wrap items-center gap-3 rounded-3xl border border-dashed border-border bg-surface p-4">
        {chosen.length === 0 && <span className="px-2 text-sm text-muted-foreground">Tap them in order…</span>}
        {chosen.map((c, i) => (
          <button
            key={c}
            disabled={locked}
            onClick={() => setChosen((cs) => cs.filter((x) => x !== c))}
            className="max-sm:min-h-14 max-sm:w-full animate-pop rounded-2xl bg-primary px-4 py-2.5 font-display font-bold text-primary-foreground"
          >
            <span className="mr-2 opacity-60">{i + 1}</span>
            {c}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-3">
        {pool.map((c) => (
          <button
            key={c}
            disabled={locked}
            onClick={() => setChosen((cs) => [...cs, c])}
            className="max-sm:min-h-14 max-sm:w-full rounded-2xl border border-border bg-surface px-4 py-2.5 font-display font-bold transition-colors hover:border-primary hover:bg-surface-raised"
          >
            {c}
          </button>
        ))}
      </div>
      {!locked && (
        <div className="flex items-center gap-3">
          <button
            disabled={!full}
            onClick={() => onAnswer(chosen.join("|") === ex.answer.join("|"))}
            className="max-sm:min-h-14 max-sm:flex-1 rounded-full bg-primary px-6 py-3 font-display font-bold text-primary-foreground disabled:opacity-40"
          >
            Check
          </button>
          <button
            onClick={() => setChosen([])}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="h-4 w-4" /> Reset
          </button>
        </div>
      )}
      {locked && (
        <p className="text-sm text-muted-foreground">
          Correct order: <span className="font-semibold text-foreground">{ex.answer.join(" → ")}</span>
        </p>
      )}
    </div>
  );
}

function RhythmDrill({
  ex,
  locked,
  onAnswer,
}: {
  ex: Extract<Exercise, { kind: "rhythm" }>;
  locked: boolean;
  onAnswer: (ok: boolean) => void;
}) {
  const interval = 60000 / ex.bpm;
  const offset = ex.offset ?? 0;
  const tolerance = ex.tolerance ?? 150;
  const [phase, setPhase] = useState<"ready" | "count" | "tap">("ready");
  const [beat, setBeat] = useState(-1);
  const [taps, setTaps] = useState<number[]>([]);
  const [drift, setDrift] = useState<number | null>(null);
  const startRef = useRef(0);
  const timers = useRef<number[]>([]);

  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);

  const begin = async () => {
    await resumeAudio();
    setTaps([]);
    setDrift(null);
    setPhase("count");
    const t0 = performance.now();
    for (let i = 0; i < ex.beats * 3; i++) {
      timers.current.push(
        window.setTimeout(() => {
          playClick(i % ex.beats === 0);
          setBeat(i % ex.beats);
          if (i === ex.beats) {
            startRef.current = t0 + (ex.beats + offset) * interval;
            setPhase("tap");
          }
        }, i * interval),
      );
    }
  };

  const tap = () => {
    if (phase !== "tap" || locked) return;
    const now = performance.now();
    const next = [...taps, now];
    setTaps(next);
    if (next.length >= ex.beats) {
      const errors = next.map((t, i) => Math.abs(t - (startRef.current + i * interval)));
      const avg = errors.reduce((a, b) => a + b, 0) / errors.length;
      setDrift(Math.round(avg));
      setPhase("ready");
      onAnswer(avg < tolerance);
    }
  };

  return (
    <div className="rounded-3xl border border-border bg-surface p-8 text-center">
      <div className="flex justify-center gap-3">
        {Array.from({ length: ex.beats }).map((_, i) => (
          <span
            key={i}
            className={`h-4 w-4 rounded-full transition-all ${
              i < taps.length ? "bg-success" : beat === i && phase !== "ready" ? "scale-150 bg-primary" : "bg-secondary"
            }`}
          />
        ))}
      </div>
      <p className="mt-4 text-sm text-muted-foreground">
        {ex.bpm} BPM ·{" "}
        {phase === "count"
          ? "count-in…"
          : phase === "tap"
            ? offset
              ? "tap between the clicks"
              : "tap now"
            : offset
              ? `${ex.beats} offbeats · within ${tolerance} ms`
              : `${ex.beats} downbeats · within ${tolerance} ms`}
      </p>

      {phase === "ready" ? (
        <button
          onClick={begin}
          disabled={locked}
          className="max-sm:min-h-14 max-sm:w-full max-sm:justify-center mt-6 inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 font-display font-bold text-accent-foreground disabled:opacity-40"
        >
          <Volume2 className="h-5 w-5" /> Start the click
        </button>
      ) : (
        <button
          onClick={tap}
          disabled={phase !== "tap"}
          className="max-sm:w-full mt-6 inline-flex h-28 w-28 flex-col items-center justify-center gap-1 rounded-full bg-primary font-display font-bold text-primary-foreground transition-transform active:scale-95 disabled:bg-secondary disabled:text-muted-foreground"
        >
          <Hand className="h-6 w-6" /> {phase === "tap" ? "Tap" : "Listen"}
        </button>
      )}
      {drift !== null && (
        <p className="mt-5 text-sm text-muted-foreground">
          Average drift <span className="font-semibold text-foreground">{drift} ms</span>
        </p>
      )}
    </div>
  );
}
