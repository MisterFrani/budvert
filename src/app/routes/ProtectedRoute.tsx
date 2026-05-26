import { Loader2 } from 'lucide-react'
import { Navigate, Outlet } from 'react-router-dom'

import { useUserBudgets } from '@/features/budgets/hooks/useUserBudgets'
import { useAuthStore } from '@/stores/authStore'

export default function ProtectedRoute() {
  const { user, isLoading: authLoading } = useAuthStore()
  const { data: budgets, isPending: budgetsPending } = useUserBudgets()

  if (authLoading || (user && budgetsPending)) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-[#6366f1]" />
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />

  if (budgets?.length === 0) return <Navigate to="/onboarding" replace />

  return <Outlet />
}
