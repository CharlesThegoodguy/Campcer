import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/context/CartContext";
import { Navbar } from "@/components/Navbar";
import { Upload, CheckCircle2, AlertTriangle, ArrowLeft, Trash2, Plus, Minus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatIDR } from "@/lib/risk-engine";

const CartCheckout = () => {
  const { user, loading } = useAuth();
  const { items, updateQuantity, removeFromCart, cartTotal, clearCart } = useCart();
  const { toast } = useToast();

  const [days, setDays] = useState(1);
  const [mountainName, setMountainName] = useState("");
  const [simaksiFile, setSimaksiFile] = useState<File | null>(null);
  const [simaksiPreview, setSimaksiPreview] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  if (loading) return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "File terlalu besar", description: "Maksimal 5MB", variant: "destructive" });
      return;
    }
    setSimaksiFile(file);
    setSimaksiPreview(URL.createObjectURL(file));
  };

  const handleCheckout = async () => {
    if (items.length === 0) {
      toast({ title: "Keranjang kosong", description: "Silakan pilih alat terlebih dahulu.", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      
      if (simaksiFile) {
        formData.append("simaksi", simaksiFile);
      }
      
      const destination = mountainName.trim() || "Sewa Bebas (Tanpa Spesifik Gunung)";
      const grandTotal = cartTotal * days;
      
      formData.append("mountain_name", destination);
      formData.append("days", days.toString());
      formData.append("people", "1"); // Default untuk sewa alat
      formData.append("total_price", grandTotal.toString());
      formData.append("notes", notes);

      const orderItems = items.map((it) => ({
        product_name: it.name,
        quantity: it.quantity,
        price_per_day: it.price_per_day,
        days,
      }));
      formData.append("items", JSON.stringify(orderItems));

      const res = await fetch("http://localhost:5000/api/orders", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal membuat pesanan");

      clearCart();
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

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-24 text-center">
          <h1 className="font-display text-3xl font-bold">Keranjang Kosong</h1>
          <p className="mt-2 text-muted-foreground">Anda belum memilih alat apapun untuk disewa.</p>
          <Link to="/" className="mt-6 inline-block rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-elegant">
            Lihat Katalog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto max-w-5xl px-4 py-24">
        <div className="mb-8 flex items-center gap-4">
          <Link to="/" className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-secondary-foreground transition-smooth hover:bg-secondary/70">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="font-display text-3xl font-bold">Checkout Keranjang</h1>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            {/* Cart Items */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <h2 className="mb-4 font-display text-xl font-bold">Daftar Alat</h2>
              <div className="divide-y divide-border">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between py-4">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary text-2xl">
                        {item.emoji}
                      </div>
                      <div>
                        <h4 className="font-semibold">{item.name}</h4>
                        <p className="text-sm text-muted-foreground">{formatIDR(item.price_per_day)}/hari</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 rounded-lg border border-border bg-background p-1">
                        <button onClick={() => updateQuantity(item.id, -1)} className="rounded p-1 hover:bg-secondary">
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-4 text-center text-sm font-medium">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, 1)} className="rounded p-1 hover:bg-secondary">
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <button onClick={() => removeFromCart(item.id)} className="p-2 text-destructive hover:bg-destructive/10 rounded-lg">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Rental Details */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <h2 className="mb-4 font-display text-xl font-bold">Detail Penyewaan</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-muted-foreground">Durasi Sewa (Hari)</label>
                  <input
                    type="number"
                    min="1"
                    value={days}
                    onChange={(e) => setDays(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full rounded-xl border border-input bg-background px-4 py-2 font-medium"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-muted-foreground">Tujuan / Nama Gunung (Opsional)</label>
                  <input
                    type="text"
                    value={mountainName}
                    onChange={(e) => setMountainName(e.target.value)}
                    placeholder="Contoh: Ranu Kumbolo"
                    className="w-full rounded-xl border border-input bg-background px-4 py-2"
                  />
                </div>
              </div>
            </div>

            {/* Optional SIMAKSI */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <div className="mb-4">
                <h2 className="font-display text-xl font-bold flex items-center gap-2">
                  Bukti SIMAKSI <span className="text-xs font-normal text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">Opsional</span>
                </h2>
                <p className="text-sm text-muted-foreground">
                  Jika Anda mendaki gunung yang memerlukan tiket/SIMAKSI, mohon lampirkan di sini untuk pendataan kami.
                </p>
              </div>
              <label className="relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-secondary/30 p-8 text-center transition-smooth hover:bg-secondary/50">
                {simaksiPreview ? (
                  <div className="relative h-40 w-full overflow-hidden rounded-lg">
                    <img src={simaksiPreview} alt="Preview SIMAKSI" className="h-full w-full object-cover" />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity hover:opacity-100">
                      <span className="text-sm font-medium text-white">Ganti Foto</span>
                    </div>
                  </div>
                ) : (
                  <>
                    <Upload className="mb-3 h-10 w-10 text-muted-foreground" />
                    <span className="font-medium">Klik untuk upload foto SIMAKSI</span>
                    <span className="mt-1 text-xs text-muted-foreground">JPG, PNG maks 5MB</span>
                  </>
                )}
                <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
              </label>
            </div>

            {/* Catatan */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <h2 className="mb-2 font-display text-xl font-bold">Catatan (Opsional)</h2>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Pesan tambahan untuk admin..."
                className="h-24 w-full resize-none rounded-xl border border-input bg-background p-3"
              ></textarea>
            </div>
          </div>

          {/* Summary Sidebar */}
          <div>
            <div className="sticky top-24 rounded-2xl border border-border bg-card p-6 shadow-elegant">
              <h3 className="mb-4 font-display text-xl font-bold">Ringkasan Pesanan</h3>
              <div className="mb-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Item</span>
                  <span className="font-medium">{items.reduce((acc, i) => acc + i.quantity, 0)} alat</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Durasi</span>
                  <span className="font-medium">{days} Hari</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Harga per hari</span>
                  <span className="font-medium">{formatIDR(cartTotal)}</span>
                </div>
              </div>
              <div className="my-4 border-t border-border"></div>
              <div className="mb-6 flex justify-between">
                <span className="font-bold">Total Pembayaran</span>
                <span className="font-display text-xl font-extrabold text-primary">{formatIDR(cartTotal * days)}</span>
              </div>
              
              <div className="mb-4 flex items-start gap-3 rounded-xl bg-accent/10 p-4 text-sm text-accent-foreground">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                <p>Harga di atas adalah estimasi. Total final dan ongkir (jika ada) akan dikonfirmasi admin.</p>
              </div>

              <button
                onClick={handleCheckout}
                disabled={submitting}
                className="w-full rounded-full bg-primary py-4 font-bold text-primary-foreground shadow-glow transition-smooth hover:scale-[1.02] disabled:opacity-70 disabled:hover:scale-100"
              >
                {submitting ? "Memproses..." : "Sewa Sekarang"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartCheckout;
