import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Briefcase, Calendar, CheckCircle, CloudSun, Globe2, IndianRupee, Leaf, Map, MapPin, Mic, Moon, Package, Phone, Search, ShoppingCart, Sprout, Sun, Users, X } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer } from "recharts";
import { Button } from "@/components/ui/button";
import { FieldIntelligencePanel } from "@/components/FieldIntelligencePanel";
import { KrishiMap } from "@/components/KrishiMap";
import { getRegionContent, Language, RegionId, regions } from "@/data/krishiMysuru";

type Role = "home" | "farmer" | "buyer" | "labourer";
type FarmerTab = "overview" | "field" | "export" | "market" | "sell" | "fpo" | "labour" | "schemes";
type ViewState = { role: Role; farmerTab: FarmerTab };
type SchemeContent = { title: string; benefit: string; eligibility: string; description: string; tag: string; icon: string };
type Scheme = Record<Language, SchemeContent> & { id: string };
type ExportCropContent = { crop: string; destination: string; demand: string; profit: string; reason: string; tag: string; icon: string };
type ExportCrop = { district: string; id: string; flags: string } & Record<Language, ExportCropContent>;
type LabourJob = { id: number; title: Record<"en" | "kn", string>; location: Record<"en" | "kn", string>; wage: string; date: string; totalSlots: number; filledSlots: number; isApplied: boolean };

const copy = {
  en: {
    hero: "Increase your income with smart farming",
    sub: "A smart farming companion for crops, climate, prices, buyers, labour and schemes.",
    farmer: "I am a Farmer", buyer: "I am a Buyer", labourer: "I am a Labourer", voice: "Voice help",
    stats: ["₹3,250/qtl tomato", "UAE demand ↑", "Ginger best crop"],
    tabs: { overview: "My Farm", field: "Field Intelligence", export: "Export", market: "Prices", sell: "Sell", fpo: "FPO", labour: "Labour", schemes: "Schemes" },
    demand: "High Demand Crops Abroad", climate: "Climate & Prediction", market: "Market Intelligence", direct: "Direct Selling", fpo: "Farmer Groups", labour: "Labour Marketplace", schemes: "Government Schemes",
    best: "Best crop this month", sellNow: "Best time to sell", apply: "Apply now", contact: "Contact farmer", nearby: "Nearby jobs", wage: "Daily wage", track: "Order tracking", browse: "Browse crops",
    benefit: "Benefit", eligibility: "Eligibility", details: "Details", destination: "Target countries", profit: "Profit", reason: "Reason for demand",
  },
  kn: {
    hero: "ಸ್ಮಾರ್ಟ್ ಕೃಷಿಯಿಂದ ನಿಮ್ಮ ಆದಾಯ ಹೆಚ್ಚಿಸಿ",
    sub: "ಬೆಳೆ, ಹವಾಮಾನ, ಬೆಲೆ, ಖರೀದಿದಾರರು, ಕಾರ್ಮಿಕರು ಮತ್ತು ಯೋಜನೆಗಳಿಗೆ ಕೃಷಿ ಸಹಾಯಕ.",
    farmer: "ನಾನು ರೈತ", buyer: "ನಾನು ಖರೀದಿದಾರ", labourer: "ನಾನು ಕಾರ್ಮಿಕ", voice: "ಧ್ವನಿ ಸಹಾಯ",
    stats: ["ಟೊಮೆಟೊ ₹3,250/qtl", "UAE ಬೇಡಿಕೆ ↑", "ಶುಂಠಿ ಉತ್ತಮ ಬೆಳೆ"],
    tabs: { overview: "ನನ್ನ ಕೃಷಿ", field: "ಕ್ಷೇತ್ರ ಮಾಹಿತಿ", export: "ರಫ್ತು", market: "ಬೆಲೆಗಳು", sell: "ಮಾರಾಟ", fpo: "FPO", labour: "ಕಾರ್ಮಿಕ", schemes: "ಯೋಜನೆಗಳು" },
    demand: "ವಿದೇಶದಲ್ಲಿ ಹೆಚ್ಚು ಬೇಡಿಕೆಯ ಬೆಳೆಗಳು", climate: "ಹವಾಮಾನ ಮತ್ತು ಮುನ್ಸೂಚನೆ", market: "ಮಾರುಕಟ್ಟೆ ಮಾಹಿತಿ", direct: "ನೇರ ಮಾರಾಟ", fpo: "ರೈತ ಗುಂಪುಗಳು", labour: "ಕಾರ್ಮಿಕ ಮಾರುಕಟ್ಟೆ", schemes: "ಸರ್ಕಾರಿ ಯೋಜನೆಗಳು",
    best: "ಈ ತಿಂಗಳ ಉತ್ತಮ ಬೆಳೆ", sellNow: "ಮಾರಾಟಕ್ಕೆ ಉತ್ತಮ ಸಮಯ", apply: "ಈಗ ಅರ್ಜಿ", contact: "ರೈತನನ್ನು ಸಂಪರ್ಕಿಸಿ", nearby: "ಹತ್ತಿರದ ಕೆಲಸಗಳು", wage: "ದಿನ ಕೂಲಿ", track: "ಆರ್ಡರ್ ಟ್ರ್ಯಾಕಿಂಗ್", browse: "ಬೆಳೆಗಳನ್ನು ನೋಡಿ",
    benefit: "ಲಾಭ", eligibility: "ಅರ್ಹತೆ", details: "ವಿವರಗಳು", destination: "ಗುರಿ ದೇಶಗಳು", profit: "ಲಾಭ", reason: "ಬೇಡಿಕೆಯ ಕಾರಣ",
  },
  hi: {
    hero: "स्मार्ट खेती से अपनी आय बढ़ाएँ",
    sub: "फसल, मौसम, कीमत, खरीदार, मजदूर और योजनाओं के लिए स्मार्ट कृषि साथी।",
    farmer: "मैं किसान हूँ", buyer: "मैं खरीदार हूँ", labourer: "मैं मजदूर हूँ", voice: "वॉयस सहायता",
    stats: ["टमाटर ₹3,250/qtl", "UAE मांग ↑", "अदरक श्रेष्ठ फसल"],
    tabs: { overview: "मेरा खेत", field: "फील्ड इंटेलिजेंस", export: "निर्यात", market: "कीमतें", sell: "बेचना", fpo: "FPO", labour: "मजदूर", schemes: "योजनाएँ" },
    demand: "विदेश में अधिक मांग वाली फसलें", climate: "मौसम और पूर्वानुमान", market: "बाज़ार जानकारी", direct: "सीधी बिक्री", fpo: "किसान समूह", labour: "मजदूर बाज़ार", schemes: "सरकारी योजनाएँ",
    best: "इस महीने की श्रेष्ठ फसल", sellNow: "बेचने का अच्छा समय", apply: "अभी आवेदन", contact: "किसान से संपर्क", nearby: "नज़दीकी काम", wage: "दैनिक मज़दूरी", track: "ऑर्डर ट्रैकिंग", browse: "फसलें देखें",
    benefit: "लाभ", eligibility: "पात्रता", details: "विवरण", destination: "लक्ष्य देश", profit: "लाभ", reason: "मांग का कारण",
  },
} as const;

const exportCrops = [
  { district: "Mysuru", id: "mys_banana", flags: "🇦🇪 🇪🇺 🇺🇸", en: { crop: "Nanjangud Rasabale (Banana)", destination: "UAE, Europe, USA", demand: "Very High", profit: "+45%", reason: "Unique aroma and GI status; preferred as a luxury dessert fruit.", tag: "GI Protected", icon: "🍌" }, kn: { crop: "ನಂಜನಗೂಡು ರಸಬಾಳೆ", destination: "ಯುಎಇ, ಯುರೋಪ್, ಅಮೇರಿಕಾ", demand: "ಅತಿ ಹೆಚ್ಚು", profit: "+45%", reason: "ವಿಶಿಷ್ಟ ಸುಗಂಧ ಮತ್ತು ಜಿಐ ಟ್ಯಾಗ್; ಐಷಾರಾಮಿ ಹಣ್ಣಾಗಿ ವಿದೇಶಗಳಲ್ಲಿ ಬಳಕೆ.", tag: "ಜಿಕಾಯ್ ರಕ್ಷಿತ", icon: "🍌" }, hi: { crop: "नंजनगुड रसबाले केला", destination: "UAE, यूरोप, अमेरिका", demand: "बहुत अधिक", profit: "+45%", reason: "विशिष्ट सुगंध और GI टैग के कारण विदेशों में लक्ज़री फल के रूप में पसंद।", tag: "GI संरक्षित", icon: "🍌" } },
  { district: "Mandya", id: "man_jaggery", flags: "🇦🇪 🇰🇼 🇬🇧", en: { crop: "Organic Jaggery (Block/Powder)", destination: "UAE, Kuwait, UK", demand: "High", profit: "+35%", reason: "Chemical-free process; high demand in health-conscious Middle East markets.", tag: "Health-Tech", icon: "🍯" }, kn: { crop: "ಸಾವಯವ ಬೆಲ್ಲ", destination: "ಯುಎಇ, ಕುವೈತ್, ಯುಕೆ", demand: "ಹೆಚ್ಚು", profit: "+35%", reason: "ರಾಸಾಯನಿಕ ಮುಕ್ತ ತಯಾರಿ; ಅರಬ್ ದೇಶಗಳಲ್ಲಿ ಆರೋಗ್ಯಕರ ಸಕ್ಕರೆಯಾಗಿ ಬಳಕೆ.", tag: "ಹೆಲ್ತ್-ಟೆಕ್", icon: "🍯" }, hi: { crop: "ऑर्गेनिक गुड़", destination: "UAE, कुवैत, UK", demand: "अधिक", profit: "+35%", reason: "रसायन-मुक्त प्रक्रिया के कारण स्वास्थ्य-सचेत Middle East बाजारों में मांग।", tag: "हेल्थ-टेक", icon: "🍯" } },
  { district: "Chamarajanagar", id: "cha_turmeric", flags: "🇺🇸 🇩🇪 🇯🇵", en: { crop: "High-Curcumin Turmeric", destination: "USA, Germany, Japan", demand: "Very High", profit: "+40%", reason: "High curcumin content used in global pharmaceutical and cosmetic industries.", tag: "Industrial Grade", icon: "🌶️" }, kn: { crop: "ಅರಿಶಿನ (ಹೆಚ್ಚಿನ ಕುರ್ಕ್ಯುಮಿನ್)", destination: "ಅಮೇರಿಕಾ, ಜರ್ಮನಿ, ಜಪಾನ್", demand: "ಅತಿ ಹೆಚ್ಚು", profit: "+40%", reason: "ಔಷಧೀಯ ಮತ್ತು ಸೌಂದರ್ಯವರ್ಧಕ ಉದ್ದೇಶಗಳಿಗಾಗಿ ಜಾಗತಿಕ ಬೇಡಿಕೆ.", tag: "ಕೈಗಾರಿಕಾ ದರ್ಜೆ", icon: "🌶️" }, hi: { crop: "उच्च करक्यूमिन हल्दी", destination: "अमेरिका, जर्मनी, जापान", demand: "बहुत अधिक", profit: "+40%", reason: "अधिक करक्यूमिन के कारण फार्मा और कॉस्मेटिक उद्योगों में वैश्विक मांग।", tag: "औद्योगिक ग्रेड", icon: "🌶️" } },
  { district: "Kodagu", id: "kod_coffee", flags: "🇮🇹 🇳🇴 🇯🇵", en: { crop: "Monsooned Malabar Coffee", destination: "Italy, Norway, Japan", demand: "Stable/Premium", profit: "+50%", reason: "Unique processing method; high value in specialty coffee shops abroad.", tag: "Premium Blend", icon: "☕" }, kn: { crop: "ಮಾನ್ಸೂನ್ ಮಲಬಾರ್ ಕಾಫಿ", destination: "ಇಟಲಿ, ನಾರ್ವೆ, ಜಪಾನ್", demand: "ಸ್ಥಿರ/ಪ್ರೀಮಿಯಂ", profit: "+50%", reason: "ವಿಶಿಷ್ಟ ಸಂಸ್ಕರಣಾ ವಿಧಾನ; ವಿದೇಶಿ ಕೆಫೆಗಳಲ್ಲಿ ಅತ್ಯಂತ ಹೆಚ್ಚಿನ ಬೆಲೆ.", tag: "ಪ್ರೀಮಿಯಂ ಬ್ಲೆಂಡ್", icon: "☕" }, hi: { crop: "मॉनसून्ड मालाबार कॉफी", destination: "इटली, नॉर्वे, जापान", demand: "स्थिर/प्रीमियम", profit: "+50%", reason: "विशिष्ट प्रोसेसिंग के कारण विदेशों के specialty coffee shops में उच्च मूल्य।", tag: "प्रीमियम ब्लेंड", icon: "☕" } },
  { district: "Haveri (Byadgi)", id: "hav_chilli", flags: "🇺🇸 🇪🇺 🌏", en: { crop: "Byadgi Chilli (Oleoresin)", destination: "USA, Europe, Southeast Asia", demand: "Very High", profit: "+55%", reason: "Used for natural food coloring (Oleoresin) with zero heat/pungency.", tag: "Global GI", icon: "🌶️" }, kn: { crop: "ಬ್ಯಾಡಗಿ ಮೆಣಸಿನಕಾಯಿ", destination: "ಅಮೇರಿಕಾ, ಯುರೋಪ್", demand: "ಅತಿ ಹೆಚ್ಚು", profit: "+55%", reason: "ನೈಸರ್ಗಿಕ ಆಹಾರ ಬಣ್ಣ ತಯಾರಿಸಲು ಅಂತರಾಷ್ಟ್ರೀಯ ಮಟ್ಟದಲ್ಲಿ ಬಳಕೆ.", tag: "ಜಾಗತಿಕ ಜಿಐ", icon: "🌶️" }, hi: { crop: "ब्याडगी मिर्च", destination: "अमेरिका, यूरोप, दक्षिण-पूर्व एशिया", demand: "बहुत अधिक", profit: "+55%", reason: "प्राकृतिक food coloring oleoresin के लिए अंतरराष्ट्रीय उपयोग।", tag: "वैश्विक GI", icon: "🌶️" } },
  { district: "Hassan", id: "has_potato", flags: "🇸🇬 🇱🇰", en: { crop: "Processing-Grade Potato", destination: "Singapore, Sri Lanka", demand: "Moderate", profit: "+25%", reason: "High starch content ideal for making chips and processed snacks.", tag: "Value Chain", icon: "🥔" }, kn: { crop: "ಸಂಸ್ಕರಣಾ ದರ್ಜೆಯ ಆಲೂಗಡ್ಡೆ", destination: "ಸಿಂಗಾಪುರ, ಶ್ರೀಲಂಕಾ", demand: "ಮಧ್ಯಮ", profit: "+25%", reason: "ಚಿಪ್ಸ್ ಮತ್ತು ಸಂಸ್ಕರಿಸಿದ ತಿಂಡಿಗಳ ತಯಾರಿಕೆಗೆ ಹೆಚ್ಚು ಸೂಕ್ತ.", tag: "ಮೌಲ್ಯವರ್ಧನೆ", icon: "🥔" }, hi: { crop: "प्रोसेसिंग-ग्रेड आलू", destination: "सिंगापुर, श्रीलंका", demand: "मध्यम", profit: "+25%", reason: "अधिक स्टार्च के कारण chips और processed snacks के लिए उपयुक्त।", tag: "वैल्यू चेन", icon: "🥔" } },
  { district: "Vijayapura/Bagalkot", id: "vij_grapes", flags: "🇳🇱 🇧🇩 🇦🇪", en: { crop: "Seedless Grapes / Pomegranate", destination: "Netherlands, Bangladesh, UAE", demand: "High", profit: "+38%", reason: "Excellent shelf life and size; high sugar content (Brix level).", tag: "Export Quality", icon: "🍇" }, kn: { crop: "ಬೀಜವಿಲ್ಲದ ದ್ರಾಕ್ಷಿ / ದಾಳಿಂಬೆ", destination: "ನೆದರ್ಲ್ಯಾಂಡ್ಸ್, ಬಾಂಗ್ಲಾದೇಶ, ಯುಎಇ", demand: "ಹೆಚ್ಚು", profit: "+38%", reason: "ದೀರ್ಘ ಬಾಳಿಕೆ ಮತ್ತು ಸಿಹಿ ಅಂಶ (Brix level) ಹೆಚ್ಚಿರುವುದರಿಂದ ಬೇಡಿಕೆ.", tag: "ರಫ್ತು ಗುಣಮಟ್ಟ", icon: "🍇" }, hi: { crop: "बीजरहित अंगूर / अनार", destination: "नीदरलैंड, बांग्लादेश, UAE", demand: "अधिक", profit: "+38%", reason: "बेहतरीन shelf life, आकार और अधिक मिठास (Brix level) के कारण मांग।", tag: "निर्यात गुणवत्ता", icon: "🍇" } },
] satisfies ExportCrop[];
const priceTrend = [{ v: 28 }, { v: 34 }, { v: 31 }, { v: 42 }, { v: 48 }, { v: 54 }, { v: 61 }];
const initialLabourJobs: LabourJob[] = [
  { id: 1, title: { en: "Banana Harvesting", kn: "ಬಾಳೆಹಣ್ಣು ಕೊಯ್ಲು" }, location: { en: "Nanjangud, Mysuru", kn: "ನಂಜನಗೂಡು, ಮೈಸೂರು" }, wage: "650", date: "2026-05-12", totalSlots: 10, filledSlots: 7, isApplied: false },
  { id: 2, title: { en: "Coffee Bean Picking", kn: "ಕಾಫಿ ಬೀಜ ಆರಿಸುವುದು" }, location: { en: "Somwarpet, Kodagu", kn: "ಸೋಮವಾರಪೇಟೆ, ಕೊಡಗು" }, wage: "550", date: "2026-05-15", totalSlots: 20, filledSlots: 18, isApplied: false },
];
const labourCopy = {
  en: { wage: "per day", apply: "Apply Now", applied: "Applied", slots: "Slots Left", find: "Find Nearby Work" },
  kn: { wage: "ಪ್ರತಿದಿನ", apply: "ಈಗಲೇ ಅನ್ವಯಿಸಿ", applied: "ಅನ್ವಯಿಸಲಾಗಿದೆ", slots: "ಖಾಲಿ ಇರುವ ಸ್ಥಾನಗಳು", find: "ಹತ್ತಿರದ ಕೆಲಸ ಹುಡುಕಿ" },
  hi: { wage: "per day", apply: "Apply Now", applied: "Applied", slots: "Slots Left", find: "Find Nearby Work" },
} as const;

const governmentSchemes = [
  { id: "pm_kisan", en: { title: "PM-KISAN", benefit: "₹6,000 yearly", eligibility: "Landholding farmers", description: "Direct income support in 3 equal installments.", tag: "Central Sector", icon: "💰" }, kn: { title: "ಪಿಎಂ-ಕಿಸಾನ್", benefit: "ವರ್ಷಕ್ಕೆ ₹6,000", eligibility: "ಭೂಮಿ ಹೊಂದಿರುವ ರೈತರು", description: "3 ಸಮಾನ ಕಂತುಗಳಲ್ಲಿ ನೇರ ಆದಾಯ ಬೆಂಬಲ.", tag: "ಕೇಂದ್ರ ವಲಯ", icon: "💰" }, hi: { title: "पीएम-किसान", benefit: "₹6,000 प्रति वर्ष", eligibility: "भूमि रखने वाले किसान", description: "3 समान किस्तों में सीधा आय समर्थन।", tag: "केंद्रीय क्षेत्र", icon: "💰" } },
  { id: "pm_kmy", en: { title: "PM Kisan Maandhan (PM-KMY)", benefit: "₹3,000 monthly pension", eligibility: "Small farmers (Age 18-40)", description: "Old age pension security after attaining 60 years.", tag: "Pension", icon: "👴" }, kn: { title: "ಪಿಎಂ ಕಿಸಾನ್ ಮಾಂಧನ್", benefit: "₹3,000 ಮಾಸಿಕ ಪಿಂಚಣಿ", eligibility: "ಸಣ್ಣ ರೈತರು (ವಯಸ್ಸು 18-40)", description: "60 ವರ್ಷ ತುಂಬಿದ ನಂತರ ವೃದ್ಧಾಪ್ಯ ಪಿಂಚಣಿ ಭದ್ರತೆ.", tag: "ಪಿಂಚಣಿ", icon: "👴" }, hi: { title: "पीएम किसान मानधन", benefit: "₹3,000 मासिक पेंशन", eligibility: "छोटे किसान (उम्र 18-40)", description: "60 वर्ष के बाद वृद्धावस्था पेंशन सुरक्षा।", tag: "पेंशन", icon: "👴" } },
  { id: "pmfby", en: { title: "PM Fasal Bima Yojana", benefit: "Comprehensive Insurance", eligibility: "All notified crops", description: "Insurance against all natural risks from pre-sowing to harvest.", tag: "Insurance", icon: "🛡️" }, kn: { title: "ಪಿಎಂ ಫಸಲ್ ಬಿಮಾ ಯೋಜನೆ", benefit: "ಸಮಗ್ರ ವಿಮೆ", eligibility: "ಅಧಿಸೂಚಿತ ಬೆಳೆಗಳು", description: "ಬಿತ್ತನೆಯಿಂದ ಕೊಯ್ಲಿನವರೆಗಿನ ಎಲ್ಲಾ ನೈಸರ್ಗಿಕ ಅಪಾಯಗಳ ವಿರುದ್ಧ ವಿಮೆ.", tag: "ವಿಮೆ", icon: "🛡️" }, hi: { title: "पीएम फसल बीमा योजना", benefit: "व्यापक बीमा", eligibility: "सभी अधिसूचित फसलें", description: "बुवाई से कटाई तक प्राकृतिक जोखिमों के विरुद्ध बीमा।", tag: "बीमा", icon: "🛡️" } },
  { id: "miss_loan", en: { title: "Modified Interest Subvention", benefit: "Loans at 4% interest", eligibility: "Short term crop loans", description: "3% additional subvention for prompt repayment on loans up to ₹3L.", tag: "Credit", icon: "🏦" }, kn: { title: "ಬಡ್ಡಿ ಸಹಾಯಧನ ಯೋಜನೆ", benefit: "4% ಬಡ್ಡಿಯಲ್ಲಿ ಸಾಲ", eligibility: "ಅಲ್ಪಾವಧಿ ಬೆಳೆ ಸಾಲಗಳು", description: "ಸಕಾಲದಲ್ಲಿ ಮರುಪಾವತಿ ಮಾಡಿದರೆ ಹೆಚ್ಚುವರಿ 3% ಬಡ್ಡಿ ರಿಯಾಯಿತಿ.", tag: "ಸಾಲ", icon: "🏦" }, hi: { title: "ब्याज सहायता योजना", benefit: "4% ब्याज पर ऋण", eligibility: "अल्पकालिक फसल ऋण", description: "₹3 लाख तक के ऋण पर समय पर भुगतान के लिए 3% अतिरिक्त छूट।", tag: "ऋण", icon: "🏦" } },
  { id: "aif", en: { title: "Agri Infra Fund (AIF)", benefit: "3% Interest Subvention", eligibility: "Startups, FPOs, PACS", description: "Medium-long term debt for post-harvest management infrastructure.", tag: "Infrastructure", icon: "🏭" }, kn: { title: "ಕೃಷಿ ಮೂಲಸೌಕರ್ಯ ನಿಧಿ", benefit: "3% ಬಡ್ಡಿ ಸಹಾಯಧನ", eligibility: "ಸ್ಟಾರ್ಟ್‌ಅಪ್‌ಗಳು, FPO ಗಳು", description: "ಕೊಯ್ಲಿನ ನಂತರದ ಮೂಲಸೌಕರ್ಯ ನಿರ್ವಹಣೆಗಾಗಿ ದೀರ್ಘಾವಧಿ ಸಾಲ.", tag: "ಮೂಲಸೌಕರ್ಯ", icon: "🏭" }, hi: { title: "कृषि इंफ्रा फंड", benefit: "3% ब्याज सहायता", eligibility: "स्टार्टअप, FPO, PACS", description: "कटाई के बाद प्रबंधन ढांचे के लिए मध्यम-दीर्घकालिक ऋण।", tag: "इंफ्रास्ट्रक्चर", icon: "🏭" } },
  { id: "fpo_promotion", en: { title: "10,000 FPOs Scheme", benefit: "₹18 Lakh financial aid", eligibility: "Groups of farmers", description: "Professional support to form Farmer Producer Organizations.", tag: "Group Farming", icon: "🤝" }, kn: { title: "10,000 FPO ಗಳ ರಚನೆ", benefit: "₹18 ಲಕ್ಷ ಆರ್ಥಿಕ ನೆರವು", eligibility: "ರೈತ ಗುಂಪುಗಳು", description: "ರೈತ ಉತ್ಪಾದಕ ಸಂಸ್ಥೆಗಳನ್ನು ರಚಿಸಲು ವೃತ್ತಿಪರ ಬೆಂಬಲ.", tag: "ಗುಂಪು ಕೃಷಿ", icon: "🤝" }, hi: { title: "10,000 FPO योजना", benefit: "₹18 लाख वित्तीय सहायता", eligibility: "किसान समूह", description: "किसान उत्पादक संगठन बनाने के लिए पेशेवर समर्थन।", tag: "समूह खेती", icon: "🤝" } },
  { id: "nbhm", en: { title: "Honey Mission (NBHM)", benefit: "Scientific Beekeeping Support", eligibility: "Registered beekeepers", description: "Promotion of 'Sweet Revolution' through scientific apiculture.", tag: "Beekeeping", icon: "🐝" }, kn: { title: "ಜೇನು ಸಾಕಣೆ ಮಿಷನ್", benefit: "ವೈಜ್ಞಾನಿಕ ಜೇನುಸಾಕಣೆ ಬೆಂಬಲ", eligibility: "ನೋಂದಾಯಿತ ಜೇನುಸಾಕಣೆದಾರರು", description: "ವೈಜ್ಞಾನಿಕ ಕೃಷಿಯ ಮೂಲಕ 'ಸಿಹಿ ಕ್ರಾಂತಿ'ಯ ಪ್ರಚಾರ.", tag: "ಜೇನು ಸಾಕಣೆ", icon: "🐝" }, hi: { title: "हनी मिशन", benefit: "वैज्ञानिक मधुमक्खी पालन समर्थन", eligibility: "पंजीकृत मधुमक्खी पालक", description: "वैज्ञानिक मधुमक्खी पालन से स्वीट रिवोल्यूशन को बढ़ावा।", tag: "मधुमक्खी पालन", icon: "🐝" } },
  { id: "drone_didi", en: { title: "Namo Drone Didi", benefit: "80% Subsidy on Drones", eligibility: "Women SHGs", description: "Providing drones for rental services to local farmers.", tag: "Technology", icon: "🚁" }, kn: { title: "ನಮೋ ಡ್ರೋನ್ ದೀದಿ", benefit: "80% ಡ್ರೋನ್ ಸಹಾಯಧನ", eligibility: "ಮಹಿಳಾ ಸ್ವಸಹಾಯ ಸಂಘಗಳು", description: "ಸ್ಥಳೀಯ ರೈತರಿಗೆ ಬಾಡಿಗೆ ಸೇವೆ ನೀಡಲು ಡ್ರೋನ್ ಒದಗಿಸುವುದು.", tag: "ತಂತ್ರಜ್ಞಾನ", icon: "🚁" }, hi: { title: "नमो ड्रोन दीदी", benefit: "ड्रोन पर 80% सब्सिडी", eligibility: "महिला स्वयं सहायता समूह", description: "स्थानीय किसानों को किराये की सेवा के लिए ड्रोन।", tag: "तकनीक", icon: "🚁" } },
  { id: "rkvy_dpr", en: { title: "RKVY-DPR", benefit: "Infrastructure Grants", eligibility: "States & Agri-Startups", description: "Support for pre & post-harvest infrastructure creation.", tag: "Development", icon: "🏗️" }, kn: { title: "RKVY-DPR", benefit: "ಮೂಲಸೌಕರ್ಯ ಅನುದಾನ", eligibility: "ರಾಜ್ಯಗಳು ಮತ್ತು ಸ್ಟಾರ್ಟ್‌ಅಪ್‌ಗಳು", description: "ಕೊಯ್ಲಿಗೆ ಮೊದಲು ಮತ್ತು ನಂತರದ ಮೂಲಸೌಕರ್ಯ ರಚನೆಗೆ ಬೆಂಬಲ.", tag: "ಅಭಿವೃದ್ಧಿ", icon: "🏗️" }, hi: { title: "RKVY-DPR", benefit: "इंफ्रास्ट्रक्चर अनुदान", eligibility: "राज्य और कृषि स्टार्टअप", description: "कटाई से पहले और बाद के ढांचे के लिए समर्थन।", tag: "विकास", icon: "🏗️" } },
  { id: "shc", en: { title: "Soil Health Card (SHC)", benefit: "Free Soil Testing", eligibility: "All Farmers", description: "Nutrient status report with dosage recommendations.", tag: "Soil Health", icon: "🌱" }, kn: { title: "ಮಣ್ಣಿನ ಆರೋಗ್ಯ ಕಾರ್ಡ್", benefit: "ಉಚಿತ ಮಣ್ಣಿನ ಪರೀಕ್ಷೆ", eligibility: "ಎಲ್ಲಾ ರೈತರು", description: "ಪೋಷಕಾಂಶಗಳ ಸ್ಥಿತಿ ಮತ್ತು ಶಿಫಾರಸುಗಳ ವರದಿ.", tag: "ಮಣ್ಣಿನ ಆರೋಗ್ಯ", icon: "🌱" }, hi: { title: "मृदा स्वास्थ्य कार्ड", benefit: "मुफ्त मिट्टी परीक्षण", eligibility: "सभी किसान", description: "पोषक तत्व स्थिति और मात्रा सिफारिश रिपोर्ट।", tag: "मिट्टी स्वास्थ्य", icon: "🌱" } },
  { id: "pdmc", en: { title: "Per Drop More Crop", benefit: "Micro Irrigation Subsidy", eligibility: "Individual Farmers", description: "Drip and Sprinkler systems to improve water efficiency.", tag: "Water", icon: "💧" }, kn: { title: "ಪ್ರತಿ ಹನಿ ಹೆಚ್ಚು ಬೆಳೆ", benefit: "ಸೂಕ್ಷ್ಮ ನೀರಾವರಿ ಸಹಾಯಧನ", eligibility: "ವೈಯಕ್ತಿಕ ರೈತರು", description: "ಹನಿ ಮತ್ತು ತುಂತುರು ನೀರಾವರಿ ಮೂಲಕ ನೀರಿನ ಉಳಿತಾಯ.", tag: "ನೀರು", icon: "💧" }, hi: { title: "पर ड्रॉप मोर क्रॉप", benefit: "सूक्ष्म सिंचाई सब्सिडी", eligibility: "व्यक्तिगत किसान", description: "ड्रिप और स्प्रिंकलर से जल दक्षता बढ़ाना।", tag: "पानी", icon: "💧" } },
  { id: "pkvy", en: { title: "Paramparagat Krishi (PKVY)", benefit: "₹31,500/ha assistance", eligibility: "Organic clusters", description: "Financial aid for organic practices and certification.", tag: "Organic", icon: "🌿" }, kn: { title: "ಪರಂಪರಾಗತ ಕೃಷಿ ವಿಕಾಸ", benefit: "₹31,500/ಹೆಕ್ಟೇರ್ ನೆರವು", eligibility: "ಸಾವಯವ ಗುಂಪುಗಳು", description: "ಸಾವಯವ ಕೃಷಿ ಮತ್ತು ಪ್ರಮಾಣೀಕರಣಕ್ಕಾಗಿ ಆರ್ಥಿಕ ನೆರವು.", tag: "ಸಾವಯವ", icon: "🌿" }, hi: { title: "परंपरागत कृषि विकास", benefit: "₹31,500/हेक्टेयर सहायता", eligibility: "जैविक क्लस्टर", description: "जैविक खेती और प्रमाणन के लिए वित्तीय सहायता।", tag: "जैविक", icon: "🌿" } },
  { id: "smam", en: { title: "Agri Mechanization (SMAM)", benefit: "Machinery Subsidies", eligibility: "Small/Marginal Farmers", description: "Subsidies for Tractors and Custom Hiring Centres.", tag: "Machinery", icon: "🚜" }, kn: { title: "ಕೃಷಿ ಯಾಂತ್ರೀಕರಣ", benefit: "ಯಂತ್ರೋಪಕರಣ ಸಹಾಯಧನ", eligibility: "ಸಣ್ಣ ರೈತರು", description: "ಟ್ರಾಕ್ಟರ್ ಮತ್ತು ಬಾಡಿಗೆ ಕೇಂದ್ರಗಳಿಗೆ ಸಹಾಯಧನ.", tag: "ಯಂತ್ರೋಪಕರಣ", icon: "🚜" }, hi: { title: "कृषि यंत्रीकरण", benefit: "मशीनरी सब्सिडी", eligibility: "छोटे/सीमांत किसान", description: "ट्रैक्टर और कस्टम हायरिंग केंद्रों के लिए सब्सिडी।", tag: "मशीनरी", icon: "🚜" } },
  { id: "nfsm", en: { title: "Food Security (NFSM)", benefit: "Production Support", eligibility: "Pulse & Millet Farmers", description: "Restoring soil fertility and enhancing farm economy.", tag: "Food Security", icon: "🌾" }, kn: { title: "ರಾಷ್ಟ್ರೀಯ ಆಹಾರ ಭದ್ರತೆ", benefit: "ಉತ್ಪಾದನಾ ಬೆಂಬಲ", eligibility: "ಧಾನ್ಯ ಮತ್ತು ಸಿರಿಧಾನ್ಯ ರೈತರು", description: "ಮಣ್ಣಿನ ಫಲವತ್ತತೆ ಮತ್ತು ಕೃಷಿ ಆರ್ಥಿಕತೆ ಸುಧಾರಣೆ.", tag: "ಆಹಾರ ಭದ್ರತೆ", icon: "🌾" }, hi: { title: "राष्ट्रीय खाद्य सुरक्षा", benefit: "उत्पादन समर्थन", eligibility: "दलहन और मोटा अनाज किसान", description: "मिट्टी की उर्वरता और कृषि अर्थव्यवस्था सुधारना।", tag: "खाद्य सुरक्षा", icon: "🌾" } },
  { id: "midh", en: { title: "Horticulture Mission (MIDH)", benefit: "Orchard/Garden Grants", eligibility: "Fruit/Veg growers", description: "Holistic growth of fruits, vegetables, and spices.", tag: "Horticulture", icon: "🍎" }, kn: { title: "ತೋಟಗಾರಿಕೆ ಮಿಷನ್", benefit: "ಹಣ್ಣು/ತರಕಾರಿ ಕೃಷಿ ಅನುದಾನ", eligibility: "ತೋಟಗಾರಿಕೆ ರೈತರು", description: "ಹಣ್ಣು, ತರಕಾರಿ ಮತ್ತು ಮಸಾಲೆ ಪದಾರ್ಥಗಳ ಸಮಗ್ರ ಬೆಂಬಲ.", tag: "ತೋಟಗಾರಿಕೆ", icon: "🍎" }, hi: { title: "बागवानी मिशन", benefit: "बाग/उद्यान अनुदान", eligibility: "फल/सब्जी उत्पादक", description: "फल, सब्ज़ी और मसालों का समग्र विकास।", tag: "बागवानी", icon: "🍎" } },
  { id: "enam", en: { title: "e-NAM", benefit: "Online Trading Access", eligibility: "All Mandi Users", description: "Electronic trading portal for unified national market.", tag: "Marketing", icon: "📱" }, kn: { title: "ಇ-ನ್ಯಾಮ್ (e-NAM)", benefit: "ಆನ್‌ಲೈನ್ ಮಾರುಕಟ್ಟೆ ಪ್ರವೇಶ", eligibility: "ಮಂಡಿ ಬಳಕೆದಾರರು", description: "ಏಕೀಕೃತ ರಾಷ್ಟ್ರೀಯ ಮಾರುಕಟ್ಟೆಗಾಗಿ ಎಲೆಕ್ಟ್ರಾನಿಕ್ ಪೋರ್ಟಲ್.", tag: "ಮಾರುಕಟ್ಟೆ", icon: "📱" }, hi: { title: "ई-नाम", benefit: "ऑनलाइन व्यापार पहुंच", eligibility: "सभी मंडी उपयोगकर्ता", description: "एकीकृत राष्ट्रीय बाजार के लिए इलेक्ट्रॉनिक पोर्टल।", tag: "मार्केटिंग", icon: "📱" } },
  { id: "fruits_ka", en: { title: "FRUITS Karnataka", benefit: "Single Window Subsidy", eligibility: "KA Registered Farmers", description: "Unified information system for all state agri-benefits.", tag: "State Govt", icon: "📑" }, kn: { title: "ಫ್ರೂಟ್ಸ್ ಕರ್ನಾಟಕ", benefit: "ಏಕಗವಾಕ್ಷಿ ಸಹಾಯಧನ", eligibility: "ಕರ್ನಾಟಕದ ರೈತರು", description: "ರಾಜ್ಯದ ಎಲ್ಲಾ ಕೃಷಿ ಸೌಲಭ್ಯಗಳಿಗೆ ಏಕೀಕೃತ ವ್ಯವಸ್ಥೆ.", tag: "ರಾಜ್ಯ ಸರ್ಕಾರ", icon: "📑" }, hi: { title: "FRUITS Karnataka", benefit: "सिंगल विंडो सब्सिडी", eligibility: "कर्नाटक पंजीकृत किसान", description: "राज्य कृषि लाभों के लिए एकीकृत सूचना प्रणाली।", tag: "राज्य सरकार", icon: "📑" } },
  { id: "vidya_nidhi", en: { title: "Raitha Vidya Nidhi", benefit: "Scholarships up to ₹11k", eligibility: "Farmers' Children", description: "Financial aid for higher education (ITI, PUC, Degree).", tag: "Education", icon: "🎓" }, kn: { title: "ರೈತ ವಿದ್ಯಾ ನಿಧಿ", benefit: "₹11,000 ವರೆಗೆ ವಿದ್ಯಾರ್ಥಿವೇತನ", eligibility: "ರೈತರ ಮಕ್ಕಳು", description: "ಉನ್ನತ ಶಿಕ್ಷಣಕ್ಕಾಗಿ (ITI, PUC, ಪದವಿ) ಆರ್ಥಿಕ ನೆರವು.", tag: "ಶಿಕ್ಷಣ", icon: "🎓" }, hi: { title: "रैथा विद्या निधि", benefit: "₹11,000 तक छात्रवृत्ति", eligibility: "किसानों के बच्चे", description: "उच्च शिक्षा (ITI, PUC, डिग्री) के लिए वित्तीय सहायता।", tag: "शिक्षा", icon: "🎓" } },
  { id: "ksheera_siri", en: { title: "Ksheera Siri", benefit: "₹5/Litre Milk Incentive", eligibility: "KMF Dairy Farmers", description: "Direct financial incentive to boost milk production.", tag: "Dairy", icon: "🥛" }, kn: { title: "ಕ್ಷೀರ ಸಿರಿ", benefit: "ಲೀಟರ್‌ಗೆ ₹5 ಪ್ರೋತ್ಸಾಹಧನ", eligibility: "ಹೈನುಗಾರರು", description: "ಹಾಲು ಉತ್ಪಾದನೆ ಹೆಚ್ಚಿಸಲು ನೇರ ಆರ್ಥಿಕ ಪ್ರೋತ್ಸಾಹ.", tag: "ಹೈನುಗಾರಿಕೆ", icon: "🥛" }, hi: { title: "क्षीर सिरी", benefit: "₹5/लीटर दूध प्रोत्साहन", eligibility: "KMF डेयरी किसान", description: "दूध उत्पादन बढ़ाने के लिए सीधा वित्तीय प्रोत्साहन।", tag: "डेयरी", icon: "🥛" } },
  { id: "sasya_sanjeevini", en: { title: "Sasya Sanjeevini", benefit: "Pest Identification Mobile Units", eligibility: "All Farmers", description: "Tech-driven units to identify and control crop pests.", tag: "Plant Health", icon: "🌿" }, kn: { title: "ಸಸ್ಯ ಸಂಜೀವಿನಿ", benefit: "ರೋಗ ಪತ್ತೆ ಸಂಚಾರಿ ಘಟಕಗಳು", eligibility: "ಎಲ್ಲಾ ರೈತರು", description: "ಬೆಳೆ ಕೀಟಗಳನ್ನು ಪತ್ತೆಹಚ್ಚಲು ಮತ್ತು ನಿಯಂತ್ರಿಸಲು ತಂತ್ರಜ್ಞಾನ.", tag: "ಸಸ್ಯ ಆರೋಗ್ಯ", icon: "🌿" }, hi: { title: "सस्य संजीविनी", benefit: "कीट पहचान मोबाइल यूनिट", eligibility: "सभी किसान", description: "फसल कीटों की पहचान और नियंत्रण के लिए तकनीक आधारित इकाइयाँ।", tag: "पौधा स्वास्थ्य", icon: "🌿" } },
  { id: "krishi_bhagya", en: { title: "Krishi Bhagya", benefit: "90% Farm Pond Subsidy", eligibility: "Dry-land Farmers", description: "Support for Krishi Honda and lift pumps.", tag: "Water", icon: "💧" }, kn: { title: "ಕೃಷಿ ಭಾಗ್ಯ", benefit: "ಕೃಷಿ ಹೊಂಡಕ್ಕೆ 90% ಸಹಾಯಧನ", eligibility: "ಒಣಭೂಮಿ ರೈತರು", description: "ಕೃಷಿ ಹೊಂಡ ಮತ್ತು ಲಿಫ್ಟ್ ಪಂಪ್‌ಗಳಿಗೆ ಬೆಂಬಲ.", tag: "ನೀರು", icon: "💧" }, hi: { title: "कृषि भाग्य", benefit: "फार्म पॉन्ड पर 90% सब्सिडी", eligibility: "सूखी भूमि के किसान", description: "कृषि होंडा और लिफ्ट पंप के लिए समर्थन।", tag: "पानी", icon: "💧" } },
  { id: "kusum_solar", en: { title: "PM-KUSUM", benefit: "Up to 90% Solar Subsidy", eligibility: "Borewell Owners", description: "De-dieselizing farms with solar irrigation pumps.", tag: "Energy", icon: "☀️" }, kn: { title: "ಪಿಎಂ-ಕುಸುಮ್", benefit: "90% ಸೌರ ಸಹಾಯಧನ", eligibility: "ಬೋರೆವೆಲ್ ಮಾಲೀಕರು", description: "ಸೌರ ಪಂಪ್‌ಗಳ ಮೂಲಕ ಕೃಷಿ ವಲಯದ ಆಧುನೀಕರಣ.", tag: "ಇಂಧನ", icon: "☀️" }, hi: { title: "पीएम-कुसुम", benefit: "90% तक सौर सब्सिडी", eligibility: "बोरवेल मालिक", description: "सोलर सिंचाई पंपों से खेतों का आधुनिकीकरण।", tag: "ऊर्जा", icon: "☀️" } },
  { id: "agri_digital", en: { title: "Digital Agriculture", benefit: "AgriStack ID access", eligibility: "All Tech-users", description: "Open standard infrastructure for inclusive solutions.", tag: "Digital", icon: "🌐" }, kn: { title: "ಡಿಜಿಟಲ್ ಕೃಷಿ", benefit: "ಅಗ್ರಿಸ್ಟ್ಯಾಕ್ ಐಡಿ ಪ್ರವೇಶ", eligibility: "ತಂತ್ರಜ್ಞಾನ ಬಳಕೆದಾರರು", description: "ರೈತ ಸ್ನೇಹಿ ಪರಿಹಾರಗಳಿಗಾಗಿ ಡಿಜಿಟಲ್ ಮೂಲಸೌಕರ್ಯ.", tag: "ಡಿಜಿಟಲ್", icon: "🌐" }, hi: { title: "डिजिटल कृषि", benefit: "AgriStack ID पहुंच", eligibility: "सभी तकनीक उपयोगकर्ता", description: "समावेशी समाधान के लिए डिजिटल इंफ्रास्ट्रक्चर।", tag: "डिजिटल", icon: "🌐" } },
  { id: "mif_fund", en: { title: "Micro Irrigation Fund", benefit: "Low interest capital", eligibility: "State Agencies", description: "MIF provides low-cost funds to states for micro-irrigation.", tag: "Water", icon: "⛲" }, kn: { title: "ಸೂಕ್ಷ್ಮ ನೀರಾವರಿ ನಿಧಿ", benefit: "ಕಡಿಮೆ ಬಡ್ಡಿ ಬಂಡವಾಳ", eligibility: "ರಾಜ್ಯ ಏಜೆನ್ಸಿಗಳು", description: "ಸೂಕ್ಷ್ಮ ನೀರಾವರಿ ವಿಸ್ತರಿಸಲು ರಾಜ್ಯಗಳಿಗೆ ಕಡಿಮೆ ಬಡ್ಡಿಯ ನಿಧಿ.", tag: "ನೀರು", icon: "⛲" }, hi: { title: "सूक्ष्म सिंचाई निधि", benefit: "कम ब्याज पूंजी", eligibility: "राज्य एजेंसियाँ", description: "सूक्ष्म सिंचाई के लिए राज्यों को कम लागत निधि।", tag: "पानी", icon: "⛲" } },
  { id: "nbm_bamboo", en: { title: "Bamboo Mission", benefit: "Plantation Grants", eligibility: "Bamboo Growers", description: "Linking growers with consumers via cluster approach.", tag: "Alternative", icon: "🎋" }, kn: { title: "ಬಿದಿರು ಮಿಷನ್", benefit: "ಬಿದಿರು ಬೆಳೆ ಅನುದಾನ", eligibility: "ಬಿದಿರು ಬೆಳೆಗಾರರು", description: "ಬೆಳೆಗಾರರನ್ನು ಗ್ರಾಹಕರೊಂದಿಗೆ ಸಂಪರ್ಕಿಸುವ ಯೋಜನೆ.", tag: "ಪರ್ಯಾಯ ಬೆಳೆ", icon: "🎋" }, hi: { title: "बांस मिशन", benefit: "रोपण अनुदान", eligibility: "बांस उत्पादक", description: "क्लस्टर दृष्टिकोण से उत्पादकों को उपभोक्ताओं से जोड़ना।", tag: "वैकल्पिक", icon: "🎋" } },
  { id: "mis_pss", en: { title: "Price Support (PSS)", benefit: "Minimum Support Price", eligibility: "Perishable crop growers", description: "Prevents distress sale during bumper crop arrivals.", tag: "Finance", icon: "⚖️" }, kn: { title: "ಬೆಲೆ ಬೆಂಬಲ ಯೋಜನೆ (PSS)", benefit: "ಕನಿಷ್ಠ ಬೆಂಬಲ ಬೆಲೆ", eligibility: "ತರಕಾರಿ/ಹಣ್ಣು ಬೆಳೆಗಾರರು", description: "ಹೆಚ್ಚು ಇಳುವರಿ ಬಂದಾಗ ಬೆಲೆ ಕುಸಿತದಿಂದ ರಕ್ಷಣೆ.", tag: "ಹಣಕಾಸು", icon: "⚖️" }, hi: { title: "मूल्य समर्थन योजना", benefit: "न्यूनतम समर्थन मूल्य", eligibility: "नाशवान फसल उत्पादक", description: "अधिक आवक पर मजबूरी में बिक्री से बचाव।", tag: "वित्त", icon: "⚖️" } },
  { id: "krishi_yantra", en: { title: "Krishi Yantra Dhare", benefit: "Low cost rental", eligibility: "Small Farmers", description: "Custom Hire Centres for tractors and tillers.", tag: "Machinery", icon: "🚜" }, kn: { title: "ಕೃಷಿ ಯಂತ್ರಧಾರೆ", benefit: "ಕಡಿಮೆ ಬಾಡಿಗೆ ಯಂತ್ರಗಳು", eligibility: "ಸಣ್ಣ ರೈತರು", description: "ಟ್ರಾಕ್ಟರ್ ಮತ್ತು ಟಿಲ್ಲರ್‌ಗಳ ಬಾಡಿಗೆ ಕೇಂದ್ರಗಳು.", tag: "ಯಂತ್ರೋಪಕರಣ", icon: "🚜" }, hi: { title: "कृषि यंत्र धारे", benefit: "कम लागत किराया", eligibility: "छोटे किसान", description: "ट्रैक्टर और टिलर के लिए कस्टम हायर केंद्र।", tag: "मशीनरी", icon: "🚜" } },
] satisfies Array<Record<Language, { title: string; benefit: string; eligibility: string; description: string; tag: string; icon: string }> & { id: string }>;

const Index = () => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem("krishi-language");
    return saved === "kn" || saved === "hi" || saved === "en" ? saved : "en";
  });
  const [schemeSearch, setSchemeSearch] = useState("");
  const [schemeCategory, setSchemeCategory] = useState("all");
  const [schemeEligibility, setSchemeEligibility] = useState("all");
  const [selectedScheme, setSelectedScheme] = useState<Scheme | null>(null);
  const [applyingScheme, setApplyingScheme] = useState<Scheme | null>(null);
  const [exportCountry, setExportCountry] = useState("all");
  const [exportDemand, setExportDemand] = useState("all");
  const [exportProfit, setExportProfit] = useState("all");
  const [selectedCrop, setSelectedCrop] = useState<ExportCrop | null>(null);
  const [sellingCrop, setSellingCrop] = useState<ExportCrop | null>(null);
  const [role, setRole] = useState<Role>("home");
  const [farmerTab, setFarmerTab] = useState<FarmerTab>("overview");
  const [selectedId, setSelectedId] = useState<RegionId>("gokulam");
  const [history, setHistory] = useState<ViewState[]>([]);
  const [theme, setTheme] = useState<"light" | "dark">(() => localStorage.getItem("krishi-theme") === "dark" ? "dark" : "light");
  const [fieldPanelOpen, setFieldPanelOpen] = useState(false);
  const [labourJobs, setLabourJobs] = useState<LabourJob[]>(initialLabourJobs);
  const selectedRegion = regions[selectedId];
  const selectedContent = getRegionContent(selectedRegion, selectedId, language);
  const t = copy[language];
  const labourLabels = labourCopy[language];

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("krishi-theme", theme);
  }, [theme]);

  const navigateTo = (nextRole: Role, nextTab = farmerTab) => {
    setHistory((items) => [...items, { role, farmerTab }].slice(-12));
    setRole(nextRole);
    if (nextRole === "farmer") setFarmerTab(nextTab);
  };
  const goBack = () => {
    const previous = history[history.length - 1];
    if (!previous) return;
    setHistory((items) => items.slice(0, -1));
    setRole(previous.role);
    setFarmerTab(previous.farmerTab);
  };
  const handleApplyJob = (id: number) => setLabourJobs((jobs) => jobs.map((job) => job.id === id ? { ...job, isApplied: true, filledSlots: Math.min(job.totalSlots, job.filledSlots + 1) } : job));

  const setLanguage = (lng: Language) => {
    setLanguageState(lng);
    localStorage.setItem("krishi-language", lng);
  };

  const schemeCategories = useMemo(() => ["all", ...Array.from(new Set(governmentSchemes.map((scheme) => scheme[language].tag)))], [language]);
  const schemeEligibilityOptions = useMemo(() => ["all", ...Array.from(new Set(governmentSchemes.map((scheme) => scheme[language].eligibility)))], [language]);
  const filteredSchemes = governmentSchemes.filter((scheme) => {
    const content = scheme[language];
    const haystack = `${content.title} ${content.benefit} ${content.eligibility} ${content.description} ${content.tag}`.toLowerCase();
    return (
      haystack.includes(schemeSearch.toLowerCase()) &&
      (schemeCategory === "all" || content.tag === schemeCategory) &&
      (schemeEligibility === "all" || content.eligibility === schemeEligibility)
    );
  });

  const countryOptions = useMemo(() => ["all", "UAE", "Europe", "USA", "Japan", "Middle East", "Southeast Asia"], []);
  const demandOptions = useMemo(() => ["all", "Very High", "High", "Moderate", "Stable/Premium"], []);
  const filteredExportCrops = exportCrops.filter((crop) => {
    const content = crop[language];
    const profitValue = Number(content.profit.replace(/[^0-9]/g, ""));
    return (
      (exportCountry === "all" || content.destination.toLowerCase().includes(exportCountry.toLowerCase())) &&
      (exportDemand === "all" || crop.en.demand === exportDemand || content.demand === exportDemand) &&
      (exportProfit === "all" || profitValue >= Number(exportProfit))
    );
  });

  const getSeasonBadge = (cropId: string) => {
    const month = new Date().getMonth();
    const summer = month >= 2 && month <= 5;
    const monsoon = month >= 5 && month <= 9;
    const badge = cropId.includes("banana") || cropId.includes("turmeric") ? (monsoon ? "Best season · low risk" : "Irrigation needed") : summer ? "Harvest window · heat risk" : "Export-ready window";
    return language === "kn" ? badge.replace("Best season · low risk", "ಉತ್ತಮ ಋತು · ಕಡಿಮೆ ಅಪಾಯ").replace("Irrigation needed", "ನೀರಾವರಿ ಅಗತ್ಯ").replace("Harvest window · heat risk", "ಕೊಯ್ಲು ಸಮಯ · ಬಿಸಿಲಿನ ಅಪಾಯ").replace("Export-ready window", "ರಫ್ತು ಸಿದ್ಧ ಸಮಯ") : badge;
  };

  const Card = ({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) => (
    <section className="rounded-[1.5rem] border border-glass-border bg-card/88 p-4 shadow-control backdrop-blur-panel">
      <div className="mb-3 flex items-center gap-2"><span className="text-2xl">{icon}</span><h2 className="font-display text-lg font-black">{title}</h2></div>{children}
    </section>
  );

  const roleButtons = (
    <div className="grid gap-3 sm:grid-cols-3">
      <Button variant="field" className="h-14 rounded-full text-base font-black" onClick={() => navigateTo("farmer")}><Sprout />{t.farmer}</Button>
      <Button variant="secondaryFarm" className="h-14 rounded-full text-base font-black" onClick={() => navigateTo("buyer")}><ShoppingCart />{t.buyer}</Button>
      <Button variant="secondaryFarm" className="h-14 rounded-full text-base font-black" onClick={() => navigateTo("labourer")}><Briefcase />{t.labourer}</Button>
    </div>
  );

  return (
    <main className="min-h-[100svh] overflow-hidden bg-background text-foreground">
      <header className="sticky top-0 z-[950] border-b border-glass-border bg-glass/92 px-4 py-3 shadow-control backdrop-blur-panel">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
          <div className="flex items-center gap-2"><Button variant="glass" size="icon" className="rounded-full" onClick={goBack} disabled={!history.length} aria-label="Go back"><ArrowLeft /></Button><button className="flex items-center gap-3 text-left" onClick={() => navigateTo("home")}><span className="flex size-11 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-control"><Leaf /></span><span><strong className="block font-display text-lg">Krishi-Mysuru</strong><small className="hidden font-bold text-muted-foreground sm:block">Smart Farm Companion</small></span></button></div>
          <nav className="flex items-center gap-2 rounded-full border border-glass-border bg-card/80 p-1">
            <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} aria-label="Toggle theme">{theme === "dark" ? <Sun /> : <Moon />}</Button>
            {(["en", "kn", "hi"] as Language[]).map((lng) => <Button key={lng} variant={language === lng ? "field" : "ghost"} size="sm" className="rounded-full" onClick={() => setLanguage(lng)}>{lng === "en" ? "EN" : lng === "kn" ? "ಕನ್ನಡ" : "हिंदी"}</Button>)}
          </nav>
        </div>
      </header>

      {role === "home" && <section className="mx-auto grid max-w-7xl gap-6 px-4 py-6 md:grid-cols-[1.1fr_0.9fr] md:py-10"><div className="rounded-[2rem] border border-glass-border bg-gradient-to-br from-card via-secondary/45 to-background p-6 shadow-glass md:p-10"><div className="mb-5 inline-flex items-center gap-2 rounded-full bg-secondary/60 px-4 py-2 text-sm font-black"><Globe2 className="size-4" /> EN · ಕನ್ನಡ · हिंदी</div><h1 className="font-display text-4xl font-black leading-tight md:text-6xl">{t.hero}</h1><p className="mt-4 max-w-2xl text-lg font-semibold text-muted-foreground">{t.sub}</p><div className="mt-7">{roleButtons}</div></div><div className="grid gap-4">{t.stats.map((stat) => <Card key={stat} title={stat} icon="🌾"><p className="text-sm font-bold text-muted-foreground">Live demand signal for Mysuru farmers</p></Card>)}<Button variant="secondaryFarm" className="h-14 rounded-full text-base font-black"><Mic />{t.voice}</Button></div></section>}

      {role === "farmer" && (
        <section className="mx-auto max-w-7xl px-4 py-5">
          <div className="mb-4 flex gap-2 overflow-x-auto pb-2">
            {(Object.keys(t.tabs) as FarmerTab[]).map((tab) => (
              <Button key={tab} variant={farmerTab === tab ? "field" : "glass"} className="rounded-full" onClick={() => navigateTo("farmer", tab)}>
                {tab === "field" && <Map />}
                {tab === "export" && <Package />}
                {t.tabs[tab]}
              </Button>
            ))}
          </div>

          {farmerTab === "field" ? (
            <div className="relative h-[calc(100svh-9.5rem)] min-h-[560px] overflow-hidden rounded-[2rem] border border-glass-border shadow-glass max-md:h-[calc(100svh-8rem)] max-md:min-h-0 max-md:rounded-none max-md:border-x-0">
              <KrishiMap selectedId={selectedId} language={language} onSelect={setSelectedId} />
              <div className="absolute left-4 top-4 z-[850] rounded-[1.25rem] border border-glass-border bg-glass/92 p-4 shadow-control backdrop-blur-panel max-md:right-4 max-md:p-3">
                <p className="text-xs font-black uppercase text-muted-foreground">Live Field</p>
                <p className="font-display text-xl font-black">{selectedContent.name}</p>
                <p className="text-sm font-bold text-muted-foreground">{selectedContent.soil}</p>
              </div>
              <FieldIntelligencePanel region={selectedRegion} regionId={selectedId} language={language} isExpanded={fieldPanelOpen} onToggle={() => setFieldPanelOpen((open) => !open)} />
            </div>
          ) : farmerTab === "schemes" ? (
            <div className="space-y-4">
              <div className="grid gap-3 rounded-[1.5rem] border border-glass-border bg-card/90 p-4 shadow-control backdrop-blur-panel md:grid-cols-[1fr_220px_220px]">
                <label className="relative"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><input value={schemeSearch} onChange={(e) => setSchemeSearch(e.target.value)} placeholder={language === "kn" ? "ವಿಮೆ, ಸೌರ... ಹುಡುಕಿ" : "Search insurance, solar..."} className="h-11 w-full rounded-full border border-input bg-background pl-10 pr-4 text-sm font-bold outline-none focus:ring-2 focus:ring-ring" /></label>
                <select value={schemeCategory} onChange={(e) => setSchemeCategory(e.target.value)} className="h-11 rounded-full border border-input bg-background px-4 text-sm font-bold"><option value="all">{language === "kn" ? "ಎಲ್ಲಾ ವರ್ಗಗಳು" : "All categories"}</option>{schemeCategories.slice(1).map((item) => <option key={item} value={item}>{item}</option>)}</select>
                <select value={schemeEligibility} onChange={(e) => setSchemeEligibility(e.target.value)} className="h-11 rounded-full border border-input bg-background px-4 text-sm font-bold"><option value="all">{language === "kn" ? "ಎಲ್ಲಾ ಅರ್ಹತೆ" : "All eligibility"}</option>{schemeEligibilityOptions.slice(1).map((item) => <option key={item} value={item}>{item}</option>)}</select>
              </div>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filteredSchemes.map((scheme) => {
                const content = scheme[language];
                return (
                  <article key={scheme.id} className="rounded-[1.5rem] border border-glass-border bg-card/90 p-4 shadow-control backdrop-blur-panel">
                    <div className="mb-4 flex items-start gap-3">
                      <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-secondary/45 text-2xl shadow-control">{content.icon}</span>
                      <div>
                        <p className="mb-1 inline-flex rounded-full bg-accent/35 px-3 py-1 text-xs font-black text-accent-foreground">{content.tag}</p>
                        <h2 className="font-display text-lg font-black leading-tight">{content.title}</h2>
                      </div>
                    </div>
                    <div className="space-y-3 text-sm font-bold">
                      <p className="rounded-2xl bg-secondary/30 p-3"><span className="block text-xs uppercase text-muted-foreground">{t.benefit}</span>{content.benefit}</p>
                      <p><span className="font-black text-primary">{t.eligibility}: </span>{content.eligibility}</p>
                      <p className="text-muted-foreground"><span className="font-black text-foreground">{t.details}: </span>{content.description}</p>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-2"><Button variant="secondaryFarm" className="rounded-full" onClick={() => setSelectedScheme(scheme)}>{t.details}</Button><Button variant="field" className="rounded-full" onClick={() => setApplyingScheme(scheme)}>{t.apply}</Button></div>
                  </article>
                );
              })}
              </div>
            </div>
          ) : farmerTab === "export" ? (
            <div className="grid gap-4 lg:grid-cols-3">
              <section className="rounded-[1.5rem] border border-glass-border bg-card/88 p-4 shadow-control backdrop-blur-panel lg:col-span-3">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2"><span className="text-2xl">🌱</span><h2 className="font-display text-lg font-black">{t.demand}</h2></div>
                  <div className="flex flex-wrap gap-2">
                    <select value={exportCountry} onChange={(e) => setExportCountry(e.target.value)} className="h-10 rounded-full border border-input bg-background px-3 text-sm font-bold"><option value="all">{language === "kn" ? "ಎಲ್ಲಾ ದೇಶಗಳು" : "All markets"}</option>{countryOptions.slice(1).map((item) => <option key={item} value={item}>{item}</option>)}</select>
                    <select value={exportDemand} onChange={(e) => setExportDemand(e.target.value)} className="h-10 rounded-full border border-input bg-background px-3 text-sm font-bold"><option value="all">{language === "kn" ? "ಎಲ್ಲಾ ಬೇಡಿಕೆ" : "All demand"}</option>{demandOptions.slice(1).map((item) => <option key={item} value={item}>{item}</option>)}</select>
                    <select value={exportProfit} onChange={(e) => setExportProfit(e.target.value)} className="h-10 rounded-full border border-input bg-background px-3 text-sm font-bold"><option value="all">{language === "kn" ? "ಎಲ್ಲಾ ಲಾಭ" : "All profit"}</option><option value="35">35%+</option><option value="45">45%+</option><option value="50">50%+</option></select>
                  </div>
                </div>
                <div className="max-h-[calc(100svh-18rem)] space-y-3 overflow-y-auto pr-1">
                  {filteredExportCrops.map((crop) => {
                    const c = crop[language];
                    return (
                      <article key={crop.id} className="rounded-[1.25rem] border border-glass-border bg-secondary/25 p-4 shadow-control">
                        <button className="w-full text-left" onClick={() => setSelectedCrop(crop)}>
                          <div className="mb-3 flex items-start justify-between gap-3"><span className="text-4xl">{c.icon}</span><b className="rounded-full bg-card px-3 py-1 text-success shadow-control">{c.profit}</b></div>
                          <div className="flex flex-wrap gap-2"><p className="inline-flex rounded-full bg-accent/35 px-3 py-1 text-xs font-black text-accent-foreground">{c.tag}</p><p className="inline-flex rounded-full bg-card px-3 py-1 text-xs font-black text-primary">{getSeasonBadge(crop.id)}</p></div>
                          <h3 className="mt-2 font-display text-lg font-black leading-tight">{c.crop}</h3>
                          <p className="mt-1 text-xs font-black uppercase text-muted-foreground">{crop.district}</p>
                          <div className="mt-3 rounded-2xl bg-card/75 p-3"><p className="text-lg">{crop.flags}</p><p className="text-sm font-bold text-muted-foreground">{c.destination}</p></div>
                          <p className="mt-3 line-clamp-3 text-sm font-bold"><span className="text-primary">{t.reason}: </span>{c.reason}</p>
                        </button>
                        <Button variant="field" className="mt-4 w-full rounded-full" onClick={() => setSellingCrop(crop)}>{language === "kn" ? "ರಫ್ತು ಬೆಳೆ ಮಾರಾಟ" : "Sell Export Produce"}</Button>
                      </article>
                    );
                  })}
                </div>
              </section>
              {selectedCrop && <Card title={language === "kn" ? "ರಫ್ತು ಪರಿಶೀಲನಾ ಪಟ್ಟಿ" : "Export checklist"} icon={selectedCrop[language].icon}><div className="space-y-3 text-sm font-bold"><p><span className="text-primary">{language === "kn" ? "ಪ್ರಮಾಣಪತ್ರಗಳು" : "Certifications"}: </span>APEDA, FSSAI, Phytosanitary, {selectedCrop[language].tag}</p><p><span className="text-primary">{language === "kn" ? "ಪ್ಯಾಕಿಂಗ್" : "Packaging"}: </span>{language === "kn" ? "ಗ್ರೇಡಿಂಗ್, ತೇವಾಂಶ ನಿಯಂತ್ರಣ, ರಫ್ತು ಲೇಬಲ್" : "Grading, moisture control, export labels and ventilated cartons."}</p><ol className="list-decimal space-y-1 pl-5 text-muted-foreground"><li>{language === "kn" ? "ಖರೀದಿದಾರರನ್ನು ದೃಢೀಕರಿಸಿ" : "Confirm buyer and target market"}</li><li>{language === "kn" ? "ಗುಣಮಟ್ಟ ಪರೀಕ್ಷೆ ಮಾಡಿ" : "Complete quality testing"}</li><li>{language === "kn" ? "ದಾಖಲೆ ಮತ್ತು ಶಿಪ್ಪಿಂಗ್ ಬುಕ್ ಮಾಡಿ" : "Prepare documents and book shipment"}</li></ol></div></Card>}
            </div>
          ) : (
            <div className="grid gap-4 lg:grid-cols-3"><Card title={t.climate} icon="☀️"><div className="space-y-3 font-bold"><p><CloudSun className="mr-2 inline size-5 text-primary" /> 28-35°C · Rain risk low</p><p className="rounded-2xl bg-accent/35 p-3">{t.best}: Ginger 🫚</p><p className="text-muted-foreground">Best sowing window: 12 days</p></div></Card><Card title={t.market} icon="💰"><div className="h-28"><ResponsiveContainer width="100%" height="100%"><AreaChart data={priceTrend}><Area dataKey="v" type="monotone" stroke="hsl(var(--primary))" fill="hsl(var(--secondary))" strokeWidth={3} /></AreaChart></ResponsiveContainer></div><p className="mt-2 font-black text-primary">{t.sellNow}: 6 days</p></Card><Card title={t.direct} icon="🤝"><Button variant="field" className="w-full rounded-full"><Package />Sell Crop</Button><Button variant="secondaryFarm" className="mt-3 w-full rounded-full"><Phone />Buyer Chat / Call</Button></Card><Card title={t.demand} icon="🌍"><p className="font-bold text-muted-foreground">{language === "kn" ? "ವಿದೇಶಿ ಬೇಡಿಕೆ, ಲಾಭ ಮತ್ತು ಖರೀದಿದಾರ ಸಂಪರ್ಕಕ್ಕಾಗಿ ಪ್ರತ್ಯೇಕ ರಫ್ತು ವಿಭಾಗ." : "A dedicated export section for abroad demand, profit signals and buyer connections."}</p><Button variant="field" className="mt-4 w-full rounded-full" onClick={() => setFarmerTab("export")}><Package />Export</Button></Card><Card title={t.fpo} icon="🏢"><p className="font-bold text-muted-foreground">Group selling gives better price and bulk export opportunities.</p><Button variant="secondaryFarm" className="mt-4 w-full rounded-full"><Users />Join FPO</Button></Card><Card title={t.labour} icon="🧑‍🌾"><p className="font-black">Need 5 workers for harvest</p><p className="text-sm font-bold text-muted-foreground">Ratings enabled · Nearby labourers</p><Button variant="field" className="mt-4 w-full rounded-full"><Briefcase />Post Job</Button></Card><Card title={t.schemes} icon="🏦"><p className="font-bold">Subsidies · Loans · Eligibility checker</p><Button variant="secondaryFarm" className="mt-4 w-full rounded-full" onClick={() => setFarmerTab("schemes")}>{t.apply}</Button></Card></div>
          )}
        </section>
      )}

      {role === "buyer" && <section className="mx-auto grid max-w-7xl gap-4 px-4 py-6 lg:grid-cols-3"><Card title={t.browse} icon="🛒"><p className="font-bold text-muted-foreground">Filter by location, quantity and price.</p></Card><Card title="Bulk purchase via FPO" icon="🏢"><p className="font-bold text-muted-foreground">Sugarcane · Tomato · Ginger lots ready.</p></Card><Card title={t.track} icon="📦"><p className="font-bold text-muted-foreground">Order #KM-204 reaches tomorrow.</p><Button variant="field" className="mt-4 w-full rounded-full">{t.contact}</Button></Card></section>}

      {role === "labourer" && <section className="mx-auto max-w-7xl px-4 py-6"><h2 className="mb-6 flex items-center gap-2 font-display text-2xl font-black text-primary"><Users className="size-7" /> {labourLabels.find}</h2><div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{labourJobs.map((job) => { const slotsRemaining = job.totalSlots - job.filledSlots; const isLow = slotsRemaining <= 3; const localized = language === "kn" ? "kn" : "en"; return <article key={job.id} className="rounded-[1.25rem] border border-glass-border bg-card p-5 shadow-control transition-shadow hover:shadow-glass"><div className="mb-4 flex items-start justify-between gap-3"><h3 className="font-display text-lg font-black leading-tight">{job.title[localized]}</h3><span className={`rounded-full px-3 py-1 text-xs font-black ${isLow ? "bg-warning/18 text-warning" : "bg-secondary/45 text-primary"}`}>{slotsRemaining} {labourLabels.slots}</span></div><div className="mb-6 space-y-2"><p className="flex items-center gap-2 text-sm font-bold text-muted-foreground"><MapPin className="size-4 text-primary" />{job.location[localized]}</p><p className="flex items-center gap-2 text-sm font-bold text-muted-foreground"><Calendar className="size-4 text-primary" />{job.date}</p><p className="flex items-center gap-2 font-black text-primary"><IndianRupee className="size-4" />{job.wage}<span className="text-xs font-bold text-muted-foreground">/ {labourLabels.wage}</span></p></div><div className="mb-6 h-2 overflow-hidden rounded-full bg-muted"><div className={`h-full transition-all duration-500 ${isLow ? "bg-warning" : "bg-primary"}`} style={{ width: `${(job.filledSlots / job.totalSlots) * 100}%` }} /></div><Button disabled={job.isApplied || slotsRemaining === 0} onClick={() => handleApplyJob(job.id)} variant={job.isApplied ? "secondaryFarm" : "field"} className="w-full rounded-xl font-black">{job.isApplied ? <><CheckCircle className="size-5" />{labourLabels.applied}</> : labourLabels.apply}</Button></article>; })}</div></section>}

      {(selectedScheme || applyingScheme || selectedCrop || sellingCrop) && (
        <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-foreground/35 p-4 backdrop-blur-sm">
          <div className="max-h-[88svh] w-full max-w-2xl overflow-y-auto rounded-[1.75rem] border border-glass-border bg-card p-5 shadow-glass">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase text-muted-foreground">Krishi-Mysuru</p>
                <h2 className="font-display text-2xl font-black">
                  {selectedScheme?.[language].title || applyingScheme?.[language].title || selectedCrop?.[language].crop || sellingCrop?.[language].crop}
                </h2>
              </div>
              <Button variant="ghost" size="icon" className="rounded-full" onClick={() => { setSelectedScheme(null); setApplyingScheme(null); setSelectedCrop(null); setSellingCrop(null); }}><X /></Button>
            </div>

            {selectedScheme && <div className="space-y-3 font-bold"><p className="text-5xl">{selectedScheme[language].icon}</p><p className="inline-flex rounded-full bg-accent/35 px-3 py-1 text-xs font-black text-accent-foreground">{selectedScheme[language].tag}</p><p className="rounded-2xl bg-secondary/35 p-3"><span className="block text-xs uppercase text-muted-foreground">{t.benefit}</span>{selectedScheme[language].benefit}</p><p><span className="text-primary">{t.eligibility}: </span>{selectedScheme[language].eligibility}</p><p className="text-muted-foreground">{selectedScheme[language].description}</p><ol className="list-decimal space-y-1 pl-5 text-muted-foreground"><li>{language === "kn" ? "FRUITS ಐಡಿ ಮತ್ತು ಆಧಾರ್ ಪರಿಶೀಲಿಸಿ" : "Verify FRUITS ID and Aadhaar"}</li><li>{language === "kn" ? "ಭೂಮಿ ಮತ್ತು ಬೆಳೆ ವಿವರಗಳನ್ನು ಸೇರಿಸಿ" : "Add land and crop details"}</li><li>{language === "kn" ? "ಹತ್ತಿರದ ಕೃಷಿ ಕಚೇರಿಗೆ ಸಲ್ಲಿಸಿ" : "Submit through local agriculture office"}</li></ol><Button variant="field" className="w-full rounded-full" onClick={() => { setApplyingScheme(selectedScheme); setSelectedScheme(null); }}>{t.apply}</Button></div>}

            {applyingScheme && <form className="grid gap-3 font-bold"><p className="text-5xl">{applyingScheme[language].icon}</p>{[language === "kn" ? "ಹೆಸರು" : "Name", "Aadhaar", language === "kn" ? "ಕೃಷಿ ಸ್ಥಳ" : "Farm location", language === "kn" ? "ಬೆಳೆ" : "Crop"].map((label) => <label key={label} className="grid gap-1 text-sm"><span>{label}</span><input required defaultValue={label === (language === "kn" ? "ಕೃಷಿ ಸ್ಥಳ" : "Farm location") ? "Mysuru" : ""} className="h-11 rounded-full border border-input bg-background px-4 outline-none focus:ring-2 focus:ring-ring" /></label>)}<Button type="submit" variant="field" className="mt-2 rounded-full">{language === "kn" ? "ಅರ್ಜಿಯನ್ನು ಸಲ್ಲಿಸಿ" : "Submit application"}</Button></form>}

            {selectedCrop && <div className="space-y-4 font-bold"><div className="flex items-center gap-4"><span className="text-6xl">{selectedCrop[language].icon}</span><div><p className="text-2xl">{selectedCrop.flags}</p><p className="text-muted-foreground">{selectedCrop[language].destination}</p></div></div><div className="grid gap-3 sm:grid-cols-3"><p className="rounded-2xl bg-secondary/35 p-3"><span className="block text-xs uppercase text-muted-foreground">Demand</span>{selectedCrop[language].demand}</p><p className="rounded-2xl bg-card p-3 text-success shadow-control"><span className="block text-xs uppercase text-muted-foreground">{t.profit}</span>{selectedCrop[language].profit}</p><p className="rounded-2xl bg-accent/35 p-3"><span className="block text-xs uppercase text-muted-foreground">Tag</span>{selectedCrop[language].tag}</p></div><p><span className="text-primary">{t.reason}: </span>{selectedCrop[language].reason}</p><Button variant="field" className="w-full rounded-full" onClick={() => { setSellingCrop(selectedCrop); setSelectedCrop(null); }}>{language === "kn" ? "ರಫ್ತು ಬೆಳೆ ಮಾರಾಟ" : "Sell Export Produce"}</Button></div>}

            {sellingCrop && <form className="grid gap-3 font-bold"><p className="text-5xl">{sellingCrop[language].icon}</p>{[language === "kn" ? "ರೈತನ ಹೆಸರು" : "Farmer name", language === "kn" ? "ಫೋನ್ ಸಂಖ್ಯೆ" : "Phone number", language === "kn" ? "ಲಭ್ಯ ಪ್ರಮಾಣ" : "Available quantity", language === "kn" ? "ಗ್ರಾಮ / ತಾಲ್ಲೂಕು" : "Village / Taluk"].map((label) => <label key={label} className="grid gap-1 text-sm"><span>{label}</span><input required className="h-11 rounded-full border border-input bg-background px-4 outline-none focus:ring-2 focus:ring-ring" /></label>)}<p className="rounded-2xl bg-secondary/35 p-3 text-sm">{sellingCrop.flags} {sellingCrop[language].destination}</p><Button type="submit" variant="field" className="mt-2 rounded-full">{language === "kn" ? "ಖರೀದಿದಾರರೊಂದಿಗೆ ಸಂಪರ್ಕಿಸಿ" : "Connect with buyers"}</Button></form>}
          </div>
        </div>
      )}

    </main>
  );
};

export default Index;
