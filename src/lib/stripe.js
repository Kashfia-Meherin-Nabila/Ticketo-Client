import 'server-only'

import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export const PLAN_PRICE_ID= {
    "starter":"price_1UJaP7FxSVrTxjLWeIKk7AXM",
    "professional":"price_1UJayWFxSVrTxjLWPF3hIJbu",
    "business":"price_1UJazlFxSVrTxjLWRRLcEkfl",
}