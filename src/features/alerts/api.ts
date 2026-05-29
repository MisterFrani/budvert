import { supabase } from '@/lib/supabase'

export async function listAlerts(budgetId: string) {
  const { data, error } = await supabase
    .from('alerts')
    .select('*')
    .eq('budget_id', budgetId)
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data
}

export async function markAllAlertsRead(budgetId: string) {
  const { error } = await supabase
    .from('alerts')
    .update({ is_read: true })
    .eq('budget_id', budgetId)
    .eq('is_read', false)

  if (error) throw new Error(error.message)
}
