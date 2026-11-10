import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import AppLayout from './components/layout/AppLayout'
import BibleLearningPage from './pages/BibleLearningPage'
import ChooseSubjectsPage from './pages/ChooseSubjectsPage'
import CodingTechnologyPage from './pages/CodingTechnologyPage'
import HomePage from './pages/HomePage'
import LearnPage from './pages/LearnPage'
import MathematicsPage from './pages/MathematicsPage'
import PracticePage from './pages/PracticePage'
import AchievementsPage from './pages/AchievementsPage'
import HelpPage from './pages/HelpPage'
import ProfilePage from './pages/ProfilePage'
import ProgressPage from './pages/ProgressPage'
import SettingsPage from './pages/SettingsPage'
import ParentAuthLayout from './components/parent-auth/ParentAuthLayout'
import LearnerPinPage from './pages/LearnerPinPage'
import ParentGetStartedPage from './pages/ParentGetStartedPage'
import ParentRegisterPage from './pages/ParentRegisterPage'
import ParentSelectLearnerPage from './pages/ParentSelectLearnerPage'
import ParentSignInPage from './pages/ParentSignInPage'
import { LearnerRoute, ParentRoute, PublicParentRoute } from './auth/AuthRoutes'
import AuthenticatedLearnerDashboardPage from './pages/AuthenticatedLearnerDashboardPage'
import PracticeQuestionPage from './pages/PracticeQuestionPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/parent" element={<ParentAuthLayout />}>
          <Route index element={<Navigate to="get-started" replace />} />
          <Route element={<PublicParentRoute />}>
            <Route path="get-started" element={<ParentGetStartedPage />} />
            <Route path="register" element={<ParentRegisterPage />} />
            <Route path="sign-in" element={<ParentSignInPage />} />
          </Route>
          <Route element={<ParentRoute />}>
            <Route path="select-learner" element={<ParentSelectLearnerPage />} />
          </Route>
        </Route>
        <Route element={<ParentAuthLayout />}>
          <Route path="/learner/pin" element={<LearnerPinPage />} />
        </Route>
        <Route element={<LearnerRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/learner/dashboard" element={<AuthenticatedLearnerDashboardPage />} />
            <Route path="/learner/practice" element={<PracticePage />} />
            <Route path="/learner/practice/:assessmentId" element={<PracticeQuestionPage />} />
            <Route path="/learner/subjects" element={<ChooseSubjectsPage />} />
            <Route path="/learner/subjects/mathematics" element={<MathematicsPage />} />
          </Route>
        </Route>
        <Route element={<AppLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/learn" element={<LearnPage />} />
          <Route path="/practice" element={<PracticePage />} />
          <Route path="/subjects" element={<ChooseSubjectsPage />} />
          <Route path="/subjects/mathematics" element={<MathematicsPage />} />
          <Route path="/coding-technology" element={<CodingTechnologyPage />} />
          <Route path="/bible-learning" element={<BibleLearningPage />} />
          <Route path="/achievements" element={<AchievementsPage />} />
          <Route path="/progress" element={<ProgressPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/help" element={<HelpPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
