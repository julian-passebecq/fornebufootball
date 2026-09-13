import { useEffect, useMemo, useRef, useState } from 'react'
import { seedData } from './seedData'
import './styles.css'

const labels = {
  no: {
    title: 'Fornebu trenerbrett', subtitle: 'Kampplan og spillerroller', teamPlan: 'Lagplan', playerPlan: 'Spillerplan', standard: 'Standard', alternative: 'Plan B', coach: 'Trenermodus', exitCoach: 'Avslutt trenermodus', password: 'Trenerpassord', unlock: 'Lås opp', cancel: 'Avbryt', editHint: 'Dra spillerne på banen. Velg en spiller for å redigere rollen.', save: 'Publiser endringer', saving: 'Publiserer…', saved: 'Publisert', saveError: 'Kunne ikke publisere – prøv igjen', selectPlayer: 'Klikk en spiller for individuell plan', backTeam: 'Tilbake til lagplan', position: 'Posisjon', attack: 'Angrep', defend: 'Forsvar', transition: 'Overgang', keyCue: 'Nøkkelpunkt', formation: 'Formasjon', loginError: 'Feil passord eller trener-serveren er ikke konfigurert.'
  },
  en: {
    title: 'Fornebu Coach Board', subtitle: 'Match plan and player roles', teamPlan: 'Team plan', playerPlan: 'Player plan', standard: 'Standard', alternative: 'Plan B', coach: 'Coach mode', exitCoach: 'Exit coach mode', password: 'Coach password', unlock: 'Unlock', cancel: 'Cancel', editHint: 'Drag players on the pitch. Select a player to edit the role.', save: 'Publish changes', saving: 'Publishing…', saved: 'Published', saveError: 'Could not publish – try again', selectPlayer: 'Click a player for the individual plan', backTeam: 'Back to team plan', position: 'Position', attack: 'Attack', defend: 'Defend', transition: 'Transition', keyCue: 'Key cue', formation: 'Formation', loginError: 'Wrong password or the coach server is not configured.'
  }
}

function clone(value) { return JSON.parse(JSON.stringify(value)) }

function migrateRemote(remote) {
  const next = clone(remote)
  if (next.version === 2) return next
  for (const key of ['7v7', '9v9']) {
    const reference = seedData[key]
    if (!next[key] || !reference) continue
    next[key].shape = reference.shape
    for (const referencePlayer of reference.players) {
      const target = next[key].players?.find(player => player.number === referencePlayer.number)
      if (!target) continue
      target.x = referencePlayer.x
      target.y = referencePlayer.y
      target.role = clone(referencePlayer.role)
    }
  }
  next.version = 2
  return next
}

function PitchIcon({ count }) {
  return <span className="format-icon" aria-hidden="true">
    <svg viewBox="0 0 34 22"><rect x="1" y="1" width="32" height="20" rx="2"/><path d="M17 1v20M12.5 11a4.5 4.5 0 1 0 9 0 4.5 4.5 0 1 0-9 0Z"/></svg>
    <b>{count}</b>
  </span>
}

function AttackIcon() {
  return <span className="topic-icon attack-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M4 17 15.5 5.5M10 5.5h5.5V11"/><path d="M4 7v10h10"/></svg></span>
}

function DefendIcon() {
  return <span className="topic-icon defend-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 3 19 6v5c0 4.7-2.8 8-7 10-4.2-2-7-5.3-7-10V6l7-3Z"/><path d="m8.8 12 2.1 2.1 4.4-4.5"/></svg></span>
}

function TransitionIcon() {
  return <span className="topic-icon transition-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M5 8h12M14 5l3 3-3 3M19 16H7M10 13l-3 3 3 3"/></svg></span>
}

function CueIcon() {
  return <span className="topic-icon cue-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M9 18h6M10 21h4"/><path d="M8.5 15.5c-1.5-1-2.5-2.8-2.5-4.8a6 6 0 1 1 12 0c0 2-1 3.8-2.5 4.8-.7.5-1 1-1.1 1.5H9.6c-.1-.5-.4-1-1.1-1.5Z"/></svg></span>
}

function Field({ value, editing, onChange, rows = 3 }) {
  if (!editing) return <p>{value}</p>
  return <textarea value={value} onChange={e => onChange(e.target.value)} rows={rows} />
}

function PlayerMarker({ player, selected, coachMode, onSelect, onMove }) {
  const drag = useRef(null)
  function pointerDown(e) {
    if (!coachMode) return
    e.preventDefault()
    const pitch = e.currentTarget.parentElement.getBoundingClientRect()
    drag.current = { pitch, moved: false }
    e.currentTarget.setPointerCapture(e.pointerId)
  }
  function pointerMove(e) {
    if (!coachMode || !drag.current) return
    const { pitch } = drag.current
    drag.current.moved = true
    const x = Math.max(4, Math.min(96, ((e.clientX - pitch.left) / pitch.width) * 100))
    const y = Math.max(7, Math.min(93, ((e.clientY - pitch.top) / pitch.height) * 100))
    onMove(x, y)
  }
  function pointerUp(e) {
    if (!coachMode || !drag.current) return
    const moved = drag.current.moved
    drag.current = null
    e.currentTarget.releasePointerCapture?.(e.pointerId)
    if (!moved) onSelect(player.number)
  }
  return <button
    className={`player-marker ${selected ? 'selected' : ''} ${coachMode ? 'draggable' : ''}`}
    style={{ left: `${player.x}%`, top: `${player.y}%` }}
    onClick={() => !coachMode && onSelect(player.number)}
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
      {players.map(player => <PlayerMarker key={player.number} player={player} selected={selected === player.number} coachMode={coachMode} onSelect={onSelect} onMove={(x, y) => onMove(player.number, x, y)} />)}
    </div>
  </div>
}

function GlobalSection({ section, lang, editing, onChange }) {
  const icon = section.key === 'defend' ? <DefendIcon/> : section.key === 'transition' ? <TransitionIcon/> : <AttackIcon/>
  return <div className="strategy-block">
    <div className="strategy-label">{icon}<span>{section.label[lang]}</span></div>
    <Field value={section.text[lang]} editing={editing} onChange={onChange} rows={3}/>
  </div>
}

function PlayerSection({ icon, title, sections, lang, editing, onChange }) {
  return <div className="player-topic">
    <div className="player-topic-head">{icon}<span>{title}</span></div>
    {sections.map(section => <div className="player-subsection" key={section.key}>
      <div className="player-sub-label">{section.label[lang]}</div>
      <Field value={section.text[lang]} editing={editing} onChange={value => onChange(section.key, value)} rows={3}/>
    </div>)}
  </div>
}

function LoginModal({ lang, onClose, onSuccess }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)
  const t = labels[lang]
  async function submit(e) {
    e.preventDefault(); setError(false)
    try {
      const response = await fetch('/api/coach-login', { method: 'POST', headers: {'content-type': 'application/json'}, body: JSON.stringify({ password }) })
      if (!response.ok) throw new Error('login')
      const body = await response.json(); onSuccess(body.token)
    } catch { setError(true) }
  }
  return <div className="modal-backdrop" onMouseDown={onClose}><form className="modal" onMouseDown={e => e.stopPropagation()} onSubmit={submit}>
    <div className="modal-ball">⚽</div><h2>{t.coach}</h2><label>{t.password}</label><input autoFocus type="password" value={password} onChange={e => setPassword(e.target.value)} />
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
  const t = labels[lang]

  useEffect(() => {
    let active = true
    fetch('/api/tactics').then(response => response.ok ? response.json() : Promise.reject()).then(remote => {
      if (active && remote?.['7v7'] && remote?.['9v9']) setData(migrateRemote(remote))
    }).catch(() => {})
    return () => { active = false }
  }, [])

  useEffect(() => { setSelected(null) }, [formation])
  const current = data[formation]
  const player = useMemo(() => current.players.find(item => item.number === selected), [current, selected])

  function updatePlayerPosition(number, x, y) {
    setData(previous => {
      const next = clone(previous)
      const target = next[formation].players.find(item => item.number === number)
      target.x = +x.toFixed(1); target.y = +y.toFixed(1)
      return next
    })
  }

  function updateGlobal(sectionKey, value) {
    setData(previous => {
      const next = clone(previous)
      next[formation].global[strategy].sections.find(section => section.key === sectionKey).text[lang] = value
      return next
    })
  }

  function updatePlayer(sectionKey, value) {
    setData(previous => {
      const next = clone(previous)
      const target = next[formation].players.find(item => item.number === selected)
      target.sections.find(section => section.key === sectionKey).text[lang] = value
      return next
    })
  }

  async function save() {
    setSaveState('saving')
    try {
      const response = await fetch('/api/tactics', { method: 'POST', headers: {'content-type': 'application/json', 'authorization': `Bearer ${token}`}, body: JSON.stringify(data) })
      if (!response.ok) throw new Error('save')
      setSaveState('saved'); setTimeout(() => setSaveState(''), 1800)
    } catch {
      setSaveState('error')
    }
  }

  function enterCoach() {
    if (token) setCoachMode(true)
    else setLoginOpen(true)
  }

  function loginSuccess(newToken) {
    sessionStorage.setItem('fornebu-coach-token', newToken)
    setToken(newToken); setCoachMode(true); setLoginOpen(false)
  }

  const formationShape = current.shape || (formation === '7v7' ? '2-3-1' : '3-2-3')
  const possession = player?.sections.find(section => section.key === 'possession')
  const defence = player?.sections.find(section => section.key === 'defence')
  const transition = player?.sections.find(section => section.key === 'transition')
  const cue = player?.sections.find(section => section.key === 'cue')

  return <div className="app-shell">
    <header className="topbar">
      <div className="brand"><div className="brand-mark">F</div><div><h1>{t.title}</h1><span>{t.subtitle}</span></div></div>

      <div className="formation-ribbon" aria-label={t.formation}>
        <button className={formation === '7v7' ? 'active' : ''} onClick={() => setFormation('7v7')}>
          <PitchIcon count="7"/><span><strong>7v7</strong><small>2-3-1</small></span>
        </button>
        <button className={formation === '9v9' ? 'active' : ''} onClick={() => setFormation('9v9')}>
          <PitchIcon count="9"/><span><strong>9v9</strong><small>3-2-3</small></span>
        </button>
      </div>

      <div className="header-actions">
        <div className="lang-switch"><button className={lang === 'no' ? 'active' : ''} onClick={() => setLang('no')}>NO</button><button className={lang === 'en' ? 'active' : ''} onClick={() => setLang('en')}>EN</button></div>
        <button className={coachMode ? 'coach active' : 'coach'} onClick={() => coachMode ? setCoachMode(false) : enterCoach()}>{coachMode ? t.exitCoach : t.coach}</button>
      </div>
    </header>

    <main>
      <div className="workspace-grid">
        <section className="board-card">
          <div className="board-heading">
            <div><span className="eyebrow">{t.formation}</span><h2>{formation} · {formationShape}</h2></div>
            <div className="board-hint">{coachMode ? t.editHint : t.selectPlayer}</div>
          </div>
          <Pitch players={current.players} selected={selected} coachMode={coachMode} onSelect={number => setSelected(selected === number ? null : number)} onMove={updatePlayerPosition} lang={lang}/>
        </section>

        <aside className="strategy-sidebar">
          {!player ? <>
            <div className="sidebar-head">
              <div><span className="eyebrow">{t.teamPlan}</span><h2>{current.global[strategy].title[lang]}</h2></div>
              <div className="strategy-toggle"><button className={strategy === 'standard' ? 'active' : ''} onClick={() => setStrategy('standard')}>{t.standard}</button><button className={strategy === 'alternative' ? 'active' : ''} onClick={() => setStrategy('alternative')}>{t.alternative}</button></div>
            </div>
            <div className="global-sections">{current.global[strategy].sections.map(section => <GlobalSection key={section.key} section={section} lang={lang} editing={coachMode} onChange={value => updateGlobal(section.key, value)}/>)}</div>
          </> : <>
            <div className="player-sidebar-head">
              <div className="player-identity"><div className="sidebar-jersey"><span>{player.number}</span></div><div><span className="eyebrow">{t.playerPlan}</span><h2>#{player.number}</h2><div className="role-line"><span>{t.position}</span><strong>{player.role[lang]}</strong></div></div></div>
              <button className="close-player" onClick={() => setSelected(null)} aria-label={t.backTeam}>×</button>
            </div>
            <div className="player-topics">
              <PlayerSection icon={<AttackIcon/>} title={t.attack} sections={[possession].filter(Boolean)} lang={lang} editing={coachMode} onChange={updatePlayer}/>
              <PlayerSection icon={<DefendIcon/>} title={t.defend} sections={[defence].filter(Boolean)} lang={lang} editing={coachMode} onChange={updatePlayer}/>
              <PlayerSection icon={<TransitionIcon/>} title={t.transition} sections={[transition].filter(Boolean)} lang={lang} editing={coachMode} onChange={updatePlayer}/>
              {cue && <PlayerSection icon={<CueIcon/>} title={t.keyCue} sections={[cue]} lang={lang} editing={coachMode} onChange={updatePlayer}/>}              
            </div>
            <button className="back-team-button" onClick={() => setSelected(null)}>{t.backTeam}</button>
          </>}
        </aside>
      </div>

      {coachMode && <section className="coach-footer">
        <div><strong>{t.coach}</strong><span>{t.editHint}</span>{saveState === 'error' && <span className="save-error">{t.saveError}</span>}</div>
        <button className="primary publish-button" onClick={save} disabled={saveState === 'saving'}>{saveState === 'saving' ? t.saving : saveState === 'saved' ? `✓ ${t.saved}` : t.save}</button>
      </section>}
    </main>

    {loginOpen && <LoginModal lang={lang} onClose={() => setLoginOpen(false)} onSuccess={loginSuccess}/>} 
  </div>
}
