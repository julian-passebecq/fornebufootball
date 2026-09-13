import type { Context, Config } from '@netlify/functions'

function toHex(buffer: ArrayBuffer) { return [...new Uint8Array(buffer)].map(b => b.toString(16).padStart(2, '0')).join('') }
async function sign(payload: string, secret: string) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), {name:'HMAC', hash:'SHA-256'}, false, ['sign'])
  return toHex(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload)))
}

export default async (req: Request, _context: Context) => {
  if (req.method !== 'POST') return new Response('Method not allowed', {status:405})
  const password = Netlify.env.get('COACH_PASSWORD')
  const secret = Netlify.env.get('COACH_SESSION_SECRET')
  if (!password || !secret) return Response.json({error:'Coach auth is not configured'}, {status:503})
  const body = await req.json().catch(()=>({})) as {password?:string}
  if (body.password !== password) return Response.json({error:'Invalid password'}, {status:401})
  const payload = `${Date.now() + 8 * 60 * 60 * 1000}`
  const signature = await sign(payload, secret)
  return Response.json({token:`${payload}.${signature}`})
}
export const config: Config = { path: '/api/coach-login' }
