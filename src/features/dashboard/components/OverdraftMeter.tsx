import { AlertOctagon, AlertTriangle } from 'lucide-react'

import { formatCurrency } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { BalanceZone } from '@/features/dashboard/hooks/useBudgetSummary'

type Props = {
  available: number
  overdraftLimit: number
  overdraftUsed: number
  balanceZone: BalanceZone
  compact?: boolean
  onConfigure?: () => void
}

export function OverdraftMeter({ available, overdraftLimit, overdraftUsed, balanceZone, compact, onConfigure }: Props) {
  // Solde négatif sans autorisation configurée
  if (balanceZone === 'exceeded' && overdraftLimit === 0) {
    return (
      <div className={cn(
        'rounded-lg border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/10',
        compact ? 'p-2.5' : 'p-3.5',
      )}>
        <div className="flex items-start gap-2">
          <AlertOctagon className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
          <div className="space-y-1">
            <p className={cn('font-semibold text-red-600', compact ? 'text-xs' : 'text-sm')}>
              Solde négatif — {formatCurrency(Math.abs(available))} de déficit
            </p>
            {!compact && onConfigure && (
              <p className="text-xs text-red-500">
                Configure une{' '}
                <button type="button" onClick={onConfigure} className="underline">
                  autorisation de découvert
                </button>
                {' '}si ta banque t'en accorde une.
              </p>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (balanceZone === 'positive') return null

  const pct = overdraftLimit > 0 ? Math.min((overdraftUsed / overdraftLimit) * 100, 100) : 100
  const isExceeded = balanceZone === 'exceeded'
  const excess = isExceeded ? overdraftUsed - overdraftLimit : 0
  const remaining = isExceeded ? 0 : overdraftLimit - overdraftUsed

  return (
    <div className={cn(
      'rounded-lg border',
      isExceeded
        ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/10'
        : 'border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/10',
      compact ? 'p-2.5' : 'p-3.5',
    )}>
      {/* En-tête */}
      <div className="mb-2.5 flex items-center gap-1.5">
        {isExceeded
          ? <AlertOctagon className="h-3.5 w-3.5 shrink-0 text-red-500" />
          : <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-amber-500" />
        }
        <span className={cn(
          'font-semibold',
          isExceeded ? 'text-red-600' : 'text-amber-700 dark:text-amber-400',
          compact ? 'text-xs' : 'text-sm',
        )}>
          {isExceeded ? 'Découvert dépassé' : 'Découvert en cours'}
        </span>
      </div>

      {/* Barre visuelle */}
      <div className="mb-2 space-y-1">
        {/* Labels extrémités */}
        <div className="flex justify-between text-[10px] text-neutral-400">
          <span>0 €</span>
          <span className={isExceeded ? 'font-medium text-red-500' : 'font-medium text-amber-600'}>
            Limite : -{formatCurrency(overdraftLimit)}
          </span>
        </div>

        {/* Barre principale */}
        <div className={cn(
          'relative h-2.5 overflow-hidden rounded-full',
          isExceeded
            ? 'bg-red-200 dark:bg-red-900/30'
            : 'bg-amber-100 dark:bg-amber-900/20',
        )}>
          <div
            className={cn(
              'h-full rounded-full transition-all',
              isExceeded ? 'bg-red-500' : 'bg-amber-400',
            )}
            style={{ width: `${pct}%` }}
          />
          {/* Marqueur position */}
          {!isExceeded && (
            <div
              className="absolute top-0 h-full w-0.5 bg-amber-600"
              style={{ left: `${pct}%` }}
            />
          )}
        </div>

        {/* Marqueur position texte */}
        <div
          className="flex flex-col items-start text-[10px]"
          style={{ marginLeft: `${Math.min(pct, 90)}%` }}
        >
          <span className={isExceeded ? 'text-red-500' : 'text-amber-600'}>▲</span>
        </div>
      </div>

      {/* Chiffres clés */}
      {compact ? (
        <div className={cn(
          'text-xs font-medium',
          isExceeded ? 'text-red-600' : 'text-amber-700 dark:text-amber-400',
        )}>
          {isExceeded
            ? `${formatCurrency(overdraftUsed)} utilisé · dépassement de ${formatCurrency(excess)}`
            : `${formatCurrency(overdraftUsed)} / ${formatCurrency(overdraftLimit)} · ${formatCurrency(remaining)} restant`
          }
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <p className={cn('text-sm font-semibold', isExceeded ? 'text-red-600' : 'text-amber-600')}>
              {formatCurrency(overdraftUsed)}
            </p>
            <p className="text-[10px] text-neutral-400">utilisé</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-neutral-600 dark:text-neutral-300">
              {formatCurrency(overdraftLimit)}
            </p>
            <p className="text-[10px] text-neutral-400">autorisé</p>
          </div>
          <div>
            {isExceeded ? (
              <>
                <p className="text-sm font-semibold text-red-600">+{formatCurrency(excess)}</p>
                <p className="text-[10px] text-neutral-400">dépassement</p>
              </>
            ) : (
              <>
                <p className="text-sm font-semibold text-emerald-600">{formatCurrency(remaining)}</p>
                <p className="text-[10px] text-neutral-400">restant</p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
