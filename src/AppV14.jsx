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
        const workspaceRect = workspace.getBoundingClientRect()
        const sidebarRect = sidebar.getBoundingClientRect()
        const board = workspace.querySelector('.board-card')
        const boardHeight = board?.getBoundingClientRect().height || 0
        const gap = 10

        slot.style.setProperty('--rule-top', `${sidebarRect.bottom - workspaceRect.top + gap}px`)
        slot.style.setProperty('--rule-left', `${sidebarRect.left - workspaceRect.left}px`)
        slot.style.setProperty('--rule-width', `${sidebarRect.width}px`)

        const neededHeight = sidebarRect.height + gap + slot.getBoundingClientRect().height
        workspace.style.minHeight = neededHeight > boardHeight ? `${neededHeight}px` : ''
      } else {
        slot.style.removeProperty('--rule-top')
        slot.style.removeProperty('--rule-left')
        slot.style.removeProperty('--rule-width')
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
