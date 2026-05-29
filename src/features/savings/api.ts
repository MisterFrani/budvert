import { supabase } from '@/lib/supabase'

export async function listSavingsGoals(budgetId: string) {
  const { data, error } = await supabase
    .from('savings_goals')
    .select('*')
    .eq('budget_id', budgetId)
    .order('target_date', { ascending: true, nullsFirst: false })

  if (error) throw new Error(error.message)
  return data
}
