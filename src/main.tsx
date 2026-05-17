import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { BrowserRouter } from 'react-router-dom'
import { PriceCalculatorPage } from './PriceCalculatorPage.tsx'
import { registerServiceWorker } from './utils/serviceWorkerUtils'

// Register Service Worker for offline support
registerServiceWorker()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <PriceCalculatorPage />
    </BrowserRouter>
  </StrictMode>,
)
