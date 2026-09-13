import { useEffect, useMemo, useRef, useState } from 'react'
import { seedData } from './seedData'
import {
  clone,
  DEFAULT_VISIBILITY,
  FORMATION_KEYS,
  migrateRemote,
  ROLE_COLORS,
  STRATEGY_KEYS,
} from './tacticsModel'
import './styles.css'
import './v5.css'
import './v6.css'
import './v8.css'
import './v9.css'
import './v10.css'

const CLUB_URL = 'https://fornebufk.spond.club/'
const CLUB_LOGO_URL = 'https://images.fotball.no/clublogos/3160.png'
const PLAYER_SKY = ROLE_COLORS.goalkeeper

const labels = {
  en: {
    title: 'Fornebu Coach Board', subtitle: 'Match plan and player roles', club: 'Fornebu FK', teamPlan: 'Team plan', playerPlan: 'Player plan', standard: 'Standard', alternative: 'Additional plan', password: 'Coach password', unlock: 'Sign in', editHint: 'Drag players and edit short points. 7v7 and 9v9 are saved separately.', save: 'Publish changes', saving: 'Publishing…', saved: 'Published', saveError: 'Could not publish – try again', selectPlayer: 'Click a player for the individual plan', backTeam: 'Back to team plan', position: 'Position', attack: 'Attack', defend: 'Defend', transition: 'Transition', keyCue: 'Key cue', formation: 'Formation', loginError: 'Wrong password or the coach server is not configured.', publicPlans: 'Show to players', shown: 'Shown', hidden: 'Hidden', visibilityHint: 'Choose which plans players can see. At least one plan must remain visible.', nextGame: 'Next game', versus: 'vs', noGame: 'Game not set', coachWorkspace: 'Coach workspace', publicBoard: 'Player board', signOut: 'Sign out', formatSetup: 'Format & next game', opponent: 'Opponent', date: 'Date', time: 'Time', editPoints: 'Use one short point per line.', editingPlan: 'Editing', planPositions: 'Positions and text are separate for this plan.', compactRule: 'Red team rule', inRule: 'IN principle', outRule: 'OUT principle', privateArea: 'Private editing area for the coach.'
  },
  no: {
    title: 'Fornebu trenerbrett', subtitle: 'Kampplan og spillerroller', club: 'Fornebu FK', teamPlan: 'Lagplan', playerPlan: 'Spillerplan', standard: 'Standard', alternative: 'Tilleggsplan', password: 'Trenerpassord', unlock: 'Logg inn', editHint: 'Dra spillere og rediger korte punkter. 7v7 og 9v9 lagres separat.', save: 'Publiser endringer', saving: 'Publiserer…', saved: 'Publisert', saveError: 'Kunne ikke publisere – prøv igjen', selectPlayer: 'Klikk en spiller for individuell plan', backTeam: 'Tilbake til lagplan', position: 'Posisjon', attack: 'Angrep', defend: 'Forsvar', transition: 'Overgang', keyCue: 'Nøkkelpunkt', formation: 'Formasjon', loginError: 'Feil passord eller trener-serveren er ikke konfigurert.', publicPlans: 'Vis for spillerne', shown: 'Vises', hidden: 'Skjult', visibilityHint: 'Velg hvilke planer spillerne skal se. Minst én plan må være synlig.', nextGame: 'Neste kamp', versus: 'mot', noGame: 'Kamp ikke satt', coachWorkspace: 'Trenerrom', publicBoard: 'Spillerside', signOut: 'Logg ut', formatSetup: 'Spillform og neste kamp', opponent: 'Motstander', date: 'Dato', time: 'Tid', editPoints: 'Ett kort punkt per linje.', editingPlan: 'Redigerer', planPositions: 'Posisjoner og tekst er egne for denne planen.', compactRule: 'Rød lagregel', inRule: 'IN-prinsipp', outRule: 'OUT-prinsipp', privateArea: 'Privat redigeringsside for treneren.'
  },
  fr: {
    title: 'Tableau Coach Fornebu', subtitle: 'Plan de match et rôles des joueurs', club: 'Fornebu FK', teamPlan: "Plan d'équipe", playerPlan: 'Plan joueur', standard: 'Standard', alternative: 'Plan additionnel', password: 'Mot de passe coach', unlock: 'Connexion', editHint: 'Déplacez les joueurs et modifiez les consignes courtes. Le 7v7 et le 9v9 sont enregistrés séparément.', save: 'Publier les modifications', saving: 'Publication…', saved: 'Publié', saveError: 'Publication impossible – réessayez', selectPlayer: 'Cliquez sur un joueur pour voir son plan individuel', backTeam: "Retour au plan d'équipe", position: 'Position', attack: 'Attaque', defend: 'Défense', transition: 'Transition', keyCue: 'Point clé', formation: 'Formation', loginError: 'Mot de passe incorrect ou serveur coach non configuré.', publicPlans: 'Afficher aux joueurs', shown: 'Visible', hidden: 'Masqué', visibilityHint: 'Choisissez les plans visibles par les joueurs. Au moins un plan doit rester visible.', nextGame: 'Prochain match', versus: 'vs', noGame: 'Match non défini', coachWorkspace: 'Espace coach', publicBoard: 'Vue joueurs', signOut: 'Déconnexion', formatSetup: 'Format et prochain match', opponent: 'Adversaire', date: 'Date', time: 'Heure', editPoints: 'Une consigne courte par ligne.', editingPlan: 'Modification', planPositions: 'Les positions et les textes sont indépendants pour ce plan.', compactRule: "Règle d'équipe en rouge", inRule: 'Principe IN', outRule: 'Principe OUT', privateArea: 'Espace privé de modification pour le coach.'
  },
}

function localized(value, lang) {
  if (value == null) return ''
  if (typeof value === 'string') return value
  return value[lang] ?? value.en ?? value.fr ?? value.no ?? ''
}

function AppMark({ className = '' }) {
  return <img className={className} src={CLUB_LOGO_URL} alt="" aria-hidden="true" onError={event => { event.currentTarget.onerror = null; event.currentTarget.src = '/fornebu-mark.svg' }} />
}

function FormatIcon({ format }) {
  return <span className="format-icon" aria-hidden="true"><span>{format === '7v7' ? '7' : '9'}</span></span>
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
  return String(value).replace(/([.!?])\s+/g, '$1\n').replace(/;\s+/g, ';\n').split(/\n+/).map(point => point.trim()).filter(Boolean)
}

function Field({ value, editing, onChange, rows = 3, hint }) {
  const safeValue = value ?? ''
  if (!editing) {
    const points = instructionPoints(safeValue)
    return <ul className="instruction-list">{points.map((point, index) => <li key={`${index}-${point.slice(0, 12)}`}>{point}</li>)}</ul>
  }
  return <div className="editable-field"><textarea value={safeValue} onChange={event => onChange(event.target.value)} rows={rows}/>{hint && <small>{hint}</small>}</div>
}

function PlayerMarker({ player, selected, coachMode, onSelect, onMove }) {
  const drag = useRef(null)

  function pointerDown(event) {
    if (!coachMode) return
    event.preventDefault()
    drag.current = { pitch: event.currentTarget.parentElement.getBoundingClientRect(), moved: false }
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  function pointerMove(event) {
    if (!coachMode || !drag.current) return
    const { pitch } = drag.current
    drag.current.moved = true
    const x = Math.max(4, Math.min(96, ((event.clientX - pitch.left) / pitch.width) * 100))
    const y = Math.max(7, Math.min(93, ((event.clientY - pitch.top) / pitch.height) * 100))
    onMove(x, y)
  }

  function pointerUp(event) {
    if (!coachMode || !drag.current) return
    const moved = drag.current.moved
    drag.current = null
    event.currentTarget.releasePointerCapture?.(event.pointerId)
    if (!moved) onSelect(player.number)
  }

  return <button
    className={`player-marker v6-player-marker ${selected ? 'selected' : ''} ${coachMode ? 'draggable' : ''}`}
    style={{ left: `${player.x}%`, top: `${player.y}%`, '--player-color': PLAYER_SKY }}
    onClick={() => !coachMode && onSelect(player.number)}
    onPointerDown={pointerDown}
    onPointerMove={pointerMove}
    onPointerUp={pointerUp}
    aria-label={`Player ${player.number}`}
  ><span className="jersey"><span>{player.number}</span></span></button>
}

function Pitch({ players, selected, coachMode, onSelect, onMove, lang }) {
  const pitchLabel = lang === 'no' ? 'Fotballbane' : lang === 'fr' ? 'Terrain de football' : 'Football pitch'
  return <div className="pitch-wrap"><div className="pitch" aria-label={pitchLabel}>
    <div className="half-line"/><div className="center-circle"/><div className="center-dot"/>
    <div className="box box-left"/><div className="six six-left"/><div className="arc arc-left"/>
    <div className="box box-right"/><div className="six six-right"/><div className="arc arc-right"/>
    <div className="goal goal-left"/><div className="goal goal-right"/>
    {players.map(player => <PlayerMarker key={player.number} player={player} selected={selected === player.number} coachMode={coachMode} onSelect={onSelect} onMove={(x, y) => onMove(player.number, x, y)}/>)}
  </div></div>
}

function GlobalSection({ section, lang, editing, onChange, hint }) {
  const icon = section.key === 'defend' ? <DefendIcon/> : section.key === 'transition' ? <TransitionIcon/> : <AttackIcon/>
  return <div className="strategy-block"><div className="strategy-label">{icon}<span>{localized(section.label, lang)}</span></div><Field value={localized(section.text, lang)} editing={editing} onChange={onChange} rows={3} hint={hint}/></div>
}

function PlayerSection({ icon, title, sections, lang, editing, onChange, hint }) {
  return <div className="player-topic v7-player-topic"><div className="player-topic-head">{icon}<span>{title}</span></div>{sections.map(section => <div className="player-subsection" key={section.key}><Field value={localized(section.text, lang)} editing={editing} onChange={value => onChange(section.key, value)} rows={3} hint={hint}/></div>)}</div>
}

function TeamPrinciples({ principles, lang, coachMode, onChange, t }) {
  const compact = localized(principles?.compact, lang)
  const inText = localized(principles?.in, lang)
  const outText = localized(principles?.out, lang)

  if (coachMode) {
    return <section className="principles-panel coach-principles">
      <label className="compact-rule-editor"><span>{t.compactRule}</span><textarea rows="2" value={compact} onChange={event => onChange('compact', event.target.value)}/></label>
      <div className="in-out-row coach-in-out-row">
        <label><span>IN</span><small>{t.inRule}</small><input value={inText} onChange={event => onChange('in', event.target.value)}/></label>
        <label><span>OUT</span><small>{t.outRule}</small><input value={outText} onChange={event => onChange('out', event.target.value)}/></label>
      </div>
    </section>
  }

  return <section className="principles-panel public-principles">
    <div className="compact-rule">{compact}</div>
    <div className="in-out-row">
      <div className="principle-in"><span>IN</span><strong>{inText}</strong></div>
      <div className="principle-out"><span>OUT</span><strong>{outText}</strong></div>
    </div>
  </section>
}

function CoachGate({ lang, onSuccess, onLanguage }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)
  const t = labels[lang]

  async function submit(event) {
    event.preventDefault()
    setError(false)
    try {
      const response = await fetch('/api/coach-login', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ password }) })
      if (!response.ok) throw new Error('login')
      const body = await response.json()
      onSuccess(body.token)
    } catch {
      setError(true)
    }
  }

  return <div className="coach-gate-page">
    <div className="gate-language"><button className={lang === 'en' ? 'active' : ''} onClick={() => onLanguage('en')}>EN</button><button className={lang === 'fr' ? 'active' : ''} onClick={() => onLanguage('fr')}>FR</button><button className={lang === 'no' ? 'active' : ''} onClick={() => onLanguage('no')}>NO</button></div>
    <form className="coach-gate" onSubmit={submit}><AppMark className="gate-mark"/><span className="eyebrow">{t.coachWorkspace}</span><h1>{t.title}</h1><p>{t.privateArea}</p><label>{t.password}</label><input autoFocus type="password" value={password} onChange={event => setPassword(event.target.value)}/>{error && <div className="error">{t.loginError}</div>}<button type="submit" className="primary gate-button">{t.unlock}</button><a href="/" className="gate-public-link">{t.publicBoard}</a></form>
  </div>
}

function formatGameDate(dateString, lang) {
  if (!dateString) return ''
  const value = new Date(`${dateString}T12:00:00`)
  if (Number.isNaN(value.getTime())) return dateString
  const locale = lang === 'no' ? 'nb-NO' : lang === 'fr' ? 'fr-FR' : 'en-GB'
  return new Intl.DateTimeFormat(locale, { weekday: 'short', day: 'numeric', month: 'short' }).format(value)
}

export default function AppV10() {
  const cleanPath = window.location.pathname.replace(/\/+$/, '') || '/'
  const coachRoute = cleanPath === '/coach'
  const [lang, setLang] = useState('en')
  const [strategy, setStrategy] = useState('standard')
  const [selected, setSelected] = useState(null)
  const [formation, setFormation] = useState('9v9')
  const [data, setData] = useState(() => migrateRemote(seedData))
  const [token, setToken] = useState(() => sessionStorage.getItem('fornebu-coach-token') || '')
  const [coachMode, setCoachMode] = useState(() => coachRoute && Boolean(sessionStorage.getItem('fornebu-coach-token')))
  const [saveState, setSaveState] = useState('')
  const t = labels[lang]

  useEffect(() => {
    let active = true
    fetch('/api/tactics').then(response => response.ok ? response.json() : Promise.reject()).then(remote => { if (active && remote?.['7v7'] && remote?.['9v9']) setData(migrateRemote(remote)) }).catch(() => {})
    return () => { active = false }
  }, [])

  const profile = data.formats?.[formation]
  const formationTemplate = data[formation]
  const formationShape = formationTemplate?.shape || (formation === '7v7' ? '2-3-1' : '3-2-3')
  const strategyVisibility = profile?.strategyVisibility || DEFAULT_VISIBILITY
  const visibleStrategies = STRATEGY_KEYS.filter(key => strategyVisibility[key])
  const currentPlan = profile?.tactics?.[strategy]
  const players = currentPlan?.players || formationTemplate?.players || []
  const player = useMemo(() => players.find(item => item.number === selected), [players, selected])

  useEffect(() => { setSelected(null) }, [formation])
  useEffect(() => { if (!coachMode && !strategyVisibility[strategy]) setStrategy(visibleStrategies[0] || 'standard') }, [coachMode, formation, strategy, strategyVisibility.standard, strategyVisibility.alternative])

  function chooseFormat(nextFormation) {
    if (!FORMATION_KEYS.includes(nextFormation)) return
    setFormation(nextFormation)
    setSelected(null)
  }

  function updateGameField(field, value) {
    setData(previous => {
      const next = clone(previous)
      next.formats[formation].nextGame = { ...(next.formats[formation].nextGame || {}), [field]: value }
      next.version = 10
      return next
    })
  }

  function updatePlayerPosition(number, x, y) {
    setData(previous => {
      const next = clone(previous)
      const target = next.formats[formation].tactics[strategy].players.find(item => item.number === number)
      target.x = +x.toFixed(1)
      target.y = +y.toFixed(1)
      next.version = 10
      return next
    })
  }

  function updateGlobal(sectionKey, value) {
    setData(previous => {
      const next = clone(previous)
      const section = next.formats[formation].tactics[strategy].global.sections.find(item => item.key === sectionKey)
      section.text = { ...(section.text || {}), [lang]: value }
      next.version = 10
      return next
    })
  }

  function updatePlayer(sectionKey, value) {
    setData(previous => {
      const next = clone(previous)
      const target = next.formats[formation].tactics[strategy].players.find(item => item.number === selected)
      const section = target.sections.find(item => item.key === sectionKey)
      section.text = { ...(section.text || {}), [lang]: value }
      next.version = 10
      return next
    })
  }

  function updatePrinciple(key, value) {
    setData(previous => {
      const next = clone(previous)
      const principles = next.formats[formation].principles || {}
      principles[key] = { ...(principles[key] || {}), [lang]: value }
      next.formats[formation].principles = principles
      next.version = 10
      return next
    })
  }

  function toggleStrategyVisibility(key) {
    setData(previous => {
      const next = clone(previous)
      const visibility = { ...DEFAULT_VISIBILITY, ...(next.formats[formation].strategyVisibility || {}) }
      const visibleCount = STRATEGY_KEYS.filter(strategyKey => visibility[strategyKey]).length
      if (visibility[key] && visibleCount === 1) return previous
      visibility[key] = !visibility[key]
      next.formats[formation].strategyVisibility = visibility
      next.version = 10
      return next
    })
  }

  async function save() {
    setSaveState('saving')
    try {
      const response = await fetch('/api/tactics', { method: 'POST', headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` }, body: JSON.stringify(data) })
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

  if (coachRoute && !coachMode) return <CoachGate lang={lang} onSuccess={loginSuccess} onLanguage={setLang}/>
  if (!profile || !currentPlan) return null

  const possession = player?.sections.find(section => section.key === 'possession')
  const defence = player?.sections.find(section => section.key === 'defence')
  const transition = player?.sections.find(section => section.key === 'transition')
  const cue = player?.sections.find(section => section.key === 'cue')
  const strategyButtons = coachMode ? STRATEGY_KEYS : visibleStrategies
  const game = profile.nextGame || {}
  const gameDate = formatGameDate(game.date, lang)
  const planLabel = strategy === 'standard' ? t.standard : t.alternative

  return <div className={`app-shell v6-shell v9-shell v10-shell ${coachMode ? 'coach-shell' : 'public-shell'}`}>
    <header className="topbar v9-topbar v10-topbar">
      <a className="brand club-brand v9-club-brand" href={CLUB_URL} target="_blank" rel="noreferrer" aria-label="Fornebu FK club website"><AppMark className="brand-mark-image v9-brand-mark"/><div><h1>{t.title}</h1><span><strong>{t.club} ↗</strong> · {coachMode ? t.coachWorkspace : t.subtitle}</span></div></a>

      <nav className="format-selector" aria-label="Game format">
        {FORMATION_KEYS.map(key => <button key={key} className={formation === key ? 'active' : ''} onClick={() => chooseFormat(key)}><FormatIcon format={key}/><span><strong>{key}</strong><small>{key === '7v7' ? '2-3-1' : '3-2-3'}</small></span></button>)}
      </nav>

      <div className="next-game-card-v9"><span>{t.nextGame}</span>{game.date || game.opponent ? <><strong>{gameDate}{game.time ? ` · ${game.time}` : ''}</strong><small>{t.versus} {game.opponent || 'TBD'}</small></> : <strong>{t.noGame}</strong>}</div>

      <div className="header-actions v9-header-actions"><div className="lang-switch v10-lang-switch"><button className={lang === 'en' ? 'active' : ''} onClick={() => setLang('en')}>EN</button><button className={lang === 'fr' ? 'active' : ''} onClick={() => setLang('fr')}>FR</button><button className={lang === 'no' ? 'active' : ''} onClick={() => setLang('no')}>NO</button></div>{coachMode && <><span className="coach-badge">{t.coachWorkspace}</span><a className="header-link" href="/">{t.publicBoard}</a><button className="signout-button" onClick={signOut}>{t.signOut}</button></>}</div>
    </header>

    <main><div className="workspace-grid">
      <section className="board-card v6-board-card v9-board-card v10-board-card">
        <div className="board-heading v9-board-heading"><div className="board-format-pill"><strong>{formation}</strong></div><div className="formation-center-badge"><span>{t.formation}</span><strong>{formationShape}</strong></div><div className="board-heading-right"><span className={`active-plan-pill ${strategy}`}>{planLabel}</span></div></div>
        <Pitch players={players} selected={selected} coachMode={coachMode} onSelect={number => setSelected(selected === number ? null : number)} onMove={updatePlayerPosition} lang={lang}/>
        <TeamPrinciples principles={profile.principles} lang={lang} coachMode={coachMode} onChange={updatePrinciple} t={t}/>
        <div className="pitch-footer-hint">{coachMode ? t.planPositions : t.selectPlayer}</div>
      </section>

      <aside className="strategy-sidebar v6-strategy-sidebar v9-strategy-sidebar">
        <div className="sidebar-brand-row v9-sidebar-brand-row"><strong>{formation} · {formationShape}</strong></div>

        {strategyButtons.length > 1 && <div className="strategy-toggle v5-plan-switch v6-plan-switch">{strategyButtons.map(key => <button key={key} className={strategy === key ? 'active' : ''} onClick={() => { setStrategy(key); setSelected(null) }}>{key === 'standard' ? t.standard : t.alternative}</button>)}</div>}

        {coachMode && <section className="coach-team-editor v9-coach-format-editor"><div className="editor-title"><span>{t.formatSetup}</span><small>{formation}</small></div><div className="editor-grid"><label className="wide"><span>{t.opponent}</span><input value={game.opponent || ''} onChange={event => updateGameField('opponent', event.target.value)}/></label><label><span>{t.date}</span><input type="date" value={game.date || ''} onChange={event => updateGameField('date', event.target.value)}/></label><label><span>{t.time}</span><input type="time" value={game.time || ''} onChange={event => updateGameField('time', event.target.value)}/></label></div><div className="coach-plan-context"><strong>{t.editingPlan}: {planLabel}</strong><span>{t.planPositions}</span></div></section>}

        {!player ? <><div className="sidebar-head v5-sidebar-head"><div><span className="eyebrow">{t.teamPlan}</span><h2>{localized(currentPlan.global.title, lang)}</h2></div></div>
          {coachMode && <div className="plan-visibility-editor v6-plan-visibility-editor"><div className="visibility-title">{t.publicPlans}</div><div className="visibility-options">{STRATEGY_KEYS.map(key => { const enabled = Boolean(strategyVisibility[key]); const lastVisible = enabled && visibleStrategies.length === 1; return <label key={key} className={`visibility-option ${enabled ? 'enabled' : 'disabled'}`}><input type="checkbox" checked={enabled} disabled={lastVisible} onChange={() => toggleStrategyVisibility(key)}/><span className="visibility-check" aria-hidden="true">{enabled ? '✓' : ''}</span><span className="visibility-name">{key === 'standard' ? t.standard : t.alternative}</span><small>{enabled ? t.shown : t.hidden}</small></label> })}</div><p>{t.visibilityHint}</p></div>}
          <div className="global-sections">{currentPlan.global.sections.map(section => <GlobalSection key={section.key} section={section} lang={lang} editing={coachMode} hint={t.editPoints} onChange={value => updateGlobal(section.key, value)}/>)}</div></> : <>
          <div className="player-sidebar-head v7-player-sidebar-head"><div className="player-identity v7-player-identity"><div className="sidebar-jersey v6-sidebar-jersey" style={{ '--player-color': PLAYER_SKY }}><span>{player.number}</span></div><div className="v7-player-meta"><span className="eyebrow">{t.playerPlan}</span><div className="v7-player-number-row"><h2>#{player.number}</h2><div className="role-line v7-role-line"><span>{t.position}</span><strong>{localized(player.role, lang)}</strong></div></div></div></div></div>
          <div className="player-topics v7-player-topics"><PlayerSection icon={<AttackIcon/>} title={t.attack} sections={[possession].filter(Boolean)} lang={lang} editing={coachMode} hint={t.editPoints} onChange={updatePlayer}/><PlayerSection icon={<DefendIcon/>} title={t.defend} sections={[defence].filter(Boolean)} lang={lang} editing={coachMode} hint={t.editPoints} onChange={updatePlayer}/><PlayerSection icon={<TransitionIcon/>} title={t.transition} sections={[transition].filter(Boolean)} lang={lang} editing={coachMode} hint={t.editPoints} onChange={updatePlayer}/>{cue && <PlayerSection icon={<CueIcon/>} title={t.keyCue} sections={[cue]} lang={lang} editing={coachMode} hint={t.editPoints} onChange={updatePlayer}/>}</div><button className="back-team-button v7-back-team-button" onClick={() => setSelected(null)}>{t.backTeam}</button></>}
      </aside>
    </div>

    {coachMode && <section className="coach-footer v6-coach-footer"><div><strong>{t.coachWorkspace}</strong><span>{t.editHint}</span>{saveState === 'error' && <span className="save-error">{t.saveError}</span>}</div><button className="primary publish-button" onClick={save} disabled={saveState === 'saving'}>{saveState === 'saving' ? t.saving : saveState === 'saved' ? `✓ ${t.saved}` : t.save}</button></section>}
    </main>
  </div>
}
