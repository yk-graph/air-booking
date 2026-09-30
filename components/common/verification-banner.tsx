'use client'

import { useActionState } from 'react'

import { resendVerification } from '@/app/actions/auth'

export function VerificationBanner() {
  const [state, action, pending] = useActionState(resendVerification, undefined)

  return (
    <div className="flex flex-col items-center gap-2 rounded border border-yellow-400 bg-yellow-50 px-4 py-3 text-sm">
      <p>Your email address is not verified yet.</p>
      {state?.message && <p className="text-gray-700">{state.message}</p>}
      <form action={action}>
        <button type="submit" disabled={pending} className="underline disabled:opacity-50">
          {pending ? 'Sending...' : 'Resend verification email'}
        </button>
      </form>
    </div>
  )
}
