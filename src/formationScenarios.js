// Temporary formation/numbering previews used to resolve the coach's intended
// shirt-number placement. These NEVER mutate or persist the saved board.
// Remove this module and the small preview toolbar once the coach confirms A/B/C.

export const TEMP_SCENARIOS = {
  '7v7': [
    {
      id: 'photo',
      label: 'A · Photo coach',
      shape: '2-3-1',
      structure: '1 / 3-2 / 9-4-11 / 10',
      note: 'Lecture directe de la photo 7v7 reçue. Positions actuelles conservées.',
      numbers: {1:1,2:3,3:2,4:4,5:9,6:11,7:10},
    },
    {
      id: 'roles-231',
      label: 'B · Rôles écrits',
      shape: '2-3-1',
      structure: '1 / 3-2 / 8-10-11 / 9',
      note: 'Adapte littéralement les rôles écrits au 2-3-1 : 9 avant-centre, 11 côté, 10 milieu offensif.',
      numbers: {1:1,2:3,3:2,4:10,5:8,6:11,7:9},
    },
    {
      id: 'us-321',
      label: 'C · 3-2-1 développement',
      shape: '3-2-1',
      structure: '1 / 3-4-2 / 7-10 / 9',
      note: 'Variante développement : trois défenseurs, deux milieux décalés, un avant-centre.',
      numbers: {1:1,2:3,3:4,4:2,5:7,6:10,7:9},
      positions: {
        1:[8,50],
        2:[28,24],3:[28,50],4:[28,76],
        5:[50,38],6:[55,62],
        7:[72,50],
      },
    },
  ],
  '9v9': [
    {
      id: 'photo',
      label: 'A · Photo coach',
      shape: '3-2-3',
      structure: '1 / 3-4-2 / 7-10 / 8-9-11',
      note: 'Lecture directe de la photo 9v9 : 4 stoppeur, 9 avant-centre, 11 côté droit.',
      numbers: {1:1,2:3,3:4,4:2,5:7,6:10,7:8,8:9,9:11},
    },
    {
      id: 'double-6-7',
      label: 'B · 6-7 au milieu',
      shape: '3-2-3',
      structure: '1 / 3-4-2 / 6-7 / 8-9-11',
      note: 'Lecture la plus littérale de « milieux défensifs (6-7) » ; ligne offensive 8-9-11.',
      numbers: {1:1,2:3,3:4,4:2,5:6,6:7,7:8,8:9,9:11},
    },
    {
      id: 'staggered-6-10',
      label: 'C · 6-10 décalés',
      shape: '3-2-3',
      structure: '1 / 3-4-2 / 6-10 / 8-9-11',
      note: 'Un milieu plus défensif et un plus offensif, tout en gardant 9 au centre et 11 sur le côté.',
      numbers: {1:1,2:3,3:4,4:2,5:6,6:10,7:8,8:9,9:11},
    },
  ],
}

export function getTempScenario(format, id) {
  return TEMP_SCENARIOS[format]?.find(item => item.id === id) || null
}

export function previewPlayers(players, scenario) {
  if (!scenario) return players
  return players.map(player => {
    const next = {...player, shirtNumber: scenario.numbers[player.number] ?? player.shirtNumber ?? player.number}
    const position = scenario.positions?.[player.number]
    if (position) {
      next.x = position[0]
      next.y = position[1]
    }
    return next
  })
}
