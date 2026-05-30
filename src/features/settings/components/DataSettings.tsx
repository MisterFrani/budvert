import { endOfMonth, format, startOfMonth, subMonths } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Download, FileSpreadsheet } from 'lucide-react'
import Papa from 'papaparse'
import { useState } from 'react'
import { toast } from 'sonner'
import * as XLSX from 'xlsx'

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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { useActiveBudget } from '@/features/budgets/hooks/useActiveBudget'
import { useCategories } from '@/features/categories/hooks/useCategories'
import { useTransactions } from '@/features/transactions/hooks/useTransactions'
import type { Tables } from '@/types/database'

type Period = 'month' | '3months' | '6months' | 'year' | 'all'

type Transaction = Tables<'transactions'>

const PERIOD_LABELS: Record<Period, string> = {
  month: 'Ce mois',
  '3months': '3 derniers mois',
  '6months': '6 derniers mois',
  year: 'Cette année',
  all: 'Tout',
}

function getPeriodDates(period: Period): { startDate?: string; endDate?: string } {
  const now = new Date()
  if (period === 'all') return {}
  if (period === 'month') {
    return {
      startDate: format(startOfMonth(now), 'yyyy-MM-dd'),
      endDate: format(endOfMonth(now), 'yyyy-MM-dd'),
    }
  }
  if (period === '3months') {
    return {
      startDate: format(startOfMonth(subMonths(now, 2)), 'yyyy-MM-dd'),
      endDate: format(endOfMonth(now), 'yyyy-MM-dd'),
    }
  }
  if (period === '6months') {
    return {
      startDate: format(startOfMonth(subMonths(now, 5)), 'yyyy-MM-dd'),
      endDate: format(endOfMonth(now), 'yyyy-MM-dd'),
    }
  }
  return {
    startDate: format(new Date(now.getFullYear(), 0, 1), 'yyyy-MM-dd'),
    endDate: format(new Date(now.getFullYear(), 11, 31), 'yyyy-MM-dd'),
  }
}

function buildRows(
  transactions: Transaction[],
  categoryMap: Record<string, string>,
) {
  return transactions.map((t) => ({
    Date: format(new Date(t.date), 'dd/MM/yyyy', { locale: fr }),
    Type: t.type === 'expense' ? 'Dépense' : 'Revenu',
    Montant: t.amount,
    Description: t.description,
    Catégorie: t.category_id ? (categoryMap[t.category_id] ?? 'Sans catégorie') : 'Sans catégorie',
    Note: t.notes ?? '',
    Récurrente: t.is_recurring ? 'Oui' : 'Non',
  }))
}

export function DataSettings() {
  const { activeBudgetId } = useActiveBudget()
  const [period, setPeriod] = useState<Period>('month')
  const [deleteConfirm, setDeleteConfirm] = useState('')
  const [deleteOpen, setDeleteOpen] = useState(false)

  const dates = getPeriodDates(period)
  const { data: transactions } = useTransactions(activeBudgetId, {
    startDate: dates.startDate,
    endDate: dates.endDate,
    limit: 10_000,
  })
  const { data: categories } = useCategories(activeBudgetId)

  const categoryMap: Record<string, string> = {}
  for (const cat of categories ?? []) {
    categoryMap[cat.id] = cat.name
  }

  function exportCSV() {
    if (!transactions?.length) {
      toast.error('Aucune transaction à exporter')
      return
    }
    const rows = buildRows(transactions, categoryMap)
    const csv = Papa.unparse(rows, { delimiter: ';' })
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `budvert-transactions-${format(new Date(), 'yyyy-MM-dd')}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Export CSV téléchargé')
  }

  function exportExcel() {
    if (!transactions?.length) {
      toast.error('Aucune transaction à exporter')
      return
    }
    const rows = buildRows(transactions, categoryMap)
    const ws = XLSX.utils.json_to_sheet(rows)
    ws['!cols'] = [
      { wch: 12 },
      { wch: 10 },
      { wch: 10 },
      { wch: 30 },
      { wch: 18 },
      { wch: 25 },
      { wch: 12 },
    ]
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Transactions')
    XLSX.writeFile(wb, `budvert-transactions-${format(new Date(), 'yyyy-MM-dd')}.xlsx`)
    toast.success('Export Excel téléchargé')
  }

  return (
    <div className="max-w-xl space-y-8">
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-medium">Export des données</h2>
          <p className="text-sm text-neutral-500">Exporte les transactions du budget actif</p>
        </div>

        <div className="space-y-1.5">
          <Label>Période</Label>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(PERIOD_LABELS) as Period[]).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPeriod(p)}
                className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
                  period === p
                    ? 'border-indigo-200 bg-indigo-50 text-indigo-600'
                    : 'border-neutral-200 text-neutral-500 hover:border-neutral-300'
                }`}
              >
                {PERIOD_LABELS[p]}
              </button>
            ))}
          </div>
          <p className="text-xs text-neutral-400">
            {transactions?.length ?? 0} transaction(s) dans cette période
          </p>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" className="gap-2" onClick={exportCSV}>
            <Download className="h-4 w-4" />
            Exporter CSV
          </Button>
          <Button variant="outline" className="gap-2" onClick={exportExcel}>
            <FileSpreadsheet className="h-4 w-4" />
            Exporter Excel
          </Button>
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-medium text-red-600">Zone de danger</h2>
          <p className="text-sm text-neutral-500">
            Ces actions sont irréversibles. Procède avec prudence.
          </p>
        </div>
        <Button
          variant="outline"
          className="border-red-200 text-red-500 hover:bg-red-50 hover:text-red-600"
          onClick={() => setDeleteOpen(true)}
        >
          Supprimer toutes mes données
        </Button>
      </div>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer toutes vos données ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action supprimera définitivement toutes vos transactions, catégories, objectifs
              et dettes. Votre compte sera conservé. Pour confirmer, tapez&nbsp;
              <strong>SUPPRIMER</strong> ci-dessous.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="px-6 pb-2">
            <Input
              placeholder="SUPPRIMER"
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteConfirm('')}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 hover:bg-red-600"
              disabled={deleteConfirm !== 'SUPPRIMER'}
              onClick={() => {
                setDeleteOpen(false)
                setDeleteConfirm('')
                toast.info('Fonctionnalité à venir')
              }}
            >
              Supprimer définitivement
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
