import {
  ArrowLeftRight,
  CreditCard,
  LayoutDashboard,
  PiggyBank,
  Settings,
  Users,
  Wallet,
} from 'lucide-react'
import { useContext } from 'react'
import { NavLink, Outlet } from 'react-router-dom'

import { RightPanelContext, RightPanelProvider } from '@/app/layouts/RightPanelContext'
import { UserMenu } from '@/features/auth/components/UserMenu'
import { BudgetSwitcher } from '@/features/budgets/components/BudgetSwitcher'
import { cn } from '@/lib/utils'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/transactions', icon: ArrowLeftRight, label: 'Transactions' },
  { to: '/budget', icon: Wallet, label: 'Budget' },
  { to: '/partage', icon: Users, label: 'Partage' },
  { to: '/dettes', icon: CreditCard, label: 'Dettes' },
  { to: '/epargne', icon: PiggyBank, label: 'Épargne' },
]

function LayoutInner() {
  const { content } = useContext(RightPanelContext)

  return (
    <div className="flex h-screen bg-[#fafafa] dark:bg-[#0a0a0a]">
      <aside className="flex w-[240px] flex-col border-r border-[#e5e5e5] bg-white dark:border-[#262626] dark:bg-[#171717]">
        <div className="flex h-14 items-center border-b border-[#e5e5e5] px-6 dark:border-[#262626]">
          <span className="text-lg font-semibold tracking-tight">budvert</span>
        </div>

        <div className="p-3 pb-0">
          <BudgetSwitcher />
        </div>

        <nav className="flex-1 space-y-0.5 p-3">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-[#6366f1]/10 text-[#6366f1]'
                    : 'text-[#737373] hover:bg-[#f5f5f5] hover:text-[#171717] dark:text-[#a3a3a3] dark:hover:bg-[#262626] dark:hover:text-[#fafafa]',
                )
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="space-y-0.5 border-t border-[#e5e5e5] p-3 dark:border-[#262626]">
          <UserMenu />
          <NavLink
            to="/parametres"
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-[#6366f1]/10 text-[#6366f1]'
                  : 'text-[#737373] hover:bg-[#f5f5f5] hover:text-[#171717] dark:text-[#a3a3a3] dark:hover:bg-[#262626] dark:hover:text-[#fafafa]',
              )
            }
          >
            <Settings className="h-4 w-4" />
            Paramètres
          </NavLink>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>

      <aside className="w-[320px] shrink-0 border-l border-[#e5e5e5] bg-white dark:border-[#262626] dark:bg-[#171717]">
        {content}
      </aside>
    </div>
  )
}

export default function DesktopLayout() {
  return (
    <RightPanelProvider>
      <LayoutInner />
    </RightPanelProvider>
  )
}
