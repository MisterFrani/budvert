import { CheckCircle2, RefreshCw } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useAlerts } from '@/features/alerts/hooks/useAlerts'
import { useMarkAlertsRead } from '@/features/alerts/hooks/useMarkAlertsRead'
import { useSavingsGoals } from '@/features/savings/hooks/useSavingsGoals'
import { useTransactions } from '@/features/transactions/hooks/useTransactions'
import { formatCurrency } from '@/lib/format'
import { cn } from '@/lib/utils'

type Props = { budgetId: string }

export function RightPanelContent({ budgetId }: Props) {
  const { data: alerts, isPending: alertsPending } = useAlerts(budgetId)
  const markRead = useMarkAlertsRead(budgetId)
  const { data: goals } = useSavingsGoals(budgetId)
  const { data: recurring } = useTransactions(budgetId, { type: 'recurring' })

  const unread = alerts?.filter((a) => !a.is_read) ?? []

  return (
    <div className="flex flex-col gap-6 overflow-auto p-5">
      {/* Alertes */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium">Alertes</p>
            {unread.length > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white">
                {unread.length}
              </span>
            )}
          </div>
          {unread.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={() => markRead.mutate()}
            >
              Tout lire
            </Button>
          )}
        </div>

        {alertsPending ? (
          <div className="space-y-2">
            {Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-lg" />)}
          </div>
        ) : unread.length === 0 ? (
          <div className="flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2.5 dark:bg-emerald-900/10">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <p className="text-xs text-emerald-700">Tout est en ordre</p>
          </div>
        ) : (
          <div className="space-y-2">
            {unread.slice(0, 5).map((alert) => (
              <div
                key={alert.id}
                className={cn(
                  'rounded-lg px-3 py-2.5',
                  alert.level === 'critical'
                    ? 'bg-red-50 dark:bg-red-900/10'
                    : 'bg-amber-50 dark:bg-amber-900/10',
                )}
              >
                <p className={cn('text-xs font-medium', alert.level === 'critical' ? 'text-red-700' : 'text-amber-700')}>
                  {alert.message}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Récurrentes */}
      <section>
        <p className="mb-3 text-sm font-medium">Ce mois-ci</p>
        {!recurring || recurring.length === 0 ? (
          <p className="text-xs text-neutral-400">Aucune charge récurrente</p>
        ) : (
          <div className="space-y-2">
            {recurring.slice(0, 5).map((t) => (
              <div key={t.id} className="flex items-center gap-2">
                <RefreshCw className="h-3.5 w-3.5 shrink-0 text-neutral-400" />
                <span className="flex-1 truncate text-xs">{t.description}</span>
                <span className="text-xs font-medium text-red-500">-{formatCurrency(t.amount)}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Objectifs épargne */}
      <section>
        <p className="mb-3 text-sm font-medium">Objectifs épargne</p>
        {!goals || goals.length === 0 ? (
          <p className="text-xs text-neutral-400">Aucun objectif</p>
        ) : (
          <div className="space-y-3">
            {goals.slice(0, 3).map((goal) => {
              const pct = goal.target_amount > 0
                ? Math.min(((goal.current_amount ?? 0) / goal.target_amount) * 100, 100)
                : 0
              return (
                <div key={goal.id}>
                  <div className="mb-1 flex justify-between">
                    <span className="text-xs font-medium">{goal.name}</span>
                    <span className="text-xs text-neutral-400">{Math.round(pct)}%</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-neutral-100">
                    <div
                      className="h-full rounded-full bg-[#6366f1] transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <p className="mt-0.5 text-right text-[10px] text-neutral-400">
                    {formatCurrency(goal.current_amount ?? 0)} / {formatCurrency(goal.target_amount)}
                  </p>
                </div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
