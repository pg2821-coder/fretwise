# Accounts and saved progress for Fretwise

Right now progress lives only in the browser it was made in. This adds real accounts so anyone can sign in on any device and pick up in the same unit and drill.

## What you get

- A sign-in page with two options: email + password, and "Continue with Google".
- Sign-up asks for a display name, shown in the path header next to a sign-out button.
- Progress (completed drills, practice sessions, XP, streak) is stored in the account, not the device.
- First sign-in on a device with existing progress: that progress is carried into the account. Later sign-ins load whatever the account already has.
- Signing out returns to the landing page; nothing private stays on screen.
- The app still works without signing in — the same as today, saved on the device — with a "Sign in to save your progress" prompt on the landing and path screens.

## Screens and flow

1. Landing — unchanged layout, plus a "Sign in" link in the header.
2. `/auth` — one page with email/password sign-in, sign-up (display name, email, password), and the Google button. Clear errors for wrong password, taken email, weak password.
3. Path and lessons — unchanged. Signed in, every finished drill and session is saved to the account as it happens.
4. Header — signed out shows "Sign in"; signed in shows the display name and "Sign out".

## Where progress lives

- Signed out: same device storage as today.
- Signed in: the account. On sign-in, if the device has progress the account does not, it is merged in once and then the account is the source of truth.
- Merge rule: completed drills are combined, practice sessions are combined, XP takes the higher total, streak is recalculated from the combined session dates.

## Technical notes

- Enable Lovable Cloud for the database and accounts. Email/password sign-in enabled; Google sign-in configured through the managed provider flow.
- Tables: `profiles` (id referencing the auth user, display_name, created_at) with a trigger creating the row on sign-up; `user_progress` (user_id, xp, streak, updated_at); `completed_drills` (user_id, drill_id); `practice_sessions` (user_id, date, minutes, lesson_id, accuracy). Row-level security on all of them so each person can only read and write their own rows; explicit grants in the same migration.
- Reads and writes go through server functions with `requireSupabaseAuth`; the browser never talks to the database with elevated rights.
- `src/lib/progress.ts` keeps its shape. A new hook chooses the store — device storage when signed out, account when signed in — so `Lesson`, `PathHome`, `Summary` and the drill logic are untouched.
- New route `src/routes/auth.tsx` (public). Path and lesson screens stay in the existing single-page flow; no route gate is needed since the app is usable signed out.
- Sign-out cancels and clears cached queries, signs out, then navigates to the landing screen.
- Unchanged: drill content, audio, metronome, colours, fonts, phone layout, accuracy and minute calculations.

## Testing after approval

A full browser run: sign up with a display name, complete a drill, sign out, sign back in and confirm the same unit and drill position; then Google sign-in and the merge of existing device progress.
