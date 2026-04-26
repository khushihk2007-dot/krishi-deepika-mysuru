import { useMemo, useState } from "react";
import { Moon, Satellite, SunMedium } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FieldIntelligencePanel } from "@/components/FieldIntelligencePanel";
import { KrishiMap } from "@/components/KrishiMap";
import { Language, RegionId, regions, uiLabels } from "@/data/krishiMysuru";

const Index = () => {
  const [language, setLanguage] = useState<Language>("en");
  const [selectedId, setSelectedId] = useState<RegionId>("gokulam");
  const [isDark, setIsDark] = useState(true);
  const selectedRegion = regions[selectedId];
  const labels = uiLabels[language];
  const themeClass = isDark ? "dark" : "";

  const subtitle = useMemo(
    () => (language === "en" ? "Pro Farmer Precision Dashboard 2026" : "ಪ್ರೊ ಫಾರ್ಮರ್ ನಿಖರ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್ 2026"),
    [language],
  );

  return (
    <main className={`${themeClass} relative h-screen overflow-hidden bg-background text-foreground`}>
      <KrishiMap selectedId={selectedId} language={language} onSelect={setSelectedId} />

      <div className="pointer-events-none absolute inset-x-0 top-0 z-[850] h-36 bg-gradient-to-b from-background/80 to-background/0" />

      <header className="pointer-events-none fixed left-0 right-0 top-0 z-[950] flex items-start justify-between gap-3 p-4 md:p-6">
        <section className="pointer-events-auto max-w-[calc(100vw-1.5rem)] rounded-lg border border-glass-border bg-glass/76 px-4 py-3 text-glass-foreground shadow-glass backdrop-blur-panel md:px-5">
          <div className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-control">
              <Satellite className="size-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-glass-foreground/64">{labels.dashboard}</p>
              <h1 className="truncate font-display text-lg font-black leading-tight md:text-2xl">Krishi-Mysuru</h1>
              <p className="hidden text-sm text-glass-foreground/72 sm:block">{subtitle}</p>
            </div>
          </div>
        </section>

        <nav className="pointer-events-auto flex shrink-0 items-center gap-2 rounded-lg border border-glass-border bg-glass/76 p-2 text-glass-foreground shadow-glass backdrop-blur-panel">
          <Button variant={language === "en" ? "field" : "ghost"} size="sm" onClick={() => setLanguage("en")}>
            English
          </Button>
          <Button variant={language === "kn" ? "field" : "ghost"} size="sm" onClick={() => setLanguage("kn")}>
            ಕನ್ನಡ
          </Button>
          <Button variant="glass" size="icon" aria-label="Toggle theme" onClick={() => setIsDark((value) => !value)}>
            {isDark ? <SunMedium className="size-4" /> : <Moon className="size-4" />}
          </Button>
        </nav>
      </header>

      <div className="fixed bottom-[60vh] left-4 z-[850] hidden rounded-lg border border-glass-border bg-glass/74 p-3 text-glass-foreground shadow-glass backdrop-blur-panel md:bottom-6 md:block">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-glass-foreground/60">Live Field</p>
        <p className="mt-1 font-display text-xl font-bold">{selectedRegion[language].name}</p>
        <p className="text-sm text-glass-foreground/72">{selectedRegion[language].soil}</p>
      </div>

      <FieldIntelligencePanel region={selectedRegion} language={language} />
    </main>
  );
};

export default Index;
