import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './AppBoard.jsx'

// Default the pitch to horizontal for new visitors. A manual choice remains remembered.
try {
  const viewKey = 'fornebu-pitch-view'
  if (!window.localStorage.getItem(viewKey)) window.localStorage.setItem(viewKey, 'horizontal')
} catch {
  // Storage may be disabled; AppBoard will still render normally.
}

ReactDOM.createRoot(document.getElementById('root')).render(<React.StrictMode><App /></React.StrictMode>)
