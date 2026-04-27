import { useState } from "react";
import { Briefcase, Building2, CloudSun, Globe2, Handshake, Leaf, Map, Mic, Package, Phone, ShoppingCart, Sprout, TrendingUp, Users } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer } from "recharts";
import { Button } from "@/components/ui/button";
import { FieldIntelligencePanel } from "@/components/FieldIntelligencePanel";
import { KrishiMap } from "@/components/KrishiMap";
import { getRegionContent, Language, RegionId, regions } from "@/data/krishiMysuru";

type Role = "home" | "farmer" | "buyer" | "labourer";
type FarmerTab = "overview" | "field" | "market" | "sell" | "fpo" | "labour" | "schemes";

const copy = {
  en: {
    hero: "Increase your income with smart farming",
    sub: "A smart farming companion for crops, climate, prices, buyers, labour and schemes.",
    farmer: "I am a Farmer", buyer: "I am a Buyer", labourer: "I am a Labourer", voice: "Voice help",
    stats: ["₹3,250/qtl tomato", "UAE demand ↑", "Ginger best crop"],
    tabs: { overview: "My Farm", field: "Field Intelligence", market: "Prices", sell: "Sell", fpo: "FPO", labour: "Labour", schemes: "Schemes" },
    demand: "High Demand Crops Abroad", climate: "Climate & Prediction", market: "Market Intelligence", direct: "Direct Selling", fpo: "Farmer Groups", labour: "Labour Marketplace", schemes: "Government Schemes",
    best: "Best crop this month", sellNow: "Best time to sell", apply: "Apply now", contact: "Contact farmer", nearby: "Nearby jobs", wage: "Daily wage", track: "Order tracking", browse: "Browse crops",
    benefit: "Benefit", eligibility: "Eligibility", details: "Details",
  },
  kn: {
    hero: "ಸ್ಮಾರ್ಟ್ ಕೃಷಿಯಿಂದ ನಿಮ್ಮ ಆದಾಯ ಹೆಚ್ಚಿಸಿ",
    sub: "ಬೆಳೆ, ಹವಾಮಾನ, ಬೆಲೆ, ಖರೀದಿದಾರರು, ಕಾರ್ಮಿಕರು ಮತ್ತು ಯೋಜನೆಗಳಿಗೆ ಕೃಷಿ ಸಹಾಯಕ.",
    farmer: "ನಾನು ರೈತ", buyer: "ನಾನು ಖರೀದಿದಾರ", labourer: "ನಾನು ಕಾರ್ಮಿಕ", voice: "ಧ್ವನಿ ಸಹಾಯ",
    stats: ["ಟೊಮೆಟೊ ₹3,250/qtl", "UAE ಬೇಡಿಕೆ ↑", "ಶುಂಠಿ ಉತ್ತಮ ಬೆಳೆ"],
    tabs: { overview: "ನನ್ನ ಕೃಷಿ", field: "ಕ್ಷೇತ್ರ ಮಾಹಿತಿ", market: "ಬೆಲೆಗಳು", sell: "ಮಾರಾಟ", fpo: "FPO", labour: "ಕಾರ್ಮಿಕ", schemes: "ಯೋಜನೆಗಳು" },
    demand: "ವಿದೇಶದಲ್ಲಿ ಹೆಚ್ಚು ಬೇಡಿಕೆಯ ಬೆಳೆಗಳು", climate: "ಹವಾಮಾನ ಮತ್ತು ಮುನ್ಸೂಚನೆ", market: "ಮಾರುಕಟ್ಟೆ ಮಾಹಿತಿ", direct: "ನೇರ ಮಾರಾಟ", fpo: "ರೈತ ಗುಂಪುಗಳು", labour: "ಕಾರ್ಮಿಕ ಮಾರುಕಟ್ಟೆ", schemes: "ಸರ್ಕಾರಿ ಯೋಜನೆಗಳು",
    best: "ಈ ತಿಂಗಳ ಉತ್ತಮ ಬೆಳೆ", sellNow: "ಮಾರಾಟಕ್ಕೆ ಉತ್ತಮ ಸಮಯ", apply: "ಈಗ ಅರ್ಜಿ", contact: "ರೈತನನ್ನು ಸಂಪರ್ಕಿಸಿ", nearby: "ಹತ್ತಿರದ ಕೆಲಸಗಳು", wage: "ದಿನ ಕೂಲಿ", track: "ಆರ್ಡರ್ ಟ್ರ್ಯಾಕಿಂಗ್", browse: "ಬೆಳೆಗಳನ್ನು ನೋಡಿ",
    benefit: "ಲಾಭ", eligibility: "ಅರ್ಹತೆ", details: "ವಿವರಗಳು",
  },
  hi: {
    hero: "स्मार्ट खेती से अपनी आय बढ़ाएँ",
    sub: "फसल, मौसम, कीमत, खरीदार, मजदूर और योजनाओं के लिए स्मार्ट कृषि साथी।",
    farmer: "मैं किसान हूँ", buyer: "मैं खरीदार हूँ", labourer: "मैं मजदूर हूँ", voice: "वॉयस सहायता",
    stats: ["टमाटर ₹3,250/qtl", "UAE मांग ↑", "अदरक श्रेष्ठ फसल"],
    tabs: { overview: "मेरा खेत", field: "फील्ड इंटेलिजेंस", market: "कीमतें", sell: "बेचना", fpo: "FPO", labour: "मजदूर", schemes: "योजनाएँ" },
    demand: "विदेश में अधिक मांग वाली फसलें", climate: "मौसम और पूर्वानुमान", market: "बाज़ार जानकारी", direct: "सीधी बिक्री", fpo: "किसान समूह", labour: "मजदूर बाज़ार", schemes: "सरकारी योजनाएँ",
    best: "इस महीने की श्रेष्ठ फसल", sellNow: "बेचने का अच्छा समय", apply: "अभी आवेदन", contact: "किसान से संपर्क", nearby: "नज़दीकी काम", wage: "दैनिक मज़दूरी", track: "ऑर्डर ट्रैकिंग", browse: "फसलें देखें",
    benefit: "लाभ", eligibility: "पात्रता", details: "विवरण",
  },
} as const;

const demandCrops = [
  { icon: "🎋", crop: "Sugarcane", country: "UAE", profit: "+28%" },
  { icon: "🍅", crop: "Tomato", country: "Europe", profit: "+34%" },
  { icon: "🫚", crop: "Ginger", country: "Singapore", profit: "+41%" },
];
const priceTrend = [{ v: 28 }, { v: 34 }, { v: 31 }, { v: 42 }, { v: 48 }, { v: 54 }, { v: 61 }];

const Index = () => {
  const [language, setLanguage] = useState<Language>("en");
  const [role, setRole] = useState<Role>("home");
  const [farmerTab, setFarmerTab] = useState<FarmerTab>("overview");
  const [selectedId, setSelectedId] = useState<RegionId>("gokulam");
  const selectedRegion = regions[selectedId];
  const selectedContent = getRegionContent(selectedRegion, selectedId, language);
  const t = copy[language];

  const Card = ({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) => (
    <section className="rounded-[1.5rem] border border-glass-border bg-card/88 p-4 shadow-control backdrop-blur-panel">
      <div className="mb-3 flex items-center gap-2"><span className="text-2xl">{icon}</span><h2 className="font-display text-lg font-black">{title}</h2></div>{children}
    </section>
  );

  const roleButtons = (
    <div className="grid gap-3 sm:grid-cols-3">
      <Button variant="field" className="h-14 rounded-full text-base font-black" onClick={() => setRole("farmer")}><Sprout />{t.farmer}</Button>
      <Button variant="secondaryFarm" className="h-14 rounded-full text-base font-black" onClick={() => setRole("buyer")}><ShoppingCart />{t.buyer}</Button>
      <Button variant="secondaryFarm" className="h-14 rounded-full text-base font-black" onClick={() => setRole("labourer")}><Briefcase />{t.labourer}</Button>
    </div>
  );

  return (
    <main className="min-h-[100svh] overflow-hidden bg-background text-foreground">
      <header className="sticky top-0 z-[950] border-b border-glass-border bg-glass/92 px-4 py-3 shadow-control backdrop-blur-panel">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
          <button className="flex items-center gap-3 text-left" onClick={() => setRole("home")}><span className="flex size-11 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-control"><Leaf /></span><span><strong className="block font-display text-lg">Krishi-Mysuru</strong><small className="font-bold text-muted-foreground">Smart Farm Companion</small></span></button>
          <nav className="flex items-center gap-2 rounded-full border border-glass-border bg-card/80 p-1">
            {(["en", "kn", "hi"] as Language[]).map((lng) => <Button key={lng} variant={language === lng ? "field" : "ghost"} size="sm" className="rounded-full" onClick={() => setLanguage(lng)}>{lng === "en" ? "EN" : lng === "kn" ? "ಕನ್ನಡ" : "हिंदी"}</Button>)}
          </nav>
        </div>
      </header>

      {role === "home" && <section className="mx-auto grid max-w-7xl gap-6 px-4 py-6 md:grid-cols-[1.1fr_0.9fr] md:py-10"><div className="rounded-[2rem] border border-glass-border bg-gradient-to-br from-card via-secondary/45 to-background p-6 shadow-glass md:p-10"><div className="mb-5 inline-flex items-center gap-2 rounded-full bg-secondary/60 px-4 py-2 text-sm font-black"><Globe2 className="size-4" /> EN · ಕನ್ನಡ · हिंदी</div><h1 className="font-display text-4xl font-black leading-tight md:text-6xl">{t.hero}</h1><p className="mt-4 max-w-2xl text-lg font-semibold text-muted-foreground">{t.sub}</p><div className="mt-7">{roleButtons}</div></div><div className="grid gap-4">{t.stats.map((stat) => <Card key={stat} title={stat} icon="🌾"><p className="text-sm font-bold text-muted-foreground">Live demand signal for Mysuru farmers</p></Card>)}<Button variant="secondaryFarm" className="h-14 rounded-full text-base font-black"><Mic />{t.voice}</Button></div></section>}

      {role === "farmer" && <section className="mx-auto max-w-7xl px-4 py-5"><div className="mb-4 flex gap-2 overflow-x-auto pb-2">{(Object.keys(t.tabs) as FarmerTab[]).map((tab) => <Button key={tab} variant={farmerTab === tab ? "field" : "glass"} className="rounded-full" onClick={() => setFarmerTab(tab)}>{tab === "field" && <Map />}{t.tabs[tab]}</Button>)}</div>{farmerTab === "field" ? <div className="relative h-[calc(100svh-9.5rem)] min-h-[560px] overflow-hidden rounded-[2rem] border border-glass-border shadow-glass"><KrishiMap selectedId={selectedId} language={language} onSelect={setSelectedId} /><div className="absolute left-4 top-4 z-[850] rounded-[1.25rem] border border-glass-border bg-glass/92 p-4 shadow-control backdrop-blur-panel"><p className="text-xs font-black uppercase text-muted-foreground">Live Field</p><p className="font-display text-xl font-black">{selectedContent.name}</p><p className="text-sm font-bold text-muted-foreground">{selectedContent.soil}</p></div><FieldIntelligencePanel region={selectedRegion} regionId={selectedId} language={language} /></div> : <div className="grid gap-4 lg:grid-cols-3"><Card title={t.demand} icon="🌱"><div className="grid gap-3">{demandCrops.map((c) => <div key={c.crop} className="flex items-center justify-between rounded-2xl bg-secondary/35 p-3"><span className="text-3xl">{c.icon}</span><div className="flex-1 px-3"><p className="font-black">{c.crop}</p><p className="text-sm font-bold text-muted-foreground">{c.country}</p></div><b className="text-primary">{c.profit}</b></div>)}</div></Card><Card title={t.climate} icon="☀️"><div className="space-y-3 font-bold"><p><CloudSun className="mr-2 inline size-5 text-primary" /> 28-35°C · Rain risk low</p><p className="rounded-2xl bg-accent/35 p-3">{t.best}: Ginger 🫚</p><p className="text-muted-foreground">Best sowing window: 12 days</p></div></Card><Card title={t.market} icon="💰"><div className="h-28"><ResponsiveContainer width="100%" height="100%"><AreaChart data={priceTrend}><Area dataKey="v" type="monotone" stroke="hsl(var(--primary))" fill="hsl(var(--secondary))" strokeWidth={3} /></AreaChart></ResponsiveContainer></div><p className="mt-2 font-black text-primary">{t.sellNow}: 6 days</p></Card><Card title={t.direct} icon="🤝"><Button variant="field" className="w-full rounded-full"><Package />Sell Crop</Button><Button variant="secondaryFarm" className="mt-3 w-full rounded-full"><Phone />Buyer Chat / Call</Button></Card><Card title={t.fpo} icon="🏢"><p className="font-bold text-muted-foreground">Group selling gives better price and bulk export opportunities.</p><Button variant="secondaryFarm" className="mt-4 w-full rounded-full"><Users />Join FPO</Button></Card><Card title={t.labour} icon="🧑‍🌾"><p className="font-black">Need 5 workers for harvest</p><p className="text-sm font-bold text-muted-foreground">Ratings enabled · Nearby labourers</p><Button variant="field" className="mt-4 w-full rounded-full"><Briefcase />Post Job</Button></Card><Card title={t.schemes} icon="🏦"><p className="font-bold">Subsidies · Loans · Eligibility checker</p><Button variant="secondaryFarm" className="mt-4 w-full rounded-full">{t.apply}</Button></Card></div>}</section>}

      {role === "buyer" && <section className="mx-auto grid max-w-7xl gap-4 px-4 py-6 lg:grid-cols-3"><Card title={t.browse} icon="🛒"><p className="font-bold text-muted-foreground">Filter by location, quantity and price.</p></Card><Card title="Bulk purchase via FPO" icon="🏢"><p className="font-bold text-muted-foreground">Sugarcane · Tomato · Ginger lots ready.</p></Card><Card title={t.track} icon="📦"><p className="font-bold text-muted-foreground">Order #KM-204 reaches tomorrow.</p><Button variant="field" className="mt-4 w-full rounded-full">{t.contact}</Button></Card></section>}

      {role === "labourer" && <section className="mx-auto grid max-w-7xl gap-4 px-4 py-6 lg:grid-cols-3"><Card title={t.nearby} icon="👷"><p className="font-black">Harvest work · Nanjangud</p><p className="text-sm font-bold text-muted-foreground">5 km away · Apply with 1 click</p></Card><Card title={t.wage} icon="💰"><p className="font-display text-3xl font-black text-primary">₹650/day</p><p className="font-bold text-muted-foreground">Current local average</p></Card><Card title="Work history + ratings" icon="⭐"><p className="font-display text-3xl font-black text-primary">4.8/5</p><Button variant="field" className="mt-4 w-full rounded-full">Apply now</Button></Card></section>}
    </main>
  );
};

export default Index;
