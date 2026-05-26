import { useQuery } from '@tanstack/react-query'
import { useEffect,useMemo } from 'react'
import { useNavigate } from 'react-router-dom'

import { getBudget } from '@/features/budgets/api'
import { useUserBudgets } from '@/features/budgets/hooks/useUserBudgets'
import { STALE_TIME } from '@/lib/constants'
import { useBudgetStore } from '@/stores/budgetStore'

export function useActiveBudget() {
  const { activeBudgetId, setActiveBudgetId } = useBudgetStore()
  const { data: budgets } = useUserBudgets()
  const navigate = useNavigate()

  const effectiveId = useMemo(() => {
    if (!budgets) return activeBudgetId
    if (budgets.length === 0) return null
    const found = budgets.find((b) => b.id === activeBudgetId)
    return found ? found.id : budgets[0].id
  }, [budgets, activeBudgetId])

  useEffect(() => {
    if (effectiveId && effectiveId !== activeBudgetId) {
      setActiveBudgetId(effectiveId)
    }
  }, [effectiveId, activeBudgetId, setActiveBudgetId])

  useEffect(() => {
    if (budgets && budgets.length === 0) {
      navigate('/onboarding')
    }
  }, [budgets, navigate])

  const { data: budget, isLoading, error } = useQuery({
    queryKey: ['budget', effectiveId],
    queryFn: () => getBudget(effectiveId!),
    enabled: !!effectiveId,
    staleTime: STALE_TIME,
  })

  return { budget, isLoading, error, activeBudgetId: effectiveId }
}
