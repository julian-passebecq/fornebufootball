# Fornebu Coach Board 1.0

React coaching board for 7v7 and 9v9. This release preserves the existing tactical
content and published data while replacing the old DOM-patching UI with a native
React implementation.

## Player view

Open the existing site root. There is deliberately **no coach link** on this page.
Choose 7v7 or 9v9 in the top ribbon. The adjacent pitch-view control offers:

- **Auto**: vertical on portrait phones/tablets, horizontal on desktop or landscape.
- **Vertical / Horizontal**: explicit preference, remembered on the device.

Orientation changes only the view, not the saved positions. Shirts and labels stay
upright. Tap a shirt for the player's shared instructions; use Back to team plan
to return. Both Starting formation and On ball loss are always available.
The team-level Without the ball card belongs only to On ball loss.

Desktop retains the pitch/sidebar layout. Small screens stack the instructions,
use touch-sized player targets and automatically bring a selected player's panel
into view. The normal page scroll is used rather than a nested mobile scrollbar.

## Coach workflow

Open `/coach` and use the existing coach password. Every visit starts in French.
The header contains one green **VALIDER** button, then red **FR**, then EN / NO.
English and Norwegian are read-only previews. Existing translations are retained;
French edits are **not automatically translated**.

1. Choose a game format and tactical phase.
2. Drag a shirt, or tap it and use the four position arrows. A keyboard user can
   focus a shirt and use arrow keys; Shift makes a larger move.
3. To change a shirt number, enter 1-99 and select **Appliquer**. If the number is
   already used, an explicit **Échanger** action swaps the two shirt numbers.
4. Edit the French role or player instructions. Player information is shared
   across phases; coordinates are phase-specific. The other game format is separate.
5. Select **VALIDER** to publish all current changes. A success message appears
   only after the API confirms the write. Errors remain visible and drafts remain
   available. **Annuler** restores the previous local edit.

Choosing a ball-loss preset replaces that phase's coordinates, not shirt numbers
or player guidance. A customized shape requires confirmation before resetting.
The red team-rule editor is below the coach's pitch; the player-facing warning is
below the instruction panel.

Unpublished drafts are stored in session storage when available. A refresh can
restore a draft against the same published baseline. Drafts are never published
implicitly, and a failed initial load disables editing/publishing instead of
allowing the example data to overwrite a real plan.

## Source of truth and compatibility

Active UI: `src/main.jsx` -> `src/AppBoard.jsx`, `src/board.css`, `src/boardCopy.js`.
State operations and coordinate transforms: `src/boardModel.js`.
Existing migration/content modules remain unchanged and are reused.
`AppV*` and `v*.css` files are retained as historical snapshots, not imported by the
current UI. Do not add another DOM observer or CSS override layer to them.

A player's original `number` is a stable internal tactical slot, used by legacy
presets and saved coordinates. New editable `shirtNumber` is the displayed jersey
number. Never use an editable shirt number as a React key or preset lookup key.

Publishing keeps the existing `/api/tactics` payload compatible, including both
legacy format templates and `formats.*.tactics`. The Netlify authentication and
storage endpoints are not replaced in this release.

## Development and verification

Use Node 22.16 or newer. Dependency versions are pinned.

```sh
npm install
npm test
npm run build
npx playwright install --with-deps chromium webkit
npm run test:e2e
npm run dev
```

GitHub Actions runs model/handler tests, a production build and the browser suite.
Browser tests cover desktop Chromium, iPhone-sized WebKit, iPad portrait WebKit and
iPad landscape Chromium. API responses are mocked: tests do not use the coach's
password, alter production tactics or prove a live Netlify save succeeded.
Screenshots, traces, HTML report and JSON results are uploaded as workflow evidence.
The server contract tests execute the real handlers with an in-memory platform
adapter, including authorization and publish/reload checks.

## Deployment

The existing Netlify project builds `main` using `npm run build` and publishes
`dist`; functions remain under `netlify/functions`. Retain the existing
`COACH_PASSWORD` and `COACH_SESSION_SECRET` environment variables. Do not put
secrets or unpublished player information in the repository.
