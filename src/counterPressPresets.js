export const COUNTERPRESS_VERSION = 1

const T = (en, fr, no) => ({ en, fr, no })

export const COUNTERPRESS_PRESETS = {
  '9v9': [
    {
      id: 'compact-323',
      shape: '3-2-3',
      recommended: true,
      name: T('Compact 3-2-3', '3-2-3 compact', 'Kompakt 3-2-3'),
      note: T('Recommended: 3+2 rest defence, short distances and central protection.', 'Recommandé : 3+2 derrière le ballon, distances courtes et axe protégé.', 'Anbefalt: 3+2 restforsvar, korte avstander og beskyttet sentrum.'),
      positions: {
        1: [11, 50], 2: [34, 36], 3: [32, 50], 4: [34, 64],
        5: [52, 42], 6: [52, 58], 7: [66, 36], 8: [68, 50], 9: [66, 64],
      },
    },
    {
      id: 'aggressive-233',
      shape: '2-3-3',
      recommended: false,
      name: T('Aggressive 2-3-3', '2-3-3 agressif', 'Aggressiv 2-3-3'),
      note: T('More players around the loss. Higher pressure, but less cover if the press is beaten.', 'Plus de joueurs autour de la perte. Pression plus forte, mais moins de couverture si le pressing est éliminé.', 'Flere spillere rundt balltapet. Høyere press, men mindre sikring hvis presset blir spilt av.'),
      positions: {
        1: [11, 50], 2: [34, 39], 4: [34, 61],
        3: [49, 50], 5: [51, 34], 6: [51, 66],
        7: [66, 36], 8: [68, 50], 9: [66, 64],
      },
    },
  ],
  '7v7': [
    {
      id: 'compact-231',
      shape: '2-3-1',
      recommended: true,
      name: T('Compact 2-3-1', '2-3-1 compact', 'Kompakt 2-3-1'),
      note: T('Recommended: simple for young players, compact midfield and clear cover behind the first press.', 'Recommandé : simple pour les jeunes, milieu compact et couverture claire derrière le premier pressing.', 'Anbefalt: enkelt for unge spillere, kompakt midtbane og tydelig sikring bak første press.'),
      positions: {
        1: [11, 50], 2: [34, 40], 3: [34, 60],
        4: [52, 50], 5: [54, 34], 6: [54, 66], 7: [68, 50],
      },
    },
    {
      id: 'front-pair-312',
      shape: '3-1-2',
      recommended: false,
      name: T('Front-pair 3-1-2', '3-1-2 avec deux presseurs', '3-1-2 med to presspillere'),
      note: T('Two players can jump onto the ball and nearest outlet. Safer back three, but the central midfielder works hard.', 'Deux joueurs peuvent fermer le porteur et la solution proche. Trois derrière sécurisent, mais le milieu axial travaille beaucoup.', 'To spillere kan gå på ball og nærmeste pasningsalternativ. Tre bak gir sikring, men sentral midtbane må dekke mye.'),
      positions: {
        1: [11, 50], 2: [34, 34], 4: [33, 50], 3: [34, 66],
        6: [51, 50], 5: [66, 39], 7: [67, 61],
      },
    },
  ],
}

export const DEFAULT_COUNTERPRESS_PRESET = {
  '7v7': 'compact-231',
  '9v9': 'compact-323',
}

function clone(value) {
  return JSON.parse(JSON.stringify(value))
}

export function getCounterPressPreset(formation, presetId) {
  const presets = COUNTERPRESS_PRESETS[formation] || []
  return presets.find(item => item.id === presetId) || presets[0] || null
}

export function applyCounterPressPreset(plan, formation, presetId) {
  const preset = getCounterPressPreset(formation, presetId)
  if (!plan?.players || !preset) return plan
  for (const player of plan.players) {
    const position = preset.positions[player.number]
    if (!position) continue
    player.x = position[0]
    player.y = position[1]
  }
  return plan
}

function roleText(roleBand, lang) {
  const copy = {
    goalkeeper: {
      possession: T('Stay high enough to sweep behind the press.', 'Reste assez haut pour couvrir derrière le pressing.', 'Stå høyt nok til å sweepe bak presset.'),
      defence: T('Protect the space behind our high line.', 'Protège l’espace derrière notre ligne haute.', 'Beskytt rommet bak den høye linjen.'),
      transition: T('On loss: step up, organise and be ready for the escape ball.', 'À la perte : avance, organise et sois prêt sur le ballon qui sort du pressing.', 'Ved balltap: stå frem, organiser og vær klar på ballen som slipper ut.'),
      cue: T('High and loud.', 'Haut et vocal.', 'Høyt og tydelig.'),
    },
    defender: {
      possession: T('Stay connected behind midfield so the team can squeeze.', 'Reste connecté derrière le milieu pour que le bloc puisse avancer.', 'Hold kontakt bak midtbanen slik at laget kan skyve opp.'),
      defence: T('Protect the centre first and intercept the escape pass.', 'Protège d’abord l’axe et coupe la passe de sortie.', 'Beskytt sentrum først og bryt utgangspasningen.'),
      transition: T('Step forward immediately when the press starts; drop only if it is beaten.', 'Avance immédiatement quand le pressing démarre ; recule seulement s’il est éliminé.', 'Stå frem med en gang presset starter; fall bare hvis presset blir spilt av.'),
      cue: T('No gap behind the press.', 'Pas d’espace derrière le pressing.', 'Ingen luke bak presset.'),
    },
    midfielder: {
      possession: T('Stay close enough to react if the ball is lost.', 'Reste assez proche pour réagir immédiatement à la perte.', 'Vær nær nok til å reagere med en gang vi mister ballen.'),
      defence: T('Close the inside lane before chasing the ball.', 'Ferme la passe intérieure avant de courir vers le ballon.', 'Steng innsiden før du jager ballen.'),
      transition: T('Second player supports the press; third player blocks the next pass.', 'Le deuxième soutient le pressing ; le troisième ferme la passe suivante.', 'Andre spiller støtter presset; tredje spiller stenger neste pasning.'),
      cue: T('Inside first.', 'Axe d’abord.', 'Sentrum først.'),
    },
    attacker: {
      possession: T('Stay connected to midfield so the first press is short.', 'Reste connecté au milieu pour que le premier pressing soit court.', 'Hold kontakt med midtbanen så første press blir kort.'),
      defence: T('Nearest player presses; far-side attacker narrows and screens the switch.', 'Le plus proche presse ; l’attaquant opposé rentre et bloque le renversement.', 'Nærmeste presser; motsatt angriper trekker inn og stenger vendingen.'),
      transition: T('React for five seconds: attack the ball or the nearest easy pass.', 'Réagis pendant cinq secondes : attaque le ballon ou la passe facile la plus proche.', 'Reager i fem sekunder: gå på ball eller nærmeste enkle pasning.'),
      cue: T('Press together, not alone.', 'Presser ensemble, jamais seul.', 'Press sammen, ikke alene.'),
    },
  }
  return copy[roleBand]?.[lang] || copy.midfielder[lang]
}

function counterPressSections(roleBand) {
  return [
    { key: 'possession', label: T('Attack', 'Attaque', 'Angrep'), text: roleText(roleBand, 'possession') },
    { key: 'defence', label: T('Defend', 'Défense', 'Forsvar'), text: roleText(roleBand, 'defence') },
    { key: 'transition', label: T('Transition', 'Transition', 'Overgang'), text: roleText(roleBand, 'transition') },
    { key: 'cue', label: T('Key cue', 'Point clé', 'Nøkkelpunkt'), text: roleText(roleBand, 'cue') },
  ]
}

export function createCounterPressPlan(standardPlan, formation, presetId = DEFAULT_COUNTERPRESS_PRESET[formation]) {
  const plan = clone(standardPlan)
  plan.global = {
    title: T('Counter-press', 'Contre-pressing', 'Gjenvinningspress'),
    sections: [
      {
        key: 'press',
        label: T('First 5 seconds', 'Les 5 premières secondes', 'De første 5 sekundene'),
        text: T('Closest player attacks the ball immediately. Everyone else squeezes toward the loss.', 'Le joueur le plus proche attaque immédiatement le ballon. Tous les autres resserrent autour de la perte.', 'Nærmeste spiller går på ball med en gang. Alle andre trekker inn mot balltapet.'),
      },
      {
        key: 'defend',
        label: T('Protect the centre', 'Protéger l’axe', 'Beskytt sentrum'),
        text: T('Close inside passing lanes first. Force play outside or backwards.', 'Fermer d’abord les passes intérieures. Forcer le jeu vers l’extérieur ou vers l’arrière.', 'Steng pasninger gjennom sentrum først. Tving spillet ut eller bakover.'),
      },
      {
        key: 'transition',
        label: T('Second wave', 'Deuxième vague', 'Andre bølge'),
        text: T('Second and third players arrive close behind the press. The back line steps up to keep short distances.', 'Le deuxième et le troisième joueurs arrivent près derrière le pressing. La ligne arrière avance pour garder des distances courtes.', 'Andre og tredje spiller kommer tett bak presset. Forsvarslinjen skyver opp for korte avstander.'),
      },
      {
        key: 'fallback',
        label: T('If the press is beaten', 'Si le pressing est éliminé', 'Hvis presset blir spilt av'),
        text: T('Stop chasing and recover centrally into the compact block.', 'Arrêter de poursuivre et se recentrer dans le bloc compact.', 'Slutt å jage og fall inn sentralt i den kompakte blokken.'),
      },
    ],
  }

  for (const player of plan.players || []) {
    player.sections = counterPressSections(player.roleBand || 'midfielder')
  }

  applyCounterPressPreset(plan, formation, presetId)
  return plan
}

export function prepareCounterPressData(source) {
  const next = clone(source)
  const oldCounterPressVersion = Number(next.counterPressVersion || 0)

  for (const formation of ['7v7', '9v9']) {
    const profile = next.formats?.[formation]
    if (!profile) continue

    const defaultPreset = DEFAULT_COUNTERPRESS_PRESET[formation]
    if (oldCounterPressVersion < COUNTERPRESS_VERSION) {
      profile.counterPressPreset = defaultPreset
      profile.tactics.alternative = createCounterPressPlan(profile.tactics.standard, formation, defaultPreset)
      profile.strategyVisibility = { ...(profile.strategyVisibility || {}), standard: true, alternative: true }
    } else {
      profile.counterPressPreset = profile.counterPressPreset || defaultPreset
      if (!profile.tactics?.alternative?.players?.length) {
        profile.tactics.alternative = createCounterPressPlan(profile.tactics.standard, formation, profile.counterPressPreset)
      }
    }
  }

  next.counterPressVersion = COUNTERPRESS_VERSION
  next.version = Math.max(Number(next.version || 0), 11)
  return next
}
