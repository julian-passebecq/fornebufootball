import { migrateRemote, FORMATION_KEYS, STRATEGY_KEYS } from './tacticsModel.js'
import { prepareCounterPressData, applyCounterPressPreset } from './counterPressPresets.js'
import { applyCoachSourceFidelity } from './coachSourceFidelity.js'

export const BOARD_VERSION = 16

// Shirt numbers supplied by the coach in the 7v7 / 9v9 reference photos.
export const REFERENCE_SHIRT_NUMBERS = {
  '7v7': { 1:1, 2:3, 3:2, 4:4, 5:9, 6:11, 7:10 },
  '9v9': { 1:1, 2:3, 3:4, 4:2, 5:7, 6:10, 7:8, 8:9, 9:11 },
}
export const copy = value => JSON.parse(JSON.stringify(value))
export const shirtNumber = player => player.shirtNumber ?? player.number
export const localized = (value, lang) => typeof value === 'string' ? value : value?.[lang] ?? value?.en ?? value?.fr ?? value?.no ?? ''

// `number` is the original stable tactical slot. The editable shirt number is
// separate, so presets, roles and saved positions never jump to another player.
export function normalizeBoard(remote) {
  const sourceVersion = Number(remote?.version || 0)
  const applyReferenceNumbers = sourceVersion < BOARD_VERSION
  const next = prepareCounterPressData(applyCoachSourceFidelity(migrateRemote(remote)))
  for (const format of FORMATION_KEYS) {
    const profile = next.formats[format]
    const used = new Set()
    for (const player of profile.tactics.standard.players) {
      let value = applyReferenceNumbers
        ? Number(REFERENCE_SHIRT_NUMBERS[format]?.[player.number])
        : Number(shirtNumber(player))
      if (!Number.isInteger(value) || value < 1 || value > 99 || used.has(value)) {
        value = Number(player.number)
        while (used.has(value)) value++
      }
      used.add(value)
      player.shirtNumber = value
      for (const phase of STRATEGY_KEYS) {
        const peer = profile.tactics[phase].players.find(p => p.number === player.number)
        if (!peer) continue
        peer.shirtNumber = value
        peer.role = copy(player.role)
        peer.sections = copy(player.sections)
      }
    }
  }
  next.version = Math.max(BOARD_VERSION, Number(next.version) || 0)
  return next
}

export function setShirtNumber(data, format, slot, rawValue, swap = false) {
  if (!/^[0-9]{1,2}$/.test(String(rawValue))) throw new Error('number-range')
  const value = Number(rawValue)
  if (value < 1 || value > 99) throw new Error('number-range')
  const roster = data.formats[format].tactics.standard.players
  const player = roster.find(p => p.number === slot)
  if (!player) throw new Error('missing-player')
  const duplicate = roster.find(p => p.number !== slot && shirtNumber(p) === value)
  if (duplicate && !swap) throw new Error('number-in-use')
  const next = copy(data)
  for (const phase of STRATEGY_KEYS) {
    const players = next.formats[format].tactics[phase].players
    players.find(p => p.number === slot).shirtNumber = value
    if (duplicate) players.find(p => p.number === duplicate.number).shirtNumber = shirtNumber(player)
  }
  return next
}

export function setPlayerText(data, format, slot, field, value, language = 'fr') {
  if (language !== 'fr') throw new Error('preview-only')
  const next = copy(data)
  for (const phase of STRATEGY_KEYS) {
    const player = next.formats[format].tactics[phase].players.find(p => p.number === slot)
    if (!player) throw new Error('missing-player')
    if (field === 'role') player.role = { ...player.role, fr: value }
    else {
      const section = player.sections.find(s => s.key === field)
      if (!section) throw new Error('missing-section')
      section.text = { ...section.text, fr: value }
    }
  }
  return next
}

export function setTeamText(data, format, phase, sectionKey, value, language = 'fr') {
  if (language !== 'fr') throw new Error('preview-only')
  const next = copy(data)
  const section = next.formats[format].tactics[phase].global.sections.find(s => s.key === sectionKey)
  if (!section) throw new Error('missing-section')
  section.text = { ...section.text, fr: value }
  return next
}

export function setPrinciple(data, format, key, value, language = 'fr') {
  if (language !== 'fr') throw new Error('preview-only')
  const next = copy(data)
  next.formats[format].principles[key] = { ...next.formats[format].principles[key], fr: value }
  return next
}

export function movePlayer(data, format, phase, slot, x, y) {
  if (!Number.isFinite(x) || !Number.isFinite(y)) throw new Error('invalid-position')
  const next = copy(data)
  const profile = next.formats[format]
  const player = profile.tactics[phase].players.find(p => p.number === slot)
  if (!player) throw new Error('missing-player')
  player.x = Math.round(Math.max(6, Math.min(94, x)) * 10) / 10
  player.y = Math.round(Math.max(7, Math.min(93, y)) * 10) / 10
  if (phase === 'alternative') profile.counterPressCustom = true
  return next
}

export function choosePreset(data, format, presetId) {
  const next = copy(data)
  const profile = next.formats[format]
  applyCounterPressPreset(profile.tactics.alternative, format, presetId)
  profile.counterPressPreset = presetId
  profile.counterPressCustom = false
  return next
}

export function visibleTeamSections(plan, phase) {
  return plan.global.sections.filter(section => phase !== 'standard' || !['defend', 'defence', 'withoutBall'].includes(section.key))
}

// Rotate the FIELD, not the text or shirt glyphs. Keep one canonical coordinate
// system in storage; vertical shows our goal at the bottom, attacking upwards.
export function toDisplay(x, y, orientation) {
  return orientation === 'vertical' ? { x: y, y: 100 - x } : { x, y }
}
export function fromDisplay(x, y, orientation) {
  return orientation === 'vertical' ? { x: 100 - y, y: x } : { x, y }
}
export function resolveOrientation(preference, width, height) {
  if (preference === 'vertical' || preference === 'horizontal') return preference
  return width <= 1180 && height > width ? 'vertical' : 'horizontal'
}

export function validateBoard(data) {
  if (!data?.['7v7'] || !data?.['9v9'] || !data?.formats) return false
  for (const format of FORMATION_KEYS) {
    const profile = data.formats[format]
    const count = format === '7v7' ? 7 : 9
    for (const phase of STRATEGY_KEYS) {
      const players = profile?.tactics?.[phase]?.players
      if (!Array.isArray(players) || players.length !== count) return false
      const slots = new Set(), numbers = new Set()
      for (const p of players) {
        const n = shirtNumber(p)
        if (!Number.isInteger(p.number) || p.number < 1 || p.number > count || slots.has(p.number)) return false
        if (!Number.isInteger(n) || n < 1 || n > 99 || numbers.has(n)) return false
        if (!Number.isFinite(p.x) || !Number.isFinite(p.y) || p.x < 0 || p.x > 100 || p.y < 0 || p.y > 100) return false
        slots.add(p.number); numbers.add(n)
      }
    }
    for (const player of profile.tactics.standard.players) {
      const peer = profile.tactics.alternative.players.find(p => p.number === player.number)
      if (shirtNumber(peer) !== shirtNumber(player)) return false
    }
  }
  return true
}
