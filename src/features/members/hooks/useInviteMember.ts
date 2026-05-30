import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { inviteMember, type MemberInvitePayload } from '@/features/members/api'

type Vars = {
  budgetId: string
  payload: MemberInvitePayload
}

export function useInviteMember() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ budgetId, payload }: Vars) => inviteMember(budgetId, payload),
    onSuccess: (_data, { budgetId }) => {
      queryClient.invalidateQueries({ queryKey: ['members', budgetId] })
      toast.success('Invitation envoyée')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}
