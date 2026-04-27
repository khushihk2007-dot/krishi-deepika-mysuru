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

      {role === "farmer" && (
        <section className="mx-auto max-w-7xl px-4 py-5">
          <div className="mb-4 flex gap-2 overflow-x-auto pb-2">
            {(Object.keys(t.tabs) as FarmerTab[]).map((tab) => (
              <Button key={tab} variant={farmerTab === tab ? "field" : "glass"} className="rounded-full" onClick={() => setFarmerTab(tab)}>
                {tab === "field" && <Map />}
                {t.tabs[tab]}
              </Button>
            ))}
          </div>

          {farmerTab === "field" ? (
            <div className="relative h-[calc(100svh-9.5rem)] min-h-[560px] overflow-hidden rounded-[2rem] border border-glass-border shadow-glass">
              <KrishiMap selectedId={selectedId} language={language} onSelect={setSelectedId} />
              <div className="absolute left-4 top-4 z-[850] rounded-[1.25rem] border border-glass-border bg-glass/92 p-4 shadow-control backdrop-blur-panel">
                <p className="text-xs font-black uppercase text-muted-foreground">Live Field</p>
                <p className="font-display text-xl font-black">{selectedContent.name}</p>
                <p className="text-sm font-bold text-muted-foreground">{selectedContent.soil}</p>
              </div>
              <FieldIntelligencePanel region={selectedRegion} regionId={selectedId} language={language} />
            </div>
          ) : farmerTab === "schemes" ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {governmentSchemes.map((scheme) => {
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
                    <Button variant="field" className="mt-4 w-full rounded-full">{t.apply}</Button>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="grid gap-4 lg:grid-cols-3"><Card title={t.demand} icon="🌱"><div className="grid gap-3">{demandCrops.map((c) => <div key={c.crop} className="flex items-center justify-between rounded-2xl bg-secondary/35 p-3"><span className="text-3xl">{c.icon}</span><div className="flex-1 px-3"><p className="font-black">{c.crop}</p><p className="text-sm font-bold text-muted-foreground">{c.country}</p></div><b className="text-primary">{c.profit}</b></div>)}</div></Card><Card title={t.climate} icon="☀️"><div className="space-y-3 font-bold"><p><CloudSun className="mr-2 inline size-5 text-primary" /> 28-35°C · Rain risk low</p><p className="rounded-2xl bg-accent/35 p-3">{t.best}: Ginger 🫚</p><p className="text-muted-foreground">Best sowing window: 12 days</p></div></Card><Card title={t.market} icon="💰"><div className="h-28"><ResponsiveContainer width="100%" height="100%"><AreaChart data={priceTrend}><Area dataKey="v" type="monotone" stroke="hsl(var(--primary))" fill="hsl(var(--secondary))" strokeWidth={3} /></AreaChart></ResponsiveContainer></div><p className="mt-2 font-black text-primary">{t.sellNow}: 6 days</p></Card><Card title={t.direct} icon="🤝"><Button variant="field" className="w-full rounded-full"><Package />Sell Crop</Button><Button variant="secondaryFarm" className="mt-3 w-full rounded-full"><Phone />Buyer Chat / Call</Button></Card><Card title={t.fpo} icon="🏢"><p className="font-bold text-muted-foreground">Group selling gives better price and bulk export opportunities.</p><Button variant="secondaryFarm" className="mt-4 w-full rounded-full"><Users />Join FPO</Button></Card><Card title={t.labour} icon="🧑‍🌾"><p className="font-black">Need 5 workers for harvest</p><p className="text-sm font-bold text-muted-foreground">Ratings enabled · Nearby labourers</p><Button variant="field" className="mt-4 w-full rounded-full"><Briefcase />Post Job</Button></Card><Card title={t.schemes} icon="🏦"><p className="font-bold">Subsidies · Loans · Eligibility checker</p><Button variant="secondaryFarm" className="mt-4 w-full rounded-full" onClick={() => setFarmerTab("schemes")}>{t.apply}</Button></Card></div>
          )}
        </section>
      )}

      {role === "buyer" && <section className="mx-auto grid max-w-7xl gap-4 px-4 py-6 lg:grid-cols-3"><Card title={t.browse} icon="🛒"><p className="font-bold text-muted-foreground">Filter by location, quantity and price.</p></Card><Card title="Bulk purchase via FPO" icon="🏢"><p className="font-bold text-muted-foreground">Sugarcane · Tomato · Ginger lots ready.</p></Card><Card title={t.track} icon="📦"><p className="font-bold text-muted-foreground">Order #KM-204 reaches tomorrow.</p><Button variant="field" className="mt-4 w-full rounded-full">{t.contact}</Button></Card></section>}

      {role === "labourer" && <section className="mx-auto grid max-w-7xl gap-4 px-4 py-6 lg:grid-cols-3"><Card title={t.nearby} icon="👷"><p className="font-black">Harvest work · Nanjangud</p><p className="text-sm font-bold text-muted-foreground">5 km away · Apply with 1 click</p></Card><Card title={t.wage} icon="💰"><p className="font-display text-3xl font-black text-primary">₹650/day</p><p className="font-bold text-muted-foreground">Current local average</p></Card><Card title="Work history + ratings" icon="⭐"><p className="font-display text-3xl font-black text-primary">4.8/5</p><Button variant="field" className="mt-4 w-full rounded-full">Apply now</Button></Card></section>}
    </main>
  );
};

export default Index;
