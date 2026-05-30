import { z } from 'zod'

export const transactionSchema = z.object({
  type: z.enum(['expense', 'income']),
  amount: z.coerce.number().min(0.01, 'Montant invalide'),
  description: z.string().min(1, 'Description requise'),
  date: z.string().min(1, 'Date requise'),
  category_id: z.string().optional(),
  member_id: z.string().nullable().optional(),
  notes: z.string().optional(),
  is_recurring: z.boolean().default(false),
  recurrence_rule: z.enum(['monthly', 'weekly']).optional(),
})

export type TransactionData = z.infer<typeof transactionSchema>
