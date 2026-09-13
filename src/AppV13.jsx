import { useEffect } from 'react'
import AppV12 from './AppV12'
import './v13.css'

const copy = {
  EN: {
    standard: 'Starting formation',
    alternative: 'On ball loss',
    counterShape: 'Ball-loss shape',
    sharedPlayerHint: 'Positions are saved per tactical phase; player instructions are shared.',
  },
  FR: {
    standard: 'Formation de jeu de départ',
    alternative: 'À la perte de balle',
    counterShape: 'Structure à la perte de balle',
    sharedPlayerHint: 'Les positions sont enregistrées par phase tactique ; les consignes joueur sont partagées.',
  },
  NO: {
    standard: 'Startformasjon',
    alternative: 'Ved balltap',
    counterShape: 'Form ved balltap',
    sharedPlayerHint: 'Posisjonene lagres per taktisk fase; spillerinstruksjonene er felles.',
  },
}

function setText(node, text) {
  if (node && node.textContent !== text) node.textContent = text
}

function isWithoutBallLabel(value = '') {
  const label = value.trim().toLowerCase()
  return label === 'without the ball'
    || label === 'sans ballon'
    || label === 'uten ball'
}

export default function AppV13() {
  useEffect(() => {
    const root = document.getElementById('root')
    if (!root) return undefined

    function relabel() {
      const language = root.querySelector('.v10-lang-switch button.active')?.textContent?.trim() || 'EN'
      const t = copy[language] || copy.EN
      const tabs = root.querySelectorAll('.strategy-toggle button')
      if (tabs[0]) setText(tabs[0], t.standard)
      if (tabs[1]) setText(tabs[1], t.alternative)

      setText(root.querySelector('.active-plan-pill.standard'), t.standard)
      setText(root.querySelector('.active-plan-pill.alternative'), t.alternative)

      const visibilityNames = root.querySelectorAll('.plan-visibility-editor .visibility-name')
      if (visibilityNames[0]) setText(visibilityNames[0], t.standard)
      if (visibilityNames[1]) setText(visibilityNames[1], t.alternative)

      const presetTitle = root.querySelector('.counterpress-preset-head > span')
      if (presetTitle) setText(presetTitle, t.counterShape)

      if (root.querySelector('.coach-shell')) {
        setText(root.querySelector('.pitch-footer-hint'), t.sharedPlayerHint)
      }

      // Starting formation describes the team's initial in-possession structure.
      // Keep "Without the ball" only in the dedicated ball-loss team strategy.
      const standardActive = Boolean(root.querySelector('.active-plan-pill.standard'))
      root.querySelectorAll('.global-sections .strategy-block').forEach(block => {
        const label = block.querySelector('.strategy-label span:last-child')?.textContent || ''
        block.classList.toggle('starting-formation-hidden', standardActive && isWithoutBallLabel(label))
      })
    }

    const frame = requestAnimationFrame(relabel)
    const observer = new MutationObserver(() => requestAnimationFrame(relabel))
    observer.observe(root, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ['class'] })

    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
    }
  }, [])

  return <AppV12 />
}
