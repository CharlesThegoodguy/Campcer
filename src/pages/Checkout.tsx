import { useState, useMemo, useCallback, useEffect } from "react";
import { useSearchParams, useNavigate, Link, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { MOUNTAINS } from "@/data/mountains";
import { recommend, formatIDR } from "@/lib/risk-engine";
import { Navbar } from "@/components/Navbar";
import { ArrowLeft, ShoppingCart, Info, CheckSquare, Square } from "lucide-react";
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

  const allRecommendedItems = useMemo(() => [...result.mandatory, ...result.suggested], [result]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(allRecommendedItems.map(it => it.equipment.id)));

  useEffect(() => {
    setSelectedIds(new Set(allRecommendedItems.map(it => it.equipment.id)));
  }, [allRecommendedItems]);

  const toggleSelection = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const selectedItems = allRecommendedItems.filter(it => selectedIds.has(it.equipment.id));
  const estimatedTotal = selectedItems.reduce((acc, it) => acc + (it.equipment.pricePerDay * it.quantity * days), 0);

  const handleAddAllToCart = () => {
    setAdding(true);
    
    selectedItems.forEach(it => {
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

    toast({ title: "Berhasil", description: `${selectedItems.length} rekomendasi alat ditambahkan ke keranjang.` });
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
                {allRecommendedItems.map((it, i) => (
                  <div key={i} className={`flex items-center justify-between rounded-xl border p-3 text-sm transition-colors ${selectedIds.has(it.equipment.id) ? 'border-primary/30 bg-primary/5' : 'border-border bg-background opacity-60'}`}>
                    <div className="flex items-center gap-3">
                      <button onClick={() => toggleSelection(it.equipment.id)} className="text-primary hover:text-primary/80 transition-colors">
                        {selectedIds.has(it.equipment.id) ? <CheckSquare className="h-5 w-5" /> : <Square className="h-5 w-5 text-muted-foreground" />}
                      </button>
                      <span className="text-xl">{it.equipment.emoji}</span>
                      <span className={`font-medium ${!selectedIds.has(it.equipment.id) && 'line-through text-muted-foreground'}`}>{it.equipment.name}</span>
                      <span className="text-muted-foreground">×{it.quantity}</span>
                    </div>
                    <span className={`font-semibold ${selectedIds.has(it.equipment.id) ? 'text-primary' : 'text-muted-foreground line-through'}`}>
                      {formatIDR(it.equipment.pricePerDay * it.quantity * days)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                <span className="font-display text-lg font-bold">Total Terpilih</span>
                <span className="font-display text-2xl font-extrabold text-primary">{formatIDR(estimatedTotal)}</span>
              </div>
            </div>
          </div>

          {/* Info + Actions */}
          <div className="space-y-6">
            <div className="rounded-3xl border border-primary/20 bg-primary/5 p-6 shadow-card-soft">
              <div className="mb-3 flex items-center gap-2 text-primary">
                <Info className="h-5 w-5" />
                <h3 className="font-display text-lg font-bold">Sistem Hanya Menyarankan Sewa</h3>
              </div>
              <p className="mb-4 text-sm text-muted-foreground leading-relaxed">
                Hasil perhitungan ini hanyalah <span className="font-semibold text-foreground">Rekomendasi Sistem (Trip Planner)</span> untuk keamanan pendakian Anda di {mountain.name}. Anda bebas untuk mengurangi, menambah, atau tidak menyewa alat sama sekali jika sudah memiliki alat sendiri.
              </p>
              <p className="text-sm text-muted-foreground">
                Silakan hilangkan centang (uncheck) pada alat yang sudah Anda miliki atau tidak ingin Anda sewa, lalu klik tombol di bawah untuk menambahkannya ke keranjang.
              </p>
            </div>

            <button
              onClick={handleAddAllToCart} disabled={adding || selectedItems.length === 0}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-4 text-sm font-bold text-primary-foreground shadow-elegant transition-smooth hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ShoppingCart className="h-5 w-5" />
              {adding ? "Menambahkan..." : `Tambahkan Terpilih (${selectedItems.length}) ke Keranjang`}
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
