import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { computeStreak, newSessionId, type Progress, type SessionRecord } from "@/lib/progress";

type Account = { displayName: string; progress: Progress };

const asProgress = (
  drills: { drill_id: string }[],
  sessions: { id: string; date: string; minutes: number; lesson_id: string; accuracy: number }[],
  row: { xp: number; streak: number } | null,
): Progress => {
  const mapped: SessionRecord[] = sessions.map((s) => ({
    id: s.id,
    date: s.date,
    minutes: Number(s.minutes),
    lessonId: s.lesson_id,
    accuracy: s.accuracy,
  }));
  return {
    completedLessons: drills.map((d) => d.drill_id),
    sessions: mapped,
    xp: row?.xp ?? 0,
    streak: computeStreak(mapped),
  };
};

/** Everything the app needs for the signed-in player. */
export const fetchAccount = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<Account> => {
    const { supabase, userId } = context;
    const [profile, progressRow, drills, sessions] = await Promise.all([
      supabase.from("profiles").select("display_name").eq("id", userId).maybeSingle(),
      supabase.from("user_progress").select("xp, streak").eq("user_id", userId).maybeSingle(),
      supabase.from("completed_drills").select("drill_id").eq("user_id", userId),
      supabase
        .from("practice_sessions")
        .select("id, date, minutes, lesson_id, accuracy")
        .eq("user_id", userId),
    ]);

    if (drills.error) throw drills.error;
    if (sessions.error) throw sessions.error;

    return {
      displayName: profile.data?.display_name ?? "",
      progress: asProgress(drills.data ?? [], sessions.data ?? [], progressRow.data ?? null),
    };
  });

/** Writes the whole snapshot; drills and sessions are keyed so repeats are ignored. */
export const saveAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: Progress) => input)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const totals = await supabase
      .from("user_progress")
      .upsert(
        { user_id: userId, xp: data.xp, streak: data.streak, updated_at: new Date().toISOString() },
        { onConflict: "user_id" },
      );
    if (totals.error) throw totals.error;

    if (data.completedLessons.length > 0) {
      const drills = await supabase.from("completed_drills").upsert(
        data.completedLessons.map((drill_id) => ({ user_id: userId, drill_id })),
        { onConflict: "user_id,drill_id", ignoreDuplicates: true },
      );
      if (drills.error) throw drills.error;
    }

    if (data.sessions.length > 0) {
      const rows = data.sessions.map((s) => ({
        id: s.id ?? newSessionId(),
        user_id: userId,
        date: s.date,
        minutes: s.minutes,
        lesson_id: s.lessonId,
        accuracy: s.accuracy,
      }));
      const written = await supabase
        .from("practice_sessions")
        .upsert(rows, { onConflict: "id", ignoreDuplicates: true });
      if (written.error) throw written.error;
    }

    return { ok: true };
  });

export const saveDisplayName = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { displayName: string }) => ({
    displayName: input.displayName.trim().slice(0, 40),
  }))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase
      .from("profiles")
      .upsert({ id: userId, display_name: data.displayName }, { onConflict: "id" });
    if (error) throw error;
    return { ok: true };
  });
