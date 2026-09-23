import { Flame, Target, Zap, ArrowRight, Timer } from "lucide-react";
import { fmtClock, type LessonResult } from "./Lesson";

export function Summary({
  result,
  streak,
  minutes,
  goal,
  onContinue,
}: {
  result: LessonResult;
  streak: number;
  minutes: number;
  goal: number;
  onContinue: () => void;
}) {
  const accuracy = result.total > 0 ? Math.min(100, Math.max(0, Math.round((result.correct / result.total) * 100))) : 0;
  const hitGoal = minutes >= goal;

  return (
    <div className="mx-auto grid min-h-screen max-w-2xl place-items-center px-6 py-12">
      <div className="animate-pop w-full rounded-4xl border border-border bg-surface p-5 sm:p-9 text-center shadow-card">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">Session complete</p>
        <h2 className="mt-3 font-display text-4xl font-bold">
          {hitGoal ? "That's a streak day." : "Logged it — that counts."}
        </h2>
        <p className="mx-auto mt-3 max-w-md text-muted-foreground">
          {hitGoal
            ? "Dorian is holding up. Tomorrow we take the same shape through Mixolydian."
            : `${Math.round(Math.max(0, goal - minutes))} more minutes today and the streak locks in.`}
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Timer, label: result.drillsOnly ? "Drills only" : "Time practiced", value: fmtClock(result.seconds), tone: "text-accent" },
            { icon: Zap, label: "XP earned", value: `+${result.xp}`, tone: "text-primary" },
            { icon: Target, label: "Accuracy", value: `${accuracy}%`, tone: "text-accent" },
            { icon: Flame, label: "Day streak", value: `${streak}`, tone: "text-flame" },
          ].map((s) => (
            <div key={s.label} className="rounded-3xl bg-surface-raised p-5">
              <s.icon className={`mx-auto h-5 w-5 ${s.tone}`} />
              <p className="mt-2 font-display text-2xl font-bold">{s.value}</p>
              <p className="text-[11px] uppercase tracking-widest text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
        <p className="mt-6 text-sm text-muted-foreground">
          Daily goal: {Math.round(minutes)} of {goal} minutes · XP counts every minute you actually played.
        </p>


        <button
          onClick={onContinue}
          className="max-sm:min-h-14 max-sm:w-full max-sm:justify-center mt-9 inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 font-display font-bold text-primary-foreground shadow-glow transition-transform hover:-translate-y-0.5"
        >
          Back to my path <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
