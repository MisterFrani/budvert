import { useState } from 'react'

import type { OnboardingState, OnboardingStep } from '@/features/onboarding/types'

export function useOnboarding() {
  const [state, setState] = useState<OnboardingState>({ step: 1, budgetId: null })

  function goNext() {
    setState((s) => ({ ...s, step: (Math.min(s.step + 1, 3) as OnboardingStep) }))
  }

  function goBack() {
    setState((s) => ({ ...s, step: (Math.max(s.step - 1, 1) as OnboardingStep) }))
  }

  function setBudgetId(id: string) {
    setState((s) => ({ ...s, budgetId: id }))
  }

  return { ...state, goNext, goBack, setBudgetId }
}
