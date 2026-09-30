'use client'

import { useActionState } from 'react'

import { resetPassword } from '@/app/actions/auth'

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState(resetPassword, undefined)

  return (
    <form action={action} className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">Set a new password</h1>

      <input type="hidden" name="token" value={token} />

      {state?.message && <p className="text-sm text-red-600">{state.message}</p>}

      <div className="flex flex-col gap-1">
        <label htmlFor="password">New password</label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          className="rounded border px-3 py-2"
        />
        {state?.errors?.password?.map((e) => (
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
        {pending ? 'Updating...' : 'Update password'}
      </button>
    </form>
  )
}
