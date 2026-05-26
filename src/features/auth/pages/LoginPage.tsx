import { Link } from 'react-router-dom'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AuthCard } from '@/features/auth/components/AuthCard'
import { LoginForm } from '@/features/auth/components/LoginForm'
import { MagicLinkForm } from '@/features/auth/components/MagicLinkForm'

export default function LoginPage() {
  return (
    <AuthCard subtitle="Reprends le contrôle de ton budget">
      <Tabs defaultValue="password">
        <TabsList className="w-full">
          <TabsTrigger value="password" className="flex-1">
            Email & mot de passe
          </TabsTrigger>
          <TabsTrigger value="magic" className="flex-1">
            Lien magique
          </TabsTrigger>
        </TabsList>
        <TabsContent value="password" className="mt-6">
          <LoginForm />
        </TabsContent>
        <TabsContent value="magic" className="mt-6">
          <MagicLinkForm />
        </TabsContent>
      </Tabs>

      <p className="mt-6 text-center text-sm text-neutral-500">
        Pas encore de compte ?{' '}
        <Link to="/signup" className="font-medium text-[#6366f1] hover:underline">
          S&apos;inscrire
        </Link>
      </p>
    </AuthCard>
  )
}
