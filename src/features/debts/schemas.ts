import { z } from 'zod'

export const debtSchema = z.object({
  creditor: z.string().min(1, 'Créancier requis'),
  total_amount: z.coerce.number().positive('Montant total requis'),
  paid_amount: z.coerce.number().min(0).optional(),
  monthly_payment: z.coerce.number().positive('Mensualité requise'),
  interest_rate: z.coerce.number().min(0).optional(),
  end_date: z.string().optional(),
})

export type DebtData = z.infer<typeof debtSchema>
