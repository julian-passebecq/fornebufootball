import test from 'node:test'
import assert from 'node:assert/strict'
import { seedData } from '../src/seedData.js'

test('7v7 has seven numbered players',()=>{assert.equal(seedData['7v7'].players.length,7);assert.deepEqual(seedData['7v7'].players.map(p=>p.number),[1,2,3,4,5,6,7])})
test('9v9 has nine numbered players',()=>{assert.equal(seedData['9v9'].players.length,9);assert.deepEqual(seedData['9v9'].players.map(p=>p.number),[1,2,3,4,5,6,7,8,9])})
test('both formations provide two global strategies and bilingual text',()=>{for(const f of ['7v7','9v9']){for(const s of ['standard','alternative']){assert.ok(seedData[f].global[s]);for(const section of seedData[f].global[s].sections){assert.ok(section.text.no);assert.ok(section.text.en)}}}})
test('player positions remain in pitch bounds',()=>{for(const f of ['7v7','9v9'])for(const p of seedData[f].players){assert.ok(p.x>=0&&p.x<=100);assert.ok(p.y>=0&&p.y<=100)}})
