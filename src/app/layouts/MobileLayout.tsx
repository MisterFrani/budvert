import { ArrowLeftRight, CreditCard, LayoutDashboard, PiggyBank, Settings, Wallet } from 'lucide-react'
import { NavLink, Outlet } from 'react-router-dom'

import { UserMenu } from '@/features/auth/components/UserMenu'
import { BudgetSwitcher } from '@/features/budgets/components/BudgetSwitcher'
import { cn } from '@/lib/utils'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/transactions', icon: ArrowLeftRight, label: 'Transactions' },
  { to: '/budget', icon: Wallet, label: 'Budget' },
  { to: '/epargne', icon: PiggyBank, label: 'Épargne' },
  { to: '/dettes', icon: CreditCard, label: 'Dettes' },
]

export default function MobileLayout() {
  return (
    <div className="flex h-screen flex-col bg-[#fafafa] dark:bg-[#0a0a0a]">
      <header className="border-b border-[#e5e5e5] bg-white dark:border-[#262626] dark:bg-[#171717]">
        <div className="flex h-14 items-center justify-between px-4">
          <span className="text-base font-semibold tracking-tight">budvert</span>
          <div className="flex items-center gap-2">
            <NavLink
              to="/parametres"
              className={({ isActive }) =>
                cn('p-1.5 transition-colors', isActive ? 'text-[#6366f1]' : 'text-[#a3a3a3]')
              }
            >
              <Settings className="h-4 w-4" />
            </NavLink>
            <UserMenu />
          </div>
        </div>
        <div className="px-4 pb-3">
          <BudgetSwitcher />
        </div>
      </header>

      <main className="flex-1 overflow-auto pb-16">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 left-0 right-0 flex h-16 items-center border-t border-[#e5e5e5] bg-white px-2 dark:border-[#262626] dark:bg-[#171717]">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              cn(
                'flex flex-1 flex-col items-center gap-1 py-2 text-xs font-medium transition-colors',
                isActive ? 'text-[#6366f1]' : 'text-[#a3a3a3]',
              )
            }
          >
            <Icon className="h-5 w-5" />
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
