import {
  Flame,
  Guitar,
  Lock,
  Check,
  Play,
  Ear,
  AudioWaveform,
  Grid2x2,
  Music,
  Trophy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Unit } from "@/lib/fretwise-data";
import { DAILY_GOAL } from "@/lib/progress";
import { StreakRing } from "./Diagrams";

const ICONS = {
  chords: Grid2x2,
  ear: Ear,
  scale: AudioWaveform,
  rhythm: Music,
  song: Guitar,
} as const;

export type Stats = { xp: number; streak: number; minutes: number; level: number };

export function PathHome({
  stats,
  units,
  week,
  onStart,
  onStartUnit,
  onAbout,
  signedIn,
  displayName,
  onSignIn,
  onSignOut,
}: {
  onAbout: () => void;
  stats: Stats;
  units: Unit[];
  week: { day: string; done: boolean }[];
  onStart: () => void;
  onStartUnit: (unitId: string) => void;
  signedIn: boolean;
  displayName: string;
  onSignIn: () => void;
  onSignOut: () => void;
}) {
  const nextUnit = units.find((u) => u.status === "active");
  const remaining = nextUnit ? nextUnit.exercises.length - nextUnit.lessonsDone : 0;
  const days = week.filter((d) => d.done).length;
  return (
    <div className="mx-auto max-w-6xl px-6 pb-20 pt-8">
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center sm:flex sm:flex-wrap sm:justify-between gap-4 rounded-3xl border border-border bg-surface px-5 py-4">
        <div className="flex min-w-0 items-center gap-2">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground">
            <Guitar className="h-5 w-5" />
          </span>
          <span className="font-display text-lg font-bold">Fretwise</span>
          <Button variant="link" onClick={onAbout} className="h-auto px-2 text-xs text-muted-foreground">About</Button>
        </div>
        <div className="flex items-center gap-2">
          {signedIn ? (
            <>
              <span className="max-w-28 truncate text-sm font-semibold sm:max-w-none">{displayName || "You"}</span>
              <Button variant="link" onClick={onSignOut} className="h-auto px-1 text-xs text-muted-foreground">
                Sign out
              </Button>
            </>
          ) : (
            <Button variant="link" onClick={onSignIn} className="h-auto px-1 text-xs text-primary">
              Sign in
            </Button>
          )}
        </div>
        <div className="col-span-2 flex min-w-0 items-center justify-between gap-3 text-sm font-semibold sm:justify-normal sm:gap-5">
          <span className="inline-flex items-center gap-1.5 text-flame">
            <Flame className="h-4 w-4" /> {stats.streak}
          </span>
          <span className="inline-flex items-center gap-1.5 text-primary">
            <Trophy className="h-4 w-4" /> {stats.xp.toLocaleString()} XP
          </span>
          <span className="rounded-full bg-secondary px-3 py-1 text-xs uppercase tracking-widest text-muted-foreground">
            Level {stats.level}
          </span>
        </div>
      </header>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <section className="rounded-3xl border border-border bg-surface p-6">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Today's lesson</p>
              <h2 className="mt-1 font-display text-2xl font-bold">
                {nextUnit?.title ?? "Mixed review"}
              </h2>
              <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                {nextUnit ? nextUnit.exercises[nextUnit.lessonsDone]?.prompt : "Your full path, in one mixed session."}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                {nextUnit
                  ? `${remaining} ${remaining === 1 ? "drill" : "drills"} remaining · About ${remaining * 2} minutes`
                  : "7 drills · About 14 minutes"}
              </p>
              <Button
                onClick={() => nextUnit ? onStartUnit(nextUnit.id) : onStart()}
                className="mt-5 h-auto whitespace-normal rounded-full px-6 py-3 font-display font-bold shadow-glow transition-transform hover:-translate-y-0.5"
              >
                <Play className="h-4 w-4" /> {nextUnit ? "Start today's lesson" : "Start mixed review"}
              </Button>
            </div>
            <StreakRing
              value={stats.minutes}
              max={DAILY_GOAL}
              size={148}
              label={`${Math.round(stats.minutes)}/${DAILY_GOAL}`}
              sub="minutes"
            />
          </div>

          <Button variant="link" onClick={onStart} className="mt-3 h-auto px-0 text-sm">Practice now</Button>

          <h3 className="mt-9 font-display text-lg font-bold">Lesson library</h3>
          <p className="text-sm text-muted-foreground">
            Six units, each with its own drills and a short concept card before you play.
          </p>
          <ol className="mt-4 space-y-1">
            {units.map((u, i) => {
              const Icon = ICONS[u.icon];
              const active = u.status === "active";
              const locked = u.status === "locked";
              const cta = locked ? "Locked" : u.status === "done" ? "Review unit" : "Continue unit";
              return (
                <li key={u.id} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <button
                      onClick={() => onStartUnit(u.id)}
                      disabled={locked}
                      aria-label={u.title}
                      className={[
                        "grid h-14 w-14 place-items-center rounded-2xl border transition-transform hover:-translate-y-0.5",
                        u.status === "done"
                          ? "border-success/40 bg-success/15 text-success"
                          : active
                            ? "border-primary bg-primary text-primary-foreground pulse-ring"
                            : "border-border bg-surface-raised text-muted-foreground",
                      ].join(" ")}
                    >
                      {u.status === "done" ? (
                        <Check className="h-6 w-6" />
                      ) : locked ? (
                        <Lock className="h-5 w-5" />
                      ) : (
                        <Icon className="h-6 w-6" />
                      )}
                    </button>
                    {i < units.length - 1 && <span className="my-1 h-8 w-0.5 rounded bg-border" />}
                  </div>
                  <button
                    onClick={() => onStartUnit(u.id)}
                      disabled={locked}
                    className="mb-2 flex-1 rounded-2xl px-3 pb-3 pt-2 text-left transition-colors hover:bg-surface-raised"
                  >
                    <p className={`font-display font-bold ${locked ? "text-muted-foreground" : ""}`}>{u.title}</p>
                    <p className="text-sm text-muted-foreground">{u.subtitle}</p>
                    <p className="mt-1 text-sm">
                      <span className="text-muted-foreground">Next: </span>
                      <span className="font-medium">{u.next}</span>
                      <span className="text-muted-foreground"> · {u.exercises.length} drills</span>
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-3">
                      <div className="h-1.5 w-32 rounded-full bg-secondary">
                        <div
                          className="h-full rounded-full bg-primary transition-[width] duration-700"
                          style={{ width: `${(u.lessonsDone / u.lessons) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {u.lessonsDone}/{u.lessons} lessons
                      </span>
                      <span
                        className={`text-xs font-semibold ${active ? "text-primary" : "text-muted-foreground"}`}
                      >
                        {cta}{!locked && " →"}
                      </span>
                    </div>
                  </button>
                </li>
              );
            })}
          </ol>
        </section>

        <aside className="space-y-6">
          <div className="rounded-3xl border border-border bg-surface p-6">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg font-bold">This week</h3>
              <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-flame">
                <Flame className="h-4 w-4" /> {days} {days === 1 ? "day" : "days"}
              </span>
            </div>
            <div className="mt-4 flex justify-between">
              {week.map((d) => (
                <div key={d.day} className="flex flex-col items-center gap-2">
                  <span
                    className={`grid h-9 w-9 place-items-center rounded-full text-xs font-bold ${
                      d.done ? "bg-flame/20 text-flame" : "border border-dashed border-border text-muted-foreground"
                    }`}
                  >
                    {d.done ? <Flame className="h-4 w-4" /> : "–"}
                  </span>
                  <span className="text-[11px] text-muted-foreground">{d.day}</span>
                </div>
              ))}
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              {week.some((d) => d.done)
                ? "Every day you practise gets a flame."
                : "No sessions logged yet this week — finish one lesson to light the first day."}
            </p>
          </div>
          {!signedIn && (
            <div className="rounded-3xl border border-border bg-surface p-6">
              <h3 className="font-display text-lg font-bold">Sign in to save your progress</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Right now your streak and drills are kept on this device only. Sign in and they follow you
                to your phone.
              </p>
              <Button onClick={onSignIn} className="mt-4 h-auto rounded-full px-5 py-2.5 font-display font-bold">
                Sign in
              </Button>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
