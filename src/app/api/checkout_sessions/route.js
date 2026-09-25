import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { PLAN_PRICE_ID, stripe } from "@/lib/stripe";
import { authClient } from "@/lib/auth-client";
import { auth } from "@/lib/auth";

// import { stripe } from '../../../lib/stripe'

export async function POST(request) {
  try {
    const headersList = await headers();
    const origin = headersList.get("origin");
    const user = await auth.api.getSession({
      headers: headersList,
    });

    const formData = await request.formData();
    const PlanId = formData.get("plan_id");
    const priceId = PLAN_PRICE_ID[PlanId];

    // Create Checkout Sessions from body params.
    const session = await stripe.checkout.sessions.create({
      customer_email: user?.user?.email,
      line_items: [
        {
          // Provide the exact Price ID (for example, price_1234) of the product you want to sell
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${origin}/dashboard/organizer/pricing/success?session_id={CHECKOUT_SESSION_ID}`,
      // Provide a name (for example, hosted_web_0001) to label this Checkout integration and measure its conversion independently
      //   integration_identifier: '{{INTEGRATION_ID}}',
    });
    return NextResponse.redirect(session.url, 303);
  } catch (err) {
    return NextResponse.json(
      { error: err.message },
      { status: err.statusCode || 500 },
    );
  }
}
