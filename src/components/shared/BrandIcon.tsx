import { ArrowLeftRight } from 'lucide-react'
import { useState } from 'react'

import { matchBrand, matchClearbit } from '@/lib/brand-icons'
import { cn } from '@/lib/utils'

type Props = {
  name: string
  size?: number
  className?: string
  withBackground?: boolean
}

export function BrandIcon({ name, size = 20, className, withBackground = true }: Props) {
  const [imgError, setImgError] = useState(false)

  const match = matchBrand(name)
  const clearbit = !match ? matchClearbit(name) : null

  // 1. simple-icons match → inline SVG
  if (match) {
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

  // 2. Clearbit fallback
  if (clearbit && !imgError) {
    if (withBackground) {
      return (
        <div
          className={cn('flex shrink-0 items-center justify-center rounded-full', className)}
          style={{ width: size * 2, height: size * 2, backgroundColor: `${clearbit.color}20` }}
        >
          <img
            src={`https://logo.clearbit.com/${clearbit.domain}`}
            width={size}
            height={size}
            alt=""
            onError={() => setImgError(true)}
            className="rounded-sm object-contain"
          />
        </div>
      )
    }
    return (
      <img
        src={`https://logo.clearbit.com/${clearbit.domain}`}
        width={size}
        height={size}
        alt=""
        onError={() => setImgError(true)}
        className={cn('rounded-sm object-contain', className)}
      />
    )
  }

  // 3. No match → generic icon
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
