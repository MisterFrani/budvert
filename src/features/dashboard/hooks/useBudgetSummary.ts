import { endOfMonth, format, startOfMonth } from 'date-fns'
import { useQuery } from '@tanstack/react-query'

import { supabase } from '@/lib/supabase'
import { STALE_TIME } from '@/lib/constants'

export type BudgetSummary = {
  carriedOver: number
  monthIncome: number
  monthExpenses: number
  available: number
  savedThisMonth: number
  debtDueThisMonth: number
  debtPaidThisMonth: number
  debtRemaining: number
  reallyFree: number
}

async function fetchSummary(budgetId: string, monthDate: Date): Promise<BudgetSummary> {
  const monthStart = format(startOfMonth(monthDate), 'yyyy-MM-dd')
  const monthEnd = format(endOfMonth(monthDate), 'yyyy-MM-dd')

  const [carriedOverRes, totalsRes, debtsRes] = await Promise.all([
    supabase.rpc('get_carried_over', { p_budget_id: budgetId, p_before: monthStart }),
    supabase.rpc('get_month_totals', {
      p_budget_id: budgetId,
      p_month_start: monthStart,
      p_month_end: monthEnd,
    }),
    supabase
      .from('debts')
      .select('id, monthly_payment, paid_amount, total_amount')
      .eq('budget_id', budgetId),
  ])

  if (carriedOverRes.error) throw new Error(carriedOverRes.error.message)
  if (totalsRes.error) throw new Error(totalsRes.error.message)
  if (debtsRes.error) throw new Error(debtsRes.error.message)

  const carriedOver = Number(carriedOverRes.data) || 0
  const totalsRow = (totalsRes.data as { income: number; expenses: number }[] | null)?.[0]
  const monthIncome = Number(totalsRow?.income) || 0
  const monthExpenses = Number(totalsRow?.expenses) || 0

  const debts = debtsRes.data ?? []
  const debtIds = debts.map((d) => d.id)

  const [goalsRes, debtPaymentsRes] = await Promise.all([
    supabase.from('savings_goals').select('id').eq('budget_id', budgetId),
    debtIds.length > 0
      ? supabase
          .from('debt_payments')
          .select('amount')
          .in('debt_id', debtIds)
          .gte('date', monthStart)
          .lte('date', monthEnd)
      : Promise.resolve({ data: [] as { amount: number }[], error: null }),
  ])

  if (goalsRes.error) throw new Error(goalsRes.error.message)
  if (debtPaymentsRes.error) throw new Error(debtPaymentsRes.error.message)

  const goalIds = (goalsRes.data ?? []).map((g) => g.id)

  const contribRes =
    goalIds.length > 0
      ? await supabase
          .from('savings_contributions')
          .select('amount')
          .in('goal_id', goalIds)
          .gte('date', monthStart)
          .lte('date', monthEnd)
      : { data: [] as { amount: number }[], error: null }

  if (contribRes.error) throw new Error(contribRes.error.message)

  const savedThisMonth = (contribRes.data ?? []).reduce((s, c) => s + c.amount, 0)

  const debtDueThisMonth = debts
    .filter((d) => (d.paid_amount ?? 0) < d.total_amount)
    .reduce((s, d) => s + d.monthly_payment, 0)

  const debtPaidThisMonth = (debtPaymentsRes.data ?? []).reduce((s, p) => s + p.amount, 0)
  const debtRemaining = Math.max(0, debtDueThisMonth - debtPaidThisMonth)
  const available = carriedOver + monthIncome - monthExpenses

  return {
    carriedOver,
    monthIncome,
    monthExpenses,
    available,
    savedThisMonth,
    debtDueThisMonth,
    debtPaidThisMonth,
    debtRemaining,
    reallyFree: available - debtRemaining,
  }
}

export function useBudgetSummary(budgetId: string | null | undefined, monthDate: Date) {
  const monthKey = format(monthDate, 'yyyy-MM')
  return useQuery({
    queryKey: ['summary', budgetId, monthKey],
    queryFn: () => fetchSummary(budgetId!, monthDate),
    enabled: !!budgetId,
    staleTime: STALE_TIME,
  })
}
