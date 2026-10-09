# UI Cleanup — Redundancy, Copy, Loading States

Goal: remove repeated labels, cut verbose copy, add visible loading
indicators. Keep tablet layouts working at 1024x600, 1280x800,
1024x768, 1366x768, 800x1280.

## 1. Remove duplicate "Expert grader" labels

Grader entry screen (`src/App.tsx:675-713`) currently says it 3x in
one view:

- [ ] Drop eyebrow `Expert grader session` (line 679)
- [ ] Drop form-heading card `Expert grader` + its helper line
      (lines 684-690)
- [ ] Field label `Expert grader name` -> `Your name`
- [ ] Keep the `<h1>Who is grading today?</h1>` as the single label

Grader dashboard (`src/App.tsx:613`):

- [ ] Drop eyebrow `Expert grader dashboard`; the `Welcome back,
      {name}.` heading already identifies the screen

## 2. Trim body copy to short phrases

Replace 1-2 sentence explanations with a short phrase or nothing.
Keep all validation and error text unchanged.

- [ ] Grader entry: remove `Enter your name once for this grading
      session.`
- [ ] Weight: `Use the numpad to the right to enter the exact weight
      in kilograms for each fish.` -> remove (numpad is adjacent)
- [ ] Association: shorten the single/multi explanation to one phrase
- [ ] Camera: shorten the two long capture/upload paragraphs
- [ ] Overview: `Original model outputs stay visible next to any
      manual decision...` -> remove
- [ ] Result/recovery screens: shorten to one phrase
- [ ] Admin PIN: shorten `Use the four-digit station code...`

## 3. Visible loading indicators

Existing states are text-only. Reuse the existing `.spinner` class
and `spin` keyframe (already in `styles.css:323`).

- [ ] Add `<Spinner />` to `Button` via a `loading` prop so busy
      buttons show motion, not just changed text
- [ ] Camera capture button: spinner while `busy === 'capture'`
- [ ] Upload button: spinner while `busy === 'upload'`
- [ ] Sync buttons (admin + grader dashboard): spinner while syncing
- [ ] `capture-toast` ring: add spinning ring for capture/print/
      install toasts
- [ ] Verify disabled state still prevents double submission

## 4. Tablet verification

- [ ] Build passes (`tsc -b && vite build`)
- [ ] Playwright suite passes
- [ ] No horizontal overflow at the 5 target viewports
- [ ] No touch target under 44px
- [ ] No console errors
- [ ] Bottom action bars remain visible (not clipped)

## Out of scope

Not touching the 1,177 `!important` declarations or the two competing
`:root` token blocks (`styles.css:308` and `:1554`). That is a real
problem but a separate, higher-risk refactor — noted for later.

## Review

(filled in after implementation)
