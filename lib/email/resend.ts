import 'server-only'

import { Resend } from 'resend'

let client: Resend | undefined

// Lazily instantiate so `next build` can evaluate modules without a key.
export function getResend(): Resend {
  return (client ??= new Resend(process.env.RESEND_API_KEY))
}

export const EMAIL_FROM = process.env.EMAIL_FROM ?? 'onboarding@resend.dev'
