import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { CheckCircle2, Lock } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { updateProfile } from '@/features/auth/api'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useCurrentProfile } from '@/features/auth/hooks/useCurrentProfile'
import { supabase } from '@/lib/supabase'
import { useQueryClient } from '@tanstack/react-query'

const AVATAR_COLORS = [
  '#6366f1', '#ef4444', '#f59e0b', '#10b981',
  '#06b6d4', '#ec4899', '#8b5cf6', '#f97316',
]

const profileSchema = z.object({
  full_name: z.string().min(2, 'Minimum 2 caractères'),
})

const passwordSchema = z.object({
  password: z.string().min(8, 'Minimum 8 caractères'),
  confirm: z.string(),
}).refine((d) => d.password === d.confirm, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirm'],
})

type ProfileForm = z.infer<typeof profileSchema>
type PasswordForm = z.infer<typeof passwordSchema>

function getInitials(name: string | null | undefined, email: string): string {
  if (name) {
    const parts = name.trim().split(' ')
    return parts.length >= 2
      ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
      : parts[0].slice(0, 2).toUpperCase()
  }
  return email.slice(0, 2).toUpperCase()
}

export function ProfileSettings() {
  const { user } = useAuth()
  const { data: profile } = useCurrentProfile()
  const queryClient = useQueryClient()
  const [selectedColor, setSelectedColor] = useState<string | null>(null)
  const [pwdOpen, setPwdOpen] = useState(false)
  const [pwdLoading, setPwdLoading] = useState(false)

  const email = user?.email ?? ''
  const avatarColor = selectedColor ?? profile?.avatar_color ?? '#6366f1'
  const initials = getInitials(profile?.full_name, email)
  const isVerified = !!user?.email_confirmed_at
  const memberSince = profile?.created_at
    ? format(new Date(profile.created_at), 'd MMMM yyyy', { locale: fr })
    : null

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: { full_name: profile?.full_name ?? '' },
  })

  const pwdForm = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
  })

  async function onSaveProfile(values: ProfileForm) {
    if (!user) return
    await updateProfile(user.id, {
      full_name: values.full_name,
      avatar_color: avatarColor,
    })
    queryClient.invalidateQueries({ queryKey: ['profile', user.id] })
    toast.success('Profil mis à jour')
  }

  async function onChangePassword(values: PasswordForm) {
    setPwdLoading(true)
    const { error } = await supabase.auth.updateUser({ password: values.password })
    setPwdLoading(false)
    if (error) {
      toast.error(error.message)
      return
    }
    toast.success('Mot de passe mis à jour')
    setPwdOpen(false)
    pwdForm.reset()
  }

  return (
    <div className="max-w-xl space-y-6">
      {/* Mon profil */}
      <div className="rounded-xl border border-neutral-200 bg-white p-6 dark:border-[#262626] dark:bg-[#171717]">
        <h2 className="mb-5 text-lg font-medium">Mon profil</h2>

        <div className="mb-6 flex flex-col items-center gap-3">
          <Avatar className="h-20 w-20">
            <AvatarFallback
              className="text-2xl font-semibold text-white"
              style={{ backgroundColor: avatarColor }}
            >
              {initials}
            </AvatarFallback>
          </Avatar>
          <p className="text-sm text-neutral-400">{email}</p>
          <div className="flex gap-2">
            {AVATAR_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setSelectedColor(c)}
                className="h-6 w-6 rounded-full ring-offset-2 transition-all"
                style={{
                  backgroundColor: c,
                  outline: avatarColor === c ? `2px solid ${c}` : 'none',
                  outlineOffset: '2px',
                }}
                aria-label={`Couleur ${c}`}
              />
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit(onSaveProfile)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="full_name">Prénom et nom</Label>
            <Input id="full_name" {...register('full_name')} placeholder="Jean Dupont" />
            {errors.full_name && (
              <p className="text-xs text-red-500">{errors.full_name.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={email} disabled className="text-neutral-400" />
            <p className="text-xs text-neutral-400">L'email ne peut pas être modifié</p>
          </div>

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Enregistrement…' : 'Enregistrer'}
          </Button>
        </form>
      </div>

      {/* Sécurité */}
      <div className="rounded-xl border border-neutral-200 bg-white p-6 dark:border-[#262626] dark:bg-[#171717]">
        <h2 className="mb-4 text-lg font-medium">Sécurité</h2>
        <Button variant="outline" className="gap-2" onClick={() => setPwdOpen(true)}>
          <Lock className="h-4 w-4" />
          Changer mon mot de passe
        </Button>
      </div>

      {/* Compte */}
      <div className="rounded-xl border border-neutral-200 bg-white p-6 dark:border-[#262626] dark:bg-[#171717]">
        <h2 className="mb-4 text-lg font-medium">Compte</h2>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-neutral-600 dark:text-neutral-300">{email}</span>
            {isVerified ? (
              <Badge className="gap-1 bg-emerald-100 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400">
                <CheckCircle2 className="h-3 w-3" />
                Vérifié
              </Badge>
            ) : (
              <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 dark:bg-amber-900/20 dark:text-amber-400">
                Non vérifié
              </Badge>
            )}
          </div>
          {memberSince && (
            <p className="text-sm text-neutral-400">Membre depuis {memberSince}</p>
          )}
        </div>
      </div>

      {/* Dialog mot de passe */}
      <Dialog open={pwdOpen} onOpenChange={setPwdOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Changer mon mot de passe</DialogTitle>
          </DialogHeader>
          <form onSubmit={pwdForm.handleSubmit(onChangePassword)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="password">Nouveau mot de passe</Label>
              <Input id="password" type="password" {...pwdForm.register('password')} />
              {pwdForm.formState.errors.password && (
                <p className="text-xs text-red-500">{pwdForm.formState.errors.password.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirm">Confirmer</Label>
              <Input id="confirm" type="password" {...pwdForm.register('confirm')} />
              {pwdForm.formState.errors.confirm && (
                <p className="text-xs text-red-500">{pwdForm.formState.errors.confirm.message}</p>
              )}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setPwdOpen(false)}>
                Annuler
              </Button>
              <Button type="submit" disabled={pwdLoading}>
                {pwdLoading ? 'Mise à jour…' : 'Confirmer'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
