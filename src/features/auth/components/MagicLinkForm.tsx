import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Mail } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { type MagicLinkFormData,magicLinkSchema } from '@/features/auth/schemas'

export function MagicLinkForm() {
  const { signInWithMagicLink } = useAuth()
  const [sent, setSent] = useState(false)
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<MagicLinkFormData>({ resolver: zodResolver(magicLinkSchema) })

  async function onSubmit(data: MagicLinkFormData) {
    try {
      await signInWithMagicLink(data)
      setSent(true)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Une erreur est survenue'
      setError('root', { message })
    }
  }

  if (sent) {
    return (
      <div className="space-y-3 py-4 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50">
          <Mail className="h-6 w-6 text-[#6366f1]" />
        </div>
        <p className="font-medium">Vérifie ta boîte mail</p>
        <p className="text-sm text-neutral-500">
          Un lien magique t'a été envoyé. Il expire dans 1 heure.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="magic-email">Email</Label>
        <Input
          id="magic-email"
          type="email"
          placeholder="toi@exemple.com"
          autoComplete="email"
          {...register('email')}
        />
        {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
      </div>

      {errors.root && (
        <p className="text-center text-sm text-red-500">{errors.root.message}</p>
      )}

      <Button type="submit" className="h-11 w-full font-medium" disabled={isSubmitting}>
        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Envoyer le lien
      </Button>
    </form>
  )
}
