import 'server-only'

import Stripe from 'stripe'

// STRIPE_SECRET_KEY is required at runtime. The production build phase is the
// only exception, where secrets are absent and Stripe must not be contacted.
const isBuildPhase = process.env.NEXT_PHASE === 'phase-production-build'
const secretKey = process.env.STRIPE_SECRET_KEY

if (!secretKey && !isBuildPhase) {
  throw new Error('STRIPE_SECRET_KEY is not set')
}

export const stripe = new Stripe(secretKey ?? 'sk_test_build')
