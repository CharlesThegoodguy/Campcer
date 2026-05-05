import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Navigate, Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { formatIDR } from "@/lib/risk-engine";
import { Package, Users, FileCheck, Plus, Trash2, Edit2, Eye, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const API = "http://localhost:5000/api";

type Tab = "products" | "orders" | "users" | "mountains";

const Admin = () => {
  const { user, isAdmin, loading } = useAuth();
  const { toast } = useToast();
  const [tab, setTab] = useState<Tab>("orders");
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [mountains, setMountains] = useState<any[]>([]);
  const [simaksiModal, setSimaksiModal] = useState<{ url: string, type: 'SIMAKSI' | 'Transfer' } | null>(null);

  const [showProductForm, setShowProductForm] = useState(false);
  const [editProduct, setEditProduct] = useState<any>(null);
  const [pForm, setPForm] = useState({ name: "", description: "", emoji: "🏕️", category: "shelter", price_per_day: 0, stock: 0, sizes: "" });
  const [pImage, setPImage] = useState<File | null>(null);
  const [sizeList, setSizeList] = useState<{ size: string, stock: number }[]>([]);

  const [showMountainForm, setShowMountainForm] = useState(false);
  const [editMountain, setEditMountain] = useState<any>(null);
  const [mForm, setMForm] = useState({ name: "", region: "", elevation: 0, grade: 1, minTempC: 0, conditionsStr: "", notes: "" });

  const openMountainForm = (m: any = null) => {
    if (m) {
      setEditMountain(m);
      setMForm({ ...m, conditionsStr: (m.conditions || []).join(", ") });
    } else {
      setEditMountain(null);
      setMForm({ name: "", region: "", elevation: 0, grade: 1, minTempC: 0, conditionsStr: "", notes: "" });
    }
    setShowMountainForm(true);
  };

  const openProductForm = (p: any = null) => {
    if (p) {
      setEditProduct(p);
      setPForm(p);
      try {
        const parsed = JSON.parse(p.sizes || "[]");
        setSizeList(Array.isArray(parsed) ? parsed : []);
      } catch {
        setSizeList([]);
      }
    } else {
      setEditProduct(null);
      setPForm({ name: "", description: "", emoji: "🏕️", category: "shelter", price_per_day: 0, stock: 0, sizes: "" });
      setSizeList([]);
    }
    setPImage(null);
    setShowProductForm(true);
  };

  const addSize = () => setSizeList([...sizeList, { size: "", stock: 0 }]);
  const updateSize = (idx: number, field: "size" | "stock", val: string | number) => {
    const list = [...sizeList];
    list[idx] = { ...list[idx], [field]: val };
    setSizeList(list);
  };
  const removeSize = (idx: number) => setSizeList(sizeList.filter((_, i) => i !== idx));

  const totalSizeStock = sizeList.reduce((acc, curr) => acc + (curr.stock || 0), 0);

  const [editUser, setEditUser] = useState<any>(null);
  const [uForm, setUForm] = useState({ full_name: "", phone: "", role: "user" });

  const token = () => localStorage.getItem("token");
  const authHeader = () => ({ Authorization: `Bearer ${token()}`, "Content-Type": "application/json" });

  useEffect(() => {
    if (!isAdmin) return;
    fetchData();
  }, [isAdmin]);

  const fetchData = async () => {
    try {
      const [oRes, pRes, uRes, mRes] = await Promise.all([
        fetch(`${API}/admin/orders`, { headers: { Authorization: `Bearer ${token()}` } }),
        fetch(`${API}/admin/products`, { headers: { Authorization: `Bearer ${token()}` } }),
        fetch(`${API}/admin/users`, { headers: { Authorization: `Bearer ${token()}` } }),
        fetch(`${API}/mountains`),
      ]);
      const [o, p, u, m] = await Promise.all([oRes.json(), pRes.json(), uRes.json(), mRes.json()]);
      if (oRes.ok) setOrders(o.orders);
      if (pRes.ok) setProducts(p.products);
      if (uRes.ok) setProfiles(u.users);
      if (mRes.ok) setMountains(m.mountains);
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
      const formData = new FormData();
      const finalStock = sizeList.length > 0 ? totalSizeStock : pForm.stock;
      const finalSizes = sizeList.length > 0 ? JSON.stringify(sizeList) : "";

      Object.entries({ ...pForm, stock: finalStock, sizes: finalSizes }).forEach(([key, value]) => formData.append(key, String(value)));
      if (pImage) formData.append("image", pImage);

      const method = editProduct ? "PUT" : "POST";
      const url = editProduct ? `${API}/admin/products/${editProduct.id}` : `${API}/admin/products`;
      const res = await fetch(url, { method, headers: { Authorization: `Bearer ${token()}` }, body: formData });
      if (!res.ok) throw new Error("Gagal");
      setShowProductForm(false);
      setEditProduct(null);
      setPImage(null);
      setSizeList([]);
      setPForm({ name: "", description: "", emoji: "🏕️", category: "shelter", price_per_day: 0, stock: 0, sizes: "" });
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

  const saveUser = async () => {
    try {
      const res = await fetch(`${API}/admin/users/${editUser.id}`, {
        method: "PATCH",
        headers: authHeader(),
        body: JSON.stringify(uForm),
      });
      if (!res.ok) throw new Error("Gagal");
      setEditUser(null);
      fetchData();
      toast({ title: "Data pengguna diperbarui" });
    } catch {
      toast({ title: "Gagal update pengguna", variant: "destructive" });
    }
  };

  const saveMountain = async () => {
    if (!mForm.name.trim()) {
      toast({ title: "Nama Gunung tidak boleh kosong", variant: "destructive" });
      return;
    }
    
    try {
      const payload = {
        ...mForm,
        conditions: mForm.conditionsStr.split(',').map(s => s.trim()).filter(Boolean)
      };

      const method = editMountain ? "PUT" : "POST";
      const url = editMountain ? `${API}/admin/mountains/${editMountain.id}` : `${API}/admin/mountains`;
      const res = await fetch(url, { 
        method, 
        headers: authHeader(), 
        body: JSON.stringify(payload) 
      });
      if (!res.ok) throw new Error("Gagal");
      setShowMountainForm(false);
      setEditMountain(null);
      fetchData();
      toast({ title: editMountain ? "Gunung diperbarui" : "Gunung ditambahkan" });
    } catch {
      toast({ title: "Gagal menyimpan gunung", variant: "destructive" });
    }
  };

  const deleteMountain = async (id: string) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus gunung ini?")) return;
    try {
      const res = await fetch(`${API}/admin/mountains/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token()}` },
      });
      if (!res.ok) throw new Error("Gagal hapus di server");
      fetchData();
      toast({ title: "Gunung dihapus" });
    } catch (err: any) {
      toast({ title: "Gagal hapus gunung", description: err.message, variant: "destructive" });
    }
  };

  if (loading) return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
  if (!user || !isAdmin) return <Navigate to="/login" replace />;

  const tabs: { key: Tab; label: string; icon: any; count: number }[] = [
    { key: "orders", label: "Pesanan", icon: FileCheck, count: orders.length },
    { key: "products", label: "Produk", icon: Package, count: products.length },
    { key: "users", label: "Users", icon: Users, count: profiles.length },
    { key: "mountains", label: "Gunung", icon: ArrowLeft, count: mountains.length },
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
              className={`flex items-center gap-4 rounded-full px-4 py-2 text-sm font-semibold transition-smooth ${tab === t.key ? "bg-primary text-primary-foreground shadow-elegant" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
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
                    <p className="mt-1 text-xs font-semibold text-primary">
                      Metode: {o.delivery_method === 'delivery' ? '🚚 Diantar ke Rumah' : '🏬 Ambil di Toko'}
                    </p>
                    {o.items && o.items.length > 0 && (
                      <div className="mt-2 text-xs text-muted-foreground">
                        <p className="font-semibold text-foreground">Alat disewa:</p>
                        <ul className="list-inside list-disc">
                          {o.items.map((item: any) => (
                            <li key={item.id} className="mb-1">
                              <span className="font-medium text-foreground">{item.quantity}x {item.product_name}</span>
                              <br />
                              <span className="ml-4 text-muted-foreground">
                                {formatIDR(item.price_per_day)}/hari × {o.days} hari = <span className="font-semibold text-foreground">{formatIDR(item.price_per_day * item.quantity * o.days)}</span>
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {o.notes && <p className="mt-1 text-sm text-muted-foreground">📝 {o.notes}</p>}
                    <p className="mt-1 text-xs text-muted-foreground">{new Date(o.created_at).toLocaleDateString("id-ID")}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="flex gap-2">
                      {o.simaksi_url && (
                        <button
                          onClick={() => setSimaksiModal({ url: `http://localhost:5000${o.simaksi_url}`, type: 'SIMAKSI' })}
                          className="flex items-center gap-1 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/20"
                        >
                          <Eye className="h-3.5 w-3.5" /> SIMAKSI
                        </button>
                      )}
                      {o.payment_proof_url && (
                        <button
                          onClick={() => setSimaksiModal({ url: `http://localhost:5000${o.payment_proof_url}`, type: 'Transfer' })}
                          className="flex items-center gap-1 rounded-lg bg-green-500/10 px-3 py-1.5 text-xs font-semibold text-green-600 hover:bg-green-500/20"
                        >
                          <Eye className="h-3.5 w-3.5" /> Transfer
                        </button>
                      )}
                    </div>
                    {/* Order Action Buttons */}
                    <div className="flex flex-col gap-2 mt-2">
                      {o.status === 'pending' && (
                        <button onClick={() => updateOrderStatus(o.id, 'confirmed')} className="rounded-lg bg-blue-500 px-3 py-1.5 text-xs font-bold text-white transition-smooth hover:bg-blue-600">
                          Konfirmasi Pesanan
                        </button>
                      )}
                      {o.status === 'confirmed' && (
                        <button onClick={() => updateOrderStatus(o.id, 'active')} className="rounded-lg bg-success px-3 py-1.5 text-xs font-bold text-white transition-smooth hover:bg-success/90">
                          Barang Sudah Dikirim
                        </button>
                      )}
                      {o.status === 'active' && (
                        <button onClick={() => updateOrderStatus(o.id, 'returned')} className="rounded-lg bg-secondary px-3 py-1.5 text-xs font-bold text-secondary-foreground transition-smooth hover:bg-secondary/80">
                          Validasi Barang Kembali
                        </button>
                      )}
                      {(o.status === 'pending' || o.status === 'confirmed') && (
                        <button onClick={() => updateOrderStatus(o.id, 'cancelled')} className="rounded-lg bg-destructive/10 px-3 py-1.5 text-xs font-bold text-destructive transition-smooth hover:bg-destructive/20">
                          Batalkan
                        </button>
                      )}
                    </div>
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
              onClick={() => openProductForm(null)}
              className="mb-4 flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-elegant"
            >
              <Plus className="h-4 w-4" /> Tambah Produk
            </button>

            {showProductForm && (
              <div className="mb-6 rounded-2xl border border-border bg-card p-6 shadow-card-soft">
                <h3 className="mb-4 font-display text-lg font-bold">{editProduct ? "Edit" : "Tambah"} Produk</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex flex-col">
                    <label className="mb-1 text-xs font-semibold text-muted-foreground">Nama Produk / Paket</label>
                    <input placeholder="Contoh: Tenda Dome 4P" value={pForm.name} onChange={(e) => setPForm({ ...pForm, name: e.target.value })} className="rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-primary" />
                  </div>

                  <div className="flex flex-col">
                    <label className="mb-1 text-xs font-semibold text-muted-foreground">Emoji (Sebagai ikon alternatif)</label>
                    <input placeholder="Contoh: ⛺" value={pForm.emoji} onChange={(e) => setPForm({ ...pForm, emoji: e.target.value })} className="rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-primary" />
                  </div>

                  <div className="flex flex-col">
                    <label className="mb-1 text-xs font-semibold text-muted-foreground">Harga Sewa per Hari (Rp)</label>
                    <input type="number" value={pForm.price_per_day} onChange={(e) => setPForm({ ...pForm, price_per_day: +e.target.value })} className="rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-primary" />
                  </div>

                  <div className="flex flex-col">
                    <label className="mb-1 text-xs font-semibold text-muted-foreground">Stok Tersedia</label>
                    <input type="number" disabled={sizeList.length > 0} value={sizeList.length > 0 ? totalSizeStock : pForm.stock} onChange={(e) => setPForm({ ...pForm, stock: +e.target.value })} className="rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-primary disabled:opacity-50" />
                    {sizeList.length > 0 && <p className="mt-1 text-[10px] text-muted-foreground">Stok dihitung otomatis dari varian ukuran.</p>}
                  </div>

                  <div className="flex flex-col justify-center">
                    <label className="mb-1 text-xs font-semibold text-muted-foreground">Gambar Produk (Opsional)</label>
                    <input type="file" accept="image/*" onChange={(e) => setPImage(e.target.files?.[0] || null)} className="text-sm" />
                  </div>

                  <div className="flex flex-col">
                    <label className="mb-1 text-xs font-semibold text-muted-foreground">Kategori Alat</label>
                    <select value={pForm.category} onChange={(e) => setPForm({ ...pForm, category: e.target.value })} className="rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-primary">
                      <option value="shelter">Tenda / Shelter</option>
                      <option value="sleep">Tidur</option>
                      <option value="cooking">Masak</option>
                      <option value="safety">Keselamatan</option>
                      <option value="carry">Carrier</option>
                      <option value="apparel">Pakaian</option>
                      <option value="lighting">Lighting</option>
                      <option value="navigation">Navigasi</option>
                      <option value="package">Paket Bundling</option>
                    </select>
                  </div>

                  <div className="flex flex-col sm:col-span-2">
                    <div className="mb-2 flex items-center justify-between">
                      <label className="text-xs font-semibold text-muted-foreground">Varian Ukuran & Stok (Opsional)</label>
                      <button type="button" onClick={addSize} className="rounded-lg bg-secondary px-2 py-1 text-[10px] font-bold text-primary hover:bg-secondary/80">+ Tambah Ukuran</button>
                    </div>
                    {sizeList.length > 0 ? (
                      <div className="space-y-2 rounded-xl border border-border p-3">
                        {sizeList.map((sz, idx) => (
                          <div key={idx} className="flex gap-2">
                            <input placeholder="Ukuran (S, M, 42...)" value={sz.size} onChange={(e) => updateSize(idx, "size", e.target.value)} className="w-1/2 rounded-lg border border-input px-3 py-2 text-sm" />
                            <input type="number" placeholder="Stok" value={sz.stock} onChange={(e) => updateSize(idx, "stock", +e.target.value)} className="w-1/3 rounded-lg border border-input px-3 py-2 text-sm" />
                            <button type="button" onClick={() => removeSize(idx)} className="flex items-center justify-center rounded-lg bg-destructive/10 px-3 text-destructive hover:bg-destructive/20"><Trash2 className="h-4 w-4" /></button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[10px] text-muted-foreground">Biarkan kosong jika barang tidak memiliki varian ukuran.</p>
                    )}
                  </div>

                  <div className="flex flex-col sm:col-span-2">
                    <label className="mb-1 text-xs font-semibold text-muted-foreground">Deskripsi Singkat</label>
                    <input placeholder="Contoh: Tenda kapasitas 4 orang, double layer..." value={pForm.description} onChange={(e) => setPForm({ ...pForm, description: e.target.value })} className="rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-primary" />
                  </div>
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
                    <div className="flex items-center gap-3">
                      {p.image_url ? (
                        <img src={`http://localhost:5000${p.image_url}`} alt={p.name} className="h-12 w-12 rounded-xl object-cover" />
                      ) : (
                        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary text-2xl">{p.emoji}</span>
                      )}
                      <div>
                        <p className="font-semibold">{p.name}</p>
                        <p className="text-xs text-muted-foreground">{formatIDR(p.price_per_day)}/hari · Stok: {p.stock}
                          {p.sizes && p.sizes !== "[]" && ` · Varian: ${(() => { try { return JSON.parse(p.sizes).length; } catch { return 0; } })()} ukuran`}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => openProductForm(p)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-primary">
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
                {editUser?.id === p.id ? (
                  <div className="flex flex-1 items-center gap-3">
                    <input value={uForm.full_name} onChange={(e) => setUForm({ ...uForm, full_name: e.target.value })} className="rounded-lg border px-3 py-1.5 text-sm" placeholder="Nama" />
                    <input value={uForm.phone} onChange={(e) => setUForm({ ...uForm, phone: e.target.value })} className="rounded-lg border px-3 py-1.5 text-sm" placeholder="No HP" />
                    <select value={uForm.role} onChange={(e) => setUForm({ ...uForm, role: e.target.value })} className="rounded-lg border px-3 py-1.5 text-sm">
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                    <button onClick={saveUser} className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground">Simpan</button>
                    <button onClick={() => setEditUser(null)} className="rounded-lg bg-secondary px-3 py-1.5 text-xs font-semibold">Batal</button>
                  </div>
                ) : (
                  <>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">{p.full_name || "—"}</p>
                        {p.role === "admin" && <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">ADMIN</span>}
                      </div>
                      <p className="text-sm text-muted-foreground">{p.email} · {p.phone || "No HP -"}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground">{new Date(p.created_at).toLocaleDateString("id-ID")}</span>
                      <button onClick={() => { setEditUser(p); setUForm({ full_name: p.full_name || "", phone: p.phone || "", role: p.role || "user" }); }} className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-primary">
                        <Edit2 className="h-4 w-4" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Mountains Tab */}
        {tab === "mountains" && (
          <div>
            <button
              onClick={() => openMountainForm(null)}
              className="mb-4 flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-elegant"
            >
              <Plus className="h-4 w-4" /> Tambah Gunung
            </button>

            {showMountainForm && (
              <div className="mb-6 rounded-2xl border border-border bg-card p-6 shadow-card-soft">
                <h3 className="mb-4 font-display text-lg font-bold">{editMountain ? "Edit" : "Tambah"} Gunung</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex flex-col">
                    <label className="mb-1 text-xs font-semibold text-muted-foreground">Nama Gunung</label>
                    <input placeholder="Contoh: Gunung Semeru" value={mForm.name} onChange={(e) => setMForm({ ...mForm, name: e.target.value })} className="rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-primary" />
                  </div>
                  <div className="flex flex-col">
                    <label className="mb-1 text-xs font-semibold text-muted-foreground">Region (Lokasi)</label>
                    <input placeholder="Contoh: Jawa Timur" value={mForm.region} onChange={(e) => setMForm({ ...mForm, region: e.target.value })} className="rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-primary" />
                  </div>
                  <div className="flex flex-col">
                    <label className="mb-1 text-xs font-semibold text-muted-foreground">Ketinggian (mdpl)</label>
                    <input type="number" value={mForm.elevation} onChange={(e) => setMForm({ ...mForm, elevation: +e.target.value })} className="rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-primary" />
                  </div>
                  <div className="flex flex-col">
                    <label className="mb-1 text-xs font-semibold text-muted-foreground">Grade Kesulitan (1-5)</label>
                    <input type="number" min={1} max={5} value={mForm.grade} onChange={(e) => setMForm({ ...mForm, grade: +e.target.value })} className="rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-primary" />
                  </div>
                  <div className="flex flex-col">
                    <label className="mb-1 text-xs font-semibold text-muted-foreground">Suhu Minimum (°C)</label>
                    <input type="number" value={mForm.minTempC} onChange={(e) => setMForm({ ...mForm, minTempC: +e.target.value })} className="rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-primary" />
                  </div>
                  <div className="flex flex-col">
                    <label className="mb-1 text-xs font-semibold text-muted-foreground">Kondisi (pisahkan dengan koma)</label>
                    <input placeholder="Contoh: cold, windy, alpine" value={mForm.conditionsStr} onChange={(e) => setMForm({ ...mForm, conditionsStr: e.target.value })} className="rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-primary" />
                  </div>
                  <div className="flex flex-col sm:col-span-2">
                    <label className="mb-1 text-xs font-semibold text-muted-foreground">Catatan / Deskripsi Singkat</label>
                    <input placeholder="Contoh: Jalur berbatu dan rawan badai..." value={mForm.notes} onChange={(e) => setMForm({ ...mForm, notes: e.target.value })} className="rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-primary" />
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <button onClick={saveMountain} className="rounded-xl bg-primary px-6 py-2 text-sm font-semibold text-primary-foreground">Simpan</button>
                  <button onClick={() => { setShowMountainForm(false); setEditMountain(null); }} className="rounded-xl bg-secondary px-6 py-2 text-sm font-semibold text-secondary-foreground">Batal</button>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {mountains.map((m) => (
                <div key={m.id} className="flex items-center justify-between rounded-2xl border border-border bg-card p-4 shadow-card-soft">
                  <div className="flex items-center gap-3">
                    <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary text-xl">⛰️</span>
                    <div>
                      <p className="font-semibold">{m.name} <span className="text-xs font-normal text-muted-foreground">({m.elevation}m)</span></p>
                      <p className="text-xs text-muted-foreground">{m.region} · Grade: {m.grade} · {m.minTempC}°C</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => openMountainForm(m)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-primary">
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button onClick={() => deleteMountain(m.id)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* SIMAKSI & Transfer Modal */}
      {simaksiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setSimaksiModal(null)}>
          <div className="max-h-[80vh] max-w-lg overflow-auto rounded-3xl bg-card p-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="mb-3 font-display text-lg font-bold">Bukti {simaksiModal.type}</h3>
            <img src={simaksiModal.url} alt={simaksiModal.type} className="w-full rounded-2xl" />
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
