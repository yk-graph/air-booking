import 'server-only'

import { Resend } from 'resend'

// RESEND_API_KEY is required at runtime. The only exception is the production
// build phase, where secrets are not available (and are not needed).
const isBuildPhase = process.env.NEXT_PHASE === 'phase-production-build'
const apiKey = process.env.RESEND_API_KEY

if (!apiKey && !isBuildPhase) {
  throw new Error('RESEND_API_KEY is not set')
}

export const resend = new Resend(apiKey ?? 're_build_placeholder')

export const EMAIL_FROM = process.env.EMAIL_FROM ?? 'onboarding@resend.dev'
