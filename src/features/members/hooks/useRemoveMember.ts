import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { removeMember } from '@/features/members/api'

type Vars = {
  memberId: string
  budgetId: string
}

export function useRemoveMember() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ memberId }: Vars) => removeMember(memberId),
    onSuccess: (_data, { budgetId }) => {
      queryClient.invalidateQueries({ queryKey: ['members', budgetId] })
      toast.success('Membre retiré')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}
