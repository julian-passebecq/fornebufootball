import type { Context, Config } from '@netlify/functions'
import { getDeployStore, getStore } from '@netlify/blobs'

function toHex(buffer: ArrayBuffer) { return [...new Uint8Array(buffer)].map(b => b.toString(16).padStart(2, '0')).join('') }
async function sign(payload: string, secret: string) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), {name:'HMAC', hash:'SHA-256'}, false, ['sign'])
  return toHex(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload)))
}
function storeForContext(){
  return Netlify.context?.deploy?.context === 'production' ? getStore('fornebu-coach') : getDeployStore('fornebu-coach')
}
async function authorized(req: Request){
  const secret=Netlify.env.get('COACH_SESSION_SECRET'); if(!secret) return false
  const token=(req.headers.get('authorization')||'').replace(/^Bearer\s+/,'')
  const [expiry,sig]=token.split('.'); if(!expiry||!sig||Number(expiry)<Date.now()) return false
  return (await sign(expiry,secret))===sig
}
export default async (req: Request, _context: Context) => {
  const store=storeForContext()
  if(req.method==='GET'){
    const data=await store.get('tactics',{type:'json'})
    if(!data) return Response.json({error:'No saved tactics yet'}, {status:404})
    return Response.json(data)
  }
  if(req.method==='POST'){
    if(!(await authorized(req))) return Response.json({error:'Unauthorized'},{status:401})
    const body=await req.json()
    if(!body?.['7v7']||!body?.['9v9']) return Response.json({error:'Invalid tactics payload'},{status:400})
    await store.setJSON('tactics',body)
    return Response.json({ok:true})
  }
  return new Response('Method not allowed',{status:405})
}
export const config: Config = { path: '/api/tactics' }
