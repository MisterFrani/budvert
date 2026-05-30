import { supabase } from '@/lib/supabase'
import type { TablesInsert, TablesUpdate } from '@/types/database'

export async function listDebts(budgetId: string) {
  const { data, error } = await supabase
    .from('debts')
    .select('*')
    .eq('budget_id', budgetId)
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data
}

export async function createDebt(
  budgetId: string,
  payload: Omit<TablesInsert<'debts'>, 'budget_id'>,
) {
  const { data, error } = await supabase
    .from('debts')
    .insert({ ...payload, budget_id: budgetId })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function updateDebt(id: string, payload: TablesUpdate<'debts'>) {
  const { data, error } = await supabase
    .from('debts')
    .update(payload)
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function deleteDebt(id: string) {
  const { error } = await supabase.from('debts').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

export async function payInstallment(
  debtId: string,
  creditor: string,
  budgetId: string,
  monthlyPayment: number,
) {
  const today = new Date().toISOString().split('T')[0]

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: payment, error: payError } = await supabase
    .from('debt_payments')
    .insert({ debt_id: debtId, amount: monthlyPayment, date: today })
    .select()
    .single()
  if (payError) throw new Error(payError.message)

  const { data: debt, error: fetchError } = await supabase
    .from('debts')
    .select('paid_amount')
    .eq('id', debtId)
    .single()
  if (fetchError) throw new Error(fetchError.message)

  const newPaidAmount = (debt.paid_amount ?? 0) + monthlyPayment

  const { error: updateError } = await supabase
    .from('debts')
    .update({ paid_amount: newPaidAmount })
    .eq('id', debtId)
  if (updateError) throw new Error(updateError.message)

  const { error: txError } = await supabase.from('transactions').insert({
    type: 'expense',
    amount: monthlyPayment,
    description: `Remboursement — ${creditor}`,
    date: today,
    category_id: null,
    debt_payment_id: payment.id,
    created_by: user.id,
    budget_id: budgetId,
  })
  if (txError) throw new Error(txError.message)

  return newPaidAmount
}
