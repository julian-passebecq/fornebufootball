import test from 'node:test'
import assert from 'node:assert/strict'
import { normalizeBoard, shirtNumber, setShirtNumber, setPlayerText, setTeamText, setPrinciple, movePlayer, choosePreset, visibleTeamSections, toDisplay, fromDisplay, resolveOrientation, validateBoard } from '../src/boardModel.js'
const formats=['7v7','9v9']
for(const format of formats){
 test(`${format}: migration preserves customized positions, numbers and French copy`,()=>{let d=normalizeBoard();d=movePlayer(d,format,'alternative',7,81,23);d=setShirtNumber(d,format,7,17);d=setPlayerText(d,format,7,'possession','Consigne du coach');const reloaded=normalizeBoard(JSON.parse(JSON.stringify(d)));assert.equal(shirtNumber(reloaded.formats[format].tactics.alternative.players.find(p=>p.number===7)),17);assert.equal(reloaded.formats[format].tactics.alternative.players.find(p=>p.number===7).x,81);assert.equal(reloaded.formats[format].tactics.standard.players.find(p=>p.number===7).sections[0].text.fr,'Consigne du coach');assert.ok(validateBoard(reloaded))})
 test(`${format}: renumbering never changes tactical slots or coordinates`,()=>{const d=normalizeBoard(),next=setShirtNumber(d,format,7,27);for(const phase of ['standard','alternative']){const p=next.formats[format].tactics[phase].players.find(p=>p.number===7);assert.equal(p.shirtNumber,27);assert.equal(p.x,d.formats[format].tactics[phase].players.find(p=>p.number===7).x)}assert.equal(shirtNumber(d.formats[format].tactics.standard.players[6]),format==='7v7'?10:8)})
 test(`${format}: duplicate numbers are rejected or explicitly swapped`,()=>{const d=normalizeBoard();assert.throws(()=>setShirtNumber(d,format,7,2),/number-in-use/);const next=setShirtNumber(d,format,7,2,true);assert.equal(shirtNumber(next.formats[format].tactics.standard.players[6]),2);assert.equal(shirtNumber(next.formats[format].tactics.alternative.players.find(p=>p.number===(format==='7v7'?3:4))),format==='7v7'?10:8);assert.ok(validateBoard(next));for(const bad of ['','0','100','-1','1.5','x'])assert.throws(()=>setShirtNumber(d,format,7,bad))})
 test(`${format}: presets still address the correct players after renumbering`,()=>{let d=setShirtNumber(normalizeBoard(),format,7,77);d=choosePreset(d,format,format==='7v7'?'compact-231':'compact-323');const p=d.formats[format].tactics.alternative.players.find(p=>p.number===7);assert.equal(p.shirtNumber,77);assert.equal(p.x,format==='7v7'?68:66)})
 test(`${format}: team text and coordinates are independent; player guidance is shared`,()=>{const d=normalizeBoard();let next=movePlayer(d,format,'standard',7,80,30);assert.notEqual(next.formats[format].tactics.alternative.players[6].x,80);next=setPlayerText(next,format,7,'cue','Un seul conseil');for(const phase of ['standard','alternative'])assert.equal(next.formats[format].tactics[phase].players[6].sections.find(s=>s.key==='cue').text.fr,'Un seul conseil');next=setTeamText(next,format,'standard','start','Mon plan');assert.notEqual(next.formats[format].tactics.alternative.global.sections[0].text.fr,'Mon plan')})
 test(`${format}: starting formation excludes without-ball by key in every language`,()=>{const d=normalizeBoard();assert.ok(!visibleTeamSections(d.formats[format].tactics.standard,'standard').some(s=>s.key==='defend'));assert.ok(visibleTeamSections(d.formats[format].tactics.alternative,'alternative').some(s=>s.key==='withoutBall'))})
}
test('EN and NO cannot mutate team text, player text or principles',()=>{const d=normalizeBoard();for(const lang of ['en','no']){assert.throws(()=>setPlayerText(d,'9v9',7,'cue','x',lang),/preview-only/);assert.throws(()=>setTeamText(d,'9v9','standard','start','x',lang),/preview-only/);assert.throws(()=>setPrinciple(d,'9v9','in','x',lang),/preview-only/)}})
test('orientation transforms are lossless; own goal is at bottom in vertical',()=>{for(const view of ['horizontal','vertical'])for(const x of [6,11,50,68,94])for(const y of [7,32,50,68,93]){const screen=toDisplay(x,y,view);assert.deepEqual(fromDisplay(screen.x,screen.y,view),{x,y})}assert.deepEqual(toDisplay(11,50,'vertical'),{x:50,y:89})})
test('auto view chooses phone/tablet portrait and preserves desktop landscape',()=>{assert.equal(resolveOrientation('auto',390,844),'vertical');assert.equal(resolveOrientation('auto',820,1180),'vertical');assert.equal(resolveOrientation('auto',1180,820),'horizontal');assert.equal(resolveOrientation('auto',1440,900),'horizontal');assert.equal(resolveOrientation('horizontal',390,844),'horizontal');assert.equal(resolveOrientation('vertical',1440,900),'vertical')})
test('invalid save payloads and out-of-range movement are handled',()=>{const d=normalizeBoard();d.formats['9v9'].tactics.standard.players[0].shirtNumber=900;assert.equal(validateBoard(d),false);assert.equal(validateBoard({}),false);assert.throws(()=>movePlayer(normalizeBoard(),'9v9','standard',7,NaN,45));const moved=movePlayer(normalizeBoard(),'9v9','standard',7,150,-70);assert.equal(moved.formats['9v9'].tactics.standard.players[6].x,94);assert.equal(moved.formats['9v9'].tactics.standard.players[6].y,7)})

test('coach reference shirt numbers match supplied formation photos',()=>{
  const d=normalizeBoard()
  assert.deepEqual(d.formats['7v7'].tactics.standard.players.map(shirtNumber),[1,3,2,4,9,11,10])
  assert.deepEqual(d.formats['9v9'].tactics.standard.players.map(shirtNumber),[1,3,4,2,7,10,8,9,11])
})

test('coach source-fidelity pass restores detailed original brief concepts',()=>{
  const d=normalizeBoard()
  const p10=d.formats['9v9'].tactics.standard.players.find(p=>p.number===6)
  const p11=d.formats['9v9'].tactics.standard.players.find(p=>p.number===9)
  const striker=d.formats['9v9'].tactics.standard.players.find(p=>p.number===8)
  assert.equal(p10.role.fr,'Milieu offensif')
  assert.equal(p11.role.fr,'Offensif de couloir')
  assert.match(p10.sections.find(s=>s.key==='possession').text.fr,/nombre limité de passes/)
  assert.match(striker.sections.find(s=>s.key==='cue').text.fr,/Marquer, marquer, marquer/)
  assert.match(d.formats['9v9'].tactics.standard.global.sections.find(s=>s.key==='attack').text.en,/midfielder is always available/)
  assert.equal(d.coachSourceVersion,1)
})

test('source-fidelity pass preserves coach-authored French text',()=>{
  const d=normalizeBoard()
  d.coachSourceVersion=0
  const target=d.formats['9v9'].tactics.standard.players.find(p=>p.number===6)
  target.sections.find(s=>s.key==='possession').text.fr='Texte personnalisé du coach à conserver.'
  const again=normalizeBoard(d)
  const preserved=again.formats['9v9'].tactics.standard.players.find(p=>p.number===6)
  assert.equal(preserved.sections.find(s=>s.key==='possession').text.fr,'Texte personnalisé du coach à conserver.')
})
