import { ClipboardCheck, Calculator, Backpack, ShieldCheck } from "lucide-react";

const STEPS = [
  { icon: ClipboardCheck, title: "Isi data pendakian", desc: "Pilih gunung tujuan, durasi, dan jumlah pendaki." },
  { icon: Calculator, title: "Hitung resiko otomatis", desc: "Sistem menganalisa grade gunung, suhu, & kondisi medan." },
  { icon: Backpack, title: "Dapatkan rekomendasi", desc: "Daftar alat WAJIB sewa muncul lengkap dengan alasannya." },
  { icon: ShieldCheck, title: "Sewa & mendaki aman", desc: "Pickup di outlet atau diantar. Pendakianmu lebih siap." },
];

export const HowItWorks = () => (
  <section id="how" className="py-24">
    <div className="container mx-auto px-4">
      <div className="mx-auto mb-14 max-w-2xl text-center">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          Cara Kerja
        </div>
        <h2 className="font-display text-4xl font-bold sm:text-5xl">4 langkah sederhana</h2>
        <p className="mt-3 text-muted-foreground">
          Dari rencana sampai puncak, CAMPCER menemani persiapanmu.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((s, i) => (
          <div key={i} className="group relative rounded-2xl border border-border bg-card p-6 transition-smooth hover:-translate-y-1 hover:border-primary/40 hover:shadow-elegant">
            <div className="absolute -top-4 left-6 flex h-8 w-8 items-center justify-center rounded-full bg-accent font-display text-sm font-bold text-accent-foreground shadow-elegant">
              {i + 1}
            </div>
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-forest text-primary-foreground shadow-elegant">
              <s.icon className="h-5 w-5" />
            </div>
            <h3 className="font-display text-lg font-bold">{s.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);
