import { endOfMonth, format, isSameMonth, startOfMonth, subMonths } from 'date-fns'
import { fr } from 'date-fns/locale'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useEffect, useState } from 'react'

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
import { useBudgetSummary } from '@/features/dashboard/hooks/useBudgetSummary'
import { useDebts } from '@/features/debts/hooks/useDebts'
import { useSavingsGoals } from '@/features/savings/hooks/useSavingsGoals'
import { useTransactions } from '@/features/transactions/hooks/useTransactions'
import { cn } from '@/lib/utils'

export default function DashboardPage() {
  const { activeBudgetId } = useActiveBudget()
  const { data: profile } = useCurrentProfile()
  const { data: categories } = useCategories(activeBudgetId)
  const setRightPanel = useRightPanel()

  const [displayMonth, setDisplayMonth] = useState(new Date())
  const today = new Date()
  const isCurrentMonth = isSameMonth(displayMonth, today)

  const monthStart = format(startOfMonth(displayMonth), 'yyyy-MM-dd')
  const monthEnd = format(endOfMonth(displayMonth), 'yyyy-MM-dd')

  const { data: currentMonthTx, isPending: txPending } = useTransactions(activeBudgetId, {
    startDate: monthStart,
    endDate: monthEnd,
    limit: 200,
  })

  const sixMonthsStart = format(startOfMonth(subMonths(today, 5)), 'yyyy-MM-dd')
  const sixMonthsEnd = format(endOfMonth(today), 'yyyy-MM-dd')
  const { data: sixMonthsTx } = useTransactions(activeBudgetId, {
    startDate: sixMonthsStart,
    endDate: sixMonthsEnd,
    limit: 500,
  })

  const { data: summary, isPending: summaryPending } = useBudgetSummary(activeBudgetId, displayMonth)
  const prevMonth = subMonths(displayMonth, 1)
  const { data: prevSummary } = useBudgetSummary(activeBudgetId, prevMonth)

  const { data: savingsGoals } = useSavingsGoals(activeBudgetId)
  const { data: debts } = useDebts(activeBudgetId)

  useEffect(() => {
    if (!activeBudgetId) return
    setRightPanel(<RightPanelContent budgetId={activeBudgetId} />)
    return () => setRightPanel(null)
  }, [activeBudgetId, setRightPanel])

  const firstName = profile?.full_name?.split(' ')[0] ?? 'toi'
  const isLoading = txPending || summaryPending

  return (
    <div className="space-y-6 p-6">
      {/* Navigation mois */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1 rounded-lg border border-neutral-200 bg-white dark:border-[#262626] dark:bg-[#171717]">
          <button
            type="button"
            aria-label="Mois précédent"
            onClick={() => setDisplayMonth((m) => subMonths(m, 1))}
            className="rounded-l-lg p-2 hover:bg-neutral-50 dark:hover:bg-[#1a1a1a]"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <p className="min-w-[100px] text-center text-sm font-medium capitalize">
            {format(displayMonth, 'MMM yyyy', { locale: fr })}
          </p>
          <button
            type="button"
            aria-label="Mois suivant"
            onClick={() => setDisplayMonth((m) => {
              const next = new Date(m.getFullYear(), m.getMonth() + 1, 1)
              return next > today ? m : next
            })}
            className={cn(
              'rounded-r-lg p-2 hover:bg-neutral-50 dark:hover:bg-[#1a1a1a]',
              isCurrentMonth && 'cursor-not-allowed opacity-30',
            )}
            disabled={isCurrentMonth}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        {!isCurrentMonth && (
          <button
            type="button"
            onClick={() => setDisplayMonth(new Date())}
            className="text-xs text-[#6366f1] hover:underline"
          >
            Aujourd'hui
          </button>
        )}
      </div>

      <HeroCard
        firstName={firstName}
        displayMonth={displayMonth}
        summary={summary}
        isLoading={isLoading}
      />

      <StatsGrid
        summary={summary}
        prevSummary={prevSummary}
        savingsGoals={savingsGoals}
        debts={debts}
        displayMonth={displayMonth}
        isLoading={isLoading}
      />

      <CalendarWidget
        transactions={currentMonthTx}
        categories={categories}
        month={displayMonth}
      />

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
