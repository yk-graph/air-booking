import { headers } from 'next/headers'
import type Stripe from 'stripe'

import { confirmPaidBooking, expireBooking } from '@/lib/booking/finalize'
import { PaymentStatus } from '@/lib/generated/prisma/enums'
import { prisma } from '@/lib/prisma'
import { stripe } from '@/lib/stripe/client'

export async function POST(request: Request) {
  const body = await request.text()
  const signature = (await headers()).get('stripe-signature')
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!signature || !webhookSecret) {
    return new Response('Missing signature', { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (error) {
    console.error('stripe webhook: signature verification failed', error)
    return new Response('Invalid signature', { status: 400 })
  }

  const seen = await prisma.stripeEvent.findUnique({ where: { id: event.id } })
  if (seen) return new Response('ok', { status: 200 })

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session
      const bookingId = session.metadata?.bookingId
      if (bookingId && session.payment_status === 'paid') {
        const paymentIntentId =
          typeof session.payment_intent === 'string' ? session.payment_intent : null
        await confirmPaidBooking(bookingId, session.id, paymentIntentId)
      }
    } else if (event.type === 'checkout.session.expired') {
      const session = event.data.object as Stripe.Checkout.Session
      const bookingId = session.metadata?.bookingId
      if (bookingId) await expireBooking(bookingId, session.id)
    } else if (event.type === 'payment_intent.payment_failed') {
      const intent = event.data.object as Stripe.PaymentIntent
      await prisma.payment.updateMany({
        where: { stripePaymentIntentId: intent.id },
        data: { status: PaymentStatus.FAILED },
      })
    }
  } catch (error) {
    console.error('stripe webhook: handler failed', event.type, error)
    return new Response('Handler error', { status: 500 })
  }

  await prisma.stripeEvent.create({ data: { id: event.id, type: event.type } })
  return new Response('ok', { status: 200 })
}
