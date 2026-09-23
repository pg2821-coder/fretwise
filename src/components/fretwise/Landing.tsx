import { Flame, Headphones, Guitar, Target, ArrowRight, Music4 } from "lucide-react";
import { ChordDiagram, StreakRing } from "./Diagrams";
import type { Unit } from "@/lib/fretwise-data";
import type { Stats } from "./PathHome";
import { DAILY_GOAL } from "@/lib/progress";

const VALUES = [
  {
    icon: Target,
    title: "Starts past the basics",
    body: "No shape-naming drills. Day one is CAGED voicings up the neck, modal shapes and the five pentatonic boxes.",
  },
  {
    icon: Headphones,
    title: "Ears, hands, theory",
    body: "Chord qualities by ear, syncopation checked against a click, and the harmony behind what you're playing.",
  },
  {
    icon: Flame,
    title: "Streaks that respect 15 minutes",
    body: "One short session a day. Your streak and minutes are counted from the days you actually practise.",
  },
];


export function Landing({
  onStart,
  stats,
  units,
  hasProgress,
  signedIn,
  onSignIn,
}: {
  onStart: () => void;
  stats: Stats;
  units: Unit[];
  hasProgress: boolean;
  signedIn: boolean;
  onSignIn: () => void;
}) {
  const nextUnit = units.find((unit) => unit.status === "active");
  return (
    <main className="mx-auto max-w-6xl px-6 pb-24 pt-10">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground">
            <Guitar className="h-5 w-5" />
          </span>
          <span className="font-display text-lg font-bold tracking-tight">Fretwise</span>
        </div>
        {!signedIn && (
          <button
            onClick={onSignIn}
            className="rounded-full border border-border px-4 py-2 text-sm font-semibold transition-colors hover:bg-surface"
          >
            Sign in
          </button>
        )}
      </header>

      <section className="mt-16 grid items-center gap-14 md:mt-24 md:grid-cols-[1.05fr_0.95fr]">
        <div className="animate-rise">
          <p className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs uppercase tracking-widest text-muted-foreground">
            <Music4 className="h-3.5 w-3.5 text-primary" /> for intermediate players
          </p>
          <h1 className="mt-6 font-display text-5xl font-bold leading-[1.05] md:text-6xl">
            15 minutes a day to finally own the whole neck.
          </h1>
          <p className="mt-6 max-w-xl text-lg text-muted-foreground">
            Fretwise turns the practice you keep avoiding — modes, CAGED shifts, chord qualities by ear, offbeat
            timing — into a short daily session you actually finish.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-4">
            <button
              onClick={onStart}
              className="max-sm:min-h-14 max-sm:w-full max-sm:justify-center group inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 font-display text-base font-bold text-primary-foreground shadow-glow transition-transform hover:-translate-y-0.5"
            >
              Start today&apos;s session
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
          {!signedIn && (
            <p className="mt-4 text-sm text-muted-foreground">
              <button onClick={onSignIn} className="font-semibold text-primary underline-offset-4 hover:underline">
                Sign in
              </button>{" "}
              to save your progress and use it on any device.
            </p>
          )}
          <dl className="mt-12 grid max-w-lg grid-cols-3 gap-6 border-t border-border pt-7">
            {[
              ["6 units", "26 drills"],
              ["Ear, shapes", "and timing"],
              ["Progress saved", "on your device"],
            ].map(([v, l]) => (
              <div key={l}>
                <dt className="font-display text-lg font-bold text-primary">{v}</dt>
                <dd className="text-xs uppercase tracking-widest text-muted-foreground">{l}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="animate-rise rounded-4xl border border-border bg-surface p-7 shadow-card [animation-delay:120ms]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">{hasProgress ? "Today" : "Day 1 starts here"}</p>
              <p className="font-display text-xl font-bold">{nextUnit?.title ?? "Mixed review"}</p>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-sm font-semibold text-flame">
              <Flame className="h-4 w-4" /> {stats.streak}
            </span>
          </div>
          <div className="mt-6 flex flex-col items-center gap-7 sm:flex-row">
            <StreakRing value={stats.minutes} max={DAILY_GOAL} label={`${Math.round(stats.minutes)}/${DAILY_GOAL}`} sub="minutes" />
            <div className="w-full min-w-0 flex-1 space-y-3">
              {units.slice(0, 3).map((unit) => {
                const l = unit.title;
                const p = Math.round(unit.lessonsDone / unit.lessons * 100);
                return (

                <div key={l as string}>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{l}</span>
                    <span>{p}%</span>
                  </div>
                  <div className="mt-1.5 h-2 rounded-full bg-secondary">
                    <div className="h-full rounded-full bg-accent" style={{ width: `${p}%` }} />
                  </div>
                </div>
              ); })}
            </div>
          </div>
          <div className="mt-7 flex flex-col items-center gap-5 sm:flex-row rounded-3xl bg-surface-raised p-5">
            <ChordDiagram shape={[-1, 5, 7, 7, 7, 5]} baseFret={5} />
            <div>
              <p className="font-display text-lg font-bold">Which CAGED shape?</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Movable voicings, chord qualities by ear and a tap-in metronome — all in the browser.
              </p>
            </div>
          </div>

        </div>
      </section>

      <section className="mt-24 grid gap-5 md:grid-cols-3">
        {VALUES.map((v, i) => (
          <div
            key={v.title}
            className="animate-rise rounded-3xl border border-border bg-surface p-6"
            style={{ animationDelay: `${160 + i * 90}ms` }}
          >
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-secondary text-primary">
              <v.icon className="h-5 w-5" />
            </span>
            <h3 className="mt-4 font-display text-lg font-bold">{v.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{v.body}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
