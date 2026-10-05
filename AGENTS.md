# Codex Workflow & Verification Rules

## Workflow Orchestration

### 1. Plan Mode Default

-   Enter plan mode for ANY non-trivial task (3+ steps or architectural
    decisions).
-   If something goes sideways, STOP and re-plan immediately --- don't
    keep pushing.
-   Use plan mode for verification steps, not just building.
-   Write detailed specs upfront to reduce ambiguity.

### 2. Subagent Strategy

-   Use subagents liberally to keep main context window clean.
-   Offload research, exploration, and parallel analysis to subagents.
-   For complex problems, throw more compute at it via subagents.
-   One task per subagent for focused execution.
-   Apply these rules only when current Codex environment supports
    agent/subagent delegation.

### 3. Self-Improvement Loop

-   After ANY correction from user: update `tasks/lessons.md` with
    pattern.
-   Write rules for yourself that prevent same mistake.
-   Ruthlessly iterate on these lessons until mistake rate drops.
-   Review lessons at session start for relevant project.

### 4. Verification Before Done

-   Never mark task complete without proving it works.
-   Diff behavior between main and your changes when relevant.
-   Ask yourself: "Would a Staff engineer approve this?"
-   Run tests, check logs, demonstrate correctness.

### 5. Demand Elegance (Balanced)

-   For non-trivial changes: pause and ask "is there a more elegant
    way?"
-   If a fix feels hacky: "Knowing everything I know now, implement the
    elegant solution."
-   Skip this for simple, obvious fixes --- don't over-engineer.
-   Challenge your own work before presenting it.

### 6. Autonomous Bug Fixing

-   When given a bug report: just fix it. Don't ask for hand-holding.
-   Point at logs, errors, failing tests --- then resolve them.
-   Zero context switching required from user.
-   Go fix failing CI tests without being told how.

### 7. Browser Testing with Playwright

-   Use Playwright for browser verification whenever UI or user-facing
    behavior changes.
-   Test actual user flows, not only isolated components.
-   Run app locally and verify affected pages in browser.
-   Check browser console for errors and warnings.
-   Check failed network requests.
-   Verify critical interactions: navigation, forms, buttons, dialogs,
    authentication, CRUD, and error states.
-   Test relevant viewport sizes when responsive behavior matters.
-   Capture screenshots for visual verification when useful.
-   For bug fixes, reproduce bug with Playwright first when possible,
    then verify fix.
-   Never claim UI task complete until Playwright verification passes.
-   If Playwright finds failure, continue fixing and rerunning tests
    until clean.

## Task Management

1.  **Plan First**: Write plan to `tasks/todo.md` with checkable items.
2.  **Verify Plan**: Review plan for completeness before implementation.
    Do not ask user for approval unless requirements are ambiguous,
    destructive, or materially change scope.
3.  **Track Progress**: Mark items complete as you go.
4.  **Explain Changes**: High-level summary at each step.
5.  **Document Results**: Add review section to `tasks/todo.md`.
6.  **Capture Lessons**: Update `tasks/lessons.md` after corrections.

## Playwright Verification Workflow

For every UI change:

1.  Start development server.
2.  Open affected route with Playwright.
3.  Execute intended user flow.
4.  Verify expected UI state.
5.  Check console errors.
6.  Check failed network requests.
7.  Test relevant edge cases.
8.  Capture screenshot when visual verification matters.
9.  Run existing Playwright test suite.
10. Fix failures.
11. Repeat until tests pass.
12. Only then mark task complete.

## Playwright Setup

``` bash
npm install -D @playwright/test
npx playwright install
```

Run tests:

``` bash
npx playwright test
```

## TunaEye Verification Coverage

Use Playwright to verify browser/application flows such as:

-   Start Grading → Expert Grader → specimen selection → Sashibo/Tail
    Cut → capture flow → grading → result → receipt
-   Route guards
-   Shift-open requirement
-   Form and input validation
-   Camera permission failure UI
-   API failure states
-   Loading and error states
-   Settings
-   Authentication
-   CRUD operations
-   Tablet viewport and responsive behavior
-   Screenshots and visual regression checks
-   SQLite/API-backed flows exposed through browser/application layer

### Hardware Boundary

Playwright does not replace physical hardware/integration testing.

Test separately:

-   Raspberry Pi camera
-   Bluetooth thermal printer
-   Weighing scale
-   Physical lighting chamber
-   Capture/image quality
-   Hardware connectivity and device-specific behavior

## Core Principles

-   **Simplicity First**: Make every change as simple as possible.
    Impact minimal code.
-   **No Laziness**: Find root causes. No temporary fixes. Senior
    developer standards.
-   **Minimal Impact**: Changes should only touch what's necessary.
    Avoid introducing bugs.
-   **Prove Before Done**: Completion requires evidence: tests, logs,
    browser verification, or other relevant checks.
-   **Fix, Retest, Repeat**: Never stop at discovering failure. Resolve
    it and rerun verification.
