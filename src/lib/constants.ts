import type { LucideIcon } from 'lucide-react'
import {
  Car,
  Gamepad2,
  Heart,
  Home,
  Package,
  Scissors,
  ShoppingCart,
  Tv,
  Wifi,
  Zap,
} from 'lucide-react'

export const STALE_TIME = 30_000

export const TRANSACTIONS_PER_PAGE = 50

export const BUDGET_THRESHOLDS = {
  WARNING: 70,
  DANGER: 90,
} as const

export const PROGRESS_COLORS = {
  SAFE: '#10b981',
  WARNING: '#f59e0b',
  DANGER: '#ef4444',
} as const

export const BUDGET_COLORS = [
  '#6366f1',
  '#ef4444',
  '#f59e0b',
  '#10b981',
  '#06b6d4',
  '#ec4899',
  '#8b5cf6',
] as const

export const CATEGORY_ICON_MAP: Record<string, LucideIcon> = {
  home: Home,
  loyer: Home,
  housing: Home,
  'shopping-cart': ShoppingCart,
  alimentation: ShoppingCart,
  food: ShoppingCart,
  courses: ShoppingCart,
  car: Car,
  transport: Car,
  voiture: Car,
  tv: Tv,
  abonnements: Tv,
  subscriptions: Tv,
  heart: Heart,
  sante: Heart,
  health: Heart,
  'gamepad-2': Gamepad2,
  loisirs: Gamepad2,
  entertainment: Gamepad2,
  scissors: Scissors,
  coiffure: Scissors,
  zap: Zap,
  energie: Zap,
  electricity: Zap,
  wifi: Wifi,
  internet: Wifi,
  package: Package,
  divers: Package,
  other: Package,
}

export function getCategoryIcon(iconName: string): LucideIcon {
  return CATEGORY_ICON_MAP[iconName.toLowerCase()] ?? Package
}
