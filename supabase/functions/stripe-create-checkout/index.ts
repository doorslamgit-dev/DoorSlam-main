// supabase/functions/stripe-create-checkout/index.ts
// Creates a Stripe Checkout session for subscription

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14.14.0?target=deno";

// =============================================================================
// Configuration
// =============================================================================

const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const SUCCESS_URL = Deno.env.get("STRIPE_SUCCESS_URL") || "https://doorslam.app/parent?subscription=success";
const CANCEL_URL = Deno.env.get("STRIPE_CANCEL_URL") || "https://doorslam.app/pricing?subscription=cancelled";

const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
  httpClient: Stripe.createFetchHttpClient(),
});

// =============================================================================
// CORS Headers
// =============================================================================

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// =============================================================================
// Handler
// =============================================================================

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Get user from JWT
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Verify JWT and get user
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get request body
    const { price_id } = await req.json();

    if (!price_id) {
      return new Response(
        JSON.stringify({ error: "Missing price_id" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get or create Stripe customer
    const { data: profile } = await supabase
      .from("profiles")
      .select("stripe_customer_id, email, full_name")
      .eq("id", user.id)
      .single();

    let stripeCustomerId = profile?.stripe_customer_id;
    const isReturningCustomer = !!stripeCustomerId;

    if (!stripeCustomerId) {
      // Create new Stripe customer
      const customer = await stripe.customers.create({
        email: user.email || profile?.email,
        name: profile?.full_name || undefined,
        metadata: {
          supabase_user_id: user.id,
        },
      });

      stripeCustomerId = customer.id;

      // Save to profile
      await supabase
        .from("profiles")
        .update({ stripe_customer_id: stripeCustomerId })
        .eq("id", user.id);
    }

    // Create Checkout session
    // New customers get a 14-day free trial on Family plan only.
    // Premium requires payment upfront. Returning customers are always billed immediately.
    const FAMILY_PRICE_IDS = new Set([
      "price_1T2DyT9ekvh9y28oKGFQPH9W", // Family 1-month
      "price_1T2Dyd9ekvh9y28oaxxH7Ob2", // Family 3-month (monthly billing)
      "price_1T2ZIT9ekvh9y28o5Sm9Ee4i", // Family 3-month (upfront)
      "price_1T2Dyg9ekvh9y28otXEF5rPV", // Family 12-month (monthly billing)
      "price_1T2Dyj9ekvh9y28oZsY9pb82", // Family 12-month (upfront)
    ]);

    const subscriptionData: Record<string, unknown> = {
      metadata: { supabase_user_id: user.id },
    };
    if (!isReturningCustomer && FAMILY_PRICE_IDS.has(price_id)) {
      subscriptionData.trial_period_days = 14;
    }

    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      mode: "subscription",
      line_items: [
        {
          price: price_id,
          quantity: 1,
        },
      ],
      success_url: SUCCESS_URL,
      cancel_url: CANCEL_URL,
      subscription_data: subscriptionData,
      metadata: {
        supabase_user_id: user.id,
      },
    });

    return new Response(
      JSON.stringify({ url: session.url }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err: unknown) {
    console.error("[stripe-create-checkout] Error:", err);
    const message = err instanceof Error ? err.message : "Internal server error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
