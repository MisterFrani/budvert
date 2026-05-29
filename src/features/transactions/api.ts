import { supabase } from '@/lib/supabase'
import type { TablesInsert, TablesUpdate } from '@/types/database'

export type TransactionFilters = {
  startDate?: string
  endDate?: string
  type?: string
  limit?: number
  offset?: number
}

export async function listTransactions(budgetId: string, filters?: TransactionFilters) {
  let query = supabase
    .from('transactions')
    .select('*')
    .eq('budget_id', budgetId)
    .order('date', { ascending: false })
    .order('created_at', { ascending: false })

  if (filters?.startDate) query = query.gte('date', filters.startDate)
  if (filters?.endDate) query = query.lte('date', filters.endDate)
  if (filters?.type === 'expense' || filters?.type === 'income') {
    query = query.eq('type', filters.type)
  }
  if (filters?.type === 'recurring') {
    query = query.eq('is_recurring', true)
  }

  const limit = filters?.limit ?? 50
  const offset = filters?.offset ?? 0
  query = query.range(offset, offset + limit - 1)

  const { data, error } = await query

  if (error) throw new Error(error.message)
  return data
}

export async function createTransaction(payload: TablesInsert<'transactions'>) {
  const { data, error } = await supabase
    .from('transactions')
    .insert(payload)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function updateTransaction(id: string, updates: TablesUpdate<'transactions'>) {
  const { data, error } = await supabase
    .from('transactions')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function deleteTransaction(id: string) {
  const { error } = await supabase.from('transactions').delete().eq('id', id)

  if (error) throw new Error(error.message)
}
