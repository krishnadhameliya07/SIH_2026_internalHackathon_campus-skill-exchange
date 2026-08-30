import { Routes, Route, Navigate } from 'react-router-dom'

import AuthLayout from './layouts/AuthLayout.jsx'
import AppLayout from './layouts/AppLayout.jsx'
import RequireAuth from './components/RequireAuth.jsx'

import SignUpLogin from './pages/auth/SignUpLogin.jsx'
import Verification from './pages/auth/Verification.jsx'
import ProfileSkillsSetup from './pages/auth/ProfileSkillsSetup.jsx'
import AIConfirm from './pages/auth/AIConfirm.jsx'

import Dashboard from './pages/dashboard/Dashboard.jsx'

import MarketplaceFeed from './pages/marketplace/MarketplaceFeed.jsx'
import MyActivity from './pages/marketplace/MyActivity.jsx'
import PostRequest from './pages/marketplace/PostRequest.jsx'
import PostOffer from './pages/marketplace/PostOffer.jsx'
import ListingDetail from './pages/marketplace/ListingDetail.jsx'
import MatchResults from './pages/marketplace/MatchResults.jsx'
import ConversationThread from './pages/marketplace/ConversationThread.jsx'
import CompletionReview from './pages/marketplace/CompletionReview.jsx'

import MyProjects from './pages/teambuilder/MyProjects.jsx'
import DescribeProject from './pages/teambuilder/DescribeProject.jsx'
import RequirementsConfirmation from './pages/teambuilder/RequirementsConfirmation.jsx'
import RecommendedTeam from './pages/teambuilder/RecommendedTeam.jsx'

import MyMentorships from './pages/mentorship/MyMentorships.jsx'
import StateLearningGoal from './pages/mentorship/StateLearningGoal.jsx'
import SkillGapLearningPath from './pages/mentorship/SkillGapLearningPath.jsx'
import MentorRecommendations from './pages/mentorship/MentorRecommendations.jsx'

import MyProfile from './pages/profile/MyProfile.jsx'
import EditSkills from './pages/profile/EditSkills.jsx'
import PublicProfileView from './pages/profile/PublicProfileView.jsx'

import Wallet from './pages/wallet/Wallet.jsx'
import NotificationsList from './pages/notifications/NotificationsList.jsx'
import AccountSettings from './pages/settings/AccountSettings.jsx'

export default function AppRoutes() {
  return (
    <Routes>
      {/* Auth & Onboarding — own funnel, no persistent nav */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<SignUpLogin />} />
        <Route path="/verify" element={<Verification />} />
        <Route path="/onboarding/profile" element={<ProfileSkillsSetup />} />
        <Route path="/onboarding/confirm" element={<AIConfirm />} />
      </Route>

      {/* Authenticated app shell — persistent top nav */}
      <Route element={<RequireAuth><AppLayout /></RequireAuth>}>
        <Route path="/" element={<Dashboard />} />

        {/* Marketplace */}
        <Route path="/marketplace" element={<MarketplaceFeed />} />
        <Route path="/marketplace/my-activity" element={<MyActivity />} />
        <Route path="/marketplace/post-request" element={<PostRequest />} />
        <Route path="/marketplace/post-offer" element={<PostOffer />} />
        <Route path="/marketplace/listing/:id" element={<ListingDetail />} />
        <Route path="/marketplace/matches/:requestId" element={<MatchResults />} />
        <Route path="/marketplace/conversation/:id" element={<ConversationThread />} />
        <Route path="/marketplace/review/:id" element={<CompletionReview />} />

        {/* Project Team Builder */}
        <Route path="/team-builder" element={<MyProjects />} />
        <Route path="/team-builder/new" element={<DescribeProject />} />
        <Route path="/team-builder/:projectId/requirements" element={<RequirementsConfirmation />} />
        <Route path="/team-builder/:projectId/team" element={<RecommendedTeam />} />
        <Route path="/team-builder/:projectId/conversation" element={<ConversationThread />} />
        <Route path="/team-builder/:projectId/review" element={<CompletionReview />} />

        {/* Mentorship / Learning */}
        <Route path="/mentorship" element={<MyMentorships />} />
        <Route path="/mentorship/new" element={<StateLearningGoal />} />
        <Route path="/mentorship/:id/gap" element={<SkillGapLearningPath />} />
        <Route path="/mentorship/:id/recommendations" element={<MentorRecommendations />} />
        <Route path="/mentorship/:id/conversation" element={<ConversationThread />} />

        {/* Skill Profile */}
        <Route path="/profile" element={<MyProfile />} />
        <Route path="/profile/edit-skills" element={<EditSkills />} />
        <Route path="/profile/:userId" element={<PublicProfileView />} />

        {/* Credits / Wallet, Notifications, Settings */}
        <Route path="/wallet" element={<Wallet />} />
        <Route path="/notifications" element={<NotificationsList />} />
        <Route path="/settings" element={<AccountSettings />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
