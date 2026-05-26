import { createBrowserRouter, RouterProvider } from 'react-router-dom'

import DesktopLayout from '@/app/layouts/DesktopLayout'
import MobileLayout from '@/app/layouts/MobileLayout'
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
    path: '/login',
    element: <ComingSoon page="Login" />,
  },
  {
    element: <AppLayout />,
    children: [
      { path: '/', element: <ComingSoon page="Dashboard" /> },
      { path: '/transactions', element: <ComingSoon page="Transactions" /> },
      { path: '/budget', element: <ComingSoon page="Budget" /> },
      { path: '/partage', element: <ComingSoon page="Partage" /> },
      { path: '/dettes', element: <ComingSoon page="Dettes" /> },
      { path: '/epargne', element: <ComingSoon page="Épargne" /> },
      { path: '/parametres', element: <ComingSoon page="Paramètres" /> },
    ],
  },
])

export function Routes() {
  return <RouterProvider router={router} />
}
