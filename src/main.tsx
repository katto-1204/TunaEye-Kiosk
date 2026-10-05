import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './styles.css'
import './product.css'
import './site.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

if ('serviceWorker' in navigator) {
  if (import.meta.env.PROD) {
    window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js'))
  } else {
    navigator.serviceWorker.getRegistrations().then(registrations => {
      for (const registration of registrations) {
        registration.unregister()
      }
    })
  }
}
