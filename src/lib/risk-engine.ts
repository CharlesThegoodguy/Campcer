import { EQUIPMENT, Equipment } from "@/data/equipment";
import { Mountain, MountainGrade } from "@/data/mountains";

export interface TripInput {
  mountain: Mountain;
  days: number;
  people: number;
}

export interface RiskAssessment {
  score: number; // 0-100
  level: "Rendah" | "Sedang" | "Tinggi" | "Sangat Tinggi" | "Ekstrem";
  color: string; // tailwind token name
  reasons: string[];
}

export interface RecommendedItem {
  equipment: Equipment;
  quantity: number;
  reason: string;
  mandatory: boolean;
}

export interface Recommendation {
  risk: RiskAssessment;
  mandatory: RecommendedItem[];
  suggested: RecommendedItem[];
  estimatedCost: number;
}

export function assessRisk({ mountain, days, people }: TripInput): RiskAssessment {
  let score = mountain.grade * 15; // 15..75
  const reasons: string[] = [
    `Gunung ${mountain.name} termasuk ${gradeLabel(mountain.grade)}.`,
  ];

  if (mountain.elevation >= 3000) { score += 10; reasons.push(`Ketinggian ${mountain.elevation} mdpl meningkatkan resiko hipoksia & hipotermia.`); }
  if (mountain.minTempC <= 5) { score += 8; reasons.push(`Suhu minimum dapat mencapai ${mountain.minTempC}°C.`); }
  if (mountain.conditions.includes("storm-prone")) { score += 6; reasons.push("Rawan badai & angin kencang."); }
  if (mountain.conditions.includes("volcanic-gas")) { score += 5; reasons.push("Aktivitas vulkanik & gas beracun."); }
  if (days >= 3) { score += 4; reasons.push(`Pendakian ${days} hari menambah beban logistik.`); }
  if (people >= 5) { score += 2; reasons.push(`Grup besar (${people} orang) butuh koordinasi & alat ekstra.`); }
  if (people === 1) { score += 6; reasons.push("Pendakian solo meningkatkan resiko signifikan."); }

  score = Math.min(100, score);

  let level: RiskAssessment["level"] = "Rendah";
  let color = "grade-1";
  if (score >= 85) { level = "Ekstrem"; color = "grade-5"; }
  else if (score >= 65) { level = "Sangat Tinggi"; color = "grade-4"; }
  else if (score >= 45) { level = "Tinggi"; color = "grade-3"; }
  else if (score >= 30) { level = "Sedang"; color = "grade-2"; }

  return { score, level, color, reasons };
}

function gradeLabel(g: MountainGrade) {
  return ["", "GRADE I (Pemula)", "GRADE II (Mudah)", "GRADE III (Menengah)", "GRADE IV (Sulit)", "GRADE V (Ekstrem)"][g];
}

const byId = (id: string) => EQUIPMENT.find((e) => e.id === id)!;

export function recommend({ mountain, days, people }: TripInput): Recommendation {
  const risk = assessRisk({ mountain, days, people });
  const mandatory: RecommendedItem[] = [];
  const suggested: RecommendedItem[] = [];

  const tentsNeeded = Math.ceil(people / (mountain.conditions.includes("storm-prone") ? 6 : 4));
  const tent = mountain.conditions.includes("storm-prone") || mountain.grade >= 4
    ? byId("tent-6-storm")
    : people <= 2 ? byId("tent-2-basic") : byId("tent-4-standard");
  mandatory.push({
    equipment: tent,
    quantity: tentsNeeded,
    mandatory: true,
    reason: mountain.conditions.includes("storm-prone")
      ? "Disarankan tenda anti badai karena gunung rawan badai."
      : "Tenda standar cukup untuk kondisi umumnya.",
  });

  // Sleeping bag
  const sb = mountain.minTempC <= 2 ? byId("sb-down") : mountain.minTempC <= 8 ? byId("sb-standard") : byId("sb-basic");
  mandatory.push({
    equipment: sb,
    quantity: people,
    mandatory: true,
    reason: `Suhu minimum ${mountain.minTempC}°C — gunakan ${sb.name.toLowerCase()}.`,
  });

  // Matras
  mandatory.push({ equipment: byId("matras"), quantity: people, mandatory: true, reason: "Isolasi panas tubuh dari tanah dingin." });

  // Thermal
  if (mountain.minTempC <= 5 || mountain.conditions.includes("alpine")) {
    mandatory.push({ equipment: byId("thermal"), quantity: people, mandatory: true, reason: "Baselayer thermal disarankan di suhu rendah." });
    mandatory.push({ equipment: byId("gloves"), quantity: people, mandatory: true, reason: "Lindungi tangan dari hipotermia." });
  }

  // Cooking essentials
  mandatory.push({ equipment: byId("stove"), quantity: Math.max(1, Math.ceil(people / 4)), mandatory: true, reason: "Memasak makanan & minuman hangat." });
  mandatory.push({ equipment: byId("nesting"), quantity: Math.max(1, Math.ceil(people / 4)), mandatory: true, reason: "Peralatan masak grup." });

  // Headlamp per person
  mandatory.push({ equipment: byId("headlamp"), quantity: people, mandatory: true, reason: "Setiap pendaki disarankan membawa headlamp." });

  // Carrier per person
  mandatory.push({
    equipment: days >= 4 ? byId("carrier-80") : byId("carrier-60"),
    quantity: people,
    mandatory: true,
    reason: `Tas gunung untuk pendakian ${days} hari.`,
  });

  // First aid
  mandatory.push({ equipment: byId("first-aid"), quantity: 1, mandatory: true, reason: "P3K disarankan untuk setiap grup." });

  // Conditional safety
  if (mountain.conditions.includes("storm-prone") || mountain.grade >= 3) {
    mandatory.push({ equipment: byId("rain-gear"), quantity: people, mandatory: true, reason: "Cuaca berubah cepat — jas hujan disarankan." });
  }
  if (mountain.conditions.includes("volcanic-gas")) {
    mandatory.push({ equipment: byId("gas-mask"), quantity: people, mandatory: true, reason: "Lindungi pernapasan dari gas vulkanik." });
  }
  if (mountain.conditions.includes("scree")) {
    mandatory.push({ equipment: byId("trekking-pole"), quantity: people, mandatory: true, reason: "Stabilitas di jalur pasir/batu lepas." });
    suggested.push({ equipment: byId("gaiter"), quantity: people, mandatory: false, reason: "Cegah kerikil masuk sepatu." });
  }
  if (mountain.conditions.includes("water-scarce") || mountain.conditions.includes("jungle")) {
    mandatory.push({ equipment: byId("water-filter"), quantity: 1, mandatory: true, reason: "Sumber air terbatas — filter disarankan." });
  }
  if (mountain.conditions.includes("jungle") || mountain.grade >= 4) {
    suggested.push({ equipment: byId("gps"), quantity: 1, mandatory: false, reason: "GPS sangat membantu di jalur kompleks." });
  }

  suggested.push({ equipment: byId("flysheet"), quantity: 1, mandatory: false, reason: "Area masak/santai terlindung hujan." });

  const estimatedCost = [...mandatory, ...suggested].reduce(
    (sum, it) => sum + it.equipment.pricePerDay * it.quantity * days,
    0,
  );

  return { risk, mandatory, suggested, estimatedCost };
}

export const formatIDR = (n: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);
