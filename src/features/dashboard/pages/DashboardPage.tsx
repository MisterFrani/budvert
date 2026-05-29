import { endOfMonth, format, startOfMonth as soMonth,startOfMonth, subMonths } from 'date-fns'
import { useEffect, useMemo } from 'react'

import { useRightPanel } from '@/app/layouts/RightPanelContext'
import { useCurrentProfile } from '@/features/auth/hooks/useCurrentProfile'
import { useActiveBudget } from '@/features/budgets/hooks/useActiveBudget'
import { useCategories } from '@/features/categories/hooks/useCategories'
import { BarChartWidget } from '@/features/dashboard/components/BarChartWidget'
import { CalendarWidget } from '@/features/dashboard/components/CalendarWidget'
import { DonutChartWidget } from '@/features/dashboard/components/DonutChartWidget'
import { HeroCard } from '@/features/dashboard/components/HeroCard'
import { RecentTransactions } from '@/features/dashboard/components/RecentTransactions'
import { RightPanelContent } from '@/features/dashboard/components/RightPanelContent'
import { StatsGrid } from '@/features/dashboard/components/StatsGrid'
import { useTransactions } from '@/features/transactions/hooks/useTransactions'

export default function DashboardPage() {
  const { budget, activeBudgetId } = useActiveBudget()
  const { data: profile } = useCurrentProfile()
  const { data: categories } = useCategories(activeBudgetId)
  const setRightPanel = useRightPanel()

  const startDate = format(startOfMonth(new Date()), 'yyyy-MM-dd')
  const endDate = format(endOfMonth(new Date()), 'yyyy-MM-dd')
  const { data: currentMonthTx, isPending: txPending } = useTransactions(activeBudgetId, {
    startDate,
    endDate,
    limit: 200,
  })

  const sixMonthsStart = format(soMonth(subMonths(new Date(), 5)), 'yyyy-MM-dd')
  const { data: sixMonthsTx } = useTransactions(activeBudgetId, {
    startDate: sixMonthsStart,
    endDate,
    limit: 500,
  })

  const totalExpenses = useMemo(
    () => currentMonthTx?.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0) ?? 0,
    [currentMonthTx],
  )
  const totalIncome = useMemo(
    () => currentMonthTx?.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0) ?? 0,
    [currentMonthTx],
  )

  useEffect(() => {
    if (!activeBudgetId) return
    setRightPanel(<RightPanelContent budgetId={activeBudgetId} />)
    return () => setRightPanel(null)
  }, [activeBudgetId, setRightPanel])

  return (
    <div className="space-y-6 p-6">
      <HeroCard
        budget={budget}
        profile={profile ?? undefined}
        totalExpenses={totalExpenses}
        totalIncome={totalIncome}
        isLoading={txPending}
      />

      <StatsGrid
        totalExpenses={totalExpenses}
        totalIncome={totalIncome}
        transactions={currentMonthTx}
        categories={categories}
        monthlyIncome={budget?.monthly_income ?? 0}
        isLoading={txPending}
      />

      <CalendarWidget transactions={currentMonthTx} categories={categories} />

      <div className="grid gap-4 lg:grid-cols-2">
        <BarChartWidget transactions={sixMonthsTx} />
        <DonutChartWidget transactions={currentMonthTx} categories={categories} />
      </div>

      <RecentTransactions
        transactions={currentMonthTx}
        categories={categories}
        isLoading={txPending}
      />
    </div>
  )
}
