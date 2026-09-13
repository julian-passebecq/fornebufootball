import { useEffect } from 'react'
import AppBoard from './AppBoard.jsx'
import './v16.css'

const VIEW_KEY = 'fornebu-pitch-view'
const MIGRATION_KEY = 'fornebu-pitch-view-v16-auto-default'

// V16 keeps automatic device orientation as the invisible default, but the
// visible ribbon control only offers the two useful manual choices.
try {
  if (!window.localStorage.getItem(MIGRATION_KEY)) {
    window.localStorage.removeItem(VIEW_KEY)
    window.localStorage.setItem(MIGRATION_KEY, '1')
  }
} catch {
  // Storage can be unavailable in private browsing. AppBoard already falls back to auto.
}

export default function AppV16() {
  useEffect(() => {
    const root = document.getElementById('root')
    if (!root) return undefined

    let frame = 0

    function syncOrientationControl() {
      const control = root.querySelector('.orientation-control')
      const select = control?.querySelector('select')
      const pitch = root.querySelector('.pitch')
      if (!control || !select) return

      let buttons = control.querySelector('.orientation-v16-buttons')
      if (!buttons) {
        buttons = document.createElement('div')
        buttons.className = 'orientation-v16-buttons'

        for (const value of ['vertical', 'horizontal']) {
          const button = document.createElement('button')
          button.type = 'button'
          button.dataset.orientation = value
          button.addEventListener('click', () => {
            const setter = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value')?.set
            if (setter) setter.call(select, value)
            else select.value = value
            select.dispatchEvent(new Event('change', { bubbles: true }))
          })
          buttons.appendChild(button)
        }
        control.appendChild(buttons)
      }

      for (const value of ['vertical', 'horizontal']) {
        const button = buttons.querySelector(`[data-orientation="${value}"]`)
        const option = select.querySelector(`option[value="${value}"]`)
        if (!button) continue
        button.textContent = option?.textContent || (value === 'vertical' ? 'Vertical' : 'Horizontal')
        const active = pitch?.dataset.orientation === value
        button.classList.toggle('active', active)
        button.setAttribute('aria-pressed', String(active))
      }
    }

    function schedule() {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(syncOrientationControl)
    }

    schedule()
    const observer = new MutationObserver(schedule)
    observer.observe(root, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'data-orientation', 'lang'] })
    window.addEventListener('resize', schedule)

    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
      window.removeEventListener('resize', schedule)
    }
  }, [])

  return <AppBoard />
}
