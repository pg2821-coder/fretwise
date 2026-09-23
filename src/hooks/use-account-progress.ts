import { useCallback, useEffect, useRef, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { fetchAccount, saveAccount } from "@/lib/account.functions";
import {
  EMPTY_PROGRESS,
  clearProgress,
  hasAnyProgress,
  loadProgress,
  mergeProgress,
  saveProgress,
  type Progress,
} from "@/lib/progress";

type Store = {
  progress: Progress;
  /** null until the first read finishes */
  ready: boolean;
  user: User | null;
  displayName: string;
  commit: (update: (p: Progress) => Progress) => void;
  signOut: () => Promise<void>;
};

/**
 * One progress store with two homes: the device when nobody is signed in,
 * the account when somebody is. Device progress is folded into the account
 * the first time it is signed into on this device.
 */
export function useAccountProgress(): Store {
  const [progress, setProgress] = useState<Progress>(EMPTY_PROGRESS);
  const [user, setUser] = useState<User | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [ready, setReady] = useState(false);
  const signedInRef = useRef(false);

  const loadForUser = useCallback(async () => {
    const account = await fetchAccount();
    const local = loadProgress();
    const merged = hasAnyProgress(local)
      ? mergeProgress(account.progress, local)
      : account.progress;
    setDisplayName(account.displayName);
    setProgress(merged);
    setReady(true);
    if (hasAnyProgress(local)) {
      await saveAccount({ data: merged });
      clearProgress();
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    const apply = async (nextUser: User | null) => {
      if (cancelled) return;
      setUser(nextUser);
      signedInRef.current = Boolean(nextUser);
      if (nextUser) {
        try {
          await loadForUser();
        } catch {
          // account unreachable — fall back to whatever this device has
          setProgress(loadProgress());
          setReady(true);
        }
      } else {
        setDisplayName("");
        setProgress(loadProgress());
        setReady(true);
      }
    };

    supabase.auth.getSession().then(({ data }) => apply(data.session?.user ?? null));

    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event !== "SIGNED_IN" && event !== "SIGNED_OUT" && event !== "USER_UPDATED") return;
      apply(session?.user ?? null);
    });

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, [loadForUser]);

  // the latest snapshot, so commit can save outside the state updater
  // (an updater runs twice in development and would save twice)
  const latest = useRef(progress);
  latest.current = progress;

  const commit = useCallback((update: (p: Progress) => Progress) => {
    const next = update(latest.current);
    latest.current = next;
    setProgress(next);
    if (signedInRef.current) {
      void saveAccount({ data: next }).catch(() => {
        /* keep the session going; the next save retries the whole snapshot */
      });
    } else {
      saveProgress(next);
    }
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setDisplayName("");
    signedInRef.current = false;
    setProgress(EMPTY_PROGRESS);
  }, []);

  return { progress, ready, user, displayName, commit, signOut };
}
