import { seedData } from './seedData.js'

export const STRATEGY_KEYS = ['standard', 'alternative']
export const FORMATION_KEYS = ['7v7', '9v9']
export const DEFAULT_VISIBILITY = { standard: true, alternative: false }

export const DEFAULT_TEAMS = [
  { id: 'team1', number: 1, name: 'Team 1', formation: '9v9', nextGame: { date: '2026-09-19', time: '10:30', opponent: 'Stabæk' } },
  { id: 'team2', number: 2, name: 'Team 2', formation: '9v9', nextGame: { date: '2026-09-20', time: '13:00', opponent: 'Bærum' } },
  { id: 'team3', number: 3, name: 'Team 3', formation: '7v7', nextGame: { date: '2026-09-21', time: '17:30', opponent: 'Lyn' } },
]

export function clone(value) {
  return JSON.parse(JSON.stringify(value))
}

function validPlan(plan) {
  return Boolean(plan?.global?.sections?.length && plan?.players?.length)
}

export function createPlan(sourceData, formation, strategy) {
  const source = sourceData?.[formation] || seedData[formation]
  return {
    global: clone(source.global[strategy]),
    players: clone(source.players),
  }
}

function ensureFormationTemplates(next, oldVersion) {
  const needsFormationMigration = oldVersion < 2

  for (const key of FORMATION_KEYS) {
    const reference = seedData[key]
    if (!next[key]) next[key] = clone(reference)
    if (!reference) continue

    if (needsFormationMigration) {
      next[key].shape = reference.shape
      for (const referencePlayer of reference.players) {
        const target = next[key].players?.find(player => player.number === referencePlayer.number)
        if (!target) continue
        target.x = referencePlayer.x
        target.y = referencePlayer.y
        target.role = clone(referencePlayer.role)
      }
    }
  }
}

function ensureTeamTactics(team, sourceData) {
  team.tactics = team.tactics || {}

  for (const formation of FORMATION_KEYS) {
    team.tactics[formation] = team.tactics[formation] || {}
    for (const strategy of STRATEGY_KEYS) {
      if (!validPlan(team.tactics[formation][strategy])) {
        team.tactics[formation][strategy] = createPlan(sourceData, formation, strategy)
      }
    }
  }
}

export function migrateRemote(remote) {
  const next = clone(remote || seedData)
  const oldVersion = Number(next.version || 0)

  ensureFormationTemplates(next, oldVersion)

  const existingTeams = new Map((next.teams || []).map(team => [team.id, team]))
  next.teams = DEFAULT_TEAMS.map(defaultTeam => {
    const existing = existingTeams.get(defaultTeam.id) || {}
    const team = {
      ...clone(defaultTeam),
      ...existing,
      number: existing.number || defaultTeam.number,
      nextGame: { ...defaultTeam.nextGame, ...(existing.nextGame || {}) },
    }

    const formationFallbackVisibility = next[team.formation]?.strategyVisibility || DEFAULT_VISIBILITY
    team.strategyVisibility = {
      ...DEFAULT_VISIBILITY,
      ...formationFallbackVisibility,
      ...(existing.strategyVisibility || {}),
    }

    ensureTeamTactics(team, next)
    return team
  })

  next.version = 5
  return next
}
