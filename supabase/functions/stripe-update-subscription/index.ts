// supabase/functions/stripe-update-subscription/index.ts
// Handles in-app plan changes: tier upgrade/downgrade and plan length upgrades.
// Accepts (target_tier, target_plan_length?) — billing method is always preserved.
// Ends trials immediately on upgrade; applies proration for active subscriptions.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14.14.0?target=deno";

// =============================================================================
// Configuration
// =============================================================================

const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
  httpClient: Stripe.createFetchHttpClient(),
});

// =============================================================================
// Price ↔ (tier, planLength, billingMethod) mapping
// =============================================================================

type PlanLength = "1_month" | "3_months" | "12_months";
type BillingMethod = "monthly" | "upfront";

interface PriceMapping {
  tier: string;
  planLength: PlanLength;
  billingMethod: BillingMethod;
}

const PRICE_ID_MAP: Record<string, PriceMapping> = {
  // Family
  "price_1T2DyT9ekvh9y28oKGFQPH9W": { tier: "family", planLength: "1_month", billingMethod: "monthly" },
  "price_1T2Dyd9ekvh9y28oaxxH7Ob2": { tier: "family", planLength: "3_months", billingMethod: "monthly" },
  "price_1T2ZIT9ekvh9y28o5Sm9Ee4i": { tier: "family", planLength: "3_months", billingMethod: "upfront" },
  "price_1T2Dyg9ekvh9y28otXEF5rPV": { tier: "family", planLength: "12_months", billingMethod: "monthly" },
  "price_1T2Dyj9ekvh9y28oZsY9pb82": { tier: "family", planLength: "12_months", billingMethod: "upfront" },
  // Premium
  "price_1T2Dys9ekvh9y28obsL45Hsr": { tier: "premium", planLength: "1_month", billingMethod: "monthly" },
  "price_1T2Dyv9ekvh9y28oY93U11ig": { tier: "premium", planLength: "3_months", billingMethod: "monthly" },
  "price_1T2ZIb9ekvh9y28oNbr6xSdl": { tier: "premium", planLength: "3_months", billingMethod: "upfront" },
  "price_1T2Dyz9ekvh9y28o0t3ZNGg6": { tier: "premium", planLength: "12_months", billingMethod: "monthly" },
  "price_1T2Dz29ekvh9y28oH88qdIkh": { tier: "premium", planLength: "12_months", billingMethod: "upfront" },
};

const PRICE_LOOKUP: Record<string, string> = {
  "family:1_month:monthly": "price_1T2DyT9ekvh9y28oKGFQPH9W",
  "family:3_months:monthly": "price_1T2Dyd9ekvh9y28oaxxH7Ob2",
  "family:3_months:upfront": "price_1T2ZIT9ekvh9y28o5Sm9Ee4i",
  "family:12_months:monthly": "price_1T2Dyg9ekvh9y28otXEF5rPV",
  "family:12_months:upfront": "price_1T2Dyj9ekvh9y28oZsY9pb82",
  "premium:1_month:monthly": "price_1T2Dys9ekvh9y28obsL45Hsr",
  "premium:3_months:monthly": "price_1T2Dyv9ekvh9y28oY93U11ig",
  "premium:3_months:upfront": "price_1T2ZIb9ekvh9y28oNbr6xSdl",
  "premium:12_months:monthly": "price_1T2Dyz9ekvh9y28o0t3ZNGg6",
  "premium:12_months:upfront": "price_1T2Dz29ekvh9y28oH88qdIkh",
};

const PLAN_LENGTH_ORDER: Record<PlanLength, number> = {
  "1_month": 1,
  "3_months": 3,
  "12_months": 12,
};

const VALID_PLAN_LENGTHS: PlanLength[] = ["1_month", "3_months", "12_months"];

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
    // -------------------------------------------------------------------------
    // 1. Authenticate user
    // -------------------------------------------------------------------------
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // -------------------------------------------------------------------------
    // 2. Parse request — { target_tier, target_plan_length? }
    // -------------------------------------------------------------------------
    const body = await req.json();
    const { target_tier, target_plan_length } = body;

    if (!target_tier || (target_tier !== "family" && target_tier !== "premium")) {
      return new Response(
        JSON.stringify({ error: "Invalid target_tier. Must be 'family' or 'premium'." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (target_plan_length && !VALID_PLAN_LENGTHS.includes(target_plan_length)) {
      return new Response(
        JSON.stringify({ error: "Invalid target_plan_length." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // -------------------------------------------------------------------------
    // 3. Get Stripe customer ID from profile
    // -------------------------------------------------------------------------
    const { data: profile } = await supabase
      .from("profiles")
      .select("stripe_customer_id")
      .eq("id", user.id)
      .single();

    if (!profile?.stripe_customer_id) {
      return new Response(
        JSON.stringify({ error: "No active subscription found" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // -------------------------------------------------------------------------
    // 4. Find the customer's active/trialing subscription
    // -------------------------------------------------------------------------
    const subscriptions = await stripe.subscriptions.list({
      customer: profile.stripe_customer_id,
      status: "active",
      limit: 1,
    });

    let subscription = subscriptions.data[0];

    if (!subscription) {
      const trialingSubscriptions = await stripe.subscriptions.list({
        customer: profile.stripe_customer_id,
        status: "trialing",
        limit: 1,
      });
      subscription = trialingSubscriptions.data[0];
    }

    if (!subscription) {
      return new Response(
        JSON.stringify({ error: "No active subscription found" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // -------------------------------------------------------------------------
    // 5. Determine current dimensions and resolve new price
    // -------------------------------------------------------------------------
    const currentItem = subscription.items.data[0];
    const currentPriceId = currentItem.price.id;
    const currentMapping = PRICE_ID_MAP[currentPriceId];

    if (!currentMapping) {
      console.error("[stripe-update-subscription] Unknown price ID:", currentPriceId);
      return new Response(
        JSON.stringify({ error: "Cannot determine current plan details" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const newPlanLength: PlanLength = target_plan_length || currentMapping.planLength;

    // Validate: plan length can only go up (or stay same)
    if (PLAN_LENGTH_ORDER[newPlanLength] < PLAN_LENGTH_ORDER[currentMapping.planLength]) {
      return new Response(
        JSON.stringify({
          error: "Cannot shorten plan length. Please cancel and re-subscribe for a shorter plan.",
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Billing method is always preserved from the current subscription
    const newPriceId = PRICE_LOOKUP[`${target_tier}:${newPlanLength}:${currentMapping.billingMethod}`];

    if (!newPriceId) {
      return new Response(
        JSON.stringify({ error: "No matching price found for the requested plan" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (newPriceId === currentPriceId) {
      return new Response(
        JSON.stringify({ error: "Already on this plan" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // -------------------------------------------------------------------------
    // 6. Update the subscription
    // -------------------------------------------------------------------------
    const isTrialing = subscription.status === "trialing";

    const updateParams: Stripe.SubscriptionUpdateParams = {
      items: [
        {
          id: currentItem.id,
          price: newPriceId,
        },
      ],
      proration_behavior: "always_invoice",
      metadata: {
        supabase_user_id: user.id,
      },
    };

    if (isTrialing) {
      updateParams.trial_end = "now";
    }

    const updated = await stripe.subscriptions.update(subscription.id, updateParams);

    console.log(
      "[stripe-update-subscription] Updated:",
      updated.id,
      "from:", currentPriceId,
      "to:", newPriceId,
      `(${currentMapping.tier}/${currentMapping.planLength}/${currentMapping.billingMethod}`,
      `→ ${target_tier}/${newPlanLength}/${currentMapping.billingMethod})`,
      "was trialing:", isTrialing
    );

    return new Response(
      JSON.stringify({
        success: true,
        new_tier: target_tier,
        new_plan_length: newPlanLength,
        billing_method: currentMapping.billingMethod,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err: unknown) {
    console.error("[stripe-update-subscription] Error:", err);
    const message = err instanceof Error ? err.message : "Internal server error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
