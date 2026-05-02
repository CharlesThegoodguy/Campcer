export type EquipmentCategory =
  | "shelter"
  | "sleep"
  | "cooking"
  | "navigation"
  | "lighting"
  | "safety"
  | "carry"
  | "apparel"
  | "package";

export interface Equipment {
  id: string;
  name: string;
  category: EquipmentCategory;
  tier: "basic" | "standard" | "premium"; // for sleeping bag, tent etc.
  pricePerDay: number; // IDR
  capacity?: number; // for tents/packages: number of persons
  description: string;
  emoji: string;
  tags: string[]; // matches mountain conditions
}

export const EQUIPMENT: Equipment[] = [
  // Tents
  { id: "tent-2-basic", name: "Tenda Dome 2P Standard", category: "shelter", tier: "basic", pricePerDay: 35000, capacity: 2, emoji: "⛺", description: "Tenda dome ringan untuk 2 orang, cocok cuaca bersahabat.", tags: [] },
  { id: "tent-4-standard", name: "Tenda Dome 4P", category: "shelter", tier: "standard", pricePerDay: 60000, capacity: 4, emoji: "⛺", description: "Tenda 4 orang, double layer, tahan gerimis.", tags: [] },
  { id: "tent-6-storm", name: "Tenda Anti Badai 6P", category: "shelter", tier: "premium", pricePerDay: 120000, capacity: 6, emoji: "🏕️", description: "Frame aluminium 4 musim, tahan angin kencang & badai.", tags: ["storm-prone", "windy", "alpine"] },
  { id: "flysheet", name: "Flysheet 3x4m", category: "shelter", tier: "basic", pricePerDay: 15000, emoji: "🟦", description: "Atap tambahan untuk area masak/santai.", tags: [] },

  // Sleep
  { id: "sb-basic", name: "Sleeping Bag Polar", category: "sleep", tier: "basic", pricePerDay: 15000, emoji: "🛏️", description: "Comfort 15°C. Untuk gunung di bawah 2500m.", tags: [] },
  { id: "sb-standard", name: "Sleeping Bag Hollow Fiber", category: "sleep", tier: "standard", pricePerDay: 25000, emoji: "🛌", description: "Comfort 5°C. Cukup untuk Grade II-III.", tags: ["cold"] },
  { id: "sb-down", name: "Sleeping Bag Bulu Angsa", category: "sleep", tier: "premium", pricePerDay: 50000, emoji: "🪶", description: "Comfort -5°C. Disarankan untuk gunung dingin/alpine.", tags: ["cold", "alpine"] },
  { id: "thermal", name: "Baselayer Thermal Set", category: "apparel", tier: "standard", pricePerDay: 20000, emoji: "🧥", description: "Pakaian dalam thermal, tahan dingin ekstrem.", tags: ["cold", "alpine"] },
  { id: "matras", name: "Matras Aluminium Foil", category: "sleep", tier: "basic", pricePerDay: 8000, emoji: "🟫", description: "Alas tidur, isolasi panas tubuh.", tags: [] },

  // Cooking
  { id: "stove", name: "Kompor Portable + Gas", category: "cooking", tier: "basic", pricePerDay: 15000, emoji: "🔥", description: "Kompor lipat hemat gas.", tags: [] },
  { id: "nesting", name: "Nesting Set 4P", category: "cooking", tier: "basic", pricePerDay: 12000, emoji: "🥘", description: "Set panci, gelas, sendok untuk 4 orang.", tags: [] },
  { id: "water-filter", name: "Water Filter Portable", category: "safety", tier: "standard", pricePerDay: 25000, emoji: "💧", description: "Filter air sungai/danau menjadi layak minum.", tags: ["water-scarce", "jungle"] },

  // Navigation & Lighting
  { id: "headlamp", name: "Headlamp 300 Lumen", category: "lighting", tier: "basic", pricePerDay: 10000, emoji: "🔦", description: "Lampu kepala disarankan untuk summit attack.", tags: [] },
  { id: "gps", name: "GPS + Peta Topografi", category: "navigation", tier: "premium", pricePerDay: 40000, emoji: "🧭", description: "GPS handheld, esensial di hutan lebat/jalur tidak jelas.", tags: ["jungle", "alpine"] },

  // Safety
  { id: "first-aid", name: "First Aid Kit Lengkap", category: "safety", tier: "standard", pricePerDay: 15000, emoji: "🩹", description: "P3K lengkap termasuk obat ketinggian.", tags: [] },
  { id: "gas-mask", name: "Masker Anti Gas Vulkanik", category: "safety", tier: "standard", pricePerDay: 20000, emoji: "😷", description: "Masker N95+ filter gas SO₂. Disarankan gunung aktif.", tags: ["volcanic-gas"] },
  { id: "rain-gear", name: "Jas Hujan Setelan", category: "apparel", tier: "standard", pricePerDay: 12000, emoji: "🧥", description: "Jaket + celana waterproof.", tags: ["storm-prone"] },
  { id: "trekking-pole", name: "Trekking Pole Sepasang", category: "safety", tier: "standard", pricePerDay: 18000, emoji: "🥾", description: "Bantu jalur scree & turunan curam.", tags: ["scree"] },
  { id: "gaiter", name: "Gaiter (Pelindung Kaki)", category: "apparel", tier: "basic", pricePerDay: 10000, emoji: "🦵", description: "Cegah pasir/kerikil masuk sepatu.", tags: ["scree"] },
  { id: "gloves", name: "Sarung Tangan Thermal", category: "apparel", tier: "basic", pricePerDay: 8000, emoji: "🧤", description: "Lindungi tangan dari dingin & gesekan.", tags: ["cold", "alpine"] },

  // Carry
  { id: "carrier-60", name: "Carrier 60L", category: "carry", tier: "standard", pricePerDay: 35000, emoji: "🎒", description: "Tas gunung kapasitas 60L untuk pendakian 2-3 hari.", tags: [] },
  { id: "carrier-80", name: "Carrier 80L", category: "carry", tier: "premium", pricePerDay: 50000, emoji: "🎒", description: "Untuk ekspedisi panjang 4+ hari.", tags: [] },
];

// Packages (multi-person bundles for convenience pricing)
export interface PackageDef {
  id: string;
  name: string;
  capacity: number;
  pricePerDay: number;
  includes: string[]; // equipment ids included
  description: string;
}

export const PACKAGES: PackageDef[] = [
  {
    id: "pkg-2",
    name: "Paket Camping 2 Orang",
    capacity: 2,
    pricePerDay: 90000,
    includes: ["tent-2-basic", "sb-standard", "sb-standard", "matras", "matras", "stove", "nesting", "headlamp"],
    description: "Hemat untuk pasangan/duo pendaki di gunung ringan.",
  },
  {
    id: "pkg-4",
    name: "Paket Camping 4 Orang",
    capacity: 4,
    pricePerDay: 175000,
    includes: ["tent-4-standard", "sb-standard", "sb-standard", "sb-standard", "sb-standard", "matras", "matras", "matras", "matras", "stove", "nesting", "headlamp", "headlamp", "first-aid"],
    description: "Lengkap untuk grup 4 orang, gunung Grade II-III.",
  },
  {
    id: "pkg-5",
    name: "Paket Camping 5 Orang",
    capacity: 5,
    pricePerDay: 220000,
    includes: ["tent-6-storm", "sb-standard", "sb-standard", "sb-standard", "sb-standard", "sb-standard", "matras", "matras", "matras", "matras", "matras", "stove", "nesting", "headlamp", "headlamp", "first-aid", "flysheet"],
    description: "Grup 5 orang dengan tenda anti badai. Cocok Grade III-IV.",
  },
];
