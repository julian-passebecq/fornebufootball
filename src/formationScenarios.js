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
      layout: [
        p(1,8,50),
        p(3,28,24), p(4,28,50), p(2,28,76),
        p(6,50,38), p(7,54,62),
        p(9,72,50),
      ],
    },
    {
      id: 'staggered-610',
      label: 'C · 6-10 décalés',
      shape: '3-2-1',
      structure: '1 / 3-4-2 / 6-10 / 9',
      note: 'Lecture développement : un milieu plus défensif (6) et un plus offensif (10), décalés pour créer des lignes de passe.',
      layout: [
        p(1,8,50),
        p(3,28,24), p(4,28,50), p(2,28,76),
        p(6,49,38), p(10,55,62),
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
      layout: [
        p(1,8,50),
        p(3,26,25), p(4,26,50), p(2,26,75),
        p(6,47,39), p(7,52,61),
        p(8,68,24), p(9,72,50), p(11,68,76),
      ],
    },
    {
      id: 'staggered-610',
      label: 'C · 6-10 décalés',
      shape: '3-2-3',
      structure: '1 / 3-4-2 / 6-10 / 8-9-11',
      note: 'Un milieu défensif (6) + un milieu offensif (10), décalés. 9 reste central et 11 reste sur le côté.',
      layout: [
        p(1,8,50),
        p(3,26,25), p(4,26,50), p(2,26,75),
        p(6,46,39), p(10,53,61),
        p(8,68,24), p(9,72,50), p(11,68,76),
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
