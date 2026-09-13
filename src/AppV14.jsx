import { useEffect } from 'react'
import AppV13 from './AppV13'
import './v14.css'

export default function AppV14() {
  useEffect(() => {
    const root = document.getElementById('root')
    if (!root) return undefined

    let frame = 0

    function positionRule() {
      const workspace = root.querySelector('.workspace-grid')
      const sidebar = workspace?.querySelector('.strategy-sidebar')
      if (!workspace || !sidebar) return

      let slot = Array.from(workspace.children).find(child => child.classList?.contains('rule-below-sidebar'))
      if (!slot) {
        slot = document.createElement('div')
        slot.className = 'rule-below-sidebar'
        sidebar.insertAdjacentElement('afterend', slot)
      }

      const originalRule = root.querySelector('.board-card .compact-rule, .board-card .compact-rule-editor')
      const currentRule = slot.querySelector('.compact-rule, .compact-rule-editor')
      const rule = originalRule || currentRule
      if (!rule) {
        slot.hidden = true
        return
      }

      slot.hidden = false
      if (rule.parentElement !== slot) slot.replaceChildren(rule)

      if (window.innerWidth > 980) {
        // Use the sidebar's layout offsets rather than viewport coordinates.
        // This keeps the warning anchored immediately below the right card,
        // even though the sidebar itself is sticky.
        const gap = 8
        const top = sidebar.offsetTop + sidebar.offsetHeight + gap
        const left = sidebar.offsetLeft
        const width = sidebar.offsetWidth

        slot.style.position = 'absolute'
        slot.style.top = `${top}px`
        slot.style.left = `${left}px`
        slot.style.width = `${width}px`
        slot.style.margin = '0'

        const board = workspace.querySelector('.board-card')
        const boardHeight = board?.offsetHeight || 0
        const requiredHeight = top + slot.offsetHeight
        workspace.style.minHeight = requiredHeight > boardHeight ? `${requiredHeight}px` : ''
      } else {
        slot.style.position = ''
        slot.style.top = ''
        slot.style.left = ''
        slot.style.width = ''
        slot.style.margin = ''
        workspace.style.minHeight = ''
      }
    }

    function schedule() {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(positionRule)
    }

    schedule()
    const observer = new MutationObserver(schedule)
    observer.observe(root, { childList: true, subtree: true })
    window.addEventListener('resize', schedule)

    const resizeObserver = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(schedule) : null
    const initialWorkspace = root.querySelector('.workspace-grid')
    const initialSidebar = initialWorkspace?.querySelector('.strategy-sidebar')
    if (initialWorkspace) resizeObserver?.observe(initialWorkspace)
    if (initialSidebar) resizeObserver?.observe(initialSidebar)

    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
      resizeObserver?.disconnect()
      window.removeEventListener('resize', schedule)
    }
  }, [])

  return <AppV13 />
}
