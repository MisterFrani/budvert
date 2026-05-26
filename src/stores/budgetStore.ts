import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type BudgetState = {
  activeBudgetId: string | null
  setActiveBudgetId: (id: string) => void
  clearActiveBudgetId: () => void
}

export const useBudgetStore = create<BudgetState>()(
  persist(
    (set) => ({
      activeBudgetId: null,
      setActiveBudgetId: (id) => set({ activeBudgetId: id }),
      clearActiveBudgetId: () => set({ activeBudgetId: null }),
    }),
    { name: 'budvert-active-budget' },
  ),
)
