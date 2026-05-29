import { z } from 'zod'

export const savingsGoalSchema = z.object({
  name: z.string().min(2, 'Minimum 2 caractères').max(50),
  icon: z.string().optional(),
  target_amount: z.coerce.number().positive('Montant cible requis'),
  current_amount: z.coerce.number().min(0).optional(),
  target_date: z.string().optional(),
})

export type SavingsGoalData = z.infer<typeof savingsGoalSchema>

export const contributionSchema = z.object({
  amount: z.coerce.number().positive('Le montant doit être supérieur à 0'),
  note: z.string().optional(),
  date: z.string(),
})

export type ContributionData = z.infer<typeof contributionSchema>
