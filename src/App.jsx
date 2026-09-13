import { useEffect, useMemo, useRef, useState } from 'react'
import { seedData, SHEET_URL } from './seedData'
import './styles.css'

const labels = {
  no: {
    title: 'Fornebu trenerbrett', subtitle: 'Kampplan og spillerroller', formation: 'Spillform', global: 'Lagplan', player: 'Spillerplan', standard: 'Standard', alternative: 'Plan B', select: 'Velg en spiller på banen', unselect: 'Klikk samme spiller igjen for å fjerne valget', coach: 'Trenermodus', exitCoach: 'Avslutt trenermodus', password: 'Trenerpassord', unlock: 'Lås opp', cancel: 'Avbryt', editHint: 'Dra spillere på banen og rediger teksten direkte.', save: 'Valider endringer', saved: 'Endringer lagret', sheet: 'Åpne Google Sheet', reset: 'Tilbakestill utkast', number: 'Spiller', position: 'Rolle', sheetStatus: 'Google Sheet-klar struktur', source: 'Datakilde', liveFallback: 'Viser lokal eksempeldata til server-synk er konfigurert.', loginError: 'Feil passord eller coach-server er ikke konfigurert.'
  },
  en: {
    title: 'Fornebu Coach Board', subtitle: 'Match plan and player roles', formation: 'Game format', global: 'Team plan', player: 'Player plan', standard: 'Standard', alternative: 'Plan B', select: 'Select a player on the pitch', unselect: 'Click the same player again to clear the selection', coach: 'Coach mode', exitCoach: 'Exit coach mode', password: 'Coach password', unlock: 'Unlock', cancel: 'Cancel', editHint: 'Drag players on the pitch and edit the text directly.', save: 'Validate changes', saved: 'Changes saved', sheet: 'Open Google Sheet', reset: 'Reset draft', number: 'Player', position: 'Role', sheetStatus: 'Google Sheet-ready structure', source: 'Data source', liveFallback: 'Showing local sample data until server sync is configured.', loginError: 'Wrong password or the coach server is not configured.'
  }
}

function clone(v) { return JSON.parse(JSON.stringify(v)) }

function Field({ value, editing, onChange }) {
  if (!editing) return <p>{value}</p>
  return <textarea value={value} onChange={e => onChange(e.target.value)} rows={4} />
}

function SectionCard({ section, lang, editing, onChange }) {
  return <div className="section-card">
    <div className="section-kicker">{section.label[lang]}</div>
    <Field value={section.text[lang]} editing={editing} onChange={onChange} />
  </div>
}

function PlayerMarker({ player, selected, coachMode, onSelect, onMove }) {
  const drag = useRef(null)
  function pointerDown(e) {
    if (!coachMode) return
    e.preventDefault()
    const pitch = e.currentTarget.parentElement.getBoundingClientRect()
    drag.current = { pitch }
    e.currentTarget.setPointerCapture(e.pointerId)
  }
  function pointerMove(e) {
    if (!coachMode || !drag.current) return
    const { pitch } = drag.current
    const x = Math.max(3, Math.min(97, ((e.clientX - pitch.left) / pitch.width) * 100))
    const y = Math.max(5, Math.min(95, ((e.clientY - pitch.top) / pitch.height) * 100))
    onMove(x, y)
  }
  function pointerUp(e) {
    if (!coachMode || !drag.current) return
    drag.current = null
    e.currentTarget.releasePointerCapture?.(e.pointerId)
  }
  return <button
    className={`player-marker ${selected ? 'selected' : ''} ${coachMode ? 'draggable' : ''}`}
    style={{ left: `${player.x}%`, top: `${player.y}%` }}
    onClick={() => onSelect(player.number)}
    onPointerDown={pointerDown}
    onPointerMove={pointerMove}
    onPointerUp={pointerUp}
    aria-label={`Player ${player.number}`}
  >
    <span className="jersey"><span>{player.number}</span></span>
  </button>
}

function Pitch({ players, selected, coachMode, onSelect, onMove, lang }) {
  return <div className="pitch-wrap">
    <div className="pitch" aria-label={lang === 'no' ? 'Fotballbane' : 'Football pitch'}>
      <div className="half-line" /><div className="center-circle" /><div className="center-dot" />
      <div className="box box-left" /><div className="six six-left" /><div className="arc arc-left" />
      <div className="box box-right" /><div className="six six-right" /><div className="arc arc-right" />
      <div className="goal goal-left" /><div className="goal goal-right" />
      {players.map(player => <PlayerMarker key={player.number} player={player} selected={selected === player.number} coachMode={coachMode} onSelect={onSelect} onMove={(x,y)=>onMove(player.number,x,y)} />)}
    </div>
  </div>
}

function LoginModal({ lang, onClose, onSuccess }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)
  const t = labels[lang]
  async function submit(e) {
    e.preventDefault(); setError(false)
    try {
      const r = await fetch('/api/coach-login', { method:'POST', headers:{'content-type':'application/json'}, body:JSON.stringify({password}) })
      if (!r.ok) throw new Error('login')
      const body = await r.json(); onSuccess(body.token)
    } catch { setError(true) }
  }
  return <div className="modal-backdrop" onMouseDown={onClose}><form className="modal" onMouseDown={e=>e.stopPropagation()} onSubmit={submit}>
    <div className="modal-icon">⚽</div><h2>{t.coach}</h2><label>{t.password}</label><input autoFocus type="password" value={password} onChange={e=>setPassword(e.target.value)} />
    {error && <div className="error">{t.loginError}</div>}
    <div className="modal-actions"><button type="button" className="ghost" onClick={onClose}>{t.cancel}</button><button type="submit" className="primary">{t.unlock}</button></div>
  </form></div>
}

export default function App() {
  const [lang, setLang] = useState('no')
  const [formation, setFormation] = useState('7v7')
  const [strategy, setStrategy] = useState('standard')
  const [selected, setSelected] = useState(null)
  const [data, setData] = useState(() => clone(seedData))
  const [coachMode, setCoachMode] = useState(false)
  const [loginOpen, setLoginOpen] = useState(false)
  const [token, setToken] = useState(() => sessionStorage.getItem('fornebu-coach-token') || '')
  const [saveState, setSaveState] = useState('')
  const [sourceState, setSourceState] = useState('fallback')
  const t = labels[lang]

  useEffect(() => {
    let active = true
    fetch('/api/tactics').then(r => r.ok ? r.json() : Promise.reject()).then(remote => {
      if (active && remote?.['7v7'] && remote?.['9v9']) { setData(remote); setSourceState('live') }
    }).catch(()=>{})
    return () => { active = false }
  }, [])

  useEffect(() => { setSelected(null) }, [formation])
  const current = data[formation]
  const player = useMemo(() => current.players.find(p=>p.number===selected), [current, selected])

  function updatePlayerPosition(number, x, y) {
    setData(prev => { const next=clone(prev); const p=next[formation].players.find(p=>p.number===number); p.x=+x.toFixed(1); p.y=+y.toFixed(1); return next })
  }
  function updateGlobal(sectionKey, value) {
    setData(prev => { const next=clone(prev); const s=next[formation].global[strategy].sections.find(s=>s.key===sectionKey); s.text[lang]=value; return next })
  }
  function updatePlayer(sectionKey, value) {
    setData(prev => { const next=clone(prev); const p=next[formation].players.find(p=>p.number===selected); p.sections.find(s=>s.key===sectionKey).text[lang]=value; return next })
  }
  async function save() {
    setSaveState('saving')
    try {
      const r = await fetch('/api/tactics', { method:'POST', headers:{'content-type':'application/json','authorization':`Bearer ${token}`}, body:JSON.stringify(data) })
      if (!r.ok) throw new Error('save')
      setSaveState('saved'); setTimeout(()=>setSaveState(''), 1800)
    } catch {
      localStorage.setItem('fornebu-coach-draft', JSON.stringify(data))
      setSaveState('saved'); setTimeout(()=>setSaveState(''), 1800)
    }
  }
  function enterCoach() {
    if (token) setCoachMode(true); else setLoginOpen(true)
  }
  function loginSuccess(newToken) { sessionStorage.setItem('fornebu-coach-token', newToken); setToken(newToken); setCoachMode(true); setLoginOpen(false) }
  function resetDraft() { setData(clone(seedData)); localStorage.removeItem('fornebu-coach-draft') }

  return <div className="app-shell">
    <header className="topbar">
      <div className="brand"><div className="brand-mark">F</div><div><h1>{t.title}</h1><span>{t.subtitle}</span></div></div>
      <div className="header-actions">
        <div className="lang-switch"><button className={lang==='no'?'active':''} onClick={()=>setLang('no')}>NO</button><button className={lang==='en'?'active':''} onClick={()=>setLang('en')}>EN</button></div>
        <button className={coachMode?'coach active':'coach'} onClick={()=>coachMode?setCoachMode(false):enterCoach()}>{coachMode?t.exitCoach:t.coach}</button>
      </div>
    </header>

    <main>
      <section className="board-card">
        <div className="board-toolbar">
          <div><span className="eyebrow">{t.formation}</span><div className="segmented"><button className={formation==='7v7'?'active':''} onClick={()=>setFormation('7v7')}>7v7</button><button className={formation==='9v9'?'active':''} onClick={()=>setFormation('9v9')}>9v9</button></div></div>
          <div className="toolbar-note">{coachMode ? t.editHint : t.unselect}</div>
          <div className="data-actions"><a href={SHEET_URL} target="_blank" rel="noreferrer">{t.sheet}</a><span className={`status ${sourceState}`}>{sourceState==='live'?'LIVE':t.sheetStatus}</span></div>
        </div>
        <Pitch players={current.players} selected={selected} coachMode={coachMode} onSelect={n=>setSelected(selected===n?null:n)} onMove={updatePlayerPosition} lang={lang}/>
      </section>

      <section className="plans-grid">
        <article className="plan-panel global-panel">
          <div className="panel-head"><div><span className="eyebrow">{t.global}</span><h2>{current.global[strategy].title[lang]}</h2></div><div className="segmented small"><button className={strategy==='standard'?'active':''} onClick={()=>setStrategy('standard')}>{t.standard}</button><button className={strategy==='alternative'?'active':''} onClick={()=>setStrategy('alternative')}>{t.alternative}</button></div></div>
          <div className="sections-grid">{current.global[strategy].sections.map(s=><SectionCard key={s.key} section={s} lang={lang} editing={coachMode} onChange={v=>updateGlobal(s.key,v)}/>)}</div>
        </article>

        <article className={`plan-panel player-panel ${player?'has-player':''}`}>
          <div className="panel-head"><div><span className="eyebrow">{t.player}</span>{player?<><h2>#{player.number} · {player.role[lang]}</h2><div className="player-meta"><span>{t.number} {player.number}</span><span>{t.position}: {player.role[lang]}</span></div></>:<h2>{t.select}</h2>}</div></div>
          {player ? <div className="sections-grid">{player.sections.map(s=><SectionCard key={s.key} section={s} lang={lang} editing={coachMode} onChange={v=>updatePlayer(s.key,v)}/>)}</div> : <div className="empty-player"><div className="mini-pitch">7 · 9</div><p>{t.select}</p></div>}
        </article>
      </section>

      {coachMode && <section className="coach-footer"><div><strong>{t.coach}</strong><span>{t.editHint}</span></div><div className="coach-footer-actions"><button className="ghost" onClick={resetDraft}>{t.reset}</button><a className="ghost link-button" href={SHEET_URL} target="_blank" rel="noreferrer">{t.sheet}</a><button className="primary" onClick={save}>{saveState==='saved'?'✓ '+t.saved:t.save}</button></div></section>}
      {sourceState==='fallback' && <div className="source-note"><strong>{t.source}:</strong> {t.liveFallback}</div>}
    </main>
    {loginOpen && <LoginModal lang={lang} onClose={()=>setLoginOpen(false)} onSuccess={loginSuccess}/>} 
  </div>
}
