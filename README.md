# Fornebu Football Coach Board

Responsive React tactics board for **7v7** and **9v9** football coaching.

## v0.2 feature set
- Horizontal interactive football pitch
- 7v7 / 9v9 formation switch in the top ribbon
- Reference shapes: **7v7 = 2-3-1**, **9v9 = 3-2-3**
- Desktop layout: roughly 2/3 pitch + 1/3 tactical sidebar
- Clickable numbered player jerseys
- Deselect a player to return to the global team plan
- Two team strategies: Standard and Plan B
- Player sidebar with position, Attack, Defend, Transition and Key cue sections
- Norwegian / English UI and tactical text
- Coach mode with password-protected editing
- Drag-and-drop player positioning in coach mode
- Inline tactical-text editing with a Publish Changes action
- Netlify Blobs persistence API for published coach changes
- Explicit save failure state instead of silently claiming a local-only save succeeded
- Responsive desktop/tablet/mobile layout

## Tactical content structure
Each formation contains:
- Global strategy: Build-up, Attack, Defend, Transition
- Player plan: In possession, Out of possession, Transition, Key cue
- Bilingual NO / EN text
- X / Y position coordinates for every player

## Google Sheet history
Google Sheets is intentionally **not exposed in the v0.2 coach UI**. The planned role for the existing `fornebucoachv1` sheet is an archive/history layer: validated website versions can later append timestamped history records or match snapshots without forcing the coach to edit spreadsheet cells.

## Local development
```bash
npm install
npm run dev
```

## Tests
```bash
npm test
```

## Production variables
Set these in Netlify before enabling Coach mode:
- `COACH_PASSWORD`
- `COACH_SESSION_SECRET` — use a long random value

Published edits are stored through Netlify Blobs. The website is the working interface and live source of truth.
