import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/design-system.css'
import './styles/app-shell.css'
import App from './App.tsx'
import { initNative } from './native'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// 네이티브(iOS/Android)에서만 동작 — 웹은 no-op
initNative()
