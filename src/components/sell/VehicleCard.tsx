import { Truck, Weight, Clock, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLang } from "@/hooks/useLang";
import type { Vehicle } from "@/data/logistics";

interface Props {
  vehicle: Vehicle;
  selected?: boolean;
  onSelect: () => void;
}

export function VehicleCard({ vehicle, selected, onSelect }: Props) {
  const { lang, t } = useLang();
  const name = lang === "kn" ? vehicle.nameKn : vehicle.nameEn;
  const capacity = lang === "kn" ? vehicle.capacityKn : vehicle.capacityEn;
  const ideal = lang === "kn" ? vehicle.idealKn : vehicle.idealEn;
  const rate = vehicle.flatRate ? `₹${vehicle.flatRate} ${t("veh.flat")}` : `₹${vehicle.ratePerKm}/${t("veh.km")}`;

  return (
    <div
      className={`glass-card lift-btn flex flex-col gap-3 rounded-2xl p-5 ${
        selected ? "ring-2 ring-primary" : ""
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="rounded-xl bg-primary/10 p-3 text-primary">
          <Truck className="h-6 w-6" />
        </div>
        <Badge variant="secondary" className="gap-1">
          <Weight className="h-3 w-3" /> {capacity}
        </Badge>
      </div>
      <div>
        <h3 className="text-lg font-semibold">{name}</h3>
        <p className="text-sm text-muted-foreground">{ideal}</p>
      </div>
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <Clock className="h-4 w-4" /> {vehicle.etaMin} {t("veh.minutes")}
        </span>
        <span className="inline-flex items-center gap-1 text-foreground">
          <TrendingUp className="h-4 w-4 text-primary" /> {rate}
        </span>
      </div>
      <Button variant={selected ? "default" : "field"} className="rounded-xl" onClick={onSelect}>
        {t("veh.book")}
      </Button>
    </div>
  );
}
