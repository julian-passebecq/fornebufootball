import { useEffect } from 'react'
import AppV13 from './AppV13'
import './v14.css'

export default function AppV14() {
  useEffect(() => {
    const root = document.getElementById('root')
    if (!root) return undefined

    let frame = 0

    function syncCoachChrome() {
      const cleanPath = window.location.pathname.replace(/\/+$/, '') || '/'
      const coachRoute = cleanPath === '/coach'
      const coachShell = root.querySelector('.coach-shell')
      const coachGate = root.querySelector('.coach-gate-page')

      // Coach edits are French-only. Force FR on the login screen and inside the workspace.
      if (coachRoute) {
        const frButton = coachShell
          ? root.querySelector('.coach-shell .v10-lang-switch button:nth-child(2)')
          : coachGate
            ? root.querySelector('.coach-gate-page .gate-language button:nth-child(2)')
            : null
        if (frButton && !frButton.classList.contains('active')) frButton.click()
      }

      // Coach access stays private via /coach. Never expose a coach button on the student page.
      root.querySelectorAll('.coach-entry-v14').forEach(node => node.remove())
    }

    function positionRule() {
      const workspace = root.querySelector('.workspace-grid')
      const sidebar = workspace?.querySelector('.strategy-sidebar')
      if (!workspace || !sidebar) return

      // In Coach mode the red team-rule editor belongs directly under the pitch.
      // Do not move it below the right panel.
      if (root.querySelector('.coach-shell')) {
        const staleSlot = Array.from(workspace.children).find(child => child.classList?.contains('rule-below-sidebar'))
        staleSlot?.remove()
        workspace.style.minHeight = ''
        return
      }

      let slot = Array.from(workspace.children).find(child => child.classList?.contains('rule-below-sidebar'))
      if (!slot) {
        slot = document.createElement('div')
        slot.className = 'rule-below-sidebar'
        sidebar.insertAdjacentElement('afterend', slot)
      }

      const originalRule = root.querySelector('.public-shell .board-card .compact-rule')
      const currentRule = slot.querySelector('.compact-rule')
      const rule = originalRule || currentRule
      if (!rule) {
        slot.hidden = true
        workspace.style.minHeight = ''
        return
      }

      slot.hidden = false
      if (rule.parentElement !== slot) slot.replaceChildren(rule)

      if (window.innerWidth > 1180) {
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
      frame = requestAnimationFrame(() => {
        syncCoachChrome()
        positionRule()
      })
    }

    schedule()
    const observer = new MutationObserver(schedule)
    observer.observe(root, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] })
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
