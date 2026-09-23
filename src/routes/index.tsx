import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Landing } from "@/components/fretwise/Landing";
import { PathHome, type Stats } from "@/components/fretwise/PathHome";
import { Lesson, type LessonResult } from "@/components/fretwise/Lesson";
import { Summary } from "@/components/fretwise/Summary";
import { useAccountProgress } from "@/hooks/use-account-progress";
import { DAILY_BRIEF, SESSION, UNITS, type Brief, type Exercise, type Unit } from "@/lib/fretwise-data";
import {
  DAILY_GOAL,
  computeStreak,
  dayKey,
  hasAnyProgress,
  levelFor,
  minutesOn,
  newSessionId,
  weekStrip,
  type Progress,
} from "@/lib/progress";

const TITLE = "Fretwise — daily practice for intermediate guitarists";
const DESCRIPTION =
  "Gamified 15-minute guitar sessions for players past the basics: CAGED, modes, pentatonic boxes, chord-quality ear training, syncopation and functional harmony — with streaks and real practice minutes.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

type Screen = "landing" | "path" | "lesson" | "summary";

type ActiveLesson = {
  unitId: string | null;
  title: string;
  subtitle: string;
  brief: Brief;
  exercises: Exercise[];
  offset: number;
};

const DAILY_LESSON: ActiveLesson = {
  unitId: null,
  title: "Daily mix",
  subtitle: "Spaced review across your path",
  brief: DAILY_BRIEF,
  exercises: SESSION,
  offset: 0,
};

const drillId = (unitId: string, index: number) => `${unitId}#${index}`;

const UNIT_ORDER = ["caged", "modes", "ear", "theory", "rhythm", "song"];
const ORDERED_UNITS = UNIT_ORDER.flatMap((id) => UNITS.filter((u) => u.id === id));

function deriveUnits(progress: Progress): Unit[] {
  const done = new Set(progress.completedLessons);
  let unlocked = true;
  return ORDERED_UNITS.map((u) => {
    const firstMissing = u.exercises.findIndex((_, i) => !done.has(drillId(u.id, i)));
    const lessonsDone = firstMissing < 0 ? u.exercises.length : firstMissing;
    const complete = lessonsDone === u.exercises.length;
    const status: Unit["status"] = !unlocked ? "locked" : complete ? "done" : "active";
    unlocked = unlocked && complete;
    return { ...u, lessons: u.exercises.length, lessonsDone, status };
  });
}

function Index() {
  const navigate = useNavigate();
  const [screen, setScreen] = useState<Screen>("landing");
  const [lesson, setLesson] = useState<ActiveLesson>(DAILY_LESSON);
  const [result, setResult] = useState<LessonResult | null>(null);
  const { progress, ready, user, displayName, commit, signOut } = useAccountProgress();

  // progress is read after hydration (device or account) so server and client markup match
  useEffect(() => {
    if (!ready) return;
    setScreen((current) => (current === "landing" && (user || hasAnyProgress(progress)) ? "path" : current));
  }, [ready, user, progress]);

  const units = useMemo(() => deriveUnits(progress), [progress]);
  const week = useMemo(() => weekStrip(progress.sessions), [progress.sessions]);
  const stats: Stats = {
    xp: progress.xp,
    streak: computeStreak(progress.sessions),
    minutes: minutesOn(progress.sessions),
    level: levelFor(progress.xp),
  };


  const startUnit = (unitId: string) => {
    const u = units.find((x) => x.id === unitId);
    if (!u || u.status === "locked") return;
    const offset = u.status === "done" ? 0 : u.lessonsDone;
    setLesson({ unitId: u.id, title: u.next, subtitle: u.title, brief: u.brief, exercises: u.exercises.slice(offset), offset });
    setScreen("lesson");
  };

  const startDaily = () => {
    const unlocked = units.filter((u) => u.status !== "locked");
    const exercises = SESSION.filter((ex) => unlocked.some((u) => u.exercises.includes(ex)));
    setLesson({ ...DAILY_LESSON, exercises });
    setScreen("lesson");
  };

  // saved as soon as a drill is answered, so a mid-lesson exit still keeps the work
  const recordDrill = (index: number, correct: boolean) => {
    if (!correct || !lesson.unitId) return;
    const id = drillId(lesson.unitId, lesson.offset + index);
    commit((p) =>
      p.completedLessons.includes(id) ? p : { ...p, completedLessons: [...p.completedLessons, id] },
    );
  };

  const finish = (r: LessonResult) => {
    setResult(r);
    const minutes = r.seconds / 60;
    commit((p) => {
      const sessions = [
        ...p.sessions,
        {
          id: newSessionId(),
          date: dayKey(),
          minutes,
          lessonId: lesson.unitId ?? "daily-mix",
          accuracy: r.total > 0 ? Math.min(100, Math.max(0, Math.round((r.correct / r.total) * 100))) : 0,
        },
      ];
      return { ...p, sessions, xp: p.xp + r.xp, streak: computeStreak(sessions) };
    });
    setScreen("summary");
  };

  const goSignIn = () => navigate({ to: "/auth" });
  const handleSignOut = async () => {
    await signOut();
    setScreen("landing");
  };

  if (screen === "landing")
    return (
      <Landing
        onStart={() => setScreen("path")}
        stats={stats}
        units={units}
        hasProgress={hasAnyProgress(progress)}
        signedIn={Boolean(user)}
        onSignIn={goSignIn}
      />
    );
  if (screen === "lesson")
    return (
      <Lesson
        unitId={lesson.unitId}
        title={lesson.title}
        subtitle={lesson.subtitle}
        brief={lesson.brief}
        exercises={lesson.exercises}
        onExit={() => setScreen("path")}
        onFinish={finish}
        onDrill={recordDrill}
        sequential={lesson.unitId !== null}
      />
    );
  if (screen === "summary" && result)
    return (
      <Summary
        result={result}
        streak={stats.streak}
        minutes={stats.minutes}
        goal={DAILY_GOAL}
        onContinue={() => setScreen("path")}
      />
    );
  return (
    <PathHome
      onAbout={() => setScreen("landing")}
      stats={stats}
      units={units}
      week={week}
      onStart={startDaily}
      onStartUnit={startUnit}
      signedIn={Boolean(user)}
      displayName={displayName}
      onSignIn={goSignIn}
      onSignOut={handleSignOut}
    />
  );
}
