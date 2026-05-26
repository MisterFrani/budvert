import { format, formatRelative } from 'date-fns'
import { fr } from 'date-fns/locale'

export function formatCurrency(amount: number, currency = 'EUR'): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount)
}

export function formatDate(date: Date | string, pattern = 'dd MMM yyyy'): string {
  return format(new Date(date), pattern, { locale: fr })
}

export function formatRelativeDate(date: Date | string): string {
  return formatRelative(new Date(date), new Date(), { locale: fr })
}
