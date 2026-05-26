import { Check, ChevronsUpDown, Plus } from 'lucide-react'
import { useState } from 'react'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { CreateBudgetDialog } from '@/features/budgets/components/CreateBudgetDialog'
import { useActiveBudget } from '@/features/budgets/hooks/useActiveBudget'
import { useUserBudgets } from '@/features/budgets/hooks/useUserBudgets'
import { cn } from '@/lib/utils'
import { useBudgetStore } from '@/stores/budgetStore'

export function BudgetSwitcher() {
  const { budget: activeBudget, activeBudgetId } = useActiveBudget()
  const { data: budgets } = useUserBudgets()
  const { setActiveBudgetId } = useBudgetStore()
  const [createOpen, setCreateOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)

  return (
    <>
      <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <button className="flex h-11 w-full items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 transition-colors hover:bg-neutral-50 dark:border-[#262626] dark:bg-[#171717] dark:hover:bg-[#1f1f1f]">
            {activeBudget && (
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: activeBudget.color }}
              />
            )}
            <span className="flex-1 truncate text-left text-sm font-medium">
              {activeBudget?.name ?? '…'}
            </span>
            <ChevronsUpDown className="h-4 w-4 shrink-0 text-neutral-400" />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="start" sideOffset={4} className="w-[--radix-dropdown-menu-trigger-width]">
          <DropdownMenuLabel className="px-2 py-1.5 text-xs uppercase text-neutral-500">
            Tes budgets
          </DropdownMenuLabel>

          {budgets?.map((b) => (
            <DropdownMenuItem
              key={b.id}
              className="cursor-pointer gap-2"
              onClick={() => {
                setActiveBudgetId(b.id)
                setDropdownOpen(false)
              }}
            >
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: b.color }}
              />
              <span className="flex-1 truncate">{b.name}</span>
              {b.id === activeBudgetId && <Check className="ml-auto h-4 w-4 text-[#6366f1]" />}
            </DropdownMenuItem>
          ))}

          <DropdownMenuSeparator />

          <DropdownMenuItem
            className={cn('cursor-pointer gap-2')}
            onClick={() => {
              setDropdownOpen(false)
              setCreateOpen(true)
            }}
          >
            <Plus className="h-4 w-4" />
            Nouveau budget
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <CreateBudgetDialog open={createOpen} onOpenChange={setCreateOpen} />
    </>
  )
}
