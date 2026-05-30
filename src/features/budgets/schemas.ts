import { z } from 'zod'

import { BUDGET_COLORS } from '@/lib/constants'

export const BUDGET_TYPE_VALUES = ['personal', 'couple', 'colocation', 'project'] as const

export const createBudgetSchema = z.object({
  name: z.string().min(2, 'Minimum 2 caractères').max(50, 'Maximum 50 caractères'),
  type: z.enum(BUDGET_TYPE_VALUES, { required_error: 'Choisis un type de budget' }),
  color: z.string().refine((c) => (BUDGET_COLORS as readonly string[]).includes(c), {
    message: 'Couleur invalide',
  }),
  overdraft_limit: z.number().min(0, 'Doit être ≥ 0').default(0),
})

export const updateBudgetSchema = createBudgetSchema.partial()

export type CreateBudgetData = z.infer<typeof createBudgetSchema>
export type UpdateBudgetData = z.infer<typeof updateBudgetSchema>
