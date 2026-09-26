// import { NextResponse } from "next/server";
// import { headers } from "next/headers";
// import { PLAN_PRICE_ID, stripe } from "@/lib/stripe";
// import { authClient } from "@/lib/auth-client";
// import { auth } from "@/lib/auth";

// // import { stripe } from '../../../lib/stripe'

// export async function POST(request) {
//   try {
//     const headersList = await headers();
//     const origin = headersList.get("origin");
//     const user = await auth.api.getSession({
//       headers: headersList,
//     });

//     const formData = await request.formData();
//     const PlanId = formData.get("plan_id");
//     const priceId = PLAN_PRICE_ID[PlanId];

//     // Create Checkout Sessions from body params.
//     const session = await stripe.checkout.sessions.create({
//       customer_email: user?.user?.email,
//       line_items: [
//         {
//           // Provide the exact Price ID (for example, price_1234) of the product you want to sell
//           price: priceId,
//           quantity: 1,
//         },
//       ],
//       mode: "subscription",
//       metadata:{ planId: PlanId},
//       success_url: `${origin}/dashboard/organizer/pricing/success?session_id={CHECKOUT_SESSION_ID}`,
//       // Provide a name (for example, hosted_web_0001) to label this Checkout integration and measure its conversion independently
//       //   integration_identifier: '{{INTEGRATION_ID}}',
//     });
//     return NextResponse.redirect(session.url, 303);
//   } catch (err) {
//     return NextResponse.json(
//       { error: err.message },
//       { status: err.statusCode || 500 },
//     );
//   }
// }


import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { PLAN_PRICE_ID, stripe } from "@/lib/stripe";
import { auth } from "@/lib/auth";

export async function POST(request) {
  try {
    const headersList = await headers();

    // Get the current website origin
    const origin =
      headersList.get("origin") ||
      process.env.NEXT_PUBLIC_APP_URL ||
      "http://localhost:3000";

    // Get logged-in user
    const session = await auth.api.getSession({
      headers: headersList,
    });

    if (!session?.user?.email) {
      return NextResponse.json(
        {
          success: false,
          message: "You must be logged in.",
        },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { type } = body;

    let lineItem;
    let metadata = {};
    let mode;
    let successUrl;

    // =========================================================
    // SUBSCRIPTION PAYMENT
    // =========================================================
    if (type === "subscription") {
      const { planId } = body;

      if (!planId) {
        return NextResponse.json(
          {
            success: false,
            message: "Plan ID is required.",
          },
          { status: 400 }
        );
      }

      const priceId = PLAN_PRICE_ID[planId];

      if (!priceId) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid subscription plan.",
          },
          { status: 400 }
        );
      }

      lineItem = {
        price: priceId,
        quantity: 1,
      };

      mode = "subscription";

      metadata = {
        paymentType: "subscription",
        planId: String(planId),
        organizerEmail: session.user.email,
      };

      successUrl =
        `${origin}/dashboard/organizer/pricing/success` +
        `?session_id={CHECKOUT_SESSION_ID}`;
    }

    // =========================================================
    // EVENT TICKET BOOKING
    // =========================================================
    else if (type === "booking") {
      const {
        eventId,
        eventTitle,
        ticketPrice,
        quantity,
      } = body;

      // -------------------------
      // Validate event
      // -------------------------
      if (!eventId) {
        return NextResponse.json(
          {
            success: false,
            message: "Event ID is required.",
          },
          { status: 400 }
        );
      }

      if (!eventTitle) {
        return NextResponse.json(
          {
            success: false,
            message: "Event title is required.",
          },
          { status: 400 }
        );
      }

      // -------------------------
      // Validate ticket price
      // -------------------------
      const numericPrice = Number(ticketPrice);

      if (
        !Number.isFinite(numericPrice) ||
        numericPrice <= 0
      ) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid ticket price.",
          },
          { status: 400 }
        );
      }

      // -------------------------
      // Validate quantity
      // -------------------------
      const numericQuantity = Number(quantity);

      if (
        !Number.isInteger(numericQuantity) ||
        numericQuantity < 1
      ) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid ticket quantity.",
          },
          { status: 400 }
        );
      }

      // -------------------------
      // Calculate Stripe amount
      // USD uses cents.
      // Example:
      // $5 = 500 cents
      // $10 = 1000 cents
      // -------------------------
      const unitAmount = Math.round(numericPrice * 100);

      if (unitAmount < 50) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Ticket price must be at least $0.50 for Stripe payment.",
          },
          { status: 400 }
        );
      }

      const totalAmount = numericPrice * numericQuantity;

      // -------------------------
      // Stripe line item
      // -------------------------
      lineItem = {
        price_data: {
          currency: "usd",

          unit_amount: unitAmount,

          product_data: {
            name: String(eventTitle),
          },
        },

        quantity: numericQuantity,
      };

      mode = "payment";

      // -------------------------
      // Store booking information
      // in Stripe metadata
      // -------------------------
      metadata = {
        paymentType: "event_ticket",

        eventId: String(eventId),

        eventTitle: String(eventTitle),

        attendeeEmail: String(
          session.user.email
        ).toLowerCase(),

        attendeeId: session.user.id
          ? String(session.user.id)
          : "",

        ticketPrice: String(numericPrice),

        quantity: String(numericQuantity),

        totalAmount: String(totalAmount),

        currency: "USD",
      };

      // -------------------------
      // After successful payment
      // go to payment-success
      // -------------------------
      successUrl =
        `${origin}/events/payment-success` +
        `?session_id={CHECKOUT_SESSION_ID}`;
    }

    // =========================================================
    // INVALID PAYMENT TYPE
    // =========================================================
    else {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid payment type. Use subscription or booking.",
        },
        { status: 400 }
      );
    }

    // =========================================================
    // CREATE STRIPE CHECKOUT SESSION
    // =========================================================
    const checkoutSession =
      await stripe.checkout.sessions.create({
        customer_email: session.user.email,

        line_items: [lineItem],

        mode,

        metadata,

        success_url: successUrl,

        cancel_url:
          `${origin}/cancel` +
          `?session_id={CHECKOUT_SESSION_ID}`,
      });

    // =========================================================
    // RETURN CHECKOUT URL
    // =========================================================
    return NextResponse.json({
      success: true,
      url: checkoutSession.url,
      sessionId: checkoutSession.id,
    });
  } catch (error) {
    console.error(
      "Stripe checkout error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error?.message ||
          "Failed to create Stripe checkout session.",
      },
      {
        status: error?.statusCode || 500,
      }
    );
  }
}