import { supabase } from '@/lib/supabase'
import type { TablesInsert } from '@/types/database'

export type MemberInvitePayload = {
  email: string
  display_name: string
  avatar_color: string
}

export async function listMembers(budgetId: string) {
  const { data, error } = await supabase
    .from('budget_members')
    .select('*')
    .eq('budget_id', budgetId)
    .neq('status', 'removed')
    .order('created_at', { ascending: true })

  if (error) throw new Error(error.message)
  return data
}

export async function inviteMember(
  budgetId: string,
  payload: MemberInvitePayload,
) {
  const insert: TablesInsert<'budget_members'> = {
    budget_id: budgetId,
    invited_email: payload.email,
    display_name: payload.display_name,
    avatar_color: payload.avatar_color,
    role: 'member',
    status: 'pending',
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', payload.email)
    .maybeSingle()

  if (profile) {
    insert.user_id = profile.id
    insert.status = 'active'
  }

  const { data, error } = await supabase
    .from('budget_members')
    .insert(insert)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function removeMember(memberId: string) {
  const { error } = await supabase
    .from('budget_members')
    .update({ status: 'removed' })
    .eq('id', memberId)

  if (error) throw new Error(error.message)
}
