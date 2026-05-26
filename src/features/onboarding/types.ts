export type OnboardingStep = 1 | 2 | 3

export type OnboardingState = {
  step: OnboardingStep
  budgetId: string | null
}
