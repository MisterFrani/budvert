import { cn } from '@/lib/utils'

const STEPS = ['Budget', 'Charges', 'Revenus']

type OnboardingProgressProps = {
  step: 1 | 2 | 3
}

export function OnboardingProgress({ step }: OnboardingProgressProps) {
  return (
    <div className="flex items-center justify-center gap-0">
      {STEPS.map((label, index) => {
        const stepNumber = index + 1
        const isCompleted = stepNumber < step
        const isCurrent = stepNumber === step

        return (
          <div key={label} className="flex items-center">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={cn(
                  'flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition-colors',
                  isCompleted && 'bg-[#6366f1] text-white',
                  isCurrent && 'border-2 border-[#6366f1] bg-white text-[#6366f1]',
                  !isCompleted && !isCurrent && 'border-2 border-neutral-200 bg-white text-neutral-400',
                )}
              >
                {isCompleted ? (
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  stepNumber
                )}
              </div>
              <span
                className={cn(
                  'text-xs font-medium',
                  isCurrent ? 'text-[#6366f1]' : 'text-neutral-400',
                )}
              >
                {label}
              </span>
            </div>

            {index < STEPS.length - 1 && (
              <div
                className={cn(
                  'mb-5 h-px w-16 transition-colors',
                  isCompleted ? 'bg-[#6366f1]' : 'bg-neutral-200',
                )}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
