import { redirect } from 'next/navigation'

import { LoginForm } from '@/components/auth/login-form'
import { getCurrentAccount } from '@/lib/auth/session'

export default async function LoginPage() {
  const account = await getCurrentAccount()
  if (account) redirect('/')

  return <LoginForm />
}
