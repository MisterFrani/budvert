import { z } from 'zod'

export const BUDGET_TYPE_VALUES = ['personal', 'couple', 'colocation', 'project'] as const

export const step1Schema = z.object({
  name: z.string().min(2, 'Minimum 2 caractères'),
  type: z.enum(BUDGET_TYPE_VALUES, { required_error: 'Choisis un type de budget' }),
  color: z.string().min(1, 'Choisis une couleur'),
})

export const step2Schema = z.object({
  categories: z.array(
    z.object({
      id: z.string(),
      name: z.string().min(1, 'Nom requis'),
      amount: z.coerce.number().min(0, 'Montant invalide'),
      type: z.enum(['fixed', 'budget']),
    }),
  ),
})

export const step3Schema = z.object({
  monthly_income: z.coerce.number().min(0, 'Montant invalide'),
})

export type Step1Data = z.infer<typeof step1Schema>
export type Step2Data = z.infer<typeof step2Schema>
export type Step3Data = z.infer<typeof step3Schema>
