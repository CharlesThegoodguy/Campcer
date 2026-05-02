import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Navigate, Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { formatIDR } from "@/lib/risk-engine";
import { FileText, User, ArrowLeft, Upload, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const API = "http://localhost:5000/api";

export const StatusBadge = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    pending: "bg-yellow-500/10 text-yellow-600",
    confirmed: "bg-blue-500/10 text-blue-600",
    active: "bg-green-500/10 text-green-600",
    returned: "bg-slate-500/10 text-slate-600",
    cancelled: "bg-red-500/10 text-red-600",
  };
  const labels: Record<string, string> = {
    pending: "Menunggu",
    confirmed: "Dikonfirmasi",
    active: "Sedang Disewa",
    returned: "Selesai",
    cancelled: "Dibatalkan",
  };
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${styles[status] || styles.pending}`}>
      {labels[status] || status}
    </span>
  );
};

const UserDashboard = () => {
  const { user, loading, checkAuth } = useAuth();
  const { toast } = useToast();
  const [tab, setTab] = useState<"orders" | "profile">("orders");
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Profile Form
  const [pForm, setPForm] = useState({ full_name: "", phone: "", password: "" });

  const token = () => localStorage.getItem("token");

  useEffect(() => {
    if (user) {
      setPForm({ full_name: user.full_name || "", phone: user.phone || "", password: "" });
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    setIsLoadingData(true);
    try {
      const res = await fetch(`${API}/orders/me`, { headers: { Authorization: `Bearer ${token()}` } });
      const data = await res.json();
      if (res.ok) setOrders(data.orders);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API}/auth/profile`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token()}`, "Content-Type": "application/json" },
        body: JSON.stringify(pForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast({ title: "Profil diperbarui" });
      setPForm(prev => ({ ...prev, password: "" }));
      checkAuth(); // refresh user context
    } catch (err: any) {
      toast({ title: "Gagal", description: err.message, variant: "destructive" });
    }
  };

  const handleUploadPayment = async (orderId: string, file: File) => {
    const formData = new FormData();
    formData.append("payment_proof", file);
    try {
      const res = await fetch(`${API}/orders/${orderId}/payment`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token()}` },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast({ title: "Bukti transfer diunggah!" });
      fetchOrders();
    } catch (err: any) {
      toast({ title: "Gagal upload", description: err.message, variant: "destructive" });
    }
  };

  if (loading) return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto max-w-5xl px-4 py-8">
        <div className="mb-6 flex items-center gap-3">
          <Link to="/" className="text-muted-foreground hover:text-primary"><ArrowLeft className="h-5 w-5" /></Link>
          <h1 className="font-display text-3xl font-bold">Dashboard Pengguna</h1>
        </div>

        <div className="mb-6 flex gap-2">
          <button
            onClick={() => setTab("orders")}
            className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-smooth ${tab === "orders" ? "bg-primary text-primary-foreground shadow-elegant" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"}`}
          >
            <FileText className="h-4 w-4" /> Pesanan Saya
          </button>
          <button
            onClick={() => setTab("profile")}
            className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-smooth ${tab === "profile" ? "bg-primary text-primary-foreground shadow-elegant" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"}`}
          >
            <User className="h-4 w-4" /> Profil
          </button>
        </div>

        {tab === "orders" && (
          <div className="space-y-4">
            {isLoadingData ? (
              <p>Memuat...</p>
            ) : orders.length === 0 ? (
              <div className="rounded-2xl border border-border bg-card p-8 text-center text-muted-foreground">
                <p>Anda belum pernah melakukan penyewaan.</p>
                <Link to="/#catalog" className="mt-4 inline-block text-primary font-semibold hover:underline">Lihat Katalog</Link>
              </div>
            ) : (
              orders.map((o) => (
                <div key={o.id} className="rounded-2xl border border-border bg-card p-5 shadow-card-soft">
                  <div className="mb-4 flex flex-wrap items-start justify-between gap-4 border-b border-border pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-display text-lg font-bold">ID: {o.id.substring(0, 8).toUpperCase()}</span>
                        <StatusBadge status={o.status} />
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {new Date(o.created_at).toLocaleDateString("id-ID", { dateStyle: "full" })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Total Tagihan</p>
                      <p className="font-display text-xl font-bold text-primary">{formatIDR(o.total_price)}</p>
                    </div>
                  </div>

                  <div className="mb-4 text-sm">
                    <p><span className="font-semibold">Tujuan:</span> {o.mountain_name}</p>
                    <p><span className="font-semibold">Durasi:</span> {o.days} hari</p>
                    <p className="mt-1"><span className="font-semibold text-destructive">Batas Pengembalian:</span> {new Date(new Date(o.created_at).getTime() + (o.days * 24 * 60 * 60 * 1000)).toLocaleDateString("id-ID", { dateStyle: "full" })}</p>
                    <div className="mt-2 text-xs text-muted-foreground">
                      <p className="font-semibold text-foreground">Alat disewa:</p>
                      <ul className="list-inside list-disc">
                        {o.items?.map((item: any) => (
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
                  </div>

                  {o.status === "pending" && (
                    <div className="rounded-xl bg-secondary/50 p-4">
                      {o.payment_proof_url ? (
                        <div className="flex items-center gap-2 text-sm font-semibold text-green-600">
                          <CheckCircle2 className="h-5 w-5" /> Bukti transfer sedang diverifikasi admin.
                        </div>
                      ) : (
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                          <div className="text-sm">
                            <p className="font-semibold">Menunggu Pembayaran</p>
                            <p className="text-muted-foreground">Silakan transfer ke BCA 1234567890 a.n Campcer</p>
                          </div>
                          <label className="flex cursor-pointer items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-smooth hover:bg-primary/90">
                            <Upload className="h-4 w-4" /> Upload Bukti
                            <input
                              type="file" accept="image/*" className="hidden"
                              onChange={(e) => {
                                if (e.target.files?.[0]) handleUploadPayment(o.id, e.target.files[0]);
                              }}
                            />
                          </label>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {tab === "profile" && (
          <div className="rounded-2xl border border-border bg-card p-6 shadow-card-soft max-w-lg">
            <h2 className="mb-4 font-display text-xl font-bold">Edit Profil</h2>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-semibold">Email</label>
                <input disabled value={user.email} className="w-full rounded-xl border border-input bg-secondary/50 px-4 py-3 text-sm" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold">Nama Lengkap</label>
                <input value={pForm.full_name} onChange={(e) => setPForm({ ...pForm, full_name: e.target.value })} required className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold">Nomor HP</label>
                <input type="tel" value={pForm.phone} onChange={(e) => setPForm({ ...pForm, phone: e.target.value })} required className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold">Password Baru <span className="text-xs font-normal text-muted-foreground">(opsional)</span></label>
                <input type="password" value={pForm.password} onChange={(e) => setPForm({ ...pForm, password: e.target.value })} className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20" placeholder="Kosongkan jika tidak ingin mengubah" />
              </div>
              <button type="submit" className="w-full rounded-xl bg-primary py-3 font-semibold text-primary-foreground hover:bg-primary/90">
                Simpan Perubahan
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
