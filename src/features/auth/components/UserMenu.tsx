import type { DropdownMenuContentProps } from '@radix-ui/react-dropdown-menu'
import { LogOut, Settings } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useCurrentProfile } from '@/features/auth/hooks/useCurrentProfile'

function getInitials(name: string | null | undefined, email: string): string {
  if (name) {
    const parts = name.trim().split(' ')
    return parts.length >= 2
      ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
      : parts[0].slice(0, 2).toUpperCase()
  }
  return email.slice(0, 2).toUpperCase()
}

type Props = {
  side?: DropdownMenuContentProps['side']
  align?: DropdownMenuContentProps['align']
}

export function UserMenu({ side = 'top', align = 'start' }: Props) {
  const { user, signOut } = useAuth()
  const { data: profile } = useCurrentProfile()
  const navigate = useNavigate()

  if (!user) return null

  const email = user.email ?? ''
  const initials = getInitials(profile?.full_name, email)
  const avatarColor = profile?.avatar_color ?? '#6366f1'
  const displayName = profile?.full_name ?? email.split('@')[0]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="rounded-full ring-offset-1 transition-all hover:ring-2 hover:ring-neutral-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-200 dark:hover:ring-neutral-700"
        >
          <Avatar className="h-8 w-8">
            <AvatarFallback
              className="text-xs font-semibold text-white"
              style={{ backgroundColor: avatarColor }}
            >
              {initials}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent side={side} align={align} className="min-w-56" sideOffset={8}>
        <DropdownMenuLabel className="bg-neutral-50 px-4 py-3 dark:bg-neutral-900">
          <p className="text-sm font-semibold leading-none">{displayName}</p>
          <p className="mt-1 text-sm font-normal text-neutral-500 dark:text-neutral-400">{email}</p>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          className="gap-2 px-4 py-2 cursor-pointer"
          onClick={() => navigate('/parametres')}
        >
          <Settings className="h-4 w-4" />
          Paramètres
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          className="gap-2 px-4 py-2 cursor-pointer text-red-500 focus:bg-red-50 focus:text-red-500 dark:focus:bg-red-900/10"
          onClick={signOut}
        >
          <LogOut className="h-4 w-4" />
          Se déconnecter
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
