// Temporary, read-only formation previews for the coach review.
// They are deliberately independent from tactical slot ids and saved coordinates:
// the coach has already moved players, so slot-based numbering can put a shirt on
// the wrong visual position. Remove this file once A/B/C is confirmed.

const p = (shirt, x, y) => ({ shirt, x, y })

export const TEMP_SCENARIOS = {
  '7v7': [
    {
      id: 'photo',
      label: 'A · Photo coach',
      shape: '2-3-1',
      structure: '1 / 3-2 / 9-4-11 / 10',
      note: 'Reproduction de la lecture actuelle de la photo coach. C’est la référence visuelle, pas une déduction des rôles écrits.',
      lines: 'Défense : #3 gauche — #2 droite · Milieu : #9 — #4 — #11 · Pointe : #10',
      layout: [
        p(1,10,50),
        p(3,29,30), p(2,29,70),
        p(9,52,18), p(4,49,50), p(11,52,82),
        p(10,70,50),
      ],
    },
    {
      id: 'literal-67',
      label: 'B · 6-7 au milieu',
      shape: '3-2-1',
      structure: '1 / 3-4-2 / 6-7 / 9',
      note: 'Lecture littérale du document : 4 stoppeur, 2-3 latéraux, 6-7 milieux défensifs, 9 avant-centre.',
      lines: 'Défense : #3 gauche — #4 stoppeur — #2 droite · Milieu : #6 — #7 · Pointe : #9',
      layout: [
        p(1,8,50),
        p(3,28,24), p(4,28,50), p(2,28,76),
        p(6,50,38), p(7,54,62),
        p(9,72,50),
      ],
    },
    {
      id: 'french-traditional',
      label: 'C · Numérotation française',
      shape: '3-2-1',
      structure: '1 / 3-4-2 / 6-8 / 9',
      note: 'Repères français traditionnels : 2 latéral droit, 3 latéral gauche, 4 axial, 6 récupérateur, 8 relayeur, 9 avant-centre.',
      lines: 'Défense : #3 gauche — #4 stoppeur — #2 droite · Milieu : #6 — #8 · Pointe : #9',
      layout: [
        p(1,8,50),
        p(3,28,24), p(4,28,50), p(2,28,76),
        p(6,49,38), p(8,54,62),
        p(9,72,50),
      ],
    },
  ],
  '9v9': [
    {
      id: 'photo',
      label: 'A · Photo coach',
      shape: '3-2-3',
      structure: '1 / 3-4-2 / 7-10 / 8-9-11',
      note: 'Lecture de la photo : 9 reste toujours l’avant-centre au milieu de la ligne de trois ; 11 reste joueur de côté autour du 9.',
      lines: 'Défense : #3 gauche — #4 stoppeur — #2 droite · Milieu : #7 — #10 · Attaque : #8 — #9 — #11',
      layout: [
        p(1,8,50),
        p(3,26,25), p(4,26,50), p(2,26,75),
        p(7,47,39), p(10,52,61),
        p(8,68,24), p(9,72,50), p(11,68,76),
      ],
    },
    {
      id: 'literal-67',
      label: 'B · 6-7 au milieu',
      shape: '3-2-3',
      structure: '1 / 3-4-2 / 6-7 / 8-9-11',
      note: 'Lecture la plus littérale de « milieux défensifs (6-7) ». La ligne offensive ne change pas : 8 — 9 — 11.',
      lines: 'Défense : #3 gauche — #4 stoppeur — #2 droite · Milieu : #6 — #7 · Attaque : #8 — #9 — #11',
      layout: [
        p(1,8,50),
        p(3,26,25), p(4,26,50), p(2,26,75),
        p(6,47,39), p(7,52,61),
        p(8,68,24), p(9,72,50), p(11,68,76),
      ],
    },
    {
      id: 'french-traditional',
      label: 'C · Numérotation française',
      shape: '3-2-3',
      structure: '1 / 3-4-2 / 6-8 / 7-9-11',
      note: 'Convention française classique : 2 arrière droit, 3 arrière gauche, 4 axial, 6 récupérateur, 8 relayeur, 7/11 ailes, 9 avant-centre.',
      lines: 'Défense : #3 gauche — #4 stoppeur — #2 droite · Milieu : #6 — #8 · Attaque : #7 — #9 — #11',
      layout: [
        p(1,8,50),
        p(3,26,25), p(4,26,50), p(2,26,75),
        p(6,47,39), p(8,52,61),
        p(7,68,24), p(9,72,50), p(11,68,76),
      ],
    },
  ],
}

export function getTempScenario(format, id) {
  return TEMP_SCENARIOS[format]?.find(item => item.id === id) || null
}

export function previewPlayers(players, scenario) {
  if (!scenario?.layout) return players
  const base = [...players].sort((a,b) => a.number - b.number)
  return scenario.layout.map((spot,index) => {
    const source = base[index] || base[0] || {number:index+1}
    return {
      ...source,
      number: index + 1,
      shirtNumber: spot.shirt,
      x: spot.x,
      y: spot.y,
    }
  })
}
