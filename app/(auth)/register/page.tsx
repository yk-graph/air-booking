import { redirect } from 'next/navigation'

import { getCurrentAccount } from '@/lib/auth/session'

import { RegisterForm } from './register-form'

export default async function RegisterPage() {
  const account = await getCurrentAccount()
  if (account) redirect('/')

  return <RegisterForm />
}
