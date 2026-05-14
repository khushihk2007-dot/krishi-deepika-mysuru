
CREATE TYPE public.vehicle_type AS ENUM ('tata_ace','mahindra_bolero','eicher_14ft','tractor_trailer');
CREATE TYPE public.mandi_destination AS ENUM ('bandipalya_apmc','maddur_coconut','ramanagara_silk','chamarajanagar_turmeric');
CREATE TYPE public.booking_status AS ENUM ('booked','out_for_pickup','at_mandi','sold');

CREATE TABLE public.crop_listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  crop text NOT NULL,
  quantity numeric NOT NULL,
  unit text NOT NULL DEFAULT 'kg',
  price_per_unit numeric,
  transport_needed boolean NOT NULL DEFAULT false,
  notes text,
  status text NOT NULL DEFAULT 'open',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.crop_listings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own listings select" ON public.crop_listings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own listings insert" ON public.crop_listings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own listings update" ON public.crop_listings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "own listings delete" ON public.crop_listings FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER crop_listings_touch BEFORE UPDATE ON public.crop_listings
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE public.vehicle_bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  listing_id uuid REFERENCES public.crop_listings(id) ON DELETE SET NULL,
  vehicle public.vehicle_type NOT NULL,
  pickup_lat numeric,
  pickup_lng numeric,
  pickup_label text,
  drop_mandi public.mandi_destination NOT NULL,
  distance_km numeric NOT NULL,
  estimated_cost numeric NOT NULL,
  share_load boolean NOT NULL DEFAULT false,
  status public.booking_status NOT NULL DEFAULT 'booked',
  scheduled_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.vehicle_bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own bookings select" ON public.vehicle_bookings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "share load bookings select" ON public.vehicle_bookings FOR SELECT USING (share_load = true AND status IN ('booked','out_for_pickup'));
CREATE POLICY "own bookings insert" ON public.vehicle_bookings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own bookings update" ON public.vehicle_bookings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "own bookings delete" ON public.vehicle_bookings FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER vehicle_bookings_touch BEFORE UPDATE ON public.vehicle_bookings
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
