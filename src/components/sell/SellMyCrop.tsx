import { useEffect, useState } from "react";
import { Sprout, Plus, Truck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useLang } from "@/hooks/useLang";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { VehicleCard } from "./VehicleCard";
import { BookingDialog } from "./BookingDialog";
import { BookingProgress } from "./BookingProgress";
import { VEHICLES, MANDIS, type Vehicle } from "@/data/logistics";

interface Listing {
  id: string;
  crop: string;
  quantity: number;
  unit: string;
  price_per_unit: number | null;
  transport_needed: boolean;
  status: string;
  created_at: string;
}

interface Booking {
  id: string;
  vehicle: string;
  drop_mandi: string;
  distance_km: number;
  estimated_cost: number;
  share_load: boolean;
  status: "booked" | "out_for_pickup" | "at_mandi" | "sold";
  created_at: string;
}

export function SellMyCrop() {
  const { user } = useAuth();
  const { lang, t } = useLang();
  const [listings, setListings] = useState<Listing[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [crop, setCrop] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("kg");
  const [price, setPrice] = useState("");
  const [notes, setNotes] = useState("");
  const [transportNeeded, setTransportNeeded] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [activeListingId, setActiveListingId] = useState<string | undefined>();
  const [dialogOpen, setDialogOpen] = useState(false);

  const refresh = async () => {
    if (!user) return;
    const [{ data: ls }, { data: bs }] = await Promise.all([
      supabase.from("crop_listings").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
      supabase.from("vehicle_bookings").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
    ]);
    setListings((ls as Listing[]) ?? []);
    setBookings((bs as Booking[]) ?? []);
  };

  useEffect(() => { refresh(); }, [user]);

  const submitListing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !crop || !quantity) return;
    setSubmitting(true);
    const { data, error } = await supabase
      .from("crop_listings")
      .insert({
        user_id: user.id,
        crop,
        quantity: Number(quantity),
        unit,
        price_per_unit: price ? Number(price) : null,
        transport_needed: transportNeeded,
        notes: notes || null,
      })
      .select("id")
      .single();
    setSubmitting(false);
    if (error) {
      toast({ title: "Failed to list crop", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: t("veh.listingSaved") });
    setCrop(""); setQuantity(""); setPrice(""); setNotes("");
    setActiveListingId(data?.id);
    refresh();
  };

  const openBooking = (v: Vehicle, listingId?: string) => {
    setSelectedVehicle(v);
    setActiveListingId(listingId);
    setDialogOpen(true);
  };

  return (
    <section className="space-y-8">
      {/* Sell form */}
      <div className="glass-card rounded-2xl p-6">
        <header className="mb-4 flex items-center gap-2">
          <Sprout className="h-5 w-5 text-primary" />
          <div>
            <h2 className="text-xl font-semibold">{t("sell.title")}</h2>
            <p className="text-sm text-muted-foreground">{t("sell.sub")}</p>
          </div>
        </header>

        <form onSubmit={submitListing} className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label>{t("sell.crop")}</Label>
            <Input value={crop} onChange={(e) => setCrop(e.target.value)} required placeholder="e.g. Banana, Turmeric" className="mt-1" />
          </div>
          <div>
            <Label>{t("sell.quantity")}</Label>
            <Input type="number" min="0" step="0.1" value={quantity} onChange={(e) => setQuantity(e.target.value)} required className="mt-1" />
          </div>
          <div>
            <Label>{t("sell.unit")}</Label>
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="kg">kg</option>
              <option value="ton">ton / ಟನ್</option>
              <option value="quintal">quintal</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <Label>{t("sell.price")}</Label>
            <Input type="number" min="0" value={price} onChange={(e) => setPrice(e.target.value)} className="mt-1" />
          </div>
          <div className="sm:col-span-2">
            <Label>{t("sell.notes")}</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="mt-1" />
          </div>
          <div className="flex items-center justify-between rounded-xl border border-glass-border bg-background/60 p-3 sm:col-span-2">
            <Label htmlFor="transport" className="text-sm font-medium">{t("sell.transportNeeded")}</Label>
            <Switch id="transport" checked={transportNeeded} onCheckedChange={setTransportNeeded} />
          </div>
          <Button type="submit" variant="field" className="rounded-xl sm:col-span-2" disabled={submitting}>
            <Plus className="h-4 w-4" /> {t("sell.list")}
          </Button>
        </form>
      </div>

      {/* Vehicle rental — visible when toggle ON or no listings yet */}
      {transportNeeded && (
        <div className="glass-card rounded-2xl p-6">
          <header className="mb-4 flex items-center gap-2">
            <Truck className="h-5 w-5 text-primary" />
            <div>
              <h2 className="text-xl font-semibold">{t("veh.title")}</h2>
              <p className="text-sm text-muted-foreground">{t("veh.sub")}</p>
            </div>
          </header>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {VEHICLES.map((v) => (
              <VehicleCard
                key={v.id}
                vehicle={v}
                selected={selectedVehicle?.id === v.id && dialogOpen}
                onSelect={() => openBooking(v, activeListingId ?? listings[0]?.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Listings */}
      <div className="glass-card rounded-2xl p-6">
        <h3 className="mb-4 text-lg font-semibold">{t("sell.myListings")}</h3>
        {listings.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("sell.empty")}</p>
        ) : (
          <ul className="space-y-2">
            {listings.map((l) => (
              <li key={l.id} className="flex items-center justify-between rounded-xl border border-glass-border bg-background/60 p-3">
                <div>
                  <p className="font-medium">{l.crop} <span className="text-muted-foreground">— {l.quantity} {l.unit}</span></p>
                  {l.price_per_unit != null && <p className="text-xs text-muted-foreground">₹{l.price_per_unit}/{l.unit}</p>}
                </div>
                <div className="flex items-center gap-2">
                  {l.transport_needed && <Badge variant="secondary"><Truck className="mr-1 h-3 w-3" /> Transport</Badge>}
                  <Badge>{l.status}</Badge>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Bookings */}
      {bookings.length > 0 && (
        <div className="glass-card rounded-2xl p-6">
          <h3 className="mb-4 text-lg font-semibold">{t("sell.bookings")}</h3>
          <ul className="space-y-4">
            {bookings.map((b) => {
              const v = VEHICLES.find((x) => x.id === b.vehicle);
              const m = MANDIS.find((x) => x.id === b.drop_mandi);
              const vName = v ? (lang === "kn" ? v.nameKn : v.nameEn) : b.vehicle;
              const mName = m ? (lang === "kn" ? m.nameKn : m.nameEn) : b.drop_mandi;
              return (
                <li key={b.id} className="rounded-xl border border-glass-border bg-background/60 p-4">
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-medium">{vName} → {mName}</p>
                      <p className="text-xs text-muted-foreground">
                        {b.distance_km} {t("veh.km")} · ₹{b.estimated_cost}
                        {b.share_load && " · shared"}
                      </p>
                    </div>
                  </div>
                  <BookingProgress bookingId={b.id} status={b.status} onChanged={refresh} />
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <BookingDialog
        open={dialogOpen}
        vehicle={selectedVehicle}
        listingId={activeListingId}
        onOpenChange={setDialogOpen}
        onBooked={refresh}
      />
    </section>
  );
}
