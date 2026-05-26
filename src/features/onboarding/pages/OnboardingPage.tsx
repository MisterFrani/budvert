import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'

import { OnboardingProgress } from '@/features/onboarding/components/OnboardingProgress'
import { Step1Budget } from '@/features/onboarding/components/Step1Budget'
import { Step2Categories } from '@/features/onboarding/components/Step2Categories'
import { Step3Income } from '@/features/onboarding/components/Step3Income'
import { useOnboarding } from '@/features/onboarding/hooks/useOnboarding'
import { useAuthStore } from '@/stores/authStore'

const STEP_TITLES: Record<number, { title: string; subtitle: string }> = {
  1: { title: 'Crée ton premier budget', subtitle: 'Tu pourras en créer d\'autres plus tard' },
  2: { title: 'Tes dépenses mensuelles', subtitle: 'Modifie les montants selon ta situation. Tu pourras les ajuster à tout moment.' },
  3: { title: 'Tes revenus mensuels', subtitle: 'On l\'utilise pour calculer ton solde disponible' },
}

export default function OnboardingPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user } = useAuthStore()
  const { step, budgetId, goNext, goBack, setBudgetId } = useOnboarding()

  function handleStep1Complete(id: string) {
    setBudgetId(id)
    goNext()
  }

  async function handleStep3Complete() {
    queryClient.invalidateQueries({ queryKey: ['budgets', user?.id] })
    navigate('/', { replace: true })
  }

  const { title, subtitle } = STEP_TITLES[step]

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <div className="mx-auto max-w-2xl px-4 py-12">
        <OnboardingProgress step={step} />

        <div className="mt-10">
          <div className="mb-8">
            <h1 className="text-2xl font-semibold">{title}</h1>
            <p className="mt-1 text-sm text-neutral-500">{subtitle}</p>
          </div>

          <div className="rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
            {step === 1 && <Step1Budget onComplete={handleStep1Complete} />}
            {step === 2 && budgetId && (
              <Step2Categories budgetId={budgetId} onBack={goBack} onComplete={goNext} />
            )}
            {step === 3 && budgetId && (
              <Step3Income budgetId={budgetId} onBack={goBack} onComplete={handleStep3Complete} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
