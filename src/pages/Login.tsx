import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, Link } from "react-router-dom";
import { Tent, LogIn, UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignup, setIsSignup] = useState(false);
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isSignup) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName } },
        });
        if (error) throw error;
        toast({ title: "Akun berhasil dibuat!", description: "Silahkan login." });
        setIsSignup(false);
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate("/");
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-soft px-4">
      <div className="w-full max-w-md">
        <Link to="/" className="mb-8 flex items-center justify-center gap-2 font-display text-2xl font-bold text-primary">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-forest text-primary-foreground shadow-elegant">
            <Tent className="h-5 w-5" />
          </span>
          CAMPCER
        </Link>

        <div className="rounded-3xl border border-border bg-card p-8 shadow-card-soft">
          <h1 className="mb-6 text-center font-display text-2xl font-bold text-foreground">
            {isSignup ? "Daftar Akun Baru" : "Masuk ke Akun"}
          </h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignup && (
              <div>
                <label className="mb-1 block text-sm font-semibold text-foreground">Nama Lengkap</label>
                <input
                  type="text" value={fullName} onChange={(e) => setFullName(e.target.value)}
                  required className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  placeholder="Nama lengkap"
                />
              </div>
            )}
            <div>
              <label className="mb-1 block text-sm font-semibold text-foreground">Email</label>
              <input
                type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                required className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                placeholder="email@contoh.com"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-foreground">Password</label>
              <input
                type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                required minLength={6} className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                placeholder="Minimal 6 karakter"
              />
            </div>
            <button
              type="submit" disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground shadow-elegant transition-smooth hover:bg-primary/90 disabled:opacity-50"
            >
              {isSignup ? <UserPlus className="h-4 w-4" /> : <LogIn className="h-4 w-4" />}
              {loading ? "Memproses..." : isSignup ? "Daftar" : "Masuk"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {isSignup ? "Sudah punya akun?" : "Belum punya akun?"}{" "}
            <button onClick={() => setIsSignup(!isSignup)} className="font-semibold text-primary hover:underline">
              {isSignup ? "Masuk" : "Daftar"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
