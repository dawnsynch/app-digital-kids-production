import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { UIProvider } from './components/ui/UIContext'
import { AuthProvider } from './auth/AuthContext'
import { LearnerSessionBoundary } from './learners/LearnerSelectionContext'
import './styles/index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <UIProvider>
      <AuthProvider>
        <LearnerSessionBoundary>
          <App />
        </LearnerSessionBoundary>
      </AuthProvider>
    </UIProvider>
  </StrictMode>,
)
