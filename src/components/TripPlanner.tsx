import { Mountain, MOUNTAINS, GRADE_INFO } from "@/data/mountains";
import { recommend, formatIDR, Recommendation } from "@/lib/risk-engine";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { AlertTriangle, CheckCircle2, Info, Users, Calendar, MapPin, Sparkles, ListChecks } from "lucide-react";

export const TripPlanner = () => {
  const [mountainId, setMountainId] = useState<string>("semeru");
  const [days, setDays] = useState(3);
  const [people, setPeople] = useState(5);
  const [submitted, setSubmitted] = useState(false);

  const mountain = MOUNTAINS.find((m) => m.id === mountainId)!;
  const result: Recommendation = useMemo(
    () => recommend({ mountain, days, people }),
    [mountain, days, people],
  );

  const grade = GRADE_INFO[mountain.grade];

  return (
    <section id="planner" className="bg-gradient-soft py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <Sparkles className="h-3.5 w-3.5" /> Trip Planner
          </div>
          <h2 className="font-display text-4xl font-bold text-foreground sm:text-5xl">
            Rencanakan pendakianmu
          </h2>
          <p className="mt-4 text-muted-foreground">
            Isi gunung tujuan, durasi, dan jumlah pendaki. Sistem akan menghitung resiko dan
            menyarankan alat wajib yang harus disewa.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[400px_1fr]">
          {/* Form */}
          <div className="rounded-3xl border border-border bg-card p-6 shadow-card-soft sm:p-8">
            <div className="space-y-6">
              <Field icon={<MapPin className="h-4 w-4" />} label="Gunung tujuan">
                <select
                  value={mountainId}
                  onChange={(e) => { setMountainId(e.target.value); setSubmitted(false); }}
                  className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm font-medium outline-none transition-smooth focus:border-primary focus:ring-2 focus:ring-primary/20"
                >
                  {MOUNTAINS.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} — {m.region} ({m.elevation}m)
                    </option>
                  ))}
                </select>
              </Field>

              <Field icon={<Calendar className="h-4 w-4" />} label="Durasi pendakian (hari)">
                <input
                  type="number" min={1} max={14} value={days}
                  onChange={(e) => { setDays(Math.max(1, Math.min(14, +e.target.value || 1))); setSubmitted(false); }}
                  className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm font-medium outline-none transition-smooth focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </Field>

              <Field icon={<Users className="h-4 w-4" />} label="Jumlah pendaki">
                <input
                  type="number" min={1} max={20} value={people}
                  onChange={(e) => { setPeople(Math.max(1, Math.min(20, +e.target.value || 1))); setSubmitted(false); }}
                  className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm font-medium outline-none transition-smooth focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </Field>

              <button
                onClick={() => setSubmitted(true)}
                className="w-full rounded-xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground shadow-elegant transition-smooth hover:bg-primary/90"
              >
                Hitung Resiko & Rekomendasi
              </button>

              <div className="rounded-2xl bg-secondary p-4 text-xs leading-relaxed text-secondary-foreground">
                <p className="font-semibold">{mountain.name}</p>
                <p className="mt-1 text-muted-foreground">{mountain.notes}</p>
              </div>
            </div>
          </div>

          {/* Result */}
          <div className="space-y-6">
            {/* Risk card */}
            <div
              className="overflow-hidden rounded-3xl border-2 bg-card shadow-elegant"
              style={{ borderColor: `hsl(var(--${result.risk.color}))` }}
            >
              <div
                className="flex items-center justify-between px-6 py-4 text-white"
                style={{ backgroundColor: `hsl(var(--${result.risk.color}))` }}
              >
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-6 w-6" />
                  <div>
                    <div className="text-xs font-semibold uppercase opacity-80">Resiko Pendakian</div>
                    <div className="font-display text-2xl font-bold">{result.risk.level}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-display text-4xl font-extrabold">{result.risk.score}</div>
                  <div className="text-xs opacity-80">/ 100</div>
                </div>
              </div>
              <div className="p-6">
                <div className="mb-3 flex items-center gap-2">
                  <span
                    className="rounded-full px-2.5 py-0.5 text-xs font-bold text-white"
                    style={{ backgroundColor: `hsl(var(--${grade.color}))` }}
                  >
                    {grade.label}
                  </span>
                  <span className="text-sm text-muted-foreground">{grade.description}</span>
                </div>
                <ul className="space-y-2">
                  {result.risk.reasons.map((r, i) => (
                    <li key={i} className="flex gap-2 text-sm text-foreground/80">
                      <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Mandatory items */}
            <div className="rounded-3xl border border-border bg-card p-6 shadow-card-soft sm:p-8">
              <div className="mb-5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ListChecks className="h-5 w-5 text-primary" />
                  <h3 className="font-display text-xl font-bold">Alat WAJIB Disewa</h3>
                </div>
                <span className="rounded-full bg-danger/10 px-3 py-1 text-xs font-semibold text-danger">
                  {result.mandatory.length} item
                </span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {result.mandatory.map((it) => (
                  <ItemRow key={it.equipment.id + it.reason} item={it} days={days} />
                ))}
              </div>
            </div>

            {/* Suggested */}
            {result.suggested.length > 0 && (
              <div className="rounded-3xl border border-dashed border-border bg-card p-6 shadow-card-soft sm:p-8">
                <div className="mb-5 flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-success" />
                  <h3 className="font-display text-xl font-bold">Disarankan Tambahan</h3>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {result.suggested.map((it) => (
                    <ItemRow key={it.equipment.id + it.reason} item={it} days={days} />
                  ))}
                </div>
              </div>
            )}

            {/* Cost */}
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-gradient-forest p-6 text-primary-foreground shadow-elegant sm:p-8">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider opacity-80">
                  Estimasi total sewa
                </div>
                <div className="font-display text-4xl font-extrabold">
                  {formatIDR(result.estimatedCost)}
                </div>
                <div className="mt-1 text-sm opacity-80">
                  Untuk {people} orang × {days} hari
                </div>
              </div>
              <CheckoutButton mountainId={mountainId} days={days} people={people} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const Field = ({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) => (
  <label className="block">
    <span className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-foreground">
      <span className="text-primary">{icon}</span>{label}
    </span>
    {children}
  </label>
);

const ItemRow = ({ item, days }: { item: ReturnType<typeof recommend>["mandatory"][number]; days: number }) => (
  <div className="group rounded-2xl border border-border bg-background p-4 transition-smooth hover:border-primary/40 hover:shadow-card-soft">
    <div className="flex items-start gap-3">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-secondary text-2xl">
        {item.equipment.emoji}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className="font-semibold leading-tight text-foreground">{item.equipment.name}</p>
          <span className="shrink-0 rounded-md bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">×{item.quantity}</span>
        </div>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{item.reason}</p>
        <p className="mt-2 text-xs font-semibold text-primary">
          {formatIDR(item.equipment.pricePerDay * item.quantity * days)}
          <span className="ml-1 font-normal text-muted-foreground">/ {days} hari</span>
        </p>
      </div>
    </div>
  </div>
);

const CheckoutButton = ({ mountainId, days, people }: { mountainId: string; days: number; people: number }) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleClick = () => {
    if (!user) {
      navigate("/login");
      return;
    }
    navigate(`/checkout?mountain=${mountainId}&days=${days}&people=${people}`);
  };

  return (
    <button onClick={handleClick} className="rounded-full bg-accent px-6 py-3 text-sm font-bold text-accent-foreground shadow-glow transition-smooth hover:scale-[1.02]">
      {user ? "Lanjut Sewa Paket Ini" : "Login untuk Sewa"}
    </button>
  );
};
