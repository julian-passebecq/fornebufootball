import React, { useEffect, useRef, useState } from 'react'
import { FORMATION_KEYS, STRATEGY_KEYS } from './tacticsModel.js'
import { COUNTERPRESS_PRESETS, getCounterPressPreset } from './counterPressPresets.js'
import { normalizeBoard, copy, localized, shirtNumber, setShirtNumber, setPlayerText, setTeamText, setPrinciple, movePlayer, choosePreset, visibleTeamSections, toDisplay, fromDisplay, resolveOrientation, validateBoard } from './boardModel.js'
import { UI } from './boardCopy.js'
import './board.css'

const CLUB_URL = 'https://fornebufk.spond.club/'
const LOGO_URL = 'https://images.fotball.no/clublogos/3160.png'
const SESSION_KEY = 'fornebu-coach-token'
const DRAFT_KEY = 'fornebu-coach-draft-v15'
const VIEW_KEY = 'fornebu-pitch-view'
function readStorage(store, key) { try { return window[store].getItem(key) } catch { return null } }
function writeStorage(store, key, value) { try { value == null ? window[store].removeItem(key) : window[store].setItem(key, value) } catch { /* Storage can be disabled in private browsing. */ } }
function initialToken() {
  const token = readStorage('sessionStorage', SESSION_KEY) || ''
  return /^\d+\.[a-f0-9]{64}$/.test(token) && Number(token.split('.')[0]) > Date.now() ? token : ''
}
function Icon({ kind = 'attack' }) {
  const paths = {
    attack: <><path d="M5 18 18 5M10 5h8v8"/><path d="M5 7v11h11"/></>,
    defence: <><path d="m12 3 7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6z"/><path d="m9 12 2 2 4-4"/></>,
    transition: <><path d="M4 8h15l-4-4M20 16H5l4 4M19 8l-4 4M5 16l4-4"/></>,
    cue: <><path d="M9 18h6M10 21h4M9 16c0-3-3-3-3-7a6 6 0 1 1 12 0c0 4-3 4-3 7z"/></>,
    rotate: <><rect x="5" y="3" width="14" height="18" rx="2"/><path d="M5 12h14M10 10h4v4h-4z"/></>,
    undo: <><path d="m8 4-5 5 5 5M3 9h10a7 7 0 0 1 7 7"/></>,
  }
  return <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">{paths[kind] || paths.attack}</svg>
}
function ClubMark() {
  return <img className="club-mark" src={LOGO_URL} alt="Fornebu FK" onError={event => { if (!event.currentTarget.dataset.fallback) { event.currentTarget.dataset.fallback = '1'; event.currentTarget.src = '/fornebu-mark.svg' } }}/>
}
function points(text) { return String(text || '').split(/\n+|(?<=[.!?;])\s+/).map(s => s.trim()).filter(Boolean) }
function Field({ value, editing, readOnly, onChange, label, hint = true }) {
  if (!editing) return <ul className="instruction-list">{points(value).map((text, i) => <li key={i}>{text}</li>)}</ul>
  return <div className="editable-field"><textarea aria-label={label} value={value} readOnly={readOnly} rows={3} onChange={e => { if (!readOnly) onChange(e.target.value) }}/>{hint && !readOnly && <small>Une consigne courte par ligne.</small>}</div>
}
function Jersey({ number }) { return <span className="jersey"><span>{number}</span></span> }

function PlayerMarker({ player, orientation, editable, selected, onSelect, onMove, onDragStart, t }) {
  const drag = useRef(null)
  const pos = toDisplay(player.x, player.y, orientation)
  function down(e) {
    if (!editable || (e.pointerType === 'mouse' && e.button !== 0) || !e.isPrimary) return
    e.preventDefault()
    drag.current = { id:e.pointerId, x:e.clientX, y:e.clientY, moved:false, rect:e.currentTarget.parentElement.getBoundingClientRect() }
    e.currentTarget.setPointerCapture(e.pointerId)
  }
  function move(e) {
    const current = drag.current
    if (!editable || !current || current.id !== e.pointerId) return
    if (!current.moved && Math.hypot(e.clientX-current.x, e.clientY-current.y) < 5) return
    if (!current.moved) { current.moved = true; onDragStart() }
    const x = (e.clientX-current.rect.left)/current.rect.width*100
    const y = (e.clientY-current.rect.top)/current.rect.height*100
    const canonical = fromDisplay(x, y, orientation)
    onMove(canonical.x, canonical.y, false)
  }
  function up(e) {
    const current = drag.current
    if (!current || current.id !== e.pointerId) return
    drag.current = null
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId)
    if (!current.moved) onSelect()
  }
  function key(e) {
    if (!editable || !['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)) return
    e.preventDefault()
    const step = e.shiftKey ? 5 : 2
    const p = fromDisplay(pos.x + (e.key==='ArrowRight'?step:e.key==='ArrowLeft'?-step:0), pos.y + (e.key==='ArrowDown'?step:e.key==='ArrowUp'?-step:0), orientation)
    onMove(p.x, p.y, true)
  }
  return <button type="button" className={`player-marker ${editable?'draggable':''} ${selected?'selected':''}`} data-player-slot={player.number} style={{left:`${pos.x}%`,top:`${pos.y}%`}} aria-label={`${t.player} ${shirtNumber(player)}`} aria-pressed={selected} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={() => { drag.current=null }} onLostPointerCapture={() => { drag.current=null }} onClick={e => { if (!editable || e.detail===0) onSelect() }} onKeyDown={key}><Jersey number={shirtNumber(player)}/></button>
}
function Pitch({ players, orientation, editable, selected, onSelect, onMove, onDragStart, t }) {
  const vertical = orientation === 'vertical'
  return <div className={`pitch ${vertical?'pitch-vertical':'pitch-horizontal'}`} data-orientation={orientation} aria-label={t.pitch}>
    <svg className="field-lines" viewBox={vertical?'0 0 600 1000':'0 0 1000 600'} preserveAspectRatio="none" aria-hidden="true"><g transform={vertical?'translate(0 1000) rotate(-90)':undefined}>
      <rect x="25" y="25" width="950" height="550"/>
      <path d="M500 25v550"/><circle cx="500" cy="300" r="90"/><circle className="field-dot" cx="500" cy="300" r="2"/>
      <path d="M25 155h145v290H25M975 155H830v290h145M25 230h62v140H25M975 230h-62v140h62"/>
      <path d="M170 248a90 90 0 0 1 0 104M830 248a90 90 0 0 0 0 104"/>
      <rect x="10" y="260" width="15" height="80"/><rect x="975" y="260" width="15" height="80"/>
    </g></svg>
    {players.map(player => <PlayerMarker key={player.number} player={player} orientation={orientation} editable={editable} selected={selected===player.number} onSelect={() => onSelect(player.number)} onMove={(x,y,history) => onMove(player.number,x,y,history)} onDragStart={onDragStart} t={t}/>)}
  </div>
}
function NumberEditor({ player, roster, disabled, onNumber, onRole, onNudge, t }) {
  const [draft, setDraft] = useState(String(shirtNumber(player)))
  const [error, setError] = useState('')
  useEffect(() => { setDraft(String(shirtNumber(player))); setError('') }, [player.number, player.shirtNumber])
  const duplicate = roster.find(p => p.number!==player.number && shirtNumber(p)===Number(draft))
  function apply(swap=false) {
    try { onNumber(draft, swap); setError('') } catch(e) { setError(e.message==='number-in-use'?'Ce numéro est déjà utilisé. Échangez les numéros ou choisissez-en un autre.':'Choisissez un numéro de 1 à 99.') }
  }
  return <section className="player-editor" aria-label="Modifier le joueur"><div className="number-editor-row"><label>Numéro du maillot<input inputMode="numeric" pattern="[0-9]*" maxLength={2} value={draft} disabled={disabled} onChange={e=>{setDraft(e.target.value);setError('')}} onKeyDown={e=>{if(e.key==='Enter'){e.preventDefault();apply()}}}/></label><button type="button" className="small-button" disabled={disabled || draft===String(shirtNumber(player))} onClick={()=>apply()}>Appliquer</button>{duplicate && <button type="button" className="small-button" disabled={disabled} onClick={()=>apply(true)}>Échanger #{shirtNumber(player)} / #{shirtNumber(duplicate)}</button>}</div>{error && <p role="alert" className="form-error">{error}</p>}
    <label className="role-editor">Rôle (FR)<input value={localized(player.role,'fr')} disabled={disabled} onChange={e=>onRole(e.target.value)}/></label>
    <div className="position-editor"><span>Déplacer sur le terrain</span><div className="nudge-buttons">{[['left','←'],['up','↑'],['down','↓'],['right','→']].map(([direction,icon])=><button key={direction} type="button" aria-label={`Déplacer ${direction}`} disabled={disabled} onClick={()=>onNudge(direction)}>{icon}</button>)}</div></div>
    <small>Glissez le maillot ou utilisez les flèches. La position ne change que pour la phase affichée.</small>
  </section>
}
function CoachGate({ onLogin, expired }) {
  const [password,setPassword]=useState(''), [busy,setBusy]=useState(false), [error,setError]=useState('')
  async function submit(e) {
    e.preventDefault(); if(busy)return; setBusy(true);setError('')
    try { const res=await fetch('/api/coach-login',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({password})}); if(!res.ok)throw new Error();const body=await res.json();if(typeof body.token!=='string')throw new Error();onLogin(body.token) } catch { setError('Connexion impossible. Vérifiez le mot de passe et réessayez.') } finally {setBusy(false)}
  }
  return <main className="gate-page"><span className="coach-fr gate-fr">FR</span><form className="coach-gate" onSubmit={submit}><ClubMark/><h1>Espace coach</h1><p>Connectez-vous pour modifier les plans en français.</p>{expired && <p role="status">Session expirée. Vos modifications sont conservées dans cette page.</p>}<label htmlFor="coach-password">Mot de passe</label><input id="coach-password" type="password" autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)} required/>{error && <p className="form-error" role="alert">{error}</p>}<button className="validate-button" disabled={busy}>{busy?'Connexion…':'Connexion'}</button></form></main>
}

export default function AppBoard() {
  const coachRoute = window.location.pathname.replace(/\/+$/,'') === '/coach'
  const [token,setToken]=useState(initialToken), [lang,setLang]=useState(coachRoute?'fr':'en')
  const [format,setFormat]=useState('9v9'), [phase,setPhase]=useState('standard'), [selected,setSelected]=useState(null)
  const [data,setData]=useState(()=>normalizeBoard()), dataRef=useRef(data)
  const [savedSnapshot,setSavedSnapshot]=useState(''), [loadState,setLoadState]=useState('loading'), [loadAttempt,setLoadAttempt]=useState(0)
  const [saveState,setSaveState]=useState(''), [notice,setNotice]=useState('')
  const [expired,setExpired]=useState(false), [undoCount,setUndoCount]=useState(0), history=useRef([]), saving=useRef(false)
  const [preference,setPreference]=useState(()=>readStorage('localStorage',VIEW_KEY)||'auto')
  const [viewport,setViewport]=useState({width:window.innerWidth,height:window.innerHeight})
  const boardRef=useRef(null), sidebarRef=useRef(null)
  const coachMode=coachRoute && Boolean(token), ready=loadState==='ready'
  const editable=coachMode && lang==='fr' && ready && saveState!=='saving'
  const dirty=ready && JSON.stringify(data)!==savedSnapshot
  const t=UI[lang], orientation=resolveOrientation(preference,viewport.width,viewport.height)
  const profile=data.formats[format], plan=profile.tactics[phase], players=plan.players
  const player=players.find(p=>p.number===selected)
  const shape=phase==='alternative'?getCounterPressPreset(format,profile.counterPressPreset)?.shape:data[format].shape

  useEffect(()=>{const fn=()=>setViewport({width:window.innerWidth,height:window.innerHeight});window.addEventListener('resize',fn);return()=>window.removeEventListener('resize',fn)},[])
  useEffect(()=>{document.documentElement.lang=lang;document.title=t.title},[lang,t.title])
  useEffect(()=>{
    const controller=new AbortController(); let alive=true
    setLoadState('loading')
    async function load(){
      try {
        const res=await fetch('/api/tactics',{cache:'no-store',signal:controller.signal})
        if(!res.ok && res.status!==404)throw new Error()
        const remote=res.status===404?undefined:await res.json()
        if(remote && (!remote['7v7'] || !remote['9v9']))throw new Error()
        const next=normalizeBoard(remote)
        if(!validateBoard(next))throw new Error()
        if(!alive)return
        const snapshot=JSON.stringify(next);setSavedSnapshot(snapshot)
        let draft=null
        if(coachRoute){try {draft=JSON.parse(readStorage('sessionStorage',DRAFT_KEY)||'null')}catch{}}
        if(draft?.base===snapshot && validateBoard(draft.data)){
          dataRef.current=draft.data;setData(draft.data);setNotice('Brouillon non publié restauré.')
        }else{dataRef.current=next;setData(next);if(draft)setNotice('Le plan publié a changé. Le brouillon ancien n’a pas été appliqué.');}
        setLoadState('ready')
      }catch(e){if(alive && e.name!=='AbortError')setLoadState('error')}
    }
    load();return()=>{alive=false;controller.abort()}
  },[loadAttempt,coachRoute])
  useEffect(()=>{if(!coachRoute || !ready)return; const timer=setTimeout(()=>writeStorage('sessionStorage',DRAFT_KEY,dirty?JSON.stringify({base:savedSnapshot,data}):null),250);return()=>clearTimeout(timer)},[data,dirty,ready,savedSnapshot,coachRoute])
  useEffect(()=>{if(!coachMode || !dirty)return;const guard=e=>{writeStorage('sessionStorage',DRAFT_KEY,JSON.stringify({base:savedSnapshot,data:dataRef.current}));e.preventDefault();e.returnValue=''};window.addEventListener('beforeunload',guard);return()=>window.removeEventListener('beforeunload',guard)},[dirty,coachMode,savedSnapshot])
  useEffect(()=>{if(selected==null || viewport.width>1180)return;const frame=requestAnimationFrame(()=>{sidebarRef.current?.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'})});return()=>cancelAnimationFrame(frame)},[selected])

  function checkpoint(){history.current.push(copy(dataRef.current));if(history.current.length>40)history.current.shift();setUndoCount(history.current.length)}
  function update(next,record=true){if(!editable)return;if(record)checkpoint();dataRef.current=next;setData(next);setSaveState('');setNotice('')}
  function undo(){if(!editable || !history.current.length)return;const last=history.current.pop();dataRef.current=last;setData(last);setUndoCount(history.current.length);setSaveState('')}
  function chooseFormat(value){setFormat(value);setSelected(null)}
  function choosePhase(value){setPhase(value);setSelected(null)}
  function selectPlayer(slot){setSelected(selected===slot?null:slot)}
  function move(slot,x,y,record=true){if(editable)update(movePlayer(dataRef.current,format,phase,slot,x,y),record)}
  function nudge(direction){const pos=toDisplay(player.x,player.y,orientation);const p=fromDisplay(pos.x+(direction==='right'?2:direction==='left'?-2:0),pos.y+(direction==='down'?2:direction==='up'?-2:0),orientation);move(player.number,p.x,p.y)}
  function changePreset(id){if(!editable)return;if(profile.counterPressCustom && !window.confirm('Remplacer les positions personnalisées de cette phase par le modèle choisi ?'))return;update(choosePreset(dataRef.current,format,id))}
  function back(){setSelected(null);if(viewport.width<=1180)requestAnimationFrame(()=>boardRef.current?.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'}))}
  async function save(){
    if(!editable || saving.current)return
    const snapshot=JSON.stringify(dataRef.current)
    if(!validateBoard(dataRef.current)){setSaveState('error');setNotice('Plan invalide : vérifiez les numéros et les positions.');return}
    saving.current=true;setSaveState('saving');setNotice('')
    try {
      const res=await fetch('/api/tactics',{method:'POST',headers:{'content-type':'application/json',authorization:`Bearer ${token}`},body:snapshot})
      if(res.status===401){writeStorage('sessionStorage',SESSION_KEY,null);writeStorage('sessionStorage',DRAFT_KEY,JSON.stringify({base:savedSnapshot,data:dataRef.current}));setToken('');setLang('fr');setExpired(true);setSaveState('error');return}
      if(!res.ok)throw new Error()
      const body=await res.json();if(body.ok!==true)throw new Error()
      setSavedSnapshot(snapshot);setSaveState('saved');setNotice('Modifications publiées.');writeStorage('sessionStorage',DRAFT_KEY,null)
    }catch {setSaveState('error');setNotice('Publication impossible. Vos modifications sont conservées. Réessayez.')}finally{saving.current=false}
  }
  if(coachRoute && !token)return <CoachGate expired={expired} onLogin={value=>{writeStorage('sessionStorage',SESSION_KEY,value);setToken(value);setLang('fr')}}/>
  const subtitle=coachMode?'Modification en français':t.subtitle
  return <div className={`board-app ${coachMode?'coach-shell':'public-shell'}`} data-version="15">
    <header className="topbar">
      <a className="brand" href={CLUB_URL} target="_blank" rel="noreferrer"><ClubMark/><div><strong className="brand-title">{t.title}</strong><strong className="brand-short">Fornebu</strong><span><b>Fornebu FK ↗</b> · {subtitle}</span></div></a>
      <div className="ribbon-controls"><nav className="format-selector" aria-label="Game format">{FORMATION_KEYS.map(key=><button type="button" key={key} className={format===key?'active':''} aria-pressed={format===key} onClick={()=>chooseFormat(key)}>{key}</button>)}</nav><label className="orientation-control"><Icon kind="rotate"/><span className="sr-only">{t.orientation}</span><select aria-label={t.orientation} value={preference} onChange={e=>{setPreference(e.target.value);writeStorage('localStorage',VIEW_KEY,e.target.value)}}><option value="auto">{t.auto}</option><option value="vertical">{t.vertical}</option><option value="horizontal">{t.horizontal}</option></select></label></div>
      <div className="header-actions">{coachMode && <button type="button" className="validate-button" onClick={save} disabled={!editable} aria-busy={saveState==='saving'} title={lang!=='fr'?'Revenez en FR pour valider':'Publier les textes et positions des deux formats'}>{saveState==='saving'?'VALIDATION…':saveState==='saved'&&!dirty?'VALIDÉ ✓':'VALIDER'}</button>}<nav className={`language-switch ${coachMode?'coach-languages':''}`} aria-label="Language">{(coachMode?['fr','en','no']:['en','fr','no']).map(code=><button type="button" key={code} className={`${lang===code?'active':''} ${coachMode&&code==='fr'?'coach-fr':''}`} aria-pressed={lang===code} title={coachMode?(code==='fr'?'Français : modification':`${code.toUpperCase()} : lecture seule`):code.toUpperCase()} onClick={()=>setLang(code)}>{code.toUpperCase()}</button>)}</nav></div>
    </header>
    <main className={`board-main ${orientation==='vertical'?'vertical-view':''}`}>
      {loadState==='loading' && <div className="status-bar" role="status">{t.loading}</div>}
      {loadState==='error' && <div className="status-bar" role="alert">{coachMode?'Chargement impossible. Rechargez le plan avant de modifier ou publier.':t.offline}<button type="button" onClick={()=>setLoadAttempt(v=>v+1)}>{t.retry}</button></div>}
      {coachMode && <div className="coach-tools"><button type="button" className="undo-button" onClick={undo} disabled={!editable||!undoCount}><Icon kind="undo"/>Annuler</button><span role="status">{lang!=='fr'?t.preview:dirty?'Modifications non publiées':'Les positions sont propres à chaque phase ; les consignes joueur sont communes.'}</span></div>}
      {notice && coachMode && <div className={`status-bar ${saveState==='error'?'error-status':''}`} role={saveState==='error'?'alert':'status'}>{notice}</div>}
      <div className="workspace-grid">
        <section className="board-card" ref={boardRef}>
          <div className="board-heading"><span className="board-format-pill">{format}</span><span className="formation-center-badge"><small>{t.formation}</small><strong>{shape}</strong></span><span className="active-plan-pill">{t[phase]}</span></div>
          <Pitch players={players} orientation={orientation} editable={editable} selected={selected} onSelect={selectPlayer} onMove={move} onDragStart={checkpoint} t={t}/>
          <section className={`principles-panel ${coachMode?'coach-principles':''}`}><div className="in-out-row">{['in','out'].map(key=><div key={key} className={`principle-${key}`}><span>{key.toUpperCase()}</span>{coachMode?<input aria-label={`Principe ${key.toUpperCase()}`} value={localized(profile.principles[key],lang)} readOnly={!editable} onChange={e=>update(setPrinciple(dataRef.current,format,key,e.target.value,lang))}/>:<strong>{localized(profile.principles[key],lang)}</strong>}</div>)}</div>{coachMode && <label className="compact-rule-editor"><span>RÈGLE D’ÉQUIPE EN ROUGE</span><textarea aria-label="Règle d’équipe" rows={2} value={localized(profile.principles.compact,lang)} readOnly={!editable} onChange={e=>update(setPrinciple(dataRef.current,format,'compact',e.target.value,lang))}/></label>}</section>
          <p className="pitch-footer-hint">{editable?'Glissez un maillot pour le déplacer. Touchez-le pour changer son numéro ou ses consignes.':t.select}</p>
        </section>
        <div className="strategy-column"><aside className="strategy-sidebar" ref={sidebarRef}>
          {!player ? <>
            <nav className="strategy-toggle" aria-label="Tactical phase">{STRATEGY_KEYS.map(key=><button type="button" key={key} className={phase===key?'active':''} aria-pressed={phase===key} onClick={()=>choosePhase(key)}>{t[key]}</button>)}</nav>
            {coachMode && phase==='alternative' && <section className="counterpress-preset-editor"><h2>{t.preset}</h2><div className="counterpress-preset-options">{COUNTERPRESS_PRESETS[format].map(preset=><button type="button" key={preset.id} disabled={!editable} className={profile.counterPressPreset===preset.id?'active':''} aria-pressed={profile.counterPressPreset===preset.id} onClick={()=>changePreset(preset.id)}><strong>{localized(preset.name,lang)}</strong>{preset.recommended && <small>{t.recommended}</small>}</button>)}</div>{profile.counterPressCustom && <small className="custom-shape-note">{t.custom}</small>}</section>}
            <div className="global-sections">{visibleTeamSections(plan,phase).map(section=><section key={section.key} className="strategy-block" data-section={section.key}><h2><span className="topic-icon"><Icon kind={section.key==='defend'?'defence':section.key==='transition'?'transition':section.key==='mindset'?'cue':'attack'}/></span>{localized(section.label,lang)}</h2><Field value={localized(section.text,lang)} label={localized(section.label,lang)} editing={coachMode} readOnly={!editable} onChange={value=>update(setTeamText(dataRef.current,format,phase,section.key,value,lang))}/></section>)}</div>
          </> : <>
            <div className="player-sidebar-head"><Jersey number={shirtNumber(player)}/><h2>#{shirtNumber(player)}</h2><span className="role-badge">{localized(player.role,lang)}</span></div>
            {coachMode && lang==='fr' && <NumberEditor player={player} roster={players} disabled={!editable} onNumber={(value,swap)=>update(setShirtNumber(dataRef.current,format,player.number,value,swap))} onRole={value=>update(setPlayerText(dataRef.current,format,player.number,'role',value))} onNudge={nudge} t={t}/>}
            <div className="player-topics">{[['possession','attack'],['defence','defence'],['transition','transition'],['cue','cue']].map(([key,title])=>{const section=player.sections.find(s=>s.key===key);return section?<section key={key} className="player-topic"><h2><span className="topic-icon"><Icon kind={title}/></span>{t[title]}</h2><Field value={localized(section.text,lang)} label={t[title]} editing={coachMode} readOnly={!editable} onChange={value=>update(setPlayerText(dataRef.current,format,player.number,key,value,lang))}/></section>:null})}</div>
            <button type="button" className="back-team-button" onClick={back}>{t.back}</button>
          </>}
        </aside>{!coachMode && <div className="compact-rule">{localized(profile.principles.compact,lang)}</div>}</div>
      </div>
    </main>
  </div>
}
