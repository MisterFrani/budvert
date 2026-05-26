import { supabase } from '@/lib/supabase'
import type { TablesUpdate } from '@/types/database'

export async function fetchCategoriesByBudget(budgetId: string) {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('budget_id', budgetId)
    .eq('is_income', false)
    .order('position', { ascending: true })

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
