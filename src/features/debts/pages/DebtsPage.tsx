import { addMonths, format, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'
import {
  Calendar,
  Check,
  CheckCircle,
  CreditCard,
  Loader2,
  MoreHorizontal,
  Percent,
  Plus,
  RefreshCw,
  TrendingDown,
} from 'lucide-react'
import { useMemo, useState } from 'react'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'
import { useActiveBudget } from '@/features/budgets/hooks/useActiveBudget'
import { DebtDialog } from '@/features/debts/components/DebtDialog'
import { useDebts } from '@/features/debts/hooks/useDebts'
import { useDeleteDebt } from '@/features/debts/hooks/useDeleteDebt'
import { usePayInstallment } from '@/features/debts/hooks/usePayInstallment'
import { formatCurrency } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { Tables } from '@/types/database'

type Debt = Tables<'debts'>

export default function DebtsPage() {
  const { activeBudgetId } = useActiveBudget()
  const { data: debts, isPending } = useDebts(activeBudgetId)
  const deleteDebt = useDeleteDebt()

  const [createOpen, setCreateOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Debt | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Debt | null>(null)

  const stats = useMemo(() => {
    if (!debts || debts.length === 0) return null
    const active = debts.filter((d) => (d.paid_amount ?? 0) < d.total_amount)
    return {
      totalRemaining: active.reduce((s, d) => s + (d.total_amount - (d.paid_amount ?? 0)), 0),
      totalMonthly: active.reduce((s, d) => s + d.monthly_payment, 0),
      activeCount: active.length,
    }
  }, [debts])

  if (isPending) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-8 w-48" />
        <div className="space-y-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Dettes &amp; Crédits</h1>
        <Button size="sm" className="gap-1.5" onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4" />
          Ajouter
        </Button>
      </div>

      {stats && (
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-[#262626] dark:bg-[#171717]">
            <div className="mb-1 flex items-center gap-1.5 text-xs text-neutral-500">
              <TrendingDown className="h-3.5 w-3.5 text-red-400" />
              Total restant
            </div>
            <p className="text-lg font-semibold text-red-500">{formatCurrency(stats.totalRemaining)}</p>
          </div>
          <div className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-[#262626] dark:bg-[#171717]">
            <div className="mb-1 flex items-center gap-1.5 text-xs text-neutral-500">
              <Calendar className="h-3.5 w-3.5 text-indigo-400" />
              Mensualités
            </div>
            <p className="text-lg font-semibold text-indigo-600">{formatCurrency(stats.totalMonthly)}</p>
          </div>
          <div className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-[#262626] dark:bg-[#171717]">
            <div className="mb-1 flex items-center gap-1.5 text-xs text-neutral-500">
              <CreditCard className="h-3.5 w-3.5 text-neutral-400" />
              Actives
            </div>
            <p className="text-lg font-semibold">{stats.activeCount}</p>
          </div>
        </div>
      )}

      {debts?.length === 0 ? (
        <div className="flex min-h-[360px] flex-col items-center justify-center gap-3">
          <CreditCard className="h-12 w-12 text-neutral-300" />
          <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
            Aucune dette enregistrée
          </p>
          <p className="text-xs text-neutral-400">Suis tes crédits et remboursements</p>
          <Button variant="outline" size="sm" onClick={() => setCreateOpen(true)}>
            Ajouter une dette
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {debts?.map((debt) => (
            <DebtCard
              key={debt.id}
              debt={debt}
              budgetId={activeBudgetId ?? ''}
              onEdit={setEditTarget}
              onDelete={setDeleteTarget}
            />
          ))}
        </div>
      )}

      {activeBudgetId && (
        <>
          <DebtDialog
            open={createOpen}
            onOpenChange={setCreateOpen}
            budgetId={activeBudgetId}
          />
          {editTarget && (
            <DebtDialog
              open={!!editTarget}
              onOpenChange={(o) => { if (!o) setEditTarget(null) }}
              budgetId={activeBudgetId}
              debt={editTarget}
            />
          )}
        </>
      )}

      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => { if (!o) setDeleteTarget(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cette dette ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. La dette envers &quot;{deleteTarget?.creditor}&quot;
              sera supprimée ainsi que tout son historique.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 hover:bg-red-600"
              onClick={() => {
                if (deleteTarget && activeBudgetId) {
                  deleteDebt.mutate({ id: deleteTarget.id, budgetId: activeBudgetId })
                  setDeleteTarget(null)
                }
              }}
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

type DebtCardProps = {
  debt: Debt
  budgetId: string
  onEdit: (debt: Debt) => void
  onDelete: (debt: Debt) => void
}

function DebtCard({ debt, budgetId, onEdit, onDelete }: DebtCardProps) {
  const payInstallment = usePayInstallment()
  const paid = debt.paid_amount ?? 0
  const remaining = debt.total_amount - paid
  const pct = debt.total_amount > 0 ? Math.min((paid / debt.total_amount) * 100, 100) : 0
  const settled = paid >= debt.total_amount

  const estimatedEndDate = (() => {
    if (debt.end_date) return parseISO(debt.end_date)
    if (debt.monthly_payment <= 0) return null
    const monthsLeft = Math.ceil(remaining / debt.monthly_payment)
    return addMonths(new Date(), monthsLeft)
  })()

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-5 dark:border-[#262626] dark:bg-[#171717]">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <p className="text-lg font-semibold">{debt.creditor}</p>
          {settled && (
            <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-medium text-green-700">
              <CheckCircle className="h-3 w-3" />
              Soldé
            </span>
          )}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(debt)}>Modifier</DropdownMenuItem>
            <DropdownMenuItem
              className="text-red-500 focus:text-red-500"
              onClick={() => onDelete(debt)}
            >
              Supprimer
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="mb-1 flex items-center gap-2">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-neutral-100">
          <div
            className="h-full rounded-full bg-green-500 transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className="text-xs font-medium text-neutral-500">{Math.round(pct)}%</span>
      </div>
      <p className="mb-4 text-xs text-neutral-400">
        {formatCurrency(paid)} remboursés sur {formatCurrency(debt.total_amount)}
      </p>

      <div className="grid grid-cols-2 gap-x-4 gap-y-2">
        <div className="flex items-center gap-1.5 text-xs text-neutral-500">
          <RefreshCw className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
          <span className="font-medium text-neutral-700 dark:text-neutral-300">
            {formatCurrency(debt.monthly_payment)}
          </span>
          <span>/ mois</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-neutral-500">
          <TrendingDown className="h-3.5 w-3.5 text-red-400 shrink-0" />
          <span className={cn('font-medium', settled ? 'text-green-600' : 'text-neutral-700 dark:text-neutral-300')}>
            {settled ? 'Soldé' : formatCurrency(remaining)}
          </span>
          {!settled && <span>restants</span>}
        </div>
        <div className="flex items-center gap-1.5 text-xs text-neutral-500">
          <Percent className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
          <span className="font-medium text-neutral-700 dark:text-neutral-300">
            {debt.interest_rate && debt.interest_rate > 0
              ? `${debt.interest_rate}%`
              : 'Sans intérêts'}
          </span>
        </div>
        {estimatedEndDate && (
          <div className="flex items-center gap-1.5 text-xs text-neutral-500">
            <Calendar className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
            <span className="font-medium text-neutral-700 dark:text-neutral-300">
              {format(estimatedEndDate, 'MMM yyyy', { locale: fr })}
            </span>
          </div>
        )}
      </div>

      <Button
        variant="outline"
        size="sm"
        className={cn(
          'mt-4 w-full gap-1.5',
          !settled && 'border-indigo-200 text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700',
        )}
        disabled={settled || payInstallment.isPending}
        onClick={() => {
          if (!settled) {
            payInstallment.mutate({
              debtId: debt.id,
              budgetId,
              monthlyPayment: debt.monthly_payment,
              currentPaidAmount: paid,
              totalAmount: debt.total_amount,
            })
          }
        }}
      >
        {payInstallment.isPending ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Check className="h-3.5 w-3.5" />
        )}
        {settled ? 'Remboursé' : 'Payer la mensualité'}
      </Button>
    </div>
  )
}
