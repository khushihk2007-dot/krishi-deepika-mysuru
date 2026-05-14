import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useLang } from "@/hooks/useLang";
import { MANDIS, calcCost, defaultPickup, haversineKm, type MandiId, type Vehicle } from "@/data/logistics";

interface Props {
  open: boolean;
  vehicle: Vehicle | null;
  listingId?: string;
  onOpenChange: (o: boolean) => void;
  onBooked: () => void;
}

export function BookingDialog({ open, vehicle, listingId, onOpenChange, onBooked }: Props) {
  const { user } = useAuth();
  const { lang, t } = useLang();
  const [pickup, setPickup] = useState(() => defaultPickup());
  const [detecting, setDetecting] = useState(false);
  const [mandiId, setMandiId] = useState<MandiId>("bandipalya_apmc");
  const [shareLoad, setShareLoad] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setPickup(defaultPickup());
      setMandiId("bandipalya_apmc");
      setShareLoad(false);
    }
  }, [open]);

  const mandi = MANDIS.find((m) => m.id === mandiId)!;
  const distance = useMemo(() => haversineKm(pickup, mandi), [pickup, mandi]);
  const cost = vehicle ? calcCost(vehicle, distance) : 0;
  const finalCost = shareLoad ? Math.round(cost / 2) : cost;

  const detect = () => {
    if (!navigator.geolocation) return;
    setDetecting(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPickup({ lat: pos.coords.latitude, lng: pos.coords.longitude, label: t("veh.detected") });
        setDetecting(false);
      },
      () => {
        toast({ title: "Location unavailable", description: "Using Mysuru as default pickup." });
        setDetecting(false);
      },
      { timeout: 8000 },
    );
  };

  const confirm = async () => {
    if (!user || !vehicle) return;
    setSaving(true);
    const { error } = await supabase.from("vehicle_bookings").insert({
      user_id: user.id,
      listing_id: listingId ?? null,
      vehicle: vehicle.id,
      pickup_lat: pickup.lat,
      pickup_lng: pickup.lng,
      pickup_label: pickup.label,
      drop_mandi: mandiId,
      distance_km: distance,
      estimated_cost: cost,
      share_load: shareLoad,
    });
    setSaving(false);
    if (error) {
      toast({ title: "Booking failed", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: t("veh.bookingSaved") });
    onBooked();
    onOpenChange(false);
  };

  if (!vehicle) return null;
  const vName = lang === "kn" ? vehicle.nameKn : vehicle.nameEn;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{vName}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-xl border border-glass-border bg-background/60 p-3">
            <Label className="flex items-center gap-1 text-xs uppercase tracking-wide text-muted-foreground">
              <MapPin className="h-3 w-3" /> {t("veh.pickup")}
            </Label>
            <div className="mt-1 flex items-center justify-between gap-2">
              <span className="truncate text-sm">{pickup.label} ({pickup.lat.toFixed(3)}, {pickup.lng.toFixed(3)})</span>
              <Button size="sm" variant="glass" onClick={detect} disabled={detecting} className="shrink-0">
                {detecting ? <Loader2 className="h-3 w-3 animate-spin" /> : t("veh.detect")}
              </Button>
            </div>
          </div>

          <div>
            <Label className="text-xs uppercase tracking-wide text-muted-foreground">{t("veh.drop")}</Label>
            <Select value={mandiId} onValueChange={(v) => setMandiId(v as MandiId)}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                {MANDIS.map((m) => (
                  <SelectItem key={m.id} value={m.id}>{lang === "kn" ? m.nameKn : m.nameEn}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-glass-border bg-background/60 p-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">{t("veh.distance")}</p>
              <p className="mt-1 text-lg font-semibold">{distance} {t("veh.km")}</p>
            </div>
            <div className="rounded-xl border border-primary/30 bg-primary/5 p-3">
              <p className="text-xs uppercase tracking-wide text-primary">{t("veh.cost")}</p>
              <p className="mt-1 text-lg font-semibold">
                ₹{finalCost}
                {shareLoad && <span className="ml-1 text-xs text-muted-foreground line-through">₹{cost}</span>}
              </p>
            </div>
          </div>

          <div className="flex items-start justify-between gap-3 rounded-xl border border-glass-border bg-background/60 p-3">
            <div>
              <Label htmlFor="share" className="text-sm">{t("veh.share")}</Label>
              <p className="text-xs text-muted-foreground">{t("veh.shareHint")}</p>
            </div>
            <Switch id="share" checked={shareLoad} onCheckedChange={setShareLoad} />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="glass" onClick={() => onOpenChange(false)}>{t("veh.cancel")}</Button>
          <Button variant="field" onClick={confirm} disabled={saving}>
            {saving && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}
            {t("veh.confirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
