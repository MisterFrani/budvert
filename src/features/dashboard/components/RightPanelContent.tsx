import { CheckCircle2, Pencil, PiggyBank, RefreshCw } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'

import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { useAlerts } from '@/features/alerts/hooks/useAlerts'
import { useMarkAlertsRead } from '@/features/alerts/hooks/useMarkAlertsRead'
import { EditBudgetDialog } from '@/features/budgets/components/EditBudgetDialog'
import { useActiveBudget } from '@/features/budgets/hooks/useActiveBudget'
import { OverdraftMeter } from '@/features/dashboard/components/OverdraftMeter'
import { useBudgetSummary } from '@/features/dashboard/hooks/useBudgetSummary'
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
  const { data: summary } = useBudgetSummary(budgetId, new Date())
  const { budget } = useActiveBudget()
  const [editOpen, setEditOpen] = useState(false)

  const unread = alerts?.filter((a) => !a.is_read) ?? []

  const topGoals = goals
    ? [...goals]
        .sort((a, b) => {
          const pctA = a.target_amount > 0 ? (a.current_amount ?? 0) / a.target_amount : 0
          const pctB = b.target_amount > 0 ? (b.current_amount ?? 0) / b.target_amount : 0
          return pctB - pctA
        })
        .slice(0, 3)
    : []

  return (
    <div className="flex flex-col overflow-y-auto p-4">
      {/* Alertes */}
      <section>
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">Alertes</p>
            {unread.length > 0 && (
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white">
                {unread.length}
              </span>
            )}
          </div>
          {unread.length > 0 && (
            <button
              type="button"
              className="text-xs text-indigo-600 hover:underline"
              onClick={() => markRead.mutate()}
            >
              Tout marquer comme lu
            </button>
          )}
        </div>

        {alertsPending ? (
          <div className="space-y-2">
            {Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-10 rounded-lg" />)}
          </div>
        ) : unread.length === 0 ? (
          <div className="flex flex-col items-center gap-1 py-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            </div>
            <span className="text-sm font-medium text-neutral-700 dark:text-neutral-200">Tout est en ordre</span>
            <span className="text-xs text-neutral-400">Aucune alerte ce mois</span>
          </div>
        ) : (
          <div className="max-h-48 space-y-1.5 overflow-y-auto">
            {unread.slice(0, 5).map((alert) => (
              <div key={alert.id} className="flex items-start gap-2 py-1">
                <span
                  className={cn(
                    'mt-1.5 h-2 w-2 shrink-0 rounded-full',
                    alert.level === 'critical' ? 'bg-red-500' : 'bg-amber-400',
                  )}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs leading-snug">{alert.message}</p>
                  <p className="text-[10px] text-neutral-400">
                    {alert.created_at && formatDistanceToNow(new Date(alert.created_at), { addSuffix: true, locale: fr })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <Separator className="my-3" />

      {/* Récurrentes */}
      <section>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-400">Récurrentes ce mois</p>
        {!recurring || recurring.length === 0 ? (
          <p className="py-2 text-xs text-neutral-400">Aucune charge récurrente</p>
        ) : (
          <div className="space-y-1.5">
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

      <Separator className="my-3" />

      {/* Découvert — toujours visible */}
      <section>
        <div className="mb-2 flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">Découvert autorisé</p>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-6 gap-1 px-2 text-[11px] text-indigo-600 hover:text-indigo-700"
            onClick={() => setEditOpen(true)}
          >
            <Pencil className="h-3 w-3" />
            Modifier
          </Button>
        </div>

        {!summary ? (
          <Skeleton className="h-8 rounded-lg" />
        ) : summary.overdraftLimit === 0 ? (
          /* Pas d'autorisation configurée */
          <div className="rounded-lg border border-dashed border-neutral-200 bg-neutral-50 px-3 py-2.5 dark:border-[#333] dark:bg-[#1a1a1a]">
            <p className="text-xs text-neutral-500">Aucune autorisation configurée</p>
            <button
              type="button"
              onClick={() => setEditOpen(true)}
              className="mt-0.5 text-[11px] font-medium text-indigo-600 hover:underline"
            >
              + Définir une limite de découvert
            </button>
          </div>
        ) : summary.balanceZone === 'positive' ? (
          /* Limite configurée, solde positif */
          <div className="space-y-1">
            <div className="flex items-center justify-between rounded-lg bg-neutral-50 px-3 py-2 dark:bg-[#1a1a1a]">
              <span className="text-xs text-neutral-500">Autorisé jusqu'à</span>
              <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-200">
                -{formatCurrency(summary.overdraftLimit)}
              </span>
            </div>
            <p className="px-1 text-[10px] text-neutral-400">Aucun découvert utilisé ce mois</p>
          </div>
        ) : (
          /* En découvert ou dépassé */
          <OverdraftMeter
            available={summary.available}
            overdraftLimit={summary.overdraftLimit}
            overdraftUsed={summary.overdraftUsed}
            balanceZone={summary.balanceZone}
            compact
          />
        )}
      </section>

      <Separator className="my-3" />

      {/* Objectifs épargne */}
      <section>
        <div className="mb-2 flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">Objectifs épargne</p>
          {goals && goals.length > 0 && (
            <Link to="/epargne" className="text-xs text-indigo-500 hover:underline">
              Voir tout
            </Link>
          )}
        </div>
        {!goals || goals.length === 0 ? (
          <div className="flex items-center gap-2 py-2">
            <PiggyBank className="h-3.5 w-3.5 text-neutral-300" />
            <span className="text-xs text-neutral-400">Aucun objectif</span>
            <Link to="/epargne" className="ml-auto text-xs text-indigo-500 underline">
              Créer
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {topGoals.map((goal) => {
              const pct = goal.target_amount > 0
                ? Math.min(((goal.current_amount ?? 0) / goal.target_amount) * 100, 100)
                : 0
              return (
                <div key={goal.id}>
                  <div className="mb-1 flex items-center gap-1.5">
                    <span className="flex-1 truncate text-xs font-medium">{goal.name}</span>
                    <span className="text-[10px] text-neutral-400">{Math.round(pct)}%</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
                    <div
                      className="h-full rounded-full bg-[#6366f1] transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {budget && (
        <EditBudgetDialog
          open={editOpen}
          onOpenChange={setEditOpen}
          budget={budget}
        />
      )}
    </div>
  )
}
