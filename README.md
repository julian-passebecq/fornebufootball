# Fornebu Football Coach Board

Responsive React tactics board for **7v7** and **9v9** football coaching.

## v0.1 feature set
- Horizontal interactive football pitch
- 7v7 / 9v9 switch above the pitch
- Clickable numbered player jerseys
- Two team strategies: Standard and Plan B
- Global plan plus player-specific plan below the pitch
- Norwegian / English UI and tactical text
- Coach mode with password-protected editing
- Drag-and-drop player positioning in coach mode
- Inline tactical-text editing with a Validate Changes action
- Netlify Blobs persistence API for validated coach changes
- Google Sheet source link built into the UI
- Responsive desktop/tablet/mobile layout

## Tactical content structure
Each formation contains:
- Global strategy: Build-up, Attack, Defend, Transition
- Player plan: In possession, Out of possession, Transition, Key cue
- Bilingual NO / EN text
- X / Y position coordinates for every player

## Google Sheet
The web app links to the existing `fornebucoachv1` Google Sheet. A structured 7v7/9v9 workbook draft was prepared with large coach-friendly text cells and sample content. Direct write-back to the original Google Sheet still requires an active Google Drive write connector or a server-side Google credential / Apps Script endpoint.

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

Validated edits are stored through Netlify Blobs. The Google Sheet remains the editorial source/link until live two-way Sheets synchronization is added.
