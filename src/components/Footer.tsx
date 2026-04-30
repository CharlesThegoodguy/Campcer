import { Tent, Instagram, MessageCircle, Mail } from "lucide-react";

export const Footer = () => (
  <footer className="border-t border-border bg-card">
    <div className="container mx-auto px-4 py-14">
      <div className="grid gap-10 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2 font-display text-xl font-bold text-primary">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-forest text-primary-foreground">
              <Tent className="h-5 w-5" />
            </span>
            CAMPCER
          </div>
          <p className="mt-4 max-w-md text-sm text-muted-foreground">
            Penyewaan alat camping & trekking dengan sistem rekomendasi resiko pendakian.
            Dibuat untuk pendaki Indonesia, terutama pemula yang ingin naik gunung dengan aman.
          </p>
        </div>
        <div>
          <h4 className="mb-3 font-display text-sm font-bold">Menu</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><a href="#planner" className="hover:text-primary">Trip Planner</a></li>
            <li><a href="#catalog" className="hover:text-primary">Katalog Alat</a></li>
            <li><a href="#mountains" className="hover:text-primary">Daftar Gunung</a></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 font-display text-sm font-bold">Kontak</h4>
          <div className="flex gap-3">
            <a className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-secondary-foreground transition-smooth hover:bg-primary hover:text-primary-foreground" href="#"><Instagram className="h-4 w-4" /></a>
            <a className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-secondary-foreground transition-smooth hover:bg-primary hover:text-primary-foreground" href="#"><MessageCircle className="h-4 w-4" /></a>
            <a className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-secondary-foreground transition-smooth hover:bg-primary hover:text-primary-foreground" href="#"><Mail className="h-4 w-4" /></a>
          </div>
        </div>
      </div>
      <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row">
        <p>© {new Date().getFullYear()} CAMPCER. Mendaki dengan persiapan, pulang dengan cerita.</p>
        <p>Made with 🌲 for Indonesian climbers.</p>
      </div>
    </div>
  </footer>
);
