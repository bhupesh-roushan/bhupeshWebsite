import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { IconContext } from 'react-icons'
import App from './App.jsx'
import './index.css'

// react-icons stamps role="img" on every icon, which asks a screen reader to
// announce it — but each one here sits beside its own text label, so 67 of them
// were being announced as unnamed images. Every icon on this site is
// decorative; anything icon-only (close, copy) carries aria-label on its button.
const ICON_DEFAULTS = { attr: { 'aria-hidden': 'true', focusable: 'false' } }

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <IconContext.Provider value={ICON_DEFAULTS}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </IconContext.Provider>
  </React.StrictMode>,
)
