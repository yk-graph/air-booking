import Link from 'next/link'

import { ResetPasswordForm } from '@/components/auth/reset-password-form'
import { checkPasswordResetToken, type PasswordResetState } from '@/lib/auth/token'

const ERROR_MESSAGES: Record<Exclude<PasswordResetState, 'valid'>, string> = {
  invalid: 'This reset link is invalid.',
  expired: 'This reset link has expired. Please request a new one.',
  used: 'This reset link has already been used.',
}

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>
}) {
  const { token } = await searchParams
  const state = token ? await checkPasswordResetToken(token) : 'invalid'

  if (state !== 'valid' || !token) {
    return (
      <div className="flex flex-col gap-4 text-center">
        <h1 className="text-xl font-semibold">Reset your password</h1>
        <p className="text-gray-600">{ERROR_MESSAGES[state === 'valid' ? 'invalid' : state]}</p>
        <Link href="/forgot-password" className="underline">
          Request a new link
        </Link>
      </div>
    )
  }

  return <ResetPasswordForm token={token} />
}
