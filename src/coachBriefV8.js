export const COACH_BRIEF_VERSION = 8

const bilingual = (en, no) => ({ en, no })
const section = (key, labelEn, labelNo, en, no) => ({
  key,
  label: bilingual(labelEn, labelNo),
  text: bilingual(en, no),
})

const globalStandard = {
  title: bilingual('Standard plan', 'Standardplan'),
  sections: [
    section(
      'start',
      'With the ball',
      'Med ball',
      'Head up and keep it simple.\nMove after your pass; the midfielder must stay available.',
      'Løft blikket og spill enkelt.\nBeveg deg etter pasningen; midtbanen skal alltid være spillbar.'
    ),
    section(
      'attack',
      'Width & support',
      'Bredde og støtte',
      'Wingers stay wide and use open space.\nThe striker runs in behind; look forward early after regaining the ball.',
      'Kantene holder bredde og bruker ledig rom.\nSpissen truer bakrom; se fremover tidlig etter ballvinning.'
    ),
    section(
      'defend',
      'Without the ball',
      'Uten ball',
      'Recover quickly, mark an opponent and communicate.\nThe closest player presses; teammates close passing lanes and spaces.',
      'Kom raskt hjem, marker en motspiller og kommuniser.\nNærmeste spiller presser; lagkameratene stenger pasningslinjer og rom.'
    ),
    section(
      'transition',
      'Transitions',
      'Overganger',
      'Lose it: react immediately for 5 seconds.\nWin it: lift your head, look forward and use the wings.',
      'Ved balltap: reager umiddelbart i 5 sekunder.\nVed ballvinning: løft blikket, se fremover og bruk kantene.'
    ),
    section(
      'mindset',
      'Mindset',
      'Mentalitet',
      'Believe you can do it.\nThe better you think about yourself, the better you perform.',
      'Tro at du kan klare det.\nJo bedre du tenker om deg selv, desto bedre kan du prestere.'
    ),
  ],
}

const player = (roleEn, roleNo, roleBand, possessionEn, possessionNo, defenceEn, defenceNo, transitionEn, transitionNo, cueEn, cueNo) => ({
  role: bilingual(roleEn, roleNo),
  roleBand,
  sections: [
    section('possession', 'In possession', 'Med ball', possessionEn, possessionNo),
    section('defence', 'Out of possession', 'Uten ball', defenceEn, defenceNo),
    section('transition', 'Transition', 'Overgang', transitionEn, transitionNo),
    section('cue', 'Key cue', 'Nøkkelpunkt', cueEn, cueNo),
  ],
})

const goalkeeper = player(
  'Goalkeeper', 'Keeper', 'goalkeeper',
  'Play short with your feet when possible.\nUnder pressure, clear cleanly and away from danger.',
  'Spill kort med beina når det er mulig.\nUnder press: klarer du, spill deg ut; ellers klarer du ballen rent bort fra fare.',
  'Protect the goal and read the game early.\nDirect and reposition the defence.',
  'Beskytt målet og les spillet tidlig.\nDiriger og flytt forsvarerne.',
  'On back-passes or with a high line, restart quickly to move danger away.\nAnticipate and react fast.',
  'På tilbakespill eller med høy forsvarslinje: sett raskt i gang og flytt faren bort.\nForutse og reager raskt.',
  'Be decisive, communicate and organise.',
  'Vær tydelig, kommuniser og organiser.'
)

const fullBack = (sideEn, sideNo) => player(
  `${sideEn} full-back`, `${sideNo} back`, 'defender',
  'Join the build-up.\nGo forward on the wing to create overloads and cross.',
  'Delta i oppbyggingen.\nGå frem på kanten for å skape overtall og slå innlegg.',
  'Close the wide channel and stop crosses.\nProtect the inside first.',
  'Steng korridoren og hindre innlegg.\nBeskytt innsiden først.',
  'Recover quickly, then offer a wide outlet when we win it.',
  'Kom raskt hjem, og bli deretter et bredt pasningsalternativ når vi vinner ballen.',
  'Support the attack without leaving the channel open.',
  'Støtt angrepet uten å åpne korridoren bak deg.'
)

const stopper = player(
  'Centre-back stopper', 'Midtstopper', 'defender',
  'After recovery, play out cleanly.\nFind a safe forward pass.',
  'Etter ballvinning: spill deg ut kontrollert.\nFinn en trygg pasning fremover.',
  'Cover the defence and mark the opposition striker.\nCut central lanes and force play wide.',
  'Sikre bakrommet og marker motstanderens spiss.\nSteng sentrale linjer og styr spillet ut mot siden.',
  'Anticipate early and intercept before the danger grows.',
  'Forutse tidlig og bryt før situasjonen blir farlig.',
  'Protect the centre first.',
  'Beskytt sentrum først.'
)

const defensiveMidfielder = (sideEn, sideNo) => player(
  `${sideEn} defensive midfielder`, `${sideNo} defensiv midtbane`, 'midfielder',
  'Receive from the defence and connect play.\nOpen the pitch and play to the sides or vertically.',
  'Ta imot fra forsvaret og bind leddene sammen.\nBred ut spillet og spill ut på siden eller vertikalt.',
  'Cover the centre and wide spaces.\nCut passing lanes and protect the defence.',
  'Dekk sentrum og siderom.\nSteng pasningslinjer og beskytt forsvaret.',
  'Link defence to attack and react first to second balls.',
  'Koble forsvar til angrep og reager først på andreballer.',
  'Keep the team balanced.',
  'Hold laget i balanse.'
)

const centralMidfielder = player(
  'Central midfielder', 'Sentral midtbane', 'midfielder',
  'Create and direct play with few touches.\nUse short play under pressure; switch or play in behind when space opens.',
  'Skap og styr spillet med få touch.\nSpill kort under press; vend spillet eller spill i bakrom når det åpner seg.',
  'Cover the centre and help block the wide lanes.\nSupport the defence when we are under pressure.',
  'Dekk sentrum og hjelp til med å stenge kantene.\nStøtt forsvaret når vi er under press.',
  'Find space quickly and look for the decisive pass.',
  'Finn rom raskt og se etter den avgjørende pasningen.',
  'Scan early, carry the ball when useful and stay available.',
  'Orienter deg tidlig, før ballen når det hjelper, og vær alltid spillbar.'
)

const winger = (sideEn, sideNo) => player(
  `${sideEn} winger`, `${sideNo} kant`, 'attacker',
  'Support the striker and attack the channel.\nMake diagonal runs and play passes in behind.',
  'Støtt spissen og angrip korridoren.\nTa diagonale løp og spill pasninger i bakrom.',
  'Be first to help defensively.\nPress the opponent build-up and block the wide outlet.',
  'Vær først til å hjelpe defensivt.\nPress motstanderens oppbygging og steng pasningen ut på siden.',
  'Counter quickly and attack the second ball around the striker.',
  'Kontra raskt og angrip andreballen rundt spissen.',
  'Protect your side and support the striker.',
  'Beskytt din side og støtt spissen.'
)

const striker = player(
  'Striker', 'Spiss', 'attacker',
  'Be decisive in front of goal.\nTime your runs to stay onside; attack vertically or diagonally.',
  'Vær avgjørende foran mål.\nTim løpene for å holde deg onside; angrip vertikalt eller diagonalt.',
  'Start the press and make the first pass difficult.',
  'Start presset og gjør motstanderens første pasning vanskelig.',
  'Explode into space when we win the ball.\nRead where the ball will arrive.',
  'Eksploder inn i rommet når vi vinner ballen.\nLes hvor ballen kommer til å havne.',
  'Score goals. Anticipate the defenders.',
  'Score mål. Forutse forsvarerne.'
)

export const STANDARD_PLAYER_BRIEF = {
  '7v7': {
    1: goalkeeper,
    2: fullBack('Left', 'Venstre'),
    3: fullBack('Right', 'Høyre'),
    4: centralMidfielder,
    5: winger('Left', 'Venstre'),
    6: winger('Right', 'Høyre'),
    7: striker,
  },
  '9v9': {
    1: goalkeeper,
    2: fullBack('Left', 'Venstre'),
    3: stopper,
    4: fullBack('Right', 'Høyre'),
    5: defensiveMidfielder('Left', 'Venstre'),
    6: defensiveMidfielder('Right', 'Høyre'),
    7: winger('Left', 'Venstre'),
    8: striker,
    9: winger('Right', 'Høyre'),
  },
}

export function applyCoachBriefToPlan(plan, formation) {
  if (!plan) return plan
  plan.global = JSON.parse(JSON.stringify(globalStandard))
  const playerBriefs = STANDARD_PLAYER_BRIEF[formation] || {}
  for (const target of plan.players || []) {
    const brief = playerBriefs[target.number]
    if (!brief) continue
    target.role = JSON.parse(JSON.stringify(brief.role))
    target.roleBand = brief.roleBand
    target.sections = JSON.parse(JSON.stringify(brief.sections))
  }
  return plan
}
