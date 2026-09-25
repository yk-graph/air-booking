import { redirect } from 'next/navigation'

import { RegisterForm } from '@/components/auth/register-form'
import { getCurrentAccount } from '@/lib/auth/session'

export default async function RegisterPage() {
  const account = await getCurrentAccount()
  if (account) redirect('/')

  return <RegisterForm />
}
