import { Tent, Sparkles, LogIn, LogOut, Shield, User } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export const Navbar = () => {
  const { user, isAdmin, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 font-display text-xl font-bold text-primary">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-forest text-primary-foreground shadow-elegant">
            <Tent className="h-5 w-5" />
          </span>
          CAMPCER
        </Link>
        <nav className="hidden items-center gap-8 text-sm font-medium md:flex">
          <a href="/#planner" className="text-foreground/70 transition-smooth hover:text-primary">Trip Planner</a>
          <a href="/#catalog" className="text-foreground/70 transition-smooth hover:text-primary">Katalog Alat</a>
          <a href="/#how" className="text-foreground/70 transition-smooth hover:text-primary">Cara Kerja</a>
          <a href="/#mountains" className="text-foreground/70 transition-smooth hover:text-primary">Gunung</a>
        </nav>
        <div className="flex items-center gap-3">
          {user ? (
            <>
              {isAdmin && (
                <Link to="/admin" className="flex items-center gap-1.5 rounded-full bg-secondary px-3 py-2 text-xs font-semibold text-secondary-foreground hover:bg-secondary/80">
                  <Shield className="h-3.5 w-3.5" /> Admin
                </Link>
              )}
              <Link to="/dashboard" className="hidden items-center gap-1.5 rounded-full bg-secondary px-3 py-2 text-xs font-semibold text-secondary-foreground hover:bg-secondary/80 sm:flex">
                <User className="h-3.5 w-3.5" /> Profil & Pesanan
              </Link>
              <button
                onClick={signOut}
                className="flex items-center gap-1.5 rounded-full bg-secondary px-3 py-2 text-xs font-semibold text-secondary-foreground hover:bg-secondary/80"
              >
                <LogOut className="h-3.5 w-3.5" /> Keluar
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="flex items-center gap-1.5 rounded-full bg-secondary px-3 py-2 text-xs font-semibold text-secondary-foreground hover:bg-secondary/80"
              >
                <LogIn className="h-3.5 w-3.5" /> Masuk
              </Link>
              <a
                href="/#planner"
                className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-elegant transition-smooth hover:bg-primary/90"
              >
                <Sparkles className="h-4 w-4" /> Mulai
              </a>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
