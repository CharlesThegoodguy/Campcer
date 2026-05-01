import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Navigate, Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { formatIDR } from "@/lib/risk-engine";
import { Package, Users, FileCheck, Plus, Trash2, Edit2, Eye, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const API = "http://localhost:5000/api";

type Tab = "products" | "orders" | "users";

const Admin = () => {
  const { user, isAdmin, loading } = useAuth();
  const { toast } = useToast();
  const [tab, setTab] = useState<Tab>("orders");
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [simaksiModal, setSimaksiModal] = useState<string | null>(null);

  const [showProductForm, setShowProductForm] = useState(false);
  const [editProduct, setEditProduct] = useState<any>(null);
  const [pForm, setPForm] = useState({ name: "", description: "", emoji: "🏕️", category: "basic", price_per_day: 0, stock: 0 });

  const token = () => localStorage.getItem("token");
  const authHeader = () => ({ Authorization: `Bearer ${token()}`, "Content-Type": "application/json" });

  useEffect(() => {
    if (!isAdmin) return;
    fetchData();
  }, [isAdmin]);

  const fetchData = async () => {
    try {
      const [oRes, pRes, uRes] = await Promise.all([
        fetch(`${API}/admin/orders`, { headers: { Authorization: `Bearer ${token()}` } }),
        fetch(`${API}/admin/products`, { headers: { Authorization: `Bearer ${token()}` } }),
        fetch(`${API}/admin/users`, { headers: { Authorization: `Bearer ${token()}` } }),
      ]);
      const [o, p, u] = await Promise.all([oRes.json(), pRes.json(), uRes.json()]);
      if (oRes.ok) setOrders(o.orders);
      if (pRes.ok) setProducts(p.products);
      if (uRes.ok) setProfiles(u.users);
    } catch (err) {
      console.error("Failed to fetch admin data", err);
    }
  };

  const updateOrderStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`${API}/admin/orders/${id}/status`, {
        method: "PATCH",
        headers: authHeader(),
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Gagal");
      setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
      toast({ title: `Status diubah ke ${status}` });
    } catch {
      toast({ title: "Gagal update status", variant: "destructive" });
    }
  };

  const saveProduct = async () => {
    try {
      const method = editProduct ? "PUT" : "POST";
      const url = editProduct ? `${API}/admin/products/${editProduct.id}` : `${API}/admin/products`;
      const res = await fetch(url, { method, headers: authHeader(), body: JSON.stringify(pForm) });
      if (!res.ok) throw new Error("Gagal");
      setShowProductForm(false);
      setEditProduct(null);
      setPForm({ name: "", description: "", emoji: "🏕️", category: "basic", price_per_day: 0, stock: 0 });
      fetchData();
      toast({ title: editProduct ? "Produk diperbarui" : "Produk ditambahkan" });
    } catch {
      toast({ title: "Gagal menyimpan produk", variant: "destructive" });
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      await fetch(`${API}/admin/products/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token()}` },
      });
      fetchData();
      toast({ title: "Produk dihapus" });
    } catch {
      toast({ title: "Gagal hapus produk", variant: "destructive" });
    }
  };

  if (loading) return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
  if (!user || !isAdmin) return <Navigate to="/login" replace />;

  const tabs: { key: Tab; label: string; icon: any; count: number }[] = [
    { key: "orders", label: "Pesanan", icon: FileCheck, count: orders.length },
    { key: "products", label: "Produk", icon: Package, count: products.length },
    { key: "users", label: "Users", icon: Users, count: profiles.length },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center gap-3">
          <Link to="/" className="text-muted-foreground hover:text-primary"><ArrowLeft className="h-5 w-5" /></Link>
          <h1 className="font-display text-3xl font-bold">Admin Dashboard</h1>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-2">
          {tabs.map((t) => (
            <button
              key={t.key} onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-smooth ${tab === t.key ? "bg-primary text-primary-foreground shadow-elegant" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
            >
              <t.icon className="h-4 w-4" /> {t.label} <span className="ml-1 rounded-full bg-background/20 px-2 py-0.5 text-xs">{t.count}</span>
            </button>
          ))}
        </div>

        {/* Orders Tab */}
        {tab === "orders" && (
          <div className="space-y-4">
            {orders.length === 0 && <p className="text-muted-foreground">Belum ada pesanan.</p>}
            {orders.map((o) => (
              <div key={o.id} className="rounded-2xl border border-border bg-card p-5 shadow-card-soft">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-display text-lg font-bold">{o.mountain_name}</span>
                      <StatusBadge status={o.status} />
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {o.user_name && <span className="font-medium">{o.user_name} ({o.user_email}) · {o.user_phone ? `WA: ${o.user_phone}` : 'No HP -'} · </span>}
                      {o.people} orang · {o.days} hari · {formatIDR(o.total_price)}
                    </p>
                    {o.notes && <p className="mt-1 text-sm text-muted-foreground">📝 {o.notes}</p>}
                    <p className="mt-1 text-xs text-muted-foreground">{new Date(o.created_at).toLocaleDateString("id-ID")}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="flex gap-2">
                      {o.simaksi_url && (
                        <button
                          onClick={() => setSimaksiModal(`http://localhost:5000${o.simaksi_url}`)}
                          className="flex items-center gap-1 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/20"
                        >
                          <Eye className="h-3.5 w-3.5" /> SIMAKSI
                        </button>
                      )}
                      {o.payment_proof_url && (
                        <button
                          onClick={() => setSimaksiModal(`http://localhost:5000${o.payment_proof_url}`)}
                          className="flex items-center gap-1 rounded-lg bg-green-500/10 px-3 py-1.5 text-xs font-semibold text-green-600 hover:bg-green-500/20"
                        >
                          <Eye className="h-3.5 w-3.5" /> Transfer
                        </button>
                      )}
                    </div>
                    <select
                      value={o.status} onChange={(e) => updateOrderStatus(o.id, e.target.value)}
                      className="rounded-lg border border-input bg-background px-2 py-1.5 text-xs font-medium"
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="active">Active</option>
                      <option value="returned">Returned</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Products Tab */}
        {tab === "products" && (
          <div>
            <button
              onClick={() => { setShowProductForm(true); setEditProduct(null); setPForm({ name: "", description: "", emoji: "🏕️", category: "basic", price_per_day: 0, stock: 0 }); }}
              className="mb-4 flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-elegant"
            >
              <Plus className="h-4 w-4" /> Tambah Produk
            </button>

            {showProductForm && (
              <div className="mb-6 rounded-2xl border border-border bg-card p-6 shadow-card-soft">
                <h3 className="mb-4 font-display text-lg font-bold">{editProduct ? "Edit" : "Tambah"} Produk</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <input placeholder="Nama produk" value={pForm.name} onChange={(e) => setPForm({ ...pForm, name: e.target.value })} className="rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-primary" />
                  <input placeholder="Emoji" value={pForm.emoji} onChange={(e) => setPForm({ ...pForm, emoji: e.target.value })} className="rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-primary" />
                  <input placeholder="Harga/hari (IDR)" type="number" value={pForm.price_per_day} onChange={(e) => setPForm({ ...pForm, price_per_day: +e.target.value })} className="rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-primary" />
                  <input placeholder="Stok" type="number" value={pForm.stock} onChange={(e) => setPForm({ ...pForm, stock: +e.target.value })} className="rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-primary" />
                  <select value={pForm.category} onChange={(e) => setPForm({ ...pForm, category: e.target.value })} className="rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-primary">
                    <option value="basic">Basic Pendakian</option>
                    <option value="standard">Standard</option>
                    <option value="premium">Premium</option>
                  </select>
                  <input placeholder="Deskripsi" value={pForm.description} onChange={(e) => setPForm({ ...pForm, description: e.target.value })} className="rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-primary sm:col-span-2" />
                </div>
                <div className="mt-4 flex gap-2">
                  <button onClick={saveProduct} className="rounded-xl bg-primary px-6 py-2 text-sm font-semibold text-primary-foreground">Simpan</button>
                  <button onClick={() => { setShowProductForm(false); setEditProduct(null); }} className="rounded-xl bg-secondary px-6 py-2 text-sm font-semibold text-secondary-foreground">Batal</button>
                </div>
              </div>
            )}

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((p) => (
                <div key={p.id} className="rounded-2xl border border-border bg-card p-4 shadow-card-soft">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{p.emoji}</span>
                      <div>
                        <p className="font-semibold">{p.name}</p>
                        <p className="text-xs text-muted-foreground">{formatIDR(p.price_per_day)}/hari · Stok: {p.stock}</p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => { setEditProduct(p); setPForm(p); setShowProductForm(true); }} className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-primary">
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button onClick={() => deleteProduct(p.id)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Users Tab */}
        {tab === "users" && (
          <div className="space-y-3">
            {profiles.map((p) => (
              <div key={p.id} className="flex items-center justify-between rounded-2xl border border-border bg-card p-4 shadow-card-soft">
                <div>
                  <p className="font-semibold">{p.full_name || "—"}</p>
                  <p className="text-sm text-muted-foreground">{p.email}</p>
                </div>
                <span className="text-xs text-muted-foreground">{new Date(p.created_at).toLocaleDateString("id-ID")}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SIMAKSI Modal */}
      {simaksiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setSimaksiModal(null)}>
          <div className="max-h-[80vh] max-w-lg overflow-auto rounded-3xl bg-card p-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="mb-3 font-display text-lg font-bold">Bukti SIMAKSI</h3>
            <img src={simaksiModal} alt="SIMAKSI" className="w-full rounded-2xl" />
            <button onClick={() => setSimaksiModal(null)} className="mt-4 w-full rounded-xl bg-secondary py-2 text-sm font-semibold text-secondary-foreground">Tutup</button>
          </div>
        </div>
      )}
    </div>
  );
};

const StatusBadge = ({ status }: { status: string }) => {
  const colors: Record<string, string> = {
    pending: "bg-warning/10 text-warning",
    confirmed: "bg-primary/10 text-primary",
    active: "bg-success/10 text-success",
    returned: "bg-secondary text-secondary-foreground",
    cancelled: "bg-destructive/10 text-destructive",
  };
  return <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${colors[status] || ""}`}>{status}</span>;
};

export default Admin;
