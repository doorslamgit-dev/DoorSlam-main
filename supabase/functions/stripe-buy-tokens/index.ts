// supabase/functions/stripe-buy-tokens/index.ts
// Creates a Stripe Checkout session for token bundle purchase (Premium only)

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14.14.0?target=deno";

// =============================================================================
// Configuration
// =============================================================================

const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const SUCCESS_URL = Deno.env.get("STRIPE_TOKEN_SUCCESS_URL") || "https://doorslam.app/parent?tokens=success";
const CANCEL_URL = Deno.env.get("STRIPE_TOKEN_CANCEL_URL") || "https://doorslam.app/parent?tokens=cancelled";

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

    // Check user is Premium tier
    const { data: profile } = await supabase
      .from("profiles")
      .select("stripe_customer_id, subscription_tier")
      .eq("id", user.id)
      .single();

    if (profile?.subscription_tier !== "premium") {
      return new Response(
        JSON.stringify({ error: "Token purchases are only available for Premium subscribers" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!profile?.stripe_customer_id) {
      return new Response(
        JSON.stringify({ error: "No Stripe customer found" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Checkout session for one-time payment
    const session = await stripe.checkout.sessions.create({
      customer: profile.stripe_customer_id,
      mode: "payment",
      line_items: [
        {
          price: price_id,
          quantity: 1,
        },
      ],
      success_url: SUCCESS_URL,
      cancel_url: CANCEL_URL,
      metadata: {
        supabase_user_id: user.id,
        purchase_type: "token_bundle",
      },
    });

    return new Response(
      JSON.stringify({ url: session.url }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err: unknown) {
    console.error("[stripe-buy-tokens] Error:", err);
    const message = err instanceof Error ? err.message : "Internal server error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
