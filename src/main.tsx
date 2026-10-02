import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// The separate trial entrance has its own browser origin and local service.
if (import.meta.env.VITE_WIKITREE_CLI_PORT === '18180') {
  localStorage.setItem('antigravity_cli_url', 'http://localhost:18180');
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
import 'katex/dist/katex.min.css';
