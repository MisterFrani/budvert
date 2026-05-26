import { useQuery } from '@tanstack/react-query'

import { fetchCurrentProfile } from '@/features/auth/api'
import { useAuthStore } from '@/stores/authStore'

export function useCurrentProfile() {
  const { user } = useAuthStore()

  return useQuery({
    queryKey: ['profile', user?.id],
    queryFn: () => fetchCurrentProfile(user!.id),
    enabled: !!user,
    staleTime: 30_000,
  })
}
