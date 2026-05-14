// Static logistics data for Krishi vehicle rental & mandi destinations.
// Distances are approximate road-distance fallbacks (km) from Mysuru city center
// used when geolocation isn't available. Real pickup uses Haversine from GPS.

export type VehicleId = "tata_ace" | "mahindra_bolero" | "eicher_14ft" | "tractor_trailer";
export type MandiId = "bandipalya_apmc" | "maddur_coconut" | "ramanagara_silk" | "chamarajanagar_turmeric";

export interface Vehicle {
  id: VehicleId;
  nameEn: string;
  nameKn: string;
  capacityEn: string;
  capacityKn: string;
  idealEn: string;
  idealKn: string;
  ratePerKm: number; // 0 means flat rate
  flatRate?: number;
  etaMin: number; // minutes
}

export const VEHICLES: Vehicle[] = [
  {
    id: "tata_ace",
    nameEn: "Tata Ace",
    nameKn: "ಟಾಟಾ ಏಸ್",
    capacityEn: "0.7 – 1 Ton",
    capacityKn: "0.7 – 1 ಟನ್",
    idealEn: "Local Mysuru Markets",
    idealKn: "ಸ್ಥಳೀಯ ಮೈಸೂರು ಮಾರುಕಟ್ಟೆ",
    ratePerKm: 15,
    etaMin: 25,
  },
  {
    id: "mahindra_bolero",
    nameEn: "Mahindra Bolero Pickup",
    nameKn: "ಮಹೀಂದ್ರಾ ಬೊಲೆರೊ ಪಿಕಪ್",
    capacityEn: "1.5 – 2 Tons",
    capacityKn: "1.5 – 2 ಟನ್",
    idealEn: "Banana & Turmeric",
    idealKn: "ಬಾಳೆ ಮತ್ತು ಅರಿಶಿನ",
    ratePerKm: 20,
    etaMin: 35,
  },
  {
    id: "eicher_14ft",
    nameEn: "Eicher 14ft Truck",
    nameKn: "ಐಚರ್ 14 ಅಡಿ ಟ್ರಕ್",
    capacityEn: "4 – 5 Tons",
    capacityKn: "4 – 5 ಟನ್",
    idealEn: "Bulk Sugarcane / Grains",
    idealKn: "ಕಬ್ಬು / ಧಾನ್ಯ",
    ratePerKm: 35,
    etaMin: 55,
  },
  {
    id: "tractor_trailer",
    nameEn: "Tractor Trailer",
    nameKn: "ಟ್ರಾಕ್ಟರ್ ಟ್ರೈಲರ್",
    capacityEn: "3 Tons",
    capacityKn: "3 ಟನ್",
    idealEn: "Off-road / Short distance",
    idealKn: "ರಸ್ತೆಯೇತರ / ಹತ್ತಿರ",
    ratePerKm: 0,
    flatRate: 600,
    etaMin: 40,
  },
];

export interface Mandi {
  id: MandiId;
  nameEn: string;
  nameKn: string;
  lat: number;
  lng: number;
}

export const MANDIS: Mandi[] = [
  { id: "bandipalya_apmc",        nameEn: "Bandipalya APMC (Mysuru)",     nameKn: "ಬಂಡಿಪಾಳ್ಯ APMC (ಮೈಸೂರು)",   lat: 12.2719, lng: 76.6553 },
  { id: "maddur_coconut",         nameEn: "Maddur Tender Coconut Market", nameKn: "ಮದ್ದೂರು ಎಳನೀರು ಮಾರುಕಟ್ಟೆ",      lat: 12.5847, lng: 77.0438 },
  { id: "ramanagara_silk",        nameEn: "Ramanagara Silk Market",       nameKn: "ರಾಮನಗರ ರೇಷ್ಮೆ ಮಾರುಕಟ್ಟೆ",      lat: 12.7250, lng: 77.2814 },
  { id: "chamarajanagar_turmeric",nameEn: "Chamarajanagar Turmeric Market",nameKn: "ಚಾಮರಾಜನಗರ ಅರಿಶಿನ ಮಾರುಕಟ್ಟೆ", lat: 11.9261, lng: 76.9438 },
];

const MYSURU_CENTER = { lat: 12.2958, lng: 76.6394 };

export function haversineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return Math.round(2 * R * Math.asin(Math.sqrt(s)) * 1.25 * 10) / 10; // *1.25 road factor
}

export function defaultPickup() {
  return { ...MYSURU_CENTER, label: "Mysuru (default)" };
}

export function calcCost(v: Vehicle, distanceKm: number) {
  if (v.flatRate) return v.flatRate;
  return Math.round(v.ratePerKm * distanceKm);
}
