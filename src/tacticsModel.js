import { seedData } from './seedData.js'
import { applyCoachBriefToPlan, COACH_BRIEF_VERSION } from './coachBriefV8.js'

export const STRATEGY_KEYS = ['standard', 'alternative']
export const FORMATION_KEYS = ['7v7', '9v9']
export const DEFAULT_VISIBILITY = { standard: true, alternative: false }
export const ROLE_BANDS = ['goalkeeper', 'defender', 'midfielder', 'attacker']
export const ROLE_COLORS = {
  goalkeeper: '#2f9fd0',
  defender: '#355f8f',
  midfielder: '#d99b2b',
  attacker: '#d85e5e',
}

export const DEFAULT_FORMATS = {
  '7v7': { id: '7v7', label: '7v7', nextGame: { date: '2026-09-21', time: '17:30', opponent: 'Lyn' } },
  '9v9': { id: '9v9', label: '9v9', nextGame: { date: '2026-09-20', time: '13:00', opponent: 'Bærum' } },
}

export function clone(value) {
  return JSON.parse(JSON.stringify(value))
}

export function defaultRoleBand(formation, playerNumber) {
  if (playerNumber === 1) return 'goalkeeper'
  if (formation === '7v7') {
    if ([2, 3].includes(playerNumber)) return 'defender'
    if ([4, 5, 6].includes(playerNumber)) return 'midfielder'
    return 'attacker'
  }
  if ([2, 3, 4].includes(playerNumber)) return 'defender'
  if ([5, 6].includes(playerNumber)) return 'midfielder'
  return 'attacker'
}

function validPlan(plan) {
  return Boolean(plan?.global?.sections?.length && plan?.players?.length)
}

function ensurePlayerBands(plan, formation) {
  if (!plan?.players) return
  for (const player of plan.players) {
    if (!ROLE_BANDS.includes(player.roleBand)) player.roleBand = defaultRoleBand(formation, player.number)
  }
}

export function createPlan(sourceData, formation, strategy) {
  const source = sourceData?.[formation] || seedData[formation]
  const plan = {
    global: clone(source.global[strategy]),
    players: clone(source.players),
  }
  ensurePlayerBands(plan, formation)
  return plan
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

function legacyProfile(next, formation) {
  const teams = Array.isArray(next.teams) ? next.teams : []
  const preferredId = formation === '7v7' ? 'team3' : 'team2'
  const team = teams.find(item => item.id === preferredId && item.formation === formation)
    || teams.find(item => item.formation === formation)
  if (!team) return null
  return {
    nextGame: clone(team.nextGame || {}),
    strategyVisibility: clone(team.strategyVisibility || {}),
    tactics: clone(team.tactics?.[formation] || {}),
  }
}

function ensureFormatProfile(profile, next, formation) {
  profile.tactics = profile.tactics || {}
  for (const strategy of STRATEGY_KEYS) {
    if (!validPlan(profile.tactics[strategy])) profile.tactics[strategy] = createPlan(next, formation, strategy)
    ensurePlayerBands(profile.tactics[strategy], formation)
  }
}

function applyCoachBriefMigration(profile, formation, oldBriefVersion) {
  if (oldBriefVersion >= COACH_BRIEF_VERSION) return
  applyCoachBriefToPlan(profile.tactics?.standard, formation)
}

export function migrateRemote(remote) {
  const next = clone(remote || seedData)
  const oldVersion = Number(next.version || 0)
  const oldBriefVersion = Number(next.coachBriefVersion || 0)

  ensureFormationTemplates(next, oldVersion)

  const existingFormats = next.formats || {}
  const formats = {}
  for (const formation of FORMATION_KEYS) {
    const defaults = DEFAULT_FORMATS[formation]
    const legacy = legacyProfile(next, formation) || {}
    const existing = existingFormats[formation] || {}
    const formationFallbackVisibility = next[formation]?.strategyVisibility || DEFAULT_VISIBILITY

    const profile = {
      ...clone(defaults),
      ...clone(legacy),
      ...clone(existing),
      id: formation,
      label: formation,
      nextGame: {
        ...clone(defaults.nextGame),
        ...(legacy.nextGame || {}),
        ...(existing.nextGame || {}),
      },
      strategyVisibility: {
        ...DEFAULT_VISIBILITY,
        ...formationFallbackVisibility,
        ...(legacy.strategyVisibility || {}),
        ...(existing.strategyVisibility || {}),
      },
      tactics: clone(existing.tactics || legacy.tactics || {}),
    }

    ensureFormatProfile(profile, next, formation)
    applyCoachBriefMigration(profile, formation, oldBriefVersion)
    formats[formation] = profile
  }

  next.formats = formats
  delete next.teams
  next.coachBriefVersion = COACH_BRIEF_VERSION
  next.version = Math.max(oldVersion, 9)
  return next
}
