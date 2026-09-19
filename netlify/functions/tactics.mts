import type { Context, Config } from '@netlify/functions'
import { getDeployStore, getStore } from '@netlify/blobs'
import { validateBoard } from '../../src/boardModel.js'

function fromHex(value: string) {
  if (!/^[a-f0-9]{64}$/i.test(value)) return null
  const bytes = new Uint8Array(value.length / 2)
  for (let i = 0; i < value.length; i += 2) bytes[i / 2] = Number.parseInt(value.slice(i, i + 2), 16)
  return bytes
}
async function verify(payload: string, signature: string, secret: string) {
  const bytes = fromHex(signature)
  if (!bytes) return false
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    {name:'HMAC', hash:'SHA-256'},
    false,
    ['verify']
  )
  return crypto.subtle.verify('HMAC', key, bytes, new TextEncoder().encode(payload))
}
function json(data: unknown, init: ResponseInit = {}) {
  const headers = new Headers(init.headers)
  headers.set('cache-control','no-store, max-age=0')
  return Response.json(data,{...init,headers})
}
function storeForContext(){
  return Netlify.context?.deploy?.context === 'production' ? getStore('fornebu-coach') : getDeployStore('fornebu-coach')
}
async function authorized(req: Request){
  const secret=Netlify.env.get('COACH_SESSION_SECRET')
  if(!secret) return false
  const raw=(req.headers.get('authorization')||'').replace(/^Bearer\s+/,'')
  const [expiry,signature,...rest]=raw.split('.')
  if(rest.length || !/^\d{13}$/.test(expiry||'') || !signature) return false
  const expiresAt=Number(expiry)
  if(!Number.isFinite(expiresAt) || expiresAt < Date.now()) return false
  // Login tokens are issued for 8 hours. Reject implausibly long-lived tokens too.
  if(expiresAt > Date.now() + 9 * 60 * 60 * 1000) return false
  return verify(expiry,signature,secret)
}
export default async (req: Request, _context: Context) => {
  const store=storeForContext()
  if(req.method==='GET'){
    const data=await store.get('tactics',{type:'json'})
    if(!data) return json({error:'No saved tactics yet'}, {status:404})
    return json(data)
  }
  if(req.method==='POST'){
    if(!(await authorized(req))) return json({error:'Unauthorized'},{status:401})
    const contentLength=Number(req.headers.get('content-length')||0)
    if(Number.isFinite(contentLength) && contentLength > 512 * 1024) {
      return json({error:'Tactics payload too large'},{status:413})
    }
    let body: unknown
    try {
      body=await req.json()
    } catch {
      return json({error:'Invalid JSON payload'},{status:400})
    }
    if(!validateBoard(body)) return json({error:'Invalid tactics payload'},{status:400})
    await store.setJSON('tactics',body)
    return json({ok:true})
  }
  return new Response('Method not allowed',{status:405,headers:{allow:'GET, POST','cache-control':'no-store, max-age=0'}})
}
export const config: Config = { path: '/api/tactics' }
