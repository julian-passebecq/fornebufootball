import test, { beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { normalizeBoard, setShirtNumber, movePlayer, setPlayerText } from '../src/boardModel.js'

// Exercise the actual handlers. Only the external storage/environment adapter is
// replaced: tests never read secrets or publish to the real coach's Netlify site.
async function loadHandler(path) {
  let source = readFileSync(new URL(path, import.meta.url), 'utf8')
  source = source.replace("import { getDeployStore, getStore } from '@netlify/blobs'", 'const { getDeployStore, getStore } = globalThis.__boardTestStores')
  return (await import('data:text/javascript;base64,' + Buffer.from(stripTypeScriptTypes(source)).toString('base64'))).default
}
let env, production, preview
function memoryStore() { const map = new Map();return { get:async key=>map.get(key),setJSON:async(key,value)=>map.set(key,structuredClone(value)) } }
globalThis.__boardTestStores = { getStore:()=>production, getDeployStore:()=>preview }
const login = await loadHandler('../netlify/functions/coach-login.mts')
const tactics = await loadHandler('../netlify/functions/tactics.mts')
beforeEach(()=>{env={COACH_PASSWORD:'test-password',COACH_SESSION_SECRET:'test-session-secret-not-used-in-production'};production=memoryStore();preview=memoryStore();globalThis.Netlify={env:{get:key=>env[key]},context:{deploy:{context:'production'}}}})
const request = (path, method='GET', body, token) => new Request(`https://board.test/api/${path}`, {method,headers:{'content-type':'application/json',...(token?{authorization:`Bearer ${token}`}:{})},...(body!==undefined?{body:JSON.stringify(body)}:{})})
async function token(){return (await (await login(request('coach-login','POST',{password:'test-password'}),{})).json()).token}

test('login requires configured secrets and the correct password',async()=>{assert.equal((await login(request('coach-login','POST',{password:'wrong'}),{})).status,401);delete env.COACH_SESSION_SECRET;assert.equal((await login(request('coach-login','POST',{password:'test-password'}),{})).status,503)})
test('issued coach session is signed and time limited',async()=>{const value=await token();assert.match(value,/^\d+\.[a-f0-9]{64}$/);const expiry=Number(value.split('.')[0]);assert.ok(expiry>Date.now()+7*3600000);assert.ok(expiry<=Date.now()+8*3600000);assert.equal((await login(request('coach-login'),{})).status,405)})
test('public callers, tampered tokens and expired tokens cannot publish',async()=>{const data=normalizeBoard();for(const value of [undefined,'1.'+'a'.repeat(64),`${Date.now()+3600000}.${'a'.repeat(64)}`]){assert.equal((await tactics(request('tactics','POST',data,value),{})).status,401)}assert.equal((await tactics(request('tactics'),{})).status,404)})
test('valid publish and reload retain numbers, French guidance and phase positions',async()=>{let data=normalizeBoard();data=setShirtNumber(data,'9v9',7,17);data=movePlayer(data,'9v9','alternative',7,77,21);data=setPlayerText(data,'9v9',7,'cue','Instruction saved by the test');const result=await tactics(request('tactics','POST',data,await token()),{});assert.equal(result.status,200);assert.deepEqual(await result.json(),{ok:true});const remote=await (await tactics(request('tactics'),{})).json();const reloaded=normalizeBoard(remote);assert.equal(reloaded.formats['9v9'].tactics.standard.players[6].shirtNumber,17);assert.equal(reloaded.formats['9v9'].tactics.alternative.players[6].x,77);assert.equal(reloaded.formats['9v9'].tactics.alternative.players[6].sections.find(s=>s.key==='cue').text.fr,'Instruction saved by the test')})
test('preview storage does not modify the production plan',async()=>{const value=await token();await tactics(request('tactics','POST',normalizeBoard(),value),{});globalThis.Netlify.context.deploy.context='deploy-preview';assert.equal((await tactics(request('tactics'),{})).status,404);await tactics(request('tactics','POST',setShirtNumber(normalizeBoard(),'9v9',7,77),value),{});globalThis.Netlify.context.deploy.context='production';const remote=await (await tactics(request('tactics'),{})).json();assert.equal(remote.formats['9v9'].tactics.standard.players[6].shirtNumber,7)})
test('incomplete payload is rejected and unsupported methods cannot save',async()=>{assert.equal((await tactics(request('tactics','POST',{},await token()),{})).status,400);assert.equal((await tactics(request('tactics','DELETE'),{})).status,405)})
