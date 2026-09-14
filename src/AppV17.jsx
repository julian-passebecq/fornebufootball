import AppV16 from './AppV16.jsx'
import './v17.css'

// V17 is presentation-only. It keeps all tactics, coach editing and persistence
// in AppBoard/AppV16 unchanged while refining the selected-player header.
export default function AppV17() {
  return <AppV16 />
}
