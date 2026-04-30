import { Mountain, Tent, Backpack, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

export const Navbar = () => (
  <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-md">
    <div className="container mx-auto flex h-16 items-center justify-between px-4">
      <Link to="/" className="flex items-center gap-2 font-display text-xl font-bold text-primary">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-forest text-primary-foreground shadow-elegant">
          <Tent className="h-5 w-5" />
        </span>
        CAMPCER
      </Link>
      <nav className="hidden items-center gap-8 text-sm font-medium md:flex">
        <a href="#planner" className="text-foreground/70 transition-smooth hover:text-primary">Trip Planner</a>
        <a href="#catalog" className="text-foreground/70 transition-smooth hover:text-primary">Katalog Alat</a>
        <a href="#how" className="text-foreground/70 transition-smooth hover:text-primary">Cara Kerja</a>
        <a href="#mountains" className="text-foreground/70 transition-smooth hover:text-primary">Gunung</a>
      </nav>
      <a
        href="#planner"
        className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-elegant transition-smooth hover:bg-primary/90"
      >
        <Sparkles className="h-4 w-4" /> Mulai
      </a>
    </div>
  </header>
);
