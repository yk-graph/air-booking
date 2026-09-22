import { redirect } from 'next/navigation'

import { getCurrentAccount } from '@/lib/auth/session'

import { LoginForm } from './login-form'

export default async function LoginPage() {
  const account = await getCurrentAccount()
  if (account) redirect('/')

  return <LoginForm />
}
