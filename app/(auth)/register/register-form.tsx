'use client'

import Link from 'next/link'
import { useActionState } from 'react'

import { signup } from '@/app/actions/auth'

export function RegisterForm() {
  const [state, action, pending] = useActionState(signup, undefined)

  return (
    <form action={action} className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">Create account</h1>

      {state?.message && <p className="text-sm text-red-600">{state.message}</p>}

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

      <div className="flex flex-col gap-1">
        <label htmlFor="password">Password</label>
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
        {pending ? 'Creating...' : 'Create account'}
      </button>

      <p className="text-sm">
        Already have an account?{' '}
        <Link href="/login" className="underline">
          Log in
        </Link>
      </p>
    </form>
  )
}
