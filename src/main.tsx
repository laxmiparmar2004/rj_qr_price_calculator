import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { BrowserRouter } from 'react-router-dom'
import { PriceCalculatorPage } from './PriceCalculatorPage.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <PriceCalculatorPage />
    </BrowserRouter>
  </StrictMode>,
)
