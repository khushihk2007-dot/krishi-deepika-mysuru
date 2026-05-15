ALTER TYPE public.labour_skill ADD VALUE IF NOT EXISTS 'pesticide_spraying';
ALTER TYPE public.labour_skill ADD VALUE IF NOT EXISTS 'tractor_driving';

ALTER TABLE public.buyer_details
  ADD COLUMN IF NOT EXISTS company_name text,
  ADD COLUMN IF NOT EXISTS primary_interest text;