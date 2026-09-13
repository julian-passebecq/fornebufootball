import { useEffect } from 'react'
import AppV10 from './AppV10'
import './v11.css'

export default function AppV11() {
  useEffect(() => {
    const root = document.getElementById('root')
    if (!root) return undefined

    function relocateFormatSelector() {
      const selector = root.querySelector('.v10-topbar .format-selector')
      const board = root.querySelector('.v10-board-card')
      if (!selector || !board) return

      let slot = board.querySelector(':scope > .format-selector-board-slot')
      if (!slot) {
        slot = document.createElement('div')
        slot.className = 'format-selector-board-slot'
        board.insertBefore(slot, board.firstChild)
      }

      if (selector.parentElement !== slot) slot.appendChild(selector)
    }

    const frame = requestAnimationFrame(relocateFormatSelector)
    const observer = new MutationObserver(relocateFormatSelector)
    observer.observe(root, { childList: true, subtree: true })

    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
    }
  }, [])

  return <AppV10 />
}
