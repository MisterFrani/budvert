import { supabase } from '@/lib/supabase'
import type { TablesInsert, TablesUpdate } from '@/types/database'

export async function listUserBudgets(userId: string) {
  const { data, error } = await supabase
    .from('budgets')
    .select('*')
    .eq('owner_id', userId)
    .order('created_at', { ascending: true })

  if (error) throw new Error(error.message)
  return data
}

export async function getBudget(id: string) {
  const { data, error } = await supabase
    .from('budgets')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function createBudget(budget: TablesInsert<'budgets'>) {
  const { data, error } = await supabase.from('budgets').insert(budget).select().single()

  if (error) throw new Error(error.message)
  return data
}

export async function updateBudget(id: string, updates: TablesUpdate<'budgets'>) {
  const { data, error } = await supabase
    .from('budgets')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function deleteBudget(id: string, totalBudgetCount: number) {
  if (totalBudgetCount <= 1) {
    throw new Error('Impossible de supprimer ton dernier budget')
  }

  const { error } = await supabase.from('budgets').delete().eq('id', id)

  if (error) throw new Error(error.message)
}
