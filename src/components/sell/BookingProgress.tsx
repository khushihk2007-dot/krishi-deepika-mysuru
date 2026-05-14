import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLang } from "@/hooks/useLang";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const STEPS = ["booked", "out_for_pickup", "at_mandi", "sold"] as const;
type Status = (typeof STEPS)[number];

export function BookingProgress({
  bookingId,
  status,
  onChanged,
}: {
  bookingId: string;
  status: Status;
  onChanged: () => void;
}) {
  const { t } = useLang();
  const idx = STEPS.indexOf(status);
  const next = STEPS[idx + 1];

  const advance = async () => {
    if (!next) return;
    const { error } = await supabase.from("vehicle_bookings").update({ status: next }).eq("id", bookingId);
    if (error) toast({ title: "Update failed", description: error.message, variant: "destructive" });
    else onChanged();
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        {STEPS.map((s, i) => (
          <div key={s} className="flex flex-1 items-center gap-2">
            <div
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                i <= idx ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}
            >
              {i < idx ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
            </div>
            {i < STEPS.length - 1 && (
              <div className={`h-1 flex-1 rounded-full ${i < idx ? "bg-primary" : "bg-muted"}`} />
            )}
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium">{t(`status.${status}` as any)}</span>
        {next && (
          <Button size="sm" variant="glass" onClick={advance}>
            {t("status.advance")} → {t(`status.${next}` as any)}
          </Button>
        )}
      </div>
    </div>
  );
}
