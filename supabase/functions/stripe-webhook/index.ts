// supabase/functions/stripe-webhook/index.ts
// Handles Stripe webhook events to sync subscription status

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14.14.0?target=deno";

// =============================================================================
// Configuration
// =============================================================================

const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY")!;
const STRIPE_WEBHOOK_SECRET = Deno.env.get("STRIPE_WEBHOOK_SECRET")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
  httpClient: Stripe.createFetchHttpClient(),
});

// =============================================================================
// Tier mapping from Stripe price ID to subscription tier
// Update these with your actual Stripe price IDs after product setup
// =============================================================================

const PRICE_TO_TIER: Record<string, string> = {
  // Family tier — monthly, quarterly, annual (billed monthly), annual (upfront)
  "price_family_monthly": "family",
  "price_family_quarterly": "family",
  "price_family_annual": "family",
  "price_family_annual_upfront": "family",
  // Premium tier — monthly, quarterly, annual (billed monthly), annual (upfront)
  "price_premium_monthly": "premium",
  "price_premium_quarterly": "premium",
  "price_premium_annual": "premium",
  "price_premium_annual_upfront": "premium",
};

// Token bundles (one-time payments)
const TOKEN_BUNDLES: Record<string, number> = {
  "price_tokens_500": 500,
  "price_tokens_1000": 1000,
  "price_tokens_2500": 2500,
};

// =============================================================================
// Handler
// =============================================================================

serve(async (req: Request) => {
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return new Response("Missing stripe-signature header", { status: 400 });
  }

  const body = await req.text();

  let event: Stripe.Event;

  try {
    event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      STRIPE_WEBHOOK_SECRET
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[stripe-webhook] Signature verification failed:", message);
    return new Response(`Webhook Error: ${message}`, { status: 400 });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  // Idempotency check
  const { data: existingEvent } = await supabase
    .from("stripe_events")
    .select("stripe_event_id")
    .eq("stripe_event_id", event.id)
    .single();

  if (existingEvent) {
    console.log("[stripe-webhook] Duplicate event, skipping:", event.id);
    return new Response(JSON.stringify({ received: true, duplicate: true }), {
      headers: { "Content-Type": "application/json" },
    });
  }

  // Record event for idempotency
  await supabase.from("stripe_events").insert({
    stripe_event_id: event.id,
    event_type: event.type,
  });

  console.log("[stripe-webhook] Processing event:", event.type, event.id);

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(supabase, session);
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(supabase, subscription);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(supabase, subscription);
        break;
      }

      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;
        console.log("[stripe-webhook] Invoice paid:", invoice.id);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        console.log("[stripe-webhook] Payment failed:", invoice.id);
        break;
      }

      default:
        console.log("[stripe-webhook] Unhandled event type:", event.type);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { "Content-Type": "application/json" },
    });

  } catch (err: unknown) {
    console.error("[stripe-webhook] Error processing event:", err);
    return new Response(
      JSON.stringify({ error: "Webhook processing failed" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});

// =============================================================================
// Event Handlers
// =============================================================================

async function handleCheckoutCompleted(
  supabase: ReturnType<typeof createClient>,
  session: Stripe.Checkout.Session
) {
  const userId = session.metadata?.supabase_user_id;

  if (!userId) {
    console.error("[stripe-webhook] No supabase_user_id in session metadata");
    return;
  }

  // Check if this is a token purchase (one-time payment)
  if (session.mode === "payment") {
    const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
    const priceId = lineItems.data[0]?.price?.id;

    if (priceId && TOKEN_BUNDLES[priceId]) {
      const tokensToAdd = TOKEN_BUNDLES[priceId];
      console.log("[stripe-webhook] Token purchase:", tokensToAdd, "for user:", userId);

      // Upsert token balance
      const { data: existing } = await supabase
        .from("token_balances")
        .select("balance")
        .eq("parent_id", userId)
        .single();

      if (existing) {
        await supabase
          .from("token_balances")
          .update({ balance: existing.balance + tokensToAdd, updated_at: new Date().toISOString() })
          .eq("parent_id", userId);
      } else {
        await supabase
          .from("token_balances")
          .insert({ parent_id: userId, balance: tokensToAdd });
      }
    }
    return;
  }

  // Subscription checkout — subscription.created event handles the details
  console.log("[stripe-webhook] Subscription checkout completed for user:", userId);
}

async function handleSubscriptionUpdated(
  supabase: ReturnType<typeof createClient>,
  subscription: Stripe.Subscription
) {
  const userId = subscription.metadata?.supabase_user_id;

  if (!userId) {
    // Try to find user by Stripe customer ID
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("stripe_customer_id", subscription.customer)
      .single();

    if (!profile) {
      console.error("[stripe-webhook] Cannot find user for subscription:", subscription.id);
      return;
    }

    await updateSubscriptionStatus(supabase, profile.id, subscription);
  } else {
    await updateSubscriptionStatus(supabase, userId, subscription);
  }
}

async function updateSubscriptionStatus(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  subscription: Stripe.Subscription
) {
  // Get price ID to determine tier
  const priceId = subscription.items.data[0]?.price?.id;
  const tier = priceId ? (PRICE_TO_TIER[priceId] || "family") : "family";

  // Map Stripe status to our status
  let status: string;
  switch (subscription.status) {
    case "trialing":
      status = "trialing";
      break;
    case "active":
      status = "active";
      break;
    case "past_due":
      status = "past_due";
      break;
    case "canceled":
    case "unpaid":
    case "incomplete_expired":
      status = "canceled";
      break;
    default:
      status = "active";
  }

  console.log("[stripe-webhook] Updating user:", userId, "tier:", tier, "status:", status);

  const { error } = await supabase
    .from("profiles")
    .update({
      subscription_tier: tier,
      subscription_status: status,
      trial_ends_at: subscription.trial_end
        ? new Date(subscription.trial_end * 1000).toISOString()
        : null,
    })
    .eq("id", userId);

  if (error) {
    console.error("[stripe-webhook] Failed to update profile:", error);
  }
}

async function handleSubscriptionDeleted(
  supabase: ReturnType<typeof createClient>,
  subscription: Stripe.Subscription
) {
  const userId = subscription.metadata?.supabase_user_id;

  let targetUserId = userId;

  if (!targetUserId) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("stripe_customer_id", subscription.customer)
      .single();

    if (!profile) {
      console.error("[stripe-webhook] Cannot find user for deleted subscription");
      return;
    }
    targetUserId = profile.id;
  }

  console.log("[stripe-webhook] Subscription deleted, reverting to expired:", targetUserId);

  const { error } = await supabase
    .from("profiles")
    .update({
      subscription_tier: "expired",
      subscription_status: "canceled",
    })
    .eq("id", targetUserId);

  if (error) {
    console.error("[stripe-webhook] Failed to update profile on deletion:", error);
  }
}
