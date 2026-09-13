import './v7.css'

const DEFAULT_FORMATS = ['9v9', '9v9', '7v7']

function readActiveFormat() {
  const heading = document.querySelector('.board-team-meta h2')
  const match = heading?.textContent?.match(/(?:7v7|9v9)/i)
  return match ? match[0].toLowerCase() : null
}

function activeTeamIndex() {
  const buttons = [...document.querySelectorAll('.v6-team-tabs button')]
  return Math.max(0, buttons.findIndex(button => button.classList.contains('active')))
}

function applyFormats(formats) {
  const labels = [...document.querySelectorAll('.v6-team-tabs .team-tab-label')]
  labels.forEach((label, index) => {
    const format = formats[index] || DEFAULT_FORMATS[index] || ''
    if (format) label.dataset.format = format
  })
}

export function installUiPatch() {
  const formats = [...DEFAULT_FORMATS]
  let scheduled = false

  function sync() {
    scheduled = false
    const current = readActiveFormat()
    if (current) formats[activeTeamIndex()] = current
    applyFormats(formats)
  }

  function scheduleSync() {
    if (scheduled) return
    scheduled = true
    requestAnimationFrame(sync)
  }

  fetch('/api/tactics')
    .then(response => response.ok ? response.json() : Promise.reject())
    .then(data => {
      if (Array.isArray(data?.teams)) {
        data.teams.slice(0, 3).forEach((team, index) => {
          if (team?.formation === '7v7' || team?.formation === '9v9') formats[index] = team.formation
        })
      }
      scheduleSync()
    })
    .catch(() => scheduleSync())

  document.addEventListener('change', event => {
    const select = event.target.closest?.('.editor-grid select')
    if (!select || !['7v7', '9v9'].includes(select.value)) return
    formats[activeTeamIndex()] = select.value
    scheduleSync()
  })

  document.addEventListener('click', event => {
    if (event.target.closest?.('.v6-team-tabs button')) setTimeout(scheduleSync, 0)
  })

  const observer = new MutationObserver(scheduleSync)
  observer.observe(document.body, { childList: true, subtree: true, characterData: true })
  scheduleSync()
}

installUiPatch()
