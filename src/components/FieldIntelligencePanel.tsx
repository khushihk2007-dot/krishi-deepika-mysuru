import { AlertTriangle, Droplets, Leaf, Phone, Sprout, Thermometer, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Language, Region, uiLabels } from "@/data/krishiMysuru";

const phPosition = (ph: number) => `${Math.min(100, Math.max(0, ((ph - 4) / 6) * 100))}%`;
const cropScores = [94, 88, 82, 79];

export function FieldIntelligencePanel({ region, language }: { region: Region; language: Language }) {
  const labels = uiLabels[language];
  const localized = region[language];
  const isAcidic = region.ph < 6;

  return (
    <aside className="fixed bottom-0 left-0 right-0 z-[900] max-h-[58vh] overflow-y-auto rounded-t-lg border border-glass-border bg-glass/82 p-4 text-glass-foreground shadow-glass backdrop-blur-panel animate-sheet-in md:bottom-6 md:left-auto md:right-6 md:top-24 md:max-h-[calc(100vh-7.5rem)] md:w-[390px] md:rounded-lg md:p-5 md:animate-panel-in">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-glass-foreground/65">{labels.health}</p>
          <h2 className="mt-1 font-display text-3xl font-bold leading-tight">{localized.name}</h2>
        </div>
        <div className="rounded-md bg-primary px-3 py-2 text-center text-primary-foreground shadow-control">
          <p className="text-[10px] font-bold uppercase tracking-widest">pH</p>
          <p className="text-xl font-black">{region.ph.toFixed(1)}</p>
        </div>
      </div>

      {isAcidic && (
        <div className="mb-5 flex gap-3 rounded-lg bg-warning p-4 text-warning-foreground shadow-control">
          <AlertTriangle className="mt-0.5 size-5 shrink-0" />
          <p className="text-sm font-semibold leading-snug">{localized.tip}</p>
        </div>
      )}

      <div className="rounded-lg border border-glass-border bg-background/12 p-4">
        <div className="mb-3 flex items-center justify-between gap-3 text-sm font-semibold">
          <span>{labels.soil}</span>
          <span className="text-right text-glass-foreground/78">{localized.soil}</span>
        </div>
        <div className="relative h-4 rounded-full bg-gradient-to-r from-warning via-success to-accent">
          <div className="absolute -top-2 h-8 w-1 rounded-full bg-glass-foreground shadow-control" style={{ left: phPosition(region.ph) }} />
        </div>
        <div className="mt-2 flex justify-between text-[11px] font-semibold text-glass-foreground/62">
          <span>Acidic</span><span>Neutral</span><span>Alkaline</span>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-lg border border-glass-border bg-background/12 p-4 transition-transform hover:-translate-y-0.5">
          <Thermometer className="mb-3 size-5 text-accent" />
          <p className="text-xs text-glass-foreground/65">{labels.temp}</p>
          <p className="text-lg font-bold">{region.temp}</p>
        </div>
        <div className="rounded-lg border border-glass-border bg-background/12 p-4 transition-transform hover:-translate-y-0.5">
          <Droplets className="mb-3 size-5 text-primary" />
          <p className="text-xs text-glass-foreground/65">{labels.hum}</p>
          <p className="text-lg font-bold">{region.hum}</p>
        </div>
      </div>

      {!isAcidic && (
        <div className="mt-4 rounded-lg border border-glass-border bg-background/12 p-4">
          <div className="flex items-start gap-3">
            <Leaf className="mt-0.5 size-5 text-primary" />
            <p className="text-sm font-medium leading-snug text-glass-foreground/86">{localized.tip}</p>
          </div>
        </div>
      )}

      <div className="mt-5">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-display text-lg font-bold">{labels.recommend}</h3>
          <Sprout className="size-5 text-primary" />
        </div>
        <div className="grid gap-3">
          {localized.crops.map((crop, index) => (
            <div key={crop} className="flex items-center justify-between rounded-lg border border-glass-border bg-background/12 p-3 transition-transform hover:translate-x-1">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary/18 text-primary"><Sprout className="size-5" /></div>
                <span className="truncate font-semibold">{crop}</span>
              </div>
              <div className="flex shrink-0 items-center gap-2 text-sm font-bold text-accent"><TrendingUp className="size-4" />{cropScores[index] ?? 76}%</div>
            </div>
          ))}
        </div>
      </div>

      <Button variant="field" className="mt-5 w-full"><Phone className="size-4" />{labels.call}</Button>
    </aside>
  );
}
