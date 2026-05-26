import { Link } from 'react-router-dom'

import { AuthCard } from '@/features/auth/components/AuthCard'
import { SignupForm } from '@/features/auth/components/SignupForm'

export default function SignupPage() {
  return (
    <AuthCard subtitle="Crée ton compte, c'est gratuit">
      <SignupForm />

      <p className="mt-6 text-center text-sm text-neutral-500">
        Déjà un compte ?{' '}
        <Link to="/login" className="font-medium text-[#6366f1] hover:underline">
          Se connecter
        </Link>
      </p>
    </AuthCard>
  )
}
