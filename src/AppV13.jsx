import { useEffect } from 'react'
import AppV12 from './AppV12'
import './v13.css'

const copy = {
  EN: {
    standard: 'Starting formation',
    alternative: 'On ball loss',
    withoutBall: 'Without the ball',
    counterShape: 'Ball-loss shape',
  },
  FR: {
    standard: 'Formation de jeu de départ',
    alternative: 'À la perte de balle',
    withoutBall: 'Sans ballon',
    counterShape: 'Structure à la perte de balle',
  },
  NO: {
    standard: 'Startformasjon',
    alternative: 'Ved balltap',
    withoutBall: 'Uten ball',
    counterShape: 'Form ved balltap',
  },
}

function setText(node, text) {
  if (node && node.textContent !== text) node.textContent = text
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

      if (root.querySelector('.active-plan-pill.alternative')) {
        const playerTopics = root.querySelectorAll('.player-topic-head span:last-child')
        if (playerTopics[1]) setText(playerTopics[1], t.withoutBall)
      }
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
