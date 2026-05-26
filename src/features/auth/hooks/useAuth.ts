import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import {
  signInWithMagicLink as apiMagicLink,
  signInWithPassword as apiSignIn,
  signOut as apiSignOut,
  signUpWithPassword as apiSignUp,
} from '@/features/auth/api'
import type { LoginFormData, MagicLinkFormData, SignupFormData } from '@/features/auth/schemas'
import { useAuthStore } from '@/stores/authStore'

export function useAuth() {
  const { user, session, isLoading } = useAuthStore()
  const queryClient = useQueryClient()

  async function signInWithPassword(data: LoginFormData) {
    const { error } = await apiSignIn(data.email, data.password)
    if (error) throw error
  }

  async function signUpWithPassword(data: SignupFormData) {
    const { error, data: result } = await apiSignUp(data.email, data.password, data.full_name)
    if (error) throw error
    return result
  }

  async function signInWithMagicLink(data: MagicLinkFormData) {
    const { error } = await apiMagicLink(data.email)
    if (error) throw error
  }

  async function signOut() {
    await apiSignOut()
    queryClient.clear()
    toast.success('Déconnecté')
  }

  return {
    user,
    session,
    isLoading,
    signInWithPassword,
    signUpWithPassword,
    signInWithMagicLink,
    signOut,
  }
}
