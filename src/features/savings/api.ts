import { supabase } from '@/lib/supabase'
import type { TablesInsert, TablesUpdate } from '@/types/database'

export async function listSavingsGoals(budgetId: string) {
  const { data, error } = await supabase
    .from('savings_goals')
    .select('*')
    .eq('budget_id', budgetId)
    .order('target_date', { ascending: true, nullsFirst: false })

  if (error) throw new Error(error.message)
  return data
}

export async function createSavingsGoal(
  budgetId: string,
  payload: Omit<TablesInsert<'savings_goals'>, 'budget_id'>,
) {
  const { data, error } = await supabase
    .from('savings_goals')
    .insert({ ...payload, budget_id: budgetId })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function updateSavingsGoal(id: string, payload: TablesUpdate<'savings_goals'>) {
  const { data, error } = await supabase
    .from('savings_goals')
    .update(payload)
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function deleteSavingsGoal(id: string) {
  const { error } = await supabase.from('savings_goals').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

export async function addContribution(
  goalId: string,
  goalName: string,
  budgetId: string,
  amount: number,
  note?: string,
  date?: string,
) {
  const today = date ?? new Date().toISOString().split('T')[0]

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: contribution, error: contribError } = await supabase
    .from('savings_contributions')
    .insert({ goal_id: goalId, amount, note: note ?? null, date: today })
    .select()
    .single()
  if (contribError) throw new Error(contribError.message)

  const { data: goal, error: fetchError } = await supabase
    .from('savings_goals')
    .select('current_amount')
    .eq('id', goalId)
    .single()
  if (fetchError) throw new Error(fetchError.message)

  const { error: updateError } = await supabase
    .from('savings_goals')
    .update({ current_amount: (goal.current_amount ?? 0) + amount })
    .eq('id', goalId)
  if (updateError) throw new Error(updateError.message)

  const { error: txError } = await supabase.from('transactions').insert({
    type: 'expense',
    amount,
    description: `Virement épargne — ${goalName}`,
    date: today,
    category_id: null,
    savings_contribution_id: contribution.id,
    created_by: user.id,
    budget_id: budgetId,
  })
  if (txError) throw new Error(txError.message)
}
