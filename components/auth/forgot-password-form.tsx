'use client'

import Link from 'next/link'
import { useActionState } from 'react'

import { requestPasswordReset } from '@/app/actions/auth'

export function ForgotPasswordForm() {
  const [state, action, pending] = useActionState(requestPasswordReset, undefined)

  return (
    <form action={action} className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">Reset your password</h1>

      {state?.message && <p className="text-sm text-gray-700">{state.message}</p>}

      <div className="flex flex-col gap-1">
        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          className="rounded border px-3 py-2"
        />
        {state?.errors?.email?.map((e) => (
          <p key={e} className="text-sm text-red-600">
            {e}
          </p>
        ))}
      </div>

      <button
        type="submit"
        disabled={pending}
        className="rounded bg-black px-3 py-2 text-white disabled:opacity-50"
      >
        {pending ? 'Sending...' : 'Send reset link'}
      </button>

      <p className="text-sm">
        <Link href="/login" className="underline">
          Back to login
        </Link>
      </p>
    </form>
  )
}
