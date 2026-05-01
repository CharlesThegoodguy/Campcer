import { useState, useMemo, useCallback } from "react";
import { useSearchParams, useNavigate, Link, Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { MOUNTAINS } from "@/data/mountains";
import { recommend, formatIDR } from "@/lib/risk-engine";
import { Navbar } from "@/components/Navbar";
import { Upload, CheckCircle2, AlertTriangle, ArrowLeft, Camera } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Checkout = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { toast } = useToast();

  if (loading) return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;

  const mountainId = params.get("mountain") || "semeru";
  const days = parseInt(params.get("days") || "3");
  const people = parseInt(params.get("people") || "5");

  const mountain = MOUNTAINS.find((m) => m.id === mountainId)!;
  const result = useMemo(() => recommend({ mountain, days, people }), [mountain, days, people]);

  const [simaksiFile, setSimaksiFile] = useState<File | null>(null);
  const [simaksiPreview, setSimaksiPreview] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "File terlalu besar", description: "Maksimal 5MB", variant: "destructive" });
      return;
    }
    setSimaksiFile(file);
    setSimaksiPreview(URL.createObjectURL(file));
  }, [toast]);

  const handleCheckout = async () => {
    if (!simaksiFile) {
      toast({ title: "Upload SIMAKSI", description: "Foto bukti SIMAKSI wajib diupload sebelum checkout.", variant: "destructive" });
      return;
    }
    if (!user) return;

    setSubmitting(true);
    try {
      // Upload SIMAKSI
      const ext = simaksiFile.name.split(".").pop();
      const path = `${user.id}/${Date.now()}.${ext}`;
      const { error: uploadErr } = await supabase.storage.from("simaksi").upload(path, simaksiFile);
      if (uploadErr) throw uploadErr;

      const { data: { publicUrl } } = supabase.storage.from("simaksi").getPublicUrl(path);

      // Create order
      const { data: order, error: orderErr } = await supabase
        .from("orders")
        .insert({
          user_id: user.id,
          mountain_name: mountain.name,
          days,
          people,
          total_price: result.estimatedCost,
          simaksi_url: publicUrl,
          notes,
          status: "pending",
        })
        .select()
        .single();
      if (orderErr) throw orderErr;

      // Create order items
      const items = [...result.mandatory, ...result.suggested].map((it) => ({
        order_id: order.id,
        product_name: it.equipment.name,
        quantity: it.quantity,
        price_per_day: it.equipment.pricePerDay,
        days,
      }));
      const { error: itemsErr } = await supabase.from("order_items").insert(items);
      if (itemsErr) throw itemsErr;

      setDone(true);
      toast({ title: "Pesanan berhasil!", description: "Admin akan memproses pesanan Anda." });
    } catch (err: any) {
      toast({ title: "Gagal checkout", description: err.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto flex flex-col items-center justify-center px-4 py-24 text-center">
          <CheckCircle2 className="mb-4 h-16 w-16 text-success" />
          <h1 className="font-display text-3xl font-bold">Pesanan Berhasil!</h1>
          <p className="mt-2 text-muted-foreground">
            Pesanan Anda sedang diproses oleh admin. Kami akan menghubungi Anda segera.
          </p>
          <Link to="/" className="mt-6 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-elegant">
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-12">
        <button onClick={() => navigate(-1)} className="mb-6 flex items-center gap-1 text-sm text-muted-foreground hover:text-primary">
          <ArrowLeft className="h-4 w-4" /> Kembali
        </button>

        <h1 className="mb-8 font-display text-3xl font-bold">Checkout Sewa Alat</h1>

        <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
          {/* Order Summary */}
          <div className="space-y-6">
            <div className="rounded-3xl border border-border bg-card p-6 shadow-card-soft">
              <h2 className="mb-4 font-display text-xl font-bold">Ringkasan Pesanan</h2>
              <div className="mb-4 grid grid-cols-3 gap-4 text-sm">
                <div className="rounded-2xl bg-secondary p-3 text-center">
                  <div className="font-bold text-foreground">{mountain.name}</div>
                  <div className="text-muted-foreground">Gunung</div>
                </div>
                <div className="rounded-2xl bg-secondary p-3 text-center">
                  <div className="font-bold text-foreground">{days} hari</div>
                  <div className="text-muted-foreground">Durasi</div>
                </div>
                <div className="rounded-2xl bg-secondary p-3 text-center">
                  <div className="font-bold text-foreground">{people} orang</div>
                  <div className="text-muted-foreground">Pendaki</div>
                </div>
              </div>

              <div className="space-y-2">
                {[...result.mandatory, ...result.suggested].map((it, i) => (
                  <div key={i} className="flex items-center justify-between rounded-xl bg-background p-3 text-sm">
                    <div className="flex items-center gap-2">
                      <span>{it.equipment.emoji}</span>
                      <span className="font-medium">{it.equipment.name}</span>
                      <span className="text-muted-foreground">×{it.quantity}</span>
                    </div>
                    <span className="font-semibold text-primary">
                      {formatIDR(it.equipment.pricePerDay * it.quantity * days)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                <span className="font-display text-lg font-bold">Total</span>
                <span className="font-display text-2xl font-extrabold text-primary">{formatIDR(result.estimatedCost)}</span>
              </div>
            </div>
          </div>

          {/* SIMAKSI Upload + Actions */}
          <div className="space-y-6">
            {/* SIMAKSI Upload */}
            <div className="rounded-3xl border-2 border-dashed border-primary/30 bg-card p-6 shadow-card-soft">
              <div className="mb-3 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-warning" />
                <h3 className="font-display text-lg font-bold">Upload Bukti SIMAKSI</h3>
              </div>
              <p className="mb-4 text-sm text-muted-foreground">
                Foto bukti SIMAKSI (Surat Izin Masuk Kawasan) ke {mountain.name} wajib diupload. 
                Ini untuk memvalidasi tujuan alat sewa Anda.
              </p>

              {simaksiPreview ? (
                <div className="relative mb-4">
                  <img src={simaksiPreview} alt="Preview SIMAKSI" className="w-full rounded-2xl object-cover" />
                  <button
                    onClick={() => { setSimaksiFile(null); setSimaksiPreview(null); }}
                    className="absolute right-2 top-2 rounded-full bg-destructive p-1.5 text-destructive-foreground"
                  >✕</button>
                </div>
              ) : (
                <label className="flex cursor-pointer flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-background p-8 transition-smooth hover:border-primary/50">
                  <Camera className="h-10 w-10 text-muted-foreground" />
                  <span className="text-sm font-semibold text-muted-foreground">Klik untuk upload foto SIMAKSI</span>
                  <span className="text-xs text-muted-foreground">JPG, PNG, max 5MB</span>
                  <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                </label>
              )}
            </div>

            {/* Notes */}
            <div className="rounded-3xl border border-border bg-card p-6 shadow-card-soft">
              <label className="mb-2 block text-sm font-semibold text-foreground">Catatan Tambahan (opsional)</label>
              <textarea
                value={notes} onChange={(e) => setNotes(e.target.value)}
                rows={3} placeholder="Contoh: sudah ambil alat jam 5 sore..."
                className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <button
              onClick={handleCheckout} disabled={submitting || !simaksiFile}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-4 text-sm font-bold text-primary-foreground shadow-elegant transition-smooth hover:bg-primary/90 disabled:opacity-50"
            >
              <Upload className="h-4 w-4" />
              {submitting ? "Memproses..." : "Konfirmasi & Sewa Sekarang"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
