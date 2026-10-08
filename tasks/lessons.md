# Lessons

- Never clean Playwright artifact directories while a browser suite is still running; wait for the process to exit, then restore or remove generated files.

- Input width calculations must include placeholder length; a two-character minimum clips the three-character `0.0` weight display.
- When asked to combine two landing sections, consolidate their unique content into one layout and remove the superseded block; wrapping both blocks in one parent is not a merge.
- Marketing CTAs must match their destination: demos open media, downloads lead to installation, and neither should reuse the grading action.

- Store image blobs in IndexedDB, not `localStorage`; persist one stable evidence ID in record metadata and avoid competing effects that overwrite the same record.
- New landing sections must reuse the established section grid, spacing, and responsive rhythm; validate a full-page desktop screenshot before calling the page fixed.
- When adding JSX to a large page, confirm every rendered component is imported or defined; a placeholder can crash the entire route at render time.
- For kiosk screens, size the content around persistent bottom actions; `height: 100%` on a panel can clip the action row when its parent also contains a footer.

- Validate every tablet layout at short 16:10 browser heights; physical screen size alone is not a CSS viewport.
- Save grading records when inference completes, not only on the final printing screen.
- Separate public-web entry from installed-kiosk entry instead of overloading one landing screen.
- Describe hardware and cloud integrations as connection contracts until real endpoints and credentials exist.
- A responsive admin rail is not the same as a collapsible sidebar. Provide an explicit, visible toggle tied to layout state; keep icons available in the collapsed state and never depend on hover for kiosk controls.
- Tablet QA must target 1024x600, 1280x800, and 1366x768 with larger touch targets, strong contrast, and no clipped bottom actions.
- Put final tablet overrides after legacy compact rules; otherwise a valid QA media query can be silently undone later in the cascade.
- When the user says an element should be removed, delete it from the render tree; styling it differently does not satisfy the request.
- Numeric limits must validate and explain the entered value, never silently rewrite it to the maximum.
- Pagination that only renders after a hidden threshold looks missing during normal QA; keep the controls visible with an explicit page and record count.
