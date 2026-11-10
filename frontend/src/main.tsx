import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { UIProvider } from './components/ui/UIContext'
import { AuthProvider } from './auth/AuthContext'
import { LearnerSessionBoundary } from './learners/LearnerSelectionContext'
import { PracticeProvider } from './practice/PracticeContext'
import './styles/index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <UIProvider>
      <AuthProvider>
        <PracticeProvider>
          <LearnerSessionBoundary>
            <App />
          </LearnerSessionBoundary>
        </PracticeProvider>
      </AuthProvider>
    </UIProvider>
  </StrictMode>,
)
