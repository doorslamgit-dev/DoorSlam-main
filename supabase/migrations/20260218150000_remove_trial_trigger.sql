-- Remove the database-level trial trigger.
-- The 14-day free trial is now managed entirely by Stripe (trial_period_days on checkout).
-- The profiles columns (subscription_tier, subscription_status, trial_ends_at) are
-- updated only via the stripe-webhook edge function.

DROP TRIGGER IF EXISTS trigger_set_trial_end_date ON profiles;
DROP FUNCTION IF EXISTS set_trial_end_date();
