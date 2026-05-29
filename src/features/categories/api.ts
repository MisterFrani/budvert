import { supabase } from '@/lib/supabase'
import type { TablesInsert, TablesUpdate } from '@/types/database'

export async function listCategories(budgetId: string) {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('budget_id', budgetId)
    .eq('is_income', false)
    .order('position', { ascending: true })

  if (error) throw new Error(error.message)
  return data
}

export async function createCategory(budgetId: string, payload: Omit<TablesInsert<'categories'>, 'budget_id'>) {
  const { data, error } = await supabase
    .from('categories')
    .insert({ ...payload, budget_id: budgetId })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function updateCategory(id: string, updates: TablesUpdate<'categories'>) {
  const { data, error } = await supabase
    .from('categories')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function deleteCategory(id: string) {
  const { error } = await supabase.from('categories').delete().eq('id', id)

  if (error) throw new Error(error.message)
}
