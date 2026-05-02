import { useState, useMemo, useCallback } from "react";
import { useSearchParams, useNavigate, Link, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { MOUNTAINS } from "@/data/mountains";
import { recommend, formatIDR } from "@/lib/risk-engine";
import { Navbar } from "@/components/Navbar";
import { ArrowLeft, ShoppingCart, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/context/CartContext";

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

  const { addToCart } = useCart();
  const [adding, setAdding] = useState(false);

  const handleAddAllToCart = () => {
    setAdding(true);
    const allItems = [...result.mandatory, ...result.suggested];
    
    // We map hardcoded Risk Engine items to the format expected by the Cart.
    // The cart uses standard product format, but the risk engine output has `equipment`
    allItems.forEach(it => {
      // Simulate adding to cart multiple times if quantity > 1
      for(let i=0; i<it.quantity; i++) {
        addToCart({
          id: it.equipment.id,
          name: it.equipment.name,
          price_per_day: it.equipment.pricePerDay,
          emoji: it.equipment.emoji
        });
      }
    });

    toast({ title: "Berhasil", description: "Semua rekomendasi alat ditambahkan ke keranjang." });
    setTimeout(() => {
      navigate('/cart-checkout');
    }, 500);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-12">
        <button onClick={() => navigate(-1)} className="mb-6 flex items-center gap-1 text-sm text-muted-foreground hover:text-primary">
          <ArrowLeft className="h-4 w-4" /> Kembali
        </button>

        <h1 className="mb-8 font-display text-3xl font-bold">Rekomendasi Alat Pendakian</h1>

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

          {/* Info + Actions */}
          <div className="space-y-6">
            <div className="rounded-3xl border border-primary/20 bg-primary/5 p-6 shadow-card-soft">
              <div className="mb-3 flex items-center gap-2 text-primary">
                <Info className="h-5 w-5" />
                <h3 className="font-display text-lg font-bold">Sistem Tidak Mewajibkan Sewa</h3>
              </div>
              <p className="mb-4 text-sm text-muted-foreground leading-relaxed">
                Hasil perhitungan ini hanyalah <span className="font-semibold text-foreground">Rekomendasi Sistem (Trip Planner)</span> untuk keamanan pendakian Anda di {mountain.name}. Anda bebas untuk mengurangi, menambah, atau tidak menyewa alat sama sekali jika sudah memiliki alat sendiri.
              </p>
              <p className="text-sm text-muted-foreground">
                Jika Anda ingin menyewa, Anda dapat memasukkan semua rekomendasi ini ke keranjang, lalu mengaturnya kembali (menghapus yang tidak perlu) sebelum melakukan checkout akhir.
              </p>
            </div>

            <button
              onClick={handleAddAllToCart} disabled={adding}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-4 text-sm font-bold text-primary-foreground shadow-elegant transition-smooth hover:bg-primary/90 disabled:opacity-50"
            >
              <ShoppingCart className="h-5 w-5" />
              {adding ? "Menambahkan..." : "Tambahkan Semua ke Keranjang"}
            </button>
            <Link to="/#catalog" className="flex w-full items-center justify-center gap-2 rounded-xl bg-secondary py-4 text-sm font-bold text-secondary-foreground shadow-sm transition-smooth hover:bg-secondary/80">
              Lihat Katalog Sendiri
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
