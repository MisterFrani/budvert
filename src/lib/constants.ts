import type { LucideIcon } from 'lucide-react'
import {
  Baby,
  Bike,
  BookOpen,
  Briefcase,
  Car,
  Coffee,
  Dumbbell,
  Gamepad2,
  Gift,
  GraduationCap,
  Heart,
  Home,
  Music,
  Package,
  Palmtree,
  Phone,
  PiggyBank,
  Plane,
  Scissors,
  ShoppingCart,
  Smartphone,
  Star,
  Trophy,
  Tv,
  Umbrella,
  UtensilsCrossed,
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
  utensils: UtensilsCrossed,
  restaurant: UtensilsCrossed,
  coffee: Coffee,
  cafe: Coffee,
  plane: Plane,
  voyage: Plane,
  'book-open': BookOpen,
  livres: BookOpen,
  music: Music,
  musique: Music,
  briefcase: Briefcase,
  travail: Briefcase,
  gift: Gift,
  cadeaux: Gift,
  phone: Phone,
  telephone: Phone,
  baby: Baby,
  enfants: Baby,
  dumbbell: Dumbbell,
  sport: Dumbbell,
  'piggy-bank': PiggyBank,
  epargne: PiggyBank,
  'graduation-cap': GraduationCap,
  etudes: GraduationCap,
  trophy: Trophy,
  objectif: Trophy,
  bike: Bike,
  velo: Bike,
  palmtree: Palmtree,
  vacances: Palmtree,
  star: Star,
  smartphone: Smartphone,
  telephone2: Smartphone,
  umbrella: Umbrella,
  securite: Umbrella,
}

export const SAVINGS_GOAL_ICONS = [
  'piggy-bank',
  'home',
  'car',
  'plane',
  'graduation-cap',
  'heart',
  'star',
  'smartphone',
  'umbrella',
  'trophy',
  'gift',
  'bike',
  'palmtree',
  'baby',
  'music',
] as const

export type SavingsGoalIcon = (typeof SAVINGS_GOAL_ICONS)[number]

export const SELECTABLE_ICONS = [
  'home',
  'shopping-cart',
  'car',
  'tv',
  'heart',
  'gamepad-2',
  'scissors',
  'zap',
  'wifi',
  'package',
  'utensils',
  'coffee',
  'plane',
  'book-open',
  'music',
  'briefcase',
  'gift',
  'phone',
  'baby',
  'dumbbell',
] as const

export type SelectableIcon = (typeof SELECTABLE_ICONS)[number]

export function getCategoryIcon(iconName: string): LucideIcon {
  return CATEGORY_ICON_MAP[iconName.toLowerCase()] ?? Package
}

export function getProgressColor(percentage: number): string {
  if (percentage < BUDGET_THRESHOLDS.WARNING) return PROGRESS_COLORS.SAFE
  if (percentage < BUDGET_THRESHOLDS.DANGER) return PROGRESS_COLORS.WARNING
  return PROGRESS_COLORS.DANGER
}
