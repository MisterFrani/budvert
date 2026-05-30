import { createBrowserRouter, RouterProvider } from 'react-router-dom'

import DesktopLayout from '@/app/layouts/DesktopLayout'
import MobileLayout from '@/app/layouts/MobileLayout'
import OnboardingRoute from '@/app/routes/OnboardingRoute'
import ProtectedRoute from '@/app/routes/ProtectedRoute'
import PublicRoute from '@/app/routes/PublicRoute'
import AuthCallbackPage from '@/features/auth/pages/AuthCallbackPage'
import LoginPage from '@/features/auth/pages/LoginPage'
import SignupPage from '@/features/auth/pages/SignupPage'
import BudgetPage from '@/features/budget/pages/BudgetPage'
import DashboardPage from '@/features/dashboard/pages/DashboardPage'
import DebtsPage from '@/features/debts/pages/DebtsPage'
import SharePage from '@/features/members/pages/SharePage'
import OnboardingPage from '@/features/onboarding/pages/OnboardingPage'
import SavingsPage from '@/features/savings/pages/SavingsPage'
import SettingsPage from '@/features/settings/pages/SettingsPage'
import TransactionsPage from '@/features/transactions/pages/TransactionsPage'
import { useMediaQuery } from '@/hooks/useMediaQuery'

function AppLayout() {
  const isDesktop = useMediaQuery('(min-width: 768px)')
  return isDesktop ? <DesktopLayout /> : <MobileLayout />
}


const router = createBrowserRouter([
  {
    element: <PublicRoute />,
    children: [
      { path: '/login', element: <LoginPage /> },
      { path: '/signup', element: <SignupPage /> },
    ],
  },
  {
    path: '/auth/callback',
    element: <AuthCallbackPage />,
  },
  {
    element: <OnboardingRoute />,
    children: [{ path: '/onboarding', element: <OnboardingPage /> }],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: '/', element: <DashboardPage /> },
          { path: '/transactions', element: <TransactionsPage /> },
          { path: '/budget', element: <BudgetPage /> },
          { path: '/partage', element: <SharePage /> },
          { path: '/dettes', element: <DebtsPage /> },
          { path: '/epargne', element: <SavingsPage /> },
          { path: '/parametres', element: <SettingsPage /> },
        ],
      },
    ],
  },
])

export function Routes() {
  return <RouterProvider router={router} />
}
