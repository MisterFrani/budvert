import { createBrowserRouter, RouterProvider } from 'react-router-dom'

import DesktopLayout from '@/app/layouts/DesktopLayout'
import MobileLayout from '@/app/layouts/MobileLayout'
import OnboardingRoute from '@/app/routes/OnboardingRoute'
import ProtectedRoute from '@/app/routes/ProtectedRoute'
import PublicRoute from '@/app/routes/PublicRoute'
import AuthCallbackPage from '@/features/auth/pages/AuthCallbackPage'
import LoginPage from '@/features/auth/pages/LoginPage'
import SignupPage from '@/features/auth/pages/SignupPage'
import OnboardingPage from '@/features/onboarding/pages/OnboardingPage'
import SettingsPage from '@/features/settings/pages/SettingsPage'
import { useMediaQuery } from '@/hooks/useMediaQuery'

function AppLayout() {
  const isDesktop = useMediaQuery('(min-width: 768px)')
  return isDesktop ? <DesktopLayout /> : <MobileLayout />
}

function ComingSoon({ page }: { page: string }) {
  return (
    <div className="flex h-full min-h-[60vh] items-center justify-center">
      <p className="text-sm text-muted-foreground">{page} — Coming soon</p>
    </div>
  )
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
          { path: '/', element: <ComingSoon page="Dashboard" /> },
          { path: '/transactions', element: <ComingSoon page="Transactions" /> },
          { path: '/budget', element: <ComingSoon page="Budget" /> },
          { path: '/partage', element: <ComingSoon page="Partage" /> },
          { path: '/dettes', element: <ComingSoon page="Dettes" /> },
          { path: '/epargne', element: <ComingSoon page="Épargne" /> },
          { path: '/parametres', element: <SettingsPage /> },
        ],
      },
    ],
  },
])

export function Routes() {
  return <RouterProvider router={router} />
}
