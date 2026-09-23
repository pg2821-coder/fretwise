import { useEffect, useRef, useState } from "react";
import { Guitar, Play, Square, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { playClick, resumeAudio } from "@/lib/audio";

const PRACTICE: Record<string, { exercise: string; tempo: number }> = {
  caged: { exercise: "Play D major in all five CAGED shapes, low to high on the neck, one strum each, at 70 BPM", tempo: 70 },
  modes: { exercise: "Play A Dorian ascending and descending, then A Aeolian in the same position, one note per click at 80 BPM. Repeat four times, listening for F♯ changing to F.", tempo: 80 },
  ear: { exercise: "Arpeggiate Cmaj7, C7, Cm7 and Cm7♭5, one note per click at 60 BPM. Say each quality aloud and repeat the sequence four times, listening to the changing 3rd, 5th and 7th.", tempo: 60 },
  theory: { exercise: "Play Dm7 → G7 → Cmaj7 → A7, one bar per chord in 4/4 at 70 BPM. Strum on each beat for four loops, hearing A7 pull back to Dm7.", tempo: 70 },
  rhythm: { exercise: "Mute the strings and strum only the four ‘ands’ for four bars at 70 BPM. Then strum only the ‘e’ of each beat for four bars, counting ‘1 e and a’ aloud.", tempo: 70 },
  song: { exercise: "Play Em → G → Bm → F♯m, one bar per chord at 60 BPM. On beat 1 strum the voicing, then pick its top-string melody note on beats 2, 3 and 4 while the chord rings. Repeat four times.", tempo: 60 },
};
const REVIEW = { exercise: "Pick one shape from today's drills and play it in three positions at 80 BPM", tempo: 80 };

export function NowPlay({ unitId, onDone }: { unitId: string | null; onDone: (seconds: number, skipped: boolean) => void }) {
  const practice = (unitId && PRACTICE[unitId]) || REVIEW;
  const [bpm, setBpm] = useState(practice.tempo);
  const [running, setRunning] = useState(false);
  const started = useRef(Date.now());
  const finished = useRef(false);
  useEffect(() => {
    if (!running) return;
    let beat = 0;
    const tick = () => { playClick(beat % 4 === 0); beat++; };
    tick();
    const timer = window.setInterval(tick, 60000 / bpm);
    return () => window.clearInterval(timer);
  }, [running, bpm]);
  const finish = (skipped: boolean) => {
    if (finished.current) return;
    finished.current = true;
    setRunning(false);
    onDone(skipped ? 0 : Math.round((Date.now() - started.current) / 1000), skipped);
  };
  return (
    <div className="mx-auto grid min-h-screen max-w-3xl place-items-center px-6 py-8">
      <section className="w-full rounded-3xl border border-border bg-surface p-6 sm:p-9">
        <Guitar className="h-8 w-8 text-primary" />
        <h2 className="mt-4 font-display text-3xl font-bold">Now play it</h2>
        <p className="mt-5 text-lg">{practice.exercise}</p>
        <p className="mt-3 text-sm text-muted-foreground">Target tempo: {practice.tempo} BPM</p>
        <div className="my-8 flex flex-wrap items-end gap-4">
          <label className="flex flex-col gap-2 text-sm font-semibold">
            BPM
            <input aria-label="BPM" type="number" min={30} max={240} value={bpm} onChange={(e) => setBpm(Math.min(240, Math.max(30, Number(e.target.value) || 30)))} className="h-11 w-24 rounded-md border border-border bg-background px-3 text-foreground" />
          </label>
          <Button variant="secondary" className="h-11 max-sm:min-h-14 max-sm:flex-1" onClick={() => { if (running) setRunning(false); else void resumeAudio().then(() => setRunning(true)); }}>
            {running ? <Square /> : <Play />} {running ? "Stop" : "Start"}
          </Button>
        </div>
        <Button className="max-sm:min-h-14 max-sm:w-full h-auto whitespace-normal rounded-full px-6 py-3 font-display font-bold" onClick={() => finish(false)}><Check /> Done, I played it</Button>
        <div><Button variant="link" className="mt-3 px-0 text-sm text-muted-foreground" onClick={() => finish(true)}>Skip for today</Button></div>
      </section>
    </div>
  );
}
