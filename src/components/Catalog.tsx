import { EquipmentCategory, PACKAGES } from "@/data/equipment";
import { formatIDR } from "@/lib/risk-engine";
import { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/hooks/use-toast";

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
  const [products, setProducts] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const { addToCart } = useCart();
  const { toast } = useToast();

  useEffect(() => {
    fetch("http://localhost:5000/api/products")
      .then((res) => res.json())
      .then((data) => {
        if (data.products) setProducts(data.products);
      })
      .catch((err) => console.error("Failed to fetch products:", err));
  }, []);

  const getSizesList = (product: any) => {
    if (!product || !product.sizes) return [];
    try {
      const parsed = JSON.parse(product.sizes);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  const handleAddToCart = (product: any) => {
    addToCart(product);
    toast({
      title: "Berhasil ditambahkan",
      description: `${product.name} dimasukkan ke keranjang`,
    });
  };

  const showPackages = active === "all" || active === "package";
  const items = active === "package" ? [] : products.filter((e) => active === "all" ? e.category !== "package" : e.category === active);

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
              className={`rounded-full px-4 py-2 text-sm font-medium transition-smooth ${active === c.id
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
              {products.filter(p => p.category === "package").map((p) => (
                <div
                  key={p.id}
                  onClick={() => { setSelectedProduct(p); setSelectedSize(""); }}
                  className="group relative cursor-pointer overflow-hidden rounded-2xl border border-border bg-gradient-forest p-6 text-primary-foreground shadow-card-soft transition-smooth hover:shadow-elegant"
                >
                  {p.image_url ? (
                    <div className="absolute inset-0 opacity-20"><img src={`http://localhost:5000${p.image_url}`} className="h-full w-full object-cover" alt="" /></div>
                  ) : (
                    <div className="absolute -right-6 -top-6 text-7xl opacity-10">{p.emoji || "⛺"}</div>
                  )}
                  <div className="relative">
                    <h4 className="mt-3 font-display text-xl font-bold">{p.name}</h4>
                    <p className="mt-1 text-sm text-white/80 line-clamp-2">{p.description}</p>
                    <div className="mt-5 flex items-end justify-between">
                      <div>
                        <div className="font-display text-2xl font-extrabold">{formatIDR(p.price_per_day)}</div>
                        <div className="text-xs text-white/70">per hari</div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (getSizesList(p).length > 0 && !selectedSize) {
                            setSelectedProduct(p);
                            setSelectedSize("");
                            toast({ title: "Pilih Ukuran", description: "Silakan pilih ukuran di detail produk.", variant: "destructive" });
                          } else {
                            handleAddToCart(p);
                          }
                        }}
                        className="rounded-full bg-accent px-4 py-2 text-xs font-bold text-accent-foreground shadow-glow transition-smooth group-hover:scale-105"
                      >
                        + Keranjang
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {products.filter(p => p.category === "package").length === 0 && (
                <p className="text-muted-foreground">Belum ada paket bundling.</p>
              )}
            </div>
          </>
        )}

        {items.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {items.map((e) => (
              <div
                key={e.id}
                onClick={() => { setSelectedProduct(e); setSelectedSize(""); }}
                className="group flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-border bg-card p-5 transition-smooth hover:-translate-y-1 hover:border-primary/40 hover:shadow-elegant"
              >
                {e.image_url ? (
                  <div className="mb-4 flex h-32 items-center justify-center rounded-xl overflow-hidden bg-secondary">
                    <img src={`http://localhost:5000${e.image_url}`} alt={e.name} className="h-full w-full object-cover" />
                  </div>
                ) : (
                  <div className="mb-4 flex h-32 items-center justify-center rounded-xl bg-gradient-soft text-6xl">
                    {e.emoji}
                  </div>
                )}
                <div className="flex flex-1 flex-col">
                  <h4 className="font-semibold leading-tight">{e.name}</h4>
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{e.description}</p>
                  <div className="mt-auto flex items-end justify-between pt-4">
                    <div>
                      <div className="font-display text-lg font-bold text-primary">{formatIDR(e.price_per_day)}</div>
                      <div className="text-[10px] text-muted-foreground">per hari</div>
                    </div>
                    <button
                      onClick={(evt) => {
                        evt.stopPropagation();
                        if (getSizesList(e).length > 0 && !selectedSize) {
                          setSelectedProduct(e);
                          setSelectedSize("");
                          toast({ title: "Pilih Ukuran", description: "Silakan pilih ukuran di detail produk.", variant: "destructive" });
                        } else {
                          handleAddToCart(e);
                        }
                      }}
                      className="rounded-full bg-secondary px-3 py-1.5 text-xs font-semibold text-secondary-foreground transition-smooth hover:bg-primary hover:text-primary-foreground"
                    >
                      + Keranjang
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          !showPackages && <div className="py-12 text-center text-muted-foreground">Belum ada alat di kategori ini.</div>
        )}
      </div>

      {/* Modal Detail Produk */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setSelectedProduct(null)}>
          <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl bg-card shadow-xl" onClick={e => e.stopPropagation()}>
            {selectedProduct.image_url ? (
              <img src={`http://localhost:5000${selectedProduct.image_url}`} alt={selectedProduct.name} className="h-64 w-full object-cover" />
            ) : (
              <div className="flex h-64 w-full items-center justify-center bg-gradient-soft text-8xl">
                {selectedProduct.emoji || "⛺"}
              </div>
            )}
            <div className="p-6">
              <div className="mb-2 flex items-center gap-2">
                <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-bold text-primary uppercase">{selectedProduct.category === 'package' ? 'Paket Bundling' : 'Alat Satuan'}</span>
                <span className="text-sm font-semibold text-muted-foreground">Stok: {selectedProduct.stock}</span>
              </div>
              <h3 className="font-display text-2xl font-bold">{selectedProduct.name}</h3>
              <p className="mt-4 text-muted-foreground leading-relaxed text-sm whitespace-pre-wrap">{selectedProduct.description || "Tidak ada deskripsi tersedia."}</p>

              {getSizesList(selectedProduct).length > 0 && (
                <div className="mt-4">
                  <label className="mb-2 block text-sm font-semibold">Pilih Ukuran / Size</label>
                  <div className="flex flex-wrap gap-2">
                    {getSizesList(selectedProduct).map((sz: any) => (
                      <button
                        key={sz.size}
                        disabled={sz.stock <= 0}
                        onClick={() => setSelectedSize(sz.size)}
                        className={`rounded-lg border px-4 py-2 text-sm font-semibold transition-smooth ${selectedSize === sz.size ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-background text-muted-foreground hover:bg-secondary'} ${sz.stock <= 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {sz.size} {sz.stock <= 0 ? '(Habis)' : `(Stok: ${sz.stock})`}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-8 flex items-center justify-between border-t border-border pt-6">
                <div>
                  <div className="text-xs text-muted-foreground">Harga Sewa</div>
                  <div className="font-display text-xl font-bold text-primary">{formatIDR(selectedProduct.price_per_day)}<span className="text-sm font-normal text-muted-foreground">/hari</span></div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => { setSelectedProduct(null); setSelectedSize(""); }}
                    className="rounded-full bg-secondary px-4 py-3 text-sm font-bold text-secondary-foreground transition-smooth hover:bg-secondary/80"
                  >
                    Tutup
                  </button>
                  <button
                    onClick={() => {
                      if (getSizesList(selectedProduct).length > 0 && !selectedSize) {
                        toast({ title: "Pilih ukuran", description: "Anda harus memilih ukuran terlebih dahulu.", variant: "destructive" });
                        return;
                      }
                      handleAddToCart({ ...selectedProduct, name: selectedSize ? `${selectedProduct.name} (Size: ${selectedSize})` : selectedProduct.name });
                      setSelectedProduct(null);
                      setSelectedSize("");
                    }}
                    className="rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-glow transition-smooth hover:scale-105"
                  >
                    + Keranjang
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
