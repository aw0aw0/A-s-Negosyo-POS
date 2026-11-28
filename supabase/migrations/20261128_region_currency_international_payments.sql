-- Regional settings are initially nullable so each browser can infer a sensible
-- country/currency before the owner saves it. The application persists that choice.
ALTER TABLE public.stores
  ADD COLUMN IF NOT EXISTS country_code text,
  ADD COLUMN IF NOT EXISTS currency_code text,
  ADD COLUMN IF NOT EXISTS paypal_me_url text,
  ADD COLUMN IF NOT EXISTS paypal_email text;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'stores_country_code_iso2_check') THEN
    ALTER TABLE public.stores
      ADD CONSTRAINT stores_country_code_iso2_check
      CHECK (country_code IS NULL OR country_code ~ '^[A-Z]{2}$');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'stores_currency_code_allowed_check') THEN
    ALTER TABLE public.stores
      ADD CONSTRAINT stores_currency_code_allowed_check
      CHECK (currency_code IS NULL OR currency_code IN ('PHP','AED','USD','SGD','EUR','GBP','SAR','CAD','AUD'));
  END IF;
END $$;

COMMENT ON COLUMN public.stores.country_code IS 'ISO 3166-1 alpha-2 store region; initialized from the owner browser region when unset.';
COMMENT ON COLUMN public.stores.currency_code IS 'Store transaction currency; initialized from the owner browser region when unset.';

ALTER TABLE public.subscription_payments
  ADD COLUMN IF NOT EXISTS payment_method text NOT NULL DEFAULT 'qr_ph',
  ADD COLUMN IF NOT EXISTS currency_code text NOT NULL DEFAULT 'PHP';

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'subscription_payments_method_allowed_check') THEN
    ALTER TABLE public.subscription_payments
      ADD CONSTRAINT subscription_payments_method_allowed_check
      CHECK (payment_method IN ('qr_ph','paypal','bank_transfer'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'subscription_payments_currency_allowed_check') THEN
    ALTER TABLE public.subscription_payments
      ADD CONSTRAINT subscription_payments_currency_allowed_check
      CHECK (currency_code IN ('PHP','AED','USD','SGD','EUR','GBP','SAR','CAD','AUD'));
  END IF;
END $$;
