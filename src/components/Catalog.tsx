import { EQUIPMENT, EquipmentCategory, PACKAGES } from "@/data/equipment";
import { formatIDR } from "@/lib/risk-engine";
import { useState } from "react";

const CATEGORIES: { id: EquipmentCategory | "all" | "package"; label: string }[] = [
  { id: "all", label: "Semua" },
  { id: "package", label: "Paket Hemat" },
  { id: "shelter", label: "Tenda" },
  { id: "sleep", label: "Tidur" },
  { id: "cooking", label: "Masak" },
  { id: "safety", label: "Keselamatan" },
  { id: "carry", label: "Carrier" },
  { id: "apparel", label: "Pakaian" },
  { id: "lighting", label: "Lighting" },
  { id: "navigation", label: "Navigasi" },
];

export const Catalog = () => {
  const [active, setActive] = useState<typeof CATEGORIES[number]["id"]>("all");

  const showPackages = active === "all" || active === "package";
  const items = active === "package" ? [] : EQUIPMENT.filter((e) => active === "all" || e.category === active);

  return (
    <section id="catalog" className="py-24">
      <div className="container mx-auto px-4">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              Katalog
            </div>
            <h2 className="font-display text-4xl font-bold sm:text-5xl">Alat siap sewa</h2>
            <p className="mt-3 max-w-xl text-muted-foreground">
              Semua peralatan dirawat & disteril setelah pemakaian. Harga per hari, sewa minimum 1 hari.
            </p>
          </div>
        </div>

        <div className="mb-8 flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              onClick={() => setActive(c.id)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-smooth ${
                active === c.id
                  ? "bg-primary text-primary-foreground shadow-elegant"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/70"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {showPackages && (
          <>
            <h3 className="mb-4 font-display text-lg font-bold text-muted-foreground">Paket Bundling</h3>
            <div className="mb-10 grid gap-5 md:grid-cols-3">
              {PACKAGES.map((p) => (
                <div key={p.id} className="group relative overflow-hidden rounded-2xl border border-border bg-gradient-forest p-6 text-primary-foreground shadow-card-soft transition-smooth hover:shadow-elegant">
                  <div className="absolute -right-6 -top-6 text-7xl opacity-10">⛺</div>
                  <div className="relative">
                    <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-semibold backdrop-blur">
                      {p.capacity} orang
                    </span>
                    <h4 className="mt-3 font-display text-xl font-bold">{p.name}</h4>
                    <p className="mt-1 text-sm text-white/80">{p.description}</p>
                    <div className="mt-5 flex items-end justify-between">
                      <div>
                        <div className="font-display text-2xl font-extrabold">{formatIDR(p.pricePerDay)}</div>
                        <div className="text-xs text-white/70">per hari</div>
                      </div>
                      <button className="rounded-full bg-accent px-4 py-2 text-xs font-bold text-accent-foreground shadow-glow transition-smooth group-hover:scale-105">
                        Sewa
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {items.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {items.map((e) => (
              <div key={e.id} className="group flex flex-col rounded-2xl border border-border bg-card p-5 transition-smooth hover:-translate-y-1 hover:border-primary/40 hover:shadow-elegant">
                <div className="mb-4 flex h-32 items-center justify-center rounded-xl bg-gradient-soft text-6xl">
                  {e.emoji}
                </div>
                <div className="flex flex-1 flex-col">
                  <div className="mb-1 flex items-center gap-1.5">
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${
                      e.tier === "premium" ? "text-accent" : e.tier === "standard" ? "text-primary" : "text-muted-foreground"
                    }`}>
                      {e.tier}
                    </span>
                  </div>
                  <h4 className="font-semibold leading-tight">{e.name}</h4>
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{e.description}</p>
                  <div className="mt-auto flex items-end justify-between pt-4">
                    <div>
                      <div className="font-display text-lg font-bold text-primary">{formatIDR(e.pricePerDay)}</div>
                      <div className="text-[10px] text-muted-foreground">per hari</div>
                    </div>
                    <button className="rounded-full bg-secondary px-3 py-1.5 text-xs font-semibold text-secondary-foreground transition-smooth hover:bg-primary hover:text-primary-foreground">
                      + Sewa
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
