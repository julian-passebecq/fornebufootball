import test from 'node:test'
import assert from 'node:assert/strict'
import { seedData } from '../src/seedData.js'
import { COACH_BRIEF_VERSION } from '../src/coachBriefV8.js'
import { migrateRemote, ROLE_BANDS, ROLE_COLORS, SKY_BLUE_PLAYER } from '../src/tacticsModel.js'

test('7v7 has seven numbered players',()=>{assert.equal(seedData['7v7'].players.length,7);assert.deepEqual(seedData['7v7'].players.map(p=>p.number),[1,2,3,4,5,6,7])})
test('9v9 has nine numbered players',()=>{assert.equal(seedData['9v9'].players.length,9);assert.deepEqual(seedData['9v9'].players.map(p=>p.number),[1,2,3,4,5,6,7,8,9])})
test('formations match reference shapes',()=>{assert.equal(seedData['7v7'].shape,'2-3-1');assert.equal(seedData['9v9'].shape,'3-2-3')})
test('player positions remain in pitch bounds',()=>{for(const f of ['7v7','9v9'])for(const p of seedData[f].players){assert.ok(p.x>=0&&p.x<=100);assert.ok(p.y>=0&&p.y<=100)}})

test('migration creates exactly two format profiles',()=>{
  const data=migrateRemote(seedData)
  assert.equal(data.version,10)
  assert.equal(data.coachBriefVersion,COACH_BRIEF_VERSION)
  assert.deepEqual(Object.keys(data.formats).sort(),['7v7','9v9'])
  assert.equal(data.teams,undefined)
})

test('both formats provide standard and additional plans',()=>{
  const data=migrateRemote(seedData)
  for(const formation of ['7v7','9v9']){
    assert.ok(data.formats[formation].tactics.standard)
    assert.ok(data.formats[formation].tactics.alternative)
  }
})

test('9v9 standard plan receives the Gardien brief',()=>{
  const standard=migrateRemote(seedData).formats['9v9'].tactics.standard
  assert.equal(standard.global.sections.length,5)
  assert.match(standard.global.sections.find(s=>s.key==='transition').text.en,/5 seconds/i)
  assert.match(standard.global.sections.find(s=>s.key==='mindset').text.en,/Believe you can do it/i)
  assert.equal(standard.players.find(p=>p.number===1).role.en,'Goalkeeper')
  assert.equal(standard.players.find(p=>p.number===3).role.en,'Centre-back stopper')
  assert.equal(standard.players.find(p=>p.number===8).role.en,'Striker')
})

test('7v7 adapts the same 9v9 source brief by role',()=>{
  const standard=migrateRemote(seedData).formats['7v7'].tactics.standard
  assert.equal(standard.players.find(p=>p.number===1).role.en,'Goalkeeper')
  assert.equal(standard.players.find(p=>p.number===2).role.en,'Left full-back')
  assert.equal(standard.players.find(p=>p.number===3).role.en,'Right full-back')
  assert.equal(standard.players.find(p=>p.number===4).role.en,'Central midfielder')
  assert.equal(standard.players.find(p=>p.number===5).role.en,'Left winger')
  assert.equal(standard.players.find(p=>p.number===6).role.en,'Right winger')
  assert.equal(standard.players.find(p=>p.number===7).role.en,'Striker')
})

test('French standard content exists for both formats',()=>{
  const data=migrateRemote(seedData)
  for(const formation of ['7v7','9v9']){
    const standard=data.formats[formation].tactics.standard
    assert.equal(standard.global.title.fr,'Plan standard')
    assert.ok(standard.players.every(player=>player.role.fr && player.sections.every(section=>section.text.fr)))
  }
})

test('all player colours are the same sky blue',()=>{
  assert.equal(ROLE_COLORS.goalkeeper,SKY_BLUE_PLAYER)
  assert.equal(ROLE_COLORS.defender,SKY_BLUE_PLAYER)
  assert.equal(ROLE_COLORS.midfielder,SKY_BLUE_PLAYER)
  assert.equal(ROLE_COLORS.attacker,SKY_BLUE_PLAYER)
})

test('both formats include the compact-block and IN/OUT principles',()=>{
  const data=migrateRemote(seedData)
  for(const formation of ['7v7','9v9']){
    const principles=data.formats[formation].principles
    assert.match(principles.compact.fr,/bloc d'équipe compact/i)
    assert.equal(principles.in.fr,'Ouvrir le jeu')
    assert.equal(principles.out.fr,'Jeu compact')
  }
})

test('standard and additional positions are independent',()=>{
  const data=migrateRemote(seedData)
  for(const formation of ['7v7','9v9']){
    const before=data.formats[formation].tactics.alternative.players[0].x
    data.formats[formation].tactics.standard.players[0].x=93
    assert.equal(data.formats[formation].tactics.alternative.players[0].x,before)
  }
})

test('standard and additional player text is independent',()=>{
  const data=migrateRemote(seedData)
  const before=data.formats['9v9'].tactics.alternative.players[0].sections[0].text.en
  data.formats['9v9'].tactics.standard.players[0].sections[0].text.en='Changed only in standard'
  assert.equal(data.formats['9v9'].tactics.alternative.players[0].sections[0].text.en,before)
})

test('coach edits survive a later migration',()=>{
  const first=migrateRemote(seedData)
  first.formats['9v9'].tactics.standard.players[0].sections[0].text.en='Coach custom goalkeeper instruction'
  first.formats['9v9'].principles.compact.en='Coach custom compact rule'
  const second=migrateRemote(first)
  assert.equal(second.formats['9v9'].tactics.standard.players[0].sections[0].text.en,'Coach custom goalkeeper instruction')
  assert.equal(second.formats['9v9'].principles.compact.en,'Coach custom compact rule')
})

test('all format players keep a valid tactical role band',()=>{
  const data=migrateRemote(seedData)
  for(const formation of ['7v7','9v9']){
    for(const strategy of ['standard','alternative']){
      for(const player of data.formats[formation].tactics[strategy].players) assert.ok(ROLE_BANDS.includes(player.roleBand))
    }
  }
})

test('standard is public by default while additional stays coach-only',()=>{
  const data=migrateRemote(seedData)
  for(const formation of ['7v7','9v9']){
    assert.equal(data.formats[formation].strategyVisibility.standard,true)
    assert.equal(data.formats[formation].strategyVisibility.alternative,false)
  }
})

test('next-game data is independent between 7v7 and 9v9',()=>{
  const data=migrateRemote(seedData)
  const before=data.formats['7v7'].nextGame.opponent
  data.formats['9v9'].nextGame.opponent='Changed opponent'
  assert.equal(data.formats['7v7'].nextGame.opponent,before)
})
