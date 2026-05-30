import { format, startOfMonth } from 'date-fns'
import {
  Info,
  Loader2,
  UserMinus,
  Users,
} from 'lucide-react'
import { useMemo, useState } from 'react'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { useCurrentProfile } from '@/features/auth/hooks/useCurrentProfile'
import { useActiveBudget } from '@/features/budgets/hooks/useActiveBudget'
import { useCategories } from '@/features/categories/hooks/useCategories'
import { useInviteMember } from '@/features/members/hooks/useInviteMember'
import { useMembers } from '@/features/members/hooks/useMembers'
import { useRemoveMember } from '@/features/members/hooks/useRemoveMember'
import { useTransactions } from '@/features/transactions/hooks/useTransactions'
import { getCategoryIcon } from '@/lib/constants'
import { formatCurrency } from '@/lib/format'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/authStore'
import type { Tables } from '@/types/database'

type Member = Tables<'budget_members'>

const AVATAR_COLORS = [
  { label: 'Indigo', value: '#6366f1' },
  { label: 'Rouge', value: '#ef4444' },
  { label: 'Vert', value: '#10b981' },
  { label: 'Ambre', value: '#f59e0b' },
  { label: 'Cyan', value: '#06b6d4' },
  { label: 'Rose', value: '#ec4899' },
]

function getInitials(name: string) {
  return name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

function statusLabel(status: string) {
  if (status === 'active') return { text: 'Actif', className: 'bg-green-100 text-green-700' }
  if (status === 'pending') return { text: 'En attente', className: 'bg-amber-100 text-amber-700' }
  return { text: 'Retiré', className: 'bg-red-100 text-red-700' }
}

type InviteFormProps = {
  budgetId: string
  compact?: boolean
}

function InviteForm({ budgetId, compact = false }: InviteFormProps) {
  const invite = useInviteMember()
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [color, setColor] = useState(AVATAR_COLORS[0].value)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!displayName.trim() || !email.trim()) return
    await invite.mutateAsync({
      budgetId,
      payload: { display_name: displayName.trim(), email: email.trim(), avatar_color: color },
    })
    setDisplayName('')
    setEmail('')
    setColor(AVATAR_COLORS[0].value)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label>Prénom / Nom</Label>
        <Input
          placeholder="Ex: Solène Martin"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          required
        />
      </div>
      <div className="space-y-1.5">
        <Label>Email</Label>
        <Input
          type="email"
          placeholder="solene@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label>Couleur de l&apos;avatar</Label>
        <div className="flex gap-2">
          {AVATAR_COLORS.map((c) => (
            <button
              key={c.value}
              type="button"
              aria-label={c.label}
              onClick={() => setColor(c.value)}
              className={cn(
                'h-7 w-7 rounded-full transition-transform',
                color === c.value ? 'ring-2 ring-offset-2 scale-110' : 'opacity-70 hover:opacity-100',
              )}
              style={{ backgroundColor: c.value, ringColor: c.value }}
            />
          ))}
        </div>
      </div>
      <Button
        type="submit"
        disabled={invite.isPending}
        className={cn(compact ? '' : 'w-full')}
      >
        {invite.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Envoyer l&apos;invitation
      </Button>
      {!compact && (
        <p className="flex items-center gap-1.5 text-xs text-neutral-400">
          <Info className="h-3.5 w-3.5 shrink-0" />
          La personne recevra un email pour rejoindre budvert
        </p>
      )}
    </form>
  )
}

type MemberCardProps = {
  member: Member
  isOwner?: boolean
  totalGroupExpenses: number
  memberExpenses: number
  topCategories: { name: string; icon: string; total: number }[]
  onRemove: (member: Member) => void
}

function MemberCard({
  member,
  isOwner = false,
  totalGroupExpenses,
  memberExpenses,
  topCategories,
  onRemove,
}: MemberCardProps) {
  const pct =
    totalGroupExpenses > 0
      ? Math.round((memberExpenses / totalGroupExpenses) * 100)
      : 0

  const badge = statusLabel(member.status)

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-5 dark:border-[#262626] dark:bg-[#171717]">
      <div className="mb-4 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white"
            style={{ backgroundColor: member.avatar_color }}
          >
            {getInitials(member.display_name)}
          </div>
          <div>
            <p className="font-semibold">{member.display_name}</p>
            <div className="mt-0.5 flex items-center gap-1.5">
              <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-medium', isOwner ? 'bg-indigo-100 text-indigo-700' : 'bg-neutral-100 text-neutral-600')}>
                {isOwner ? 'Propriétaire' : 'Membre'}
              </span>
              <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-medium', badge.className)}>
                {badge.text}
              </span>
            </div>
          </div>
        </div>
        {!isOwner && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-red-500 hover:text-red-600"
            onClick={() => onRemove(member)}
          >
            <UserMinus className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="text-xs text-neutral-400">Dépensé ce mois</p>
          <p className={cn('text-lg font-bold', memberExpenses > 0 ? 'text-red-500' : 'text-neutral-700 dark:text-neutral-300')}>
            {formatCurrency(memberExpenses)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-neutral-400">Part du groupe</p>
          <p className="text-lg font-bold">{pct}%</p>
        </div>
      </div>

      {topCategories.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-neutral-400">Top catégories</p>
          {topCategories.map((cat) => {
            const Icon = getCategoryIcon(cat.icon)
            return (
              <div key={cat.name} className="flex items-center gap-2">
                <Icon className="h-3.5 w-3.5 shrink-0 text-neutral-400" />
                <span className="flex-1 truncate text-sm">{cat.name}</span>
                <span className="text-sm font-medium text-red-500">{formatCurrency(cat.total)}</span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function SharePage() {
  const { activeBudgetId, budget } = useActiveBudget()
  const { user } = useAuthStore()
  const { data: profile } = useCurrentProfile()
  const { data: members, isPending: membersPending } = useMembers(activeBudgetId)
  const { data: categories } = useCategories(activeBudgetId)

  const now = new Date()
  const startDate = format(startOfMonth(now), 'yyyy-MM-dd')
  const endDate = format(now, 'yyyy-MM-dd')

  const { data: transactions } = useTransactions(activeBudgetId, { startDate, endDate })

  const [removeTarget, setRemoveTarget] = useState<Member | null>(null)
  const removeM = useRemoveMember()

  const activeMembers = useMemo(
    () => members?.filter((m) => m.status !== 'removed') ?? [],
    [members],
  )

  const monthlyStats = useMemo(() => {
    if (!transactions) return { totalIncome: 0, totalExpenses: 0 }
    return {
      totalIncome: transactions
        .filter((t) => t.type === 'income')
        .reduce((s, t) => s + t.amount, 0),
      totalExpenses: transactions
        .filter((t) => t.type === 'expense')
        .reduce((s, t) => s + t.amount, 0),
    }
  }, [transactions])

  const memberStats = useMemo(() => {
    const expenses = transactions?.filter((t) => t.type === 'expense') ?? []

    const byMember = new Map<string | null, number>()
    const catByMember = new Map<string | null, Map<string, number>>()

    for (const t of expenses) {
      const mid = t.member_id ?? null
      byMember.set(mid, (byMember.get(mid) ?? 0) + t.amount)

      if (!catByMember.has(mid)) catByMember.set(mid, new Map())
      const catMap = catByMember.get(mid)!
      const key = t.category_id ?? ''
      catMap.set(key, (catMap.get(key) ?? 0) + t.amount)
    }

    return { byMember, catByMember }
  }, [transactions])

  function getTopCategories(memberId: string | null) {
    const catMap = memberStats.catByMember.get(memberId)
    if (!catMap) return []
    return Array.from(catMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([catId, total]) => {
        const cat = categories?.find((c) => c.id === catId)
        return {
          name: cat?.name ?? 'Sans catégorie',
          icon: cat?.icon ?? 'package',
          total,
        }
      })
  }

  const ownerAsVirtualMember: Member | null = useMemo(() => {
    if (!budget || !user) return null
    return {
      id: budget.owner_id,
      budget_id: budget.id,
      user_id: user.id,
      invited_email: profile?.email ?? '',
      display_name: profile?.full_name ?? 'Moi',
      avatar_color: profile?.avatar_color ?? '#6366f1',
      role: 'owner',
      status: 'active',
      created_at: budget.created_at,
      joined_at: budget.created_at,
    }
  }, [budget, user, profile])

  if (!activeBudgetId || membersPending) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  const hasMembers = activeMembers.length > 0

  if (!hasMembers) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-6">
        <div className="w-full max-w-lg space-y-6">
          <div className="text-center">
            <Users className="mx-auto mb-4 h-12 w-12 text-indigo-400" />
            <h2 className="text-xl font-semibold">Inviter quelqu&apos;un à ce budget</h2>
            <p className="mt-1 text-sm text-neutral-500">
              Partage ce budget avec un proche pour suivre vos dépenses ensemble
            </p>
          </div>
          <InviteForm budgetId={activeBudgetId} />
        </div>
      </div>
    )
  }

  const allSegments: { memberId: string | null; color: string; name: string; amount: number }[] = []

  if (ownerAsVirtualMember) {
    const amount = memberStats.byMember.get(user?.id ?? null) ?? 0
    allSegments.push({
      memberId: user?.id ?? null,
      color: ownerAsVirtualMember.avatar_color,
      name: ownerAsVirtualMember.display_name,
      amount,
    })
  }

  for (const m of activeMembers) {
    const amount = memberStats.byMember.get(m.user_id) ?? 0
    allSegments.push({ memberId: m.user_id, color: m.avatar_color, name: m.display_name, amount })
  }

  const unattributed = memberStats.byMember.get(null) ?? 0
  if (unattributed > 0) {
    allSegments.push({ memberId: null, color: '#d4d4d4', name: 'Non attribué', amount: unattributed })
  }

  const totalForBar = allSegments.reduce((s, seg) => s + seg.amount, 0)

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-semibold">Budget partagé</h1>

      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-[#262626] dark:bg-[#171717]">
          <p className="mb-1 text-xs text-neutral-500">Revenus totaux</p>
          <p className="text-lg font-semibold text-emerald-600">{formatCurrency(monthlyStats.totalIncome)}</p>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-[#262626] dark:bg-[#171717]">
          <p className="mb-1 text-xs text-neutral-500">Dépenses totales</p>
          <p className="text-lg font-semibold text-red-500">{formatCurrency(monthlyStats.totalExpenses)}</p>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-[#262626] dark:bg-[#171717]">
          <p className="mb-1 text-xs text-neutral-500">Membres actifs</p>
          <p className="text-lg font-semibold">{activeMembers.length + 1}</p>
        </div>
      </div>

      {totalForBar > 0 && (
        <div className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-[#262626] dark:bg-[#171717]">
          <p className="mb-3 text-sm font-medium">Répartition des dépenses</p>
          <div className="flex h-3 w-full overflow-hidden rounded-full">
            {allSegments.map((seg) => {
              const pct = (seg.amount / totalForBar) * 100
              if (pct === 0) return null
              return (
                <div
                  key={seg.memberId ?? 'unattributed'}
                  className="h-full"
                  style={{ width: `${pct}%`, backgroundColor: seg.color }}
                />
              )
            })}
          </div>
          <div className="mt-2 flex flex-wrap gap-3">
            {allSegments.map((seg) => {
              if (seg.amount === 0) return null
              const pct = totalForBar > 0 ? Math.round((seg.amount / totalForBar) * 100) : 0
              return (
                <div key={seg.memberId ?? 'unattributed'} className="flex items-center gap-1.5 text-xs text-neutral-500">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: seg.color }} />
                  <span>{seg.name}</span>
                  <span className="font-medium text-neutral-700 dark:text-neutral-300">
                    {formatCurrency(seg.amount)} ({pct}%)
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {ownerAsVirtualMember && (
          <MemberCard
            member={ownerAsVirtualMember}
            isOwner
            totalGroupExpenses={monthlyStats.totalExpenses}
            memberExpenses={memberStats.byMember.get(user?.id ?? null) ?? 0}
            topCategories={getTopCategories(user?.id ?? null)}
            onRemove={() => {}}
          />
        )}
        {activeMembers.map((m) => (
          <MemberCard
            key={m.id}
            member={m}
            totalGroupExpenses={monthlyStats.totalExpenses}
            memberExpenses={memberStats.byMember.get(m.user_id) ?? 0}
            topCategories={getTopCategories(m.user_id)}
            onRemove={setRemoveTarget}
          />
        ))}
      </div>

      <div className="rounded-xl border border-neutral-200 bg-white p-5 dark:border-[#262626] dark:bg-[#171717]">
        <h2 className="mb-4 text-base font-medium">Inviter un autre membre</h2>
        <InviteForm budgetId={activeBudgetId} compact />
      </div>

      <AlertDialog open={!!removeTarget} onOpenChange={(o) => { if (!o) setRemoveTarget(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Retirer ce membre ?</AlertDialogTitle>
            <AlertDialogDescription>
              &quot;{removeTarget?.display_name}&quot; ne pourra plus accéder à ce budget.
              Ses transactions existantes seront conservées.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 hover:bg-red-600"
              onClick={() => {
                if (removeTarget && activeBudgetId) {
                  removeM.mutate({ memberId: removeTarget.id, budgetId: activeBudgetId })
                  setRemoveTarget(null)
                }
              }}
            >
              Retirer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
