import { MOUNTAINS, GRADE_INFO } from "@/data/mountains";
import { Mountain } from "lucide-react";

export const MountainsList = () => (
  <section id="mountains" className="bg-secondary/50 py-24">
    <div className="container mx-auto px-4">
      <div className="mb-12 max-w-2xl">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          Database Gunung
        </div>
        <h2 className="font-display text-4xl font-bold sm:text-5xl">Gunung yang kami cover</h2>
        <p className="mt-3 text-muted-foreground">
          Setiap gunung punya grade resiko sendiri. Sistem otomatis menyesuaikan rekomendasi alat berdasarkan grade & kondisi.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {MOUNTAINS.map((m) => {
          const g = GRADE_INFO[m.grade];
          return (
            <div key={m.id} className="group rounded-2xl border border-border bg-card p-5 transition-smooth hover:-translate-y-1 hover:shadow-elegant">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-forest text-primary-foreground">
                    <Mountain className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-display font-bold leading-tight">{m.name}</h4>
                    <p className="text-xs text-muted-foreground">{m.region} · {m.elevation}m</p>
                  </div>
                </div>
                <span
                  className="rounded-md px-2 py-0.5 text-[10px] font-bold text-white"
                  style={{ backgroundColor: `hsl(var(--${g.color}))` }}
                >
                  {g.label}
                </span>
              </div>
              <p className="mt-4 line-clamp-2 text-xs text-muted-foreground">{m.notes}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {m.conditions.slice(0, 4).map((c) => (
                  <span key={c} className="rounded-md bg-secondary px-2 py-0.5 text-[10px] font-medium text-secondary-foreground">
                    {c}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  </section>
);
