import { format } from 'date-fns'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { createTransaction } from '@/features/transactions/api'
import { computeBalanceZone, fetchSummary } from '@/features/dashboard/hooks/useBudgetSummary'
import { supabase } from '@/lib/supabase'
import { formatCurrency } from '@/lib/format'
import type { TablesInsert, Tables } from '@/types/database'
import type { BudgetSummary } from '@/features/dashboard/hooks/useBudgetSummary'

export function useCreateTransaction(budgetId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: TablesInsert<'transactions'>) => createTransaction(payload),
    onSuccess: () => {
      const monthKey = format(new Date(), 'yyyy-MM')
      const oldSummary = queryClient.getQueryData<BudgetSummary>(['summary', budgetId, monthKey])
      const budget = queryClient.getQueryData<Tables<'budgets'>>(['budget', budgetId])
      const overdraftLimit = budget?.overdraft_limit ?? 0
      const oldAvailable = oldSummary?.available ?? 0

      queryClient.invalidateQueries({ queryKey: ['transactions', budgetId] })
      queryClient.invalidateQueries({ queryKey: ['categories', budgetId] })
      queryClient.invalidateQueries({ queryKey: ['summary', budgetId] })

      toast.success('Transaction ajoutée')

      // Overdraft check runs in background — does not block sheet from closing
      void checkOverdraftTransition(budgetId, monthKey, overdraftLimit, oldAvailable, queryClient)
    },
    onError: (err: Error) => toast.error(err.message),
  })
}

async function checkOverdraftTransition(
  budgetId: string,
  monthKey: string,
  overdraftLimit: number,
  oldAvailable: number,
  queryClient: ReturnType<typeof useQueryClient>,
) {
  let newSummary: BudgetSummary
  try {
    newSummary = await queryClient.fetchQuery({
      queryKey: ['summary', budgetId, monthKey],
      queryFn: () => fetchSummary(budgetId, new Date()),
      staleTime: 0,
    })
  } catch {
    return
  }

  const oldZone = computeBalanceZone(oldAvailable, overdraftLimit)
  const newZone = newSummary.balanceZone

  if (oldZone === newZone) return

  if (newZone === 'overdraft') {
    toast.warning('Tu passes en découvert')
    const { overdraftUsed } = newSummary
    if (overdraftUsed >= overdraftLimit * 0.8) {
      await insertOverdraftAlert(budgetId, 'warning',
        `Tu utilises ${formatCurrency(overdraftUsed)} de ton découvert de ${formatCurrency(overdraftLimit)}`)
      queryClient.invalidateQueries({ queryKey: ['alerts', budgetId] })
    }
  } else if (newZone === 'exceeded') {
    toast.error('Dépassement de découvert !')
    const excess = newSummary.overdraftUsed - overdraftLimit
    await insertOverdraftAlert(budgetId, 'critical',
      `Découvert dépassé de ${formatCurrency(excess > 0 ? excess : newSummary.overdraftUsed)}`)
    queryClient.invalidateQueries({ queryKey: ['alerts', budgetId] })
  }
}

async function insertOverdraftAlert(budgetId: string, level: string, message: string) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const today = new Date().toISOString().split('T')[0]
  const { data: existing } = await supabase
    .from('alerts')
    .select('id')
    .eq('budget_id', budgetId)
    .eq('type', 'overdraft')
    .gte('created_at', today)
    .limit(1)

  if ((existing?.length ?? 0) > 0) return

  await supabase.from('alerts').insert({
    budget_id: budgetId,
    user_id: user.id,
    type: 'overdraft',
    level,
    message,
  })
}
