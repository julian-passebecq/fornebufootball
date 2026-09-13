import test from 'node:test'
import assert from 'node:assert/strict'
import { seedData } from '../src/seedData.js'
import { migrateRemote } from '../src/tacticsModel.js'

test('7v7 has seven numbered players',()=>{assert.equal(seedData['7v7'].players.length,7);assert.deepEqual(seedData['7v7'].players.map(p=>p.number),[1,2,3,4,5,6,7])})
test('9v9 has nine numbered players',()=>{assert.equal(seedData['9v9'].players.length,9);assert.deepEqual(seedData['9v9'].players.map(p=>p.number),[1,2,3,4,5,6,7,8,9])})
test('seed data schema version is current',()=>{assert.equal(seedData.version,2)})
test('formations match reference shapes',()=>{assert.equal(seedData['7v7'].shape,'2-3-1');assert.equal(seedData['9v9'].shape,'3-2-3')})
test('both formations provide two global strategies and bilingual text',()=>{for(const f of ['7v7','9v9']){for(const s of ['standard','alternative']){assert.ok(seedData[f].global[s]);for(const section of seedData[f].global[s].sections){assert.ok(section.text.no);assert.ok(section.text.en)}}}})
test('player positions remain in pitch bounds',()=>{for(const f of ['7v7','9v9'])for(const p of seedData[f].players){assert.ok(p.x>=0&&p.x<=100);assert.ok(p.y>=0&&p.y<=100)}})

test('migration creates three teams with their own tactics for both formats',()=>{
  const data=migrateRemote(seedData)
  assert.equal(data.teams.length,3)
  for(const team of data.teams){
    assert.ok(team.tactics['7v7'].standard)
    assert.ok(team.tactics['7v7'].alternative)
    assert.ok(team.tactics['9v9'].standard)
    assert.ok(team.tactics['9v9'].alternative)
  }
})

test('standard and additional plan positions are independent',()=>{
  const data=migrateRemote(seedData)
  const team=data.teams[1]
  const before=team.tactics['9v9'].alternative.players[0].x
  team.tactics['9v9'].standard.players[0].x=93
  assert.equal(team.tactics['9v9'].alternative.players[0].x,before)
})

test('standard and additional plan player text is independent',()=>{
  const data=migrateRemote(seedData)
  const team=data.teams[1]
  const before=team.tactics['9v9'].alternative.players[0].sections[0].text.en
  team.tactics['9v9'].standard.players[0].sections[0].text.en='Changed only in standard'
  assert.equal(team.tactics['9v9'].alternative.players[0].sections[0].text.en,before)
})

test('standard is public by default while additional plan stays coach-only',()=>{
  const data=migrateRemote(seedData)
  for(const team of data.teams){
    assert.equal(team.strategyVisibility.standard,true)
    assert.equal(team.strategyVisibility.alternative,false)
  }
})
