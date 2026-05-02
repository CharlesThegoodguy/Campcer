export type MountainGrade = 1 | 2 | 3 | 4 | 5;

export interface Mountain {
  id: string;
  name: string;
  region: string;
  elevation: number; // meters
  grade: MountainGrade;
  minTempC: number;
  conditions: string[]; // tags: cold, windy, storm-prone, alpine, jungle, scree, water-scarce
  notes: string;
}

export const MOUNTAINS: Mountain[] = [
  {
    id: "semeru",
    name: "Gunung Semeru",
    region: "Jawa Timur",
    elevation: 3676,
    grade: 4,
    minTempC: 0,
    conditions: ["cold", "windy", "storm-prone", "scree", "alpine", "volcanic-gas"],
    notes: "Gunung tertinggi di Jawa. Suhu bisa mencapai 0°C, badai pasir di Arcopodo, gas beracun di puncak.",
  },
  {
    id: "rinjani",
    name: "Gunung Rinjani",
    region: "Nusa Tenggara Barat",
    elevation: 3726,
    grade: 4,
    minTempC: 2,
    conditions: ["cold", "windy", "scree", "alpine", "water-scarce"],
    notes: "Trek panjang 3-4 hari, jalur berpasir curam menuju puncak.",
  },
  {
    id: "kerinci",
    name: "Gunung Kerinci",
    region: "Jambi",
    elevation: 3805,
    grade: 5,
    minTempC: -2,
    conditions: ["cold", "windy", "storm-prone", "alpine", "jungle", "volcanic-gas"],
    notes: "Tertinggi di Sumatra. Cuaca ekstrem, hutan lebat, gas vulkanik aktif.",
  },
  {
    id: "merbabu",
    name: "Gunung Merbabu",
    region: "Jawa Tengah",
    elevation: 3145,
    grade: 3,
    minTempC: 5,
    conditions: ["cold", "windy", "water-scarce"],
    notes: "Sabana terbuka, angin kencang, sumber air terbatas.",
  },
  {
    id: "merapi",
    name: "Gunung Merapi",
    region: "Yogyakarta",
    elevation: 2930,
    grade: 4,
    minTempC: 8,
    conditions: ["scree", "volcanic-gas", "windy"],
    notes: "Aktif. Jalur pasir & batuan lepas, summit attack dini hari.",
  },
  {
    id: "gede",
    name: "Gunung Gede",
    region: "Jawa Barat",
    elevation: 2958,
    grade: 2,
    minTempC: 8,
    conditions: ["cold", "jungle"],
    notes: "Cocok untuk pendaki pemula, jalur jelas & banyak sumber air.",
  },
  {
    id: "prau",
    name: "Gunung Prau",
    region: "Jawa Tengah",
    elevation: 2590,
    grade: 1,
    minTempC: 5,
    conditions: ["cold", "windy"],
    notes: "Pendakian singkat, ramah pemula, golden sunrise terbaik.",
  },
  {
    id: "papandayan",
    name: "Gunung Papandayan",
    region: "Jawa Barat",
    elevation: 2665,
    grade: 1,
    minTempC: 8,
    conditions: ["volcanic-gas"],
    notes: "Family friendly, jalur pendek, kawah aktif.",
  },
  {
    id: "lawu",
    name: "Gunung Lawu",
    region: "Jawa Tengah/Timur",
    elevation: 3265,
    grade: 3,
    minTempC: 3,
    conditions: ["cold", "windy", "alpine"],
    notes: "Suhu bisa sangat dingin, jalur panjang.",
  },
  {
    id: "slamet",
    name: "Gunung Slamet",
    region: "Jawa Tengah",
    elevation: 3428,
    grade: 4,
    minTempC: 2,
    conditions: ["cold", "windy", "scree", "water-scarce", "alpine"],
    notes: "Jalur scree panjang, sumber air sangat terbatas di atas pos 5.",
  },
  {
    id: "sindoro",
    name: "Gunung Sindoro",
    region: "Jawa Tengah",
    elevation: 3153,
    grade: 3,
    minTempC: 5,
    conditions: ["cold", "windy", "scree", "volcanic-gas"],
    notes: "Jalur terbuka, terkena angin langsung, kawah berbahaya.",
  },
  {
    id: "sumbing",
    name: "Gunung Sumbing",
    region: "Jawa Tengah",
    elevation: 3371,
    grade: 3,
    minTempC: 4,
    conditions: ["cold", "windy", "scree"],
    notes: "Tanjakan curam terus menerus, fisik disarankan prima.",
  },
];

export const GRADE_INFO: Record<MountainGrade, { label: string; color: string; description: string }> = {
  1: { label: "GRADE I", color: "grade-1", description: "Pemula. Trek singkat, jalur jelas, resiko rendah." },
  2: { label: "GRADE II", color: "grade-2", description: "Mudah. Cocok untuk pendaki baru dengan pendamping." },
  3: { label: "GRADE III", color: "grade-3", description: "Menengah. Butuh fisik baik & alat memadai." },
  4: { label: "GRADE IV", color: "grade-4", description: "Sulit. Resiko tinggi, alat lengkap & pengalaman disarankan." },
  5: { label: "GRADE V", color: "grade-5", description: "Ekstrem. Hanya untuk pendaki berpengalaman." },
};
