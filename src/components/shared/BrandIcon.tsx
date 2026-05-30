import { ArrowLeftRight } from 'lucide-react'

import { matchBrand } from '@/lib/brand-icons'
import { cn } from '@/lib/utils'

type Props = {
  name: string
  size?: number
  className?: string
  withBackground?: boolean
}

export function BrandIcon({ name, size = 20, className, withBackground = true }: Props) {
  const match = matchBrand(name)

  if (!match) {
    if (!withBackground) return null
    return (
      <div
        className={cn('flex shrink-0 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800', className)}
        style={{ width: size * 2, height: size * 2 }}
      >
        <ArrowLeftRight className="text-neutral-400" style={{ width: size, height: size }} />
      </div>
    )
  }

  if (match.type === 'lucide') {
    const Icon = match.icon
    if (withBackground) {
      return (
        <div
          className={cn('flex shrink-0 items-center justify-center rounded-full', className)}
          style={{ width: size * 2, height: size * 2, backgroundColor: `${match.color}20` }}
        >
          <Icon style={{ color: match.color, width: size, height: size }} />
        </div>
      )
    }
    return <Icon className={className} style={{ color: match.color, width: size, height: size }} />
  }

  const color = `#${match.icon.hex}`
  if (withBackground) {
    return (
      <div
        className={cn('flex shrink-0 items-center justify-center rounded-full', className)}
        style={{ width: size * 2, height: size * 2, backgroundColor: `${color}20` }}
      >
        <svg
          role="img"
          viewBox="0 0 24 24"
          aria-label={match.icon.title}
          style={{ fill: color, width: size, height: size }}
        >
          <path d={match.icon.path} />
        </svg>
      </div>
    )
  }
  return (
    <svg
      role="img"
      viewBox="0 0 24 24"
      aria-label={match.icon.title}
      className={className}
      style={{ fill: color, width: size, height: size }}
    >
      <path d={match.icon.path} />
    </svg>
  )
}
