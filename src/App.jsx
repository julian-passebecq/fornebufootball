import { useEffect, useMemo, useRef, useState } from 'react'
import { seedData } from './seedData'
import './styles.css'

const STRATEGY_KEYS = ['standard', 'alternative']
const DEFAULT_VISIBILITY = { standard: true, alternative: false }
const DEFAULT_TEAMS = [
  { id: 'team1', name: 'Team 1', formation: '9v9', nextGame: { date: '2026-09-19', time: '10:30', opponent: 'Stabæk' } },
  { id: 'team2', name: 'Team 2', formation: '9v9', nextGame: { date: '2026-09-20', time: '13:00', opponent: 'Bærum' } },
  { id: 'team3', name: 'Team 3', formation: '7v7', nextGame: { date: '2026-09-21', time: '17:30', opponent: 'Lyn' } },
]

const labels = {
  no: {
    title: 'Fornebu trenerbrett', subtitle: 'Kampplan og spillerroller', teamPlan: 'Lagplan', playerPlan: 'Spillerplan', standard: 'Standard', alternative: 'Plan B', password: 'Trenerpassord', unlock: 'Logg inn', cancel: 'Avbryt', editHint: 'Dra spillere, rediger korte punkter og publiser når planen er klar.', save: 'Publiser endringer', saving: 'Publiserer…', saved: 'Publisert', saveError: 'Kunne ikke publisere – prøv igjen', selectPlayer: 'Klikk en spiller for individuell plan', backTeam: 'Tilbake til lagplan', position: 'Posisjon', attack: 'Angrep', defend: 'Forsvar', transition: 'Overgang', keyCue: 'Nøkkelpunkt', formation: 'Formasjon', loginError: 'Feil passord eller trener-serveren er ikke konfigurert.', publicPlans: 'Vis for laget', shown: 'Vises', hidden: 'Skjult', visibilityHint: 'Velg planene spillerne skal se. Minst én plan må være synlig.', nextGame: 'Neste kamp', versus: 'mot', noGame: 'Kamp ikke satt', coachWorkspace: 'Trenerrom', publicBoard: 'Spillerside', signOut: 'Logg ut', teamSetup: 'Lag og neste kamp', teamName: 'Lagnavn', gameFormat: 'Spillform', opponent: 'Motstander', date: 'Dato', time: 'Tid', editPoints: 'Ett kort punkt per linje.'
  },
  en: {
    title: 'Fornebu Coach Board', subtitle: 'Match plan and player roles', teamPlan: 'Team plan', playerPlan: 'Player plan', standard: 'Standard', alternative: 'Plan B', password: 'Coach password', unlock: 'Sign in', cancel: 'Cancel', editHint: 'Drag players, edit short points, then publish when the plan is ready.', save: 'Publish changes', saving: 'Publishing…', saved: 'Published', saveError: 'Could not publish – try again', selectPlayer: 'Click a player for the individual plan', backTeam: 'Back to team plan', position: 'Position', attack: 'Attack', defend: 'Defend', transition: 'Transition', keyCue: 'Key cue', formation: 'Formation', loginError: 'Wrong password or the coach server is not configured.', publicPlans: 'Show to players', shown: 'Shown', hidden: 'Hidden', visibilityHint: 'Choose the plans players can see. At least one plan must remain visible.', nextGame: 'Next game', versus: 'vs', noGame: 'Game not set', coachWorkspace: 'Coach workspace', publicBoard: 'Player board', signOut: 'Sign out', teamSetup: 'Team & next game', teamName: 'Team name', gameFormat: 'Game format', opponent: 'Opponent', date: 'Date', time: 'Time', editPoints: 'Use one short point per line.'
  }
}

function clone(value) { return JSON.parse(JSON.stringify(value)) }

function migrateRemote(remote) {
  const next = clone(remote)
  const oldVersion = Number(next.version || 0)
  const needsFormationMigration = oldVersion < 2

  for (const key of ['7v7', '9v9']) {
    const reference = seedData[key]
    if (!next[key] || !reference) continue

    if (needsFormationMigration) {
      next[key].shape = reference.shape
      for (const referencePlayer of reference.players) {
        const target = next[key].players?.find(player => player.number === referencePlayer.number)
        if (!target) continue
        target.x = referencePlayer.x
        target.y = referencePlayer.y
        target.role = clone(referencePlayer.role)
      }
    }

    next[key].strategyVisibility = {
      ...DEFAULT_VISIBILITY,
      ...(next[key].strategyVisibility || {})
    }
  }

  const existingTeams = new Map((next.teams || []).map(team => [team.id, team]))
  next.teams = DEFAULT_TEAMS.map(defaultTeam => {
    const existing = existingTeams.get(defaultTeam.id) || {}
    return {
      ...clone(defaultTeam),
      ...existing,
      nextGame: { ...defaultTeam.nextGame, ...(existing.nextGame || {}) }
    }
  })

  next.version = 4
  return next
}

function AppMark({ className = '' }) {
  return <img className={className} src="/fornebu-mark.svg" alt="" aria-hidden="true" />
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

function instructionPoints(value) {
  if (!value) return []
  const withBreaks = String(value)
    .replace(/([.!?])\s+/g, '$1\n')
    .replace(/;\s+/g, ';\n')
  return withBreaks.split(/\n+/).map(point => point.trim()).filter(Boolean)
}

function Field({ value, editing, onChange, rows = 3, hint }) {
  if (!editing) {
    const points = instructionPoints(value)
    return <ul className="instruction-list">{points.map((point, index) => <li key={`${index}-${point.slice(0, 12)}`}>{point}</li>)}</ul>
  }
  return <div className="editable-field"><textarea value={value} onChange={e => onChange(e.target.value)} rows={rows} />{hint && <small>{hint}</small>}</div>
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

function GlobalSection({ section, lang, editing, onChange, hint }) {
  const icon = section.key === 'defend' ? <DefendIcon/> : section.key === 'transition' ? <TransitionIcon/> : <AttackIcon/>
  return <div className="strategy-block">
    <div className="strategy-label">{icon}<span>{section.label[lang]}</span></div>
    <Field value={section.text[lang]} editing={editing} onChange={onChange} rows={3} hint={hint}/>
  </div>
}

function PlayerSection({ icon, title, sections, lang, editing, onChange, hint }) {
  return <div className="player-topic">
    <div className="player-topic-head">{icon}<span>{title}</span></div>
    {sections.map(section => <div className="player-subsection" key={section.key}>
      <Field value={section.text[lang]} editing={editing} onChange={value => onChange(section.key, value)} rows={3} hint={hint}/>
    </div>)}
  </div>
}

function CoachGate({ lang, onSuccess, onLanguage }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)
  const t = labels[lang]

  async function submit(e) {
    e.preventDefault()
    setError(false)
    try {
      const response = await fetch('/api/coach-login', { method: 'POST', headers: {'content-type': 'application/json'}, body: JSON.stringify({ password }) })
      if (!response.ok) throw new Error('login')
      const body = await response.json()
      onSuccess(body.token)
    } catch {
      setError(true)
    }
  }

  return <div className="coach-gate-page">
    <div className="gate-language"><button className={lang === 'en' ? 'active' : ''} onClick={() => onLanguage('en')}>EN</button><button className={lang === 'no' ? 'active' : ''} onClick={() => onLanguage('no')}>NO</button></div>
    <form className="coach-gate" onSubmit={submit}>
      <AppMark className="gate-mark"/>
      <span className="eyebrow">{t.coachWorkspace}</span>
      <h1>{t.title}</h1>
      <p>{lang === 'en' ? 'Private editing area for the coach.' : 'Privat redigeringsside for treneren.'}</p>
      <label>{t.password}</label>
      <input autoFocus type="password" value={password} onChange={e => setPassword(e.target.value)} />
      {error && <div className="error">{t.loginError}</div>}
      <button type="submit" className="primary gate-button">{t.unlock}</button>
      <a href="/" className="gate-public-link">{t.publicBoard}</a>
    </form>
  </div>
}

function formatGameDate(dateString, lang) {
  if (!dateString) return ''
  const value = new Date(`${dateString}T12:00:00`)
  if (Number.isNaN(value.getTime())) return dateString
  return new Intl.DateTimeFormat(lang === 'no' ? 'nb-NO' : 'en-GB', { weekday: 'short', day: 'numeric', month: 'short' }).format(value)
}

export default function App() {
  const cleanPath = window.location.pathname.replace(/\/+$/, '') || '/'
  const coachRoute = cleanPath === '/coach'
  const [lang, setLang] = useState('en')
  const [strategy, setStrategy] = useState('standard')
  const [selected, setSelected] = useState(null)
  const [selectedTeamId, setSelectedTeamId] = useState('team2')
  const [data, setData] = useState(() => migrateRemote(seedData))
  const [token, setToken] = useState(() => sessionStorage.getItem('fornebu-coach-token') || '')
  const [coachMode, setCoachMode] = useState(() => coachRoute && Boolean(sessionStorage.getItem('fornebu-coach-token')))
  const [saveState, setSaveState] = useState('')
  const t = labels[lang]

  useEffect(() => {
    let active = true
    fetch('/api/tactics').then(response => response.ok ? response.json() : Promise.reject()).then(remote => {
      if (active && remote?.['7v7'] && remote?.['9v9']) setData(migrateRemote(remote))
    }).catch(() => {})
    return () => { active = false }
  }, [])

  const teams = data.teams || DEFAULT_TEAMS
  const selectedTeam = teams.find(team => team.id === selectedTeamId) || teams[0]
  const formation = selectedTeam?.formation === '7v7' ? '7v7' : '9v9'
  const current = data[formation]
  const formationShape = current.shape || (formation === '7v7' ? '2-3-1' : '3-2-3')
  const strategyVisibility = current.strategyVisibility || DEFAULT_VISIBILITY
  const visibleStrategies = STRATEGY_KEYS.filter(key => strategyVisibility[key])
  const player = useMemo(() => current.players.find(item => item.number === selected), [current, selected])

  useEffect(() => { setSelected(null) }, [selectedTeamId, formation])

  useEffect(() => {
    if (!coachMode && !strategyVisibility[strategy]) {
      setStrategy(visibleStrategies[0] || 'standard')
    }
  }, [coachMode, formation, strategy, strategyVisibility.standard, strategyVisibility.alternative])

  function chooseTeam(team) {
    setSelectedTeamId(team.id)
    setSelected(null)
  }

  function updateTeamField(field, value) {
    setData(previous => {
      const next = clone(previous)
      const team = next.teams.find(item => item.id === selectedTeamId)
      team[field] = value
      next.version = 4
      return next
    })
  }

  function updateGameField(field, value) {
    setData(previous => {
      const next = clone(previous)
      const team = next.teams.find(item => item.id === selectedTeamId)
      team.nextGame = { ...(team.nextGame || {}), [field]: value }
      next.version = 4
      return next
    })
  }

  function updatePlayerPosition(number, x, y) {
    setData(previous => {
      const next = clone(previous)
      const target = next[formation].players.find(item => item.number === number)
      target.x = +x.toFixed(1)
      target.y = +y.toFixed(1)
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

  function toggleStrategyVisibility(key) {
    setData(previous => {
      const next = clone(previous)
      const visibility = { ...DEFAULT_VISIBILITY, ...(next[formation].strategyVisibility || {}) }
      const visibleCount = STRATEGY_KEYS.filter(strategyKey => visibility[strategyKey]).length
      if (visibility[key] && visibleCount === 1) return previous
      visibility[key] = !visibility[key]
      next[formation].strategyVisibility = visibility
      next.version = 4
      return next
    })
  }

  async function save() {
    setSaveState('saving')
    try {
      const response = await fetch('/api/tactics', { method: 'POST', headers: {'content-type': 'application/json', 'authorization': `Bearer ${token}`}, body: JSON.stringify(data) })
      if (response.status === 401) {
        sessionStorage.removeItem('fornebu-coach-token')
        setToken('')
        setCoachMode(false)
        setSaveState('error')
        return
      }
      if (!response.ok) throw new Error('save')
      setSaveState('saved')
      setTimeout(() => setSaveState(''), 1800)
    } catch {
      setSaveState('error')
    }
  }

  function loginSuccess(newToken) {
    sessionStorage.setItem('fornebu-coach-token', newToken)
    setToken(newToken)
    setCoachMode(true)
  }

  function signOut() {
    sessionStorage.removeItem('fornebu-coach-token')
    setToken('')
    setCoachMode(false)
  }

  if (coachRoute && !coachMode) {
    return <CoachGate lang={lang} onSuccess={loginSuccess} onLanguage={setLang}/>
  }

  const possession = player?.sections.find(section => section.key === 'possession')
  const defence = player?.sections.find(section => section.key === 'defence')
  const transition = player?.sections.find(section => section.key === 'transition')
  const cue = player?.sections.find(section => section.key === 'cue')
  const strategyButtons = coachMode ? STRATEGY_KEYS : visibleStrategies
  const game = selectedTeam?.nextGame || {}
  const gameDate = formatGameDate(game.date, lang)

  return <div className={`app-shell ${coachMode ? 'coach-shell' : 'public-shell'}`}>
    <header className="topbar">
      <div className="brand"><AppMark className="brand-mark-image"/><div><h1>{t.title}</h1><span>{coachMode ? t.coachWorkspace : t.subtitle}</span></div></div>

      <div className="team-ribbon" aria-label="Team selection">
        <div className="team-tabs">
          {teams.map(team => {
            const teamFormation = team.formation === '7v7' ? '7v7' : '9v9'
            const shape = data[teamFormation]?.shape || (teamFormation === '7v7' ? '2-3-1' : '3-2-3')
            return <button key={team.id} className={selectedTeam?.id === team.id ? 'active' : ''} onClick={() => chooseTeam(team)}>
              <PitchIcon count={teamFormation === '7v7' ? '7' : '9'}/>
              <span><strong>{team.name}</strong><small>{teamFormation} · {shape}</small></span>
            </button>
          })}
        </div>
        <div className="next-game-ribbon">
          <span>{t.nextGame}</span>
          {game.date || game.opponent ? <><strong>{gameDate}{game.time ? ` · ${game.time}` : ''}</strong><small>{t.versus} {game.opponent || 'TBD'}</small></> : <strong>{t.noGame}</strong>}
        </div>
      </div>

      <div className="header-actions">
        {coachMode && <span className="coach-badge">{t.coachWorkspace}</span>}
        <div className="lang-switch"><button className={lang === 'en' ? 'active' : ''} onClick={() => setLang('en')}>EN</button><button className={lang === 'no' ? 'active' : ''} onClick={() => setLang('no')}>NO</button></div>
        {coachMode && <><a className="header-link" href="/">{t.publicBoard}</a><button className="signout-button" onClick={signOut}>{t.signOut}</button></>}
      </div>
    </header>

    <main>
      <div className="workspace-grid">
        <section className="board-card">
          <div className="board-heading">
            <div><span className="eyebrow">{selectedTeam.name}</span><h2>{formation} · {formationShape}</h2></div>
            <div className="board-hint">{coachMode ? t.editHint : t.selectPlayer}</div>
          </div>
          <Pitch players={current.players} selected={selected} coachMode={coachMode} onSelect={number => setSelected(selected === number ? null : number)} onMove={updatePlayerPosition} lang={lang}/>
        </section>

        <aside className="strategy-sidebar">
          <div className="sidebar-brand-row">
            <AppMark className="sidebar-app-mark"/>
            <div><span className="eyebrow">{selectedTeam.name}</span><strong>{formation} · {formationShape}</strong></div>
          </div>

          {coachMode && <section className="coach-team-editor">
            <div className="editor-title"><span>{t.teamSetup}</span><small>{selectedTeam.name}</small></div>
            <div className="editor-grid">
              <label className="wide"><span>{t.teamName}</span><input value={selectedTeam.name} onChange={e => updateTeamField('name', e.target.value)} /></label>
              <label><span>{t.gameFormat}</span><select value={selectedTeam.formation} onChange={e => updateTeamField('formation', e.target.value)}><option value="7v7">7v7</option><option value="9v9">9v9</option></select></label>
              <label><span>{t.opponent}</span><input value={game.opponent || ''} onChange={e => updateGameField('opponent', e.target.value)} /></label>
              <label><span>{t.date}</span><input type="date" value={game.date || ''} onChange={e => updateGameField('date', e.target.value)} /></label>
              <label><span>{t.time}</span><input type="time" value={game.time || ''} onChange={e => updateGameField('time', e.target.value)} /></label>
            </div>
          </section>}

          {!player ? <>
            <div className="sidebar-head">
              <div><span className="eyebrow">{t.teamPlan}</span><h2>{current.global[strategy].title[lang]}</h2></div>
              {strategyButtons.length > 1 && <div className="strategy-toggle">
                {strategyButtons.map(key => <button key={key} className={strategy === key ? 'active' : ''} onClick={() => setStrategy(key)}>{key === 'standard' ? t.standard : t.alternative}</button>)}
              </div>}
            </div>

            {coachMode && <div className="plan-visibility-editor">
              <div className="visibility-title">{t.publicPlans}</div>
              <div className="visibility-options">
                {STRATEGY_KEYS.map(key => {
                  const enabled = Boolean(strategyVisibility[key])
                  const lastVisible = enabled && visibleStrategies.length === 1
                  return <label key={key} className={`visibility-option ${enabled ? 'enabled' : 'disabled'}`}>
                    <input type="checkbox" checked={enabled} disabled={lastVisible} onChange={() => toggleStrategyVisibility(key)} />
                    <span className="visibility-check" aria-hidden="true">{enabled ? '✓' : ''}</span>
                    <span className="visibility-name">{key === 'standard' ? t.standard : t.alternative}</span>
                    <small>{enabled ? t.shown : t.hidden}</small>
                  </label>
                })}
              </div>
              <p>{t.visibilityHint}</p>
            </div>}

            <div className="global-sections">{current.global[strategy].sections.map(section => <GlobalSection key={section.key} section={section} lang={lang} editing={coachMode} hint={t.editPoints} onChange={value => updateGlobal(section.key, value)}/>)}</div>
          </> : <>
            <div className="player-sidebar-head">
              <div className="player-identity"><div className="sidebar-jersey"><span>{player.number}</span></div><div><span className="eyebrow">{t.playerPlan}</span><h2>#{player.number}</h2><div className="role-line"><span>{t.position}</span><strong>{player.role[lang]}</strong></div></div></div>
              <button className="close-player" onClick={() => setSelected(null)} aria-label={t.backTeam}>×</button>
            </div>
            <div className="player-topics">
              <PlayerSection icon={<AttackIcon/>} title={t.attack} sections={[possession].filter(Boolean)} lang={lang} editing={coachMode} hint={t.editPoints} onChange={updatePlayer}/>
              <PlayerSection icon={<DefendIcon/>} title={t.defend} sections={[defence].filter(Boolean)} lang={lang} editing={coachMode} hint={t.editPoints} onChange={updatePlayer}/>
              <PlayerSection icon={<TransitionIcon/>} title={t.transition} sections={[transition].filter(Boolean)} lang={lang} editing={coachMode} hint={t.editPoints} onChange={updatePlayer}/>
              {cue && <PlayerSection icon={<CueIcon/>} title={t.keyCue} sections={[cue]} lang={lang} editing={coachMode} hint={t.editPoints} onChange={updatePlayer}/>}              
            </div>
            <button className="back-team-button" onClick={() => setSelected(null)}>{t.backTeam}</button>
          </>}
        </aside>
      </div>

      {coachMode && <section className="coach-footer">
        <div><strong>{t.coachWorkspace}</strong><span>{t.editHint}</span>{saveState === 'error' && <span className="save-error">{t.saveError}</span>}</div>
        <button className="primary publish-button" onClick={save} disabled={saveState === 'saving'}>{saveState === 'saving' ? t.saving : saveState === 'saved' ? `✓ ${t.saved}` : t.save}</button>
      </section>}
    </main>
  </div>
}
