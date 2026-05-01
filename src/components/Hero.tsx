import heroImg from "@/assets/hero-mountain.jpg";
import { ArrowRight, ShieldCheck } from "lucide-react";

export const Hero = () => (
  <section className="relative overflow-hidden">
    <div className="absolute inset-0">
      <img
        src={heroImg}
        alt="Pegunungan Indonesia berkabut saat matahari terbit"
        width={1920}
        height={1280}
        className="h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-hero" />
    </div>

    <div className="container relative mx-auto flex min-h-[88vh] flex-col justify-center px-4 py-24 text-primary-foreground">
      <div className="max-w-3xl">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-xs font-medium backdrop-blur-md">
          <ShieldCheck className="h-3.5 w-3.5" />
          Sewa cerdas. Pendakian aman.
        </div>
        <h1 className="font-display text-5xl font-extrabold leading-[1.05] sm:text-6xl lg:text-7xl">
          Sewa alat camping
          <br />
          <span className="text-accent">sesuai resiko</span> gunungmu.
        </h1>
        <p className="mt-6 max-w-xl text-lg text-white/85 sm:text-xl">
          CAMPCER menghitung resiko gunung tujuanmu, lalu menyarankan alat wajib yang harus disewa.
          Khusus untuk pendaki pemula yang ingin naik gunung dengan persiapan matang.
        </p>
        <div className="mt-10 flex flex-wrap gap-4">
          <a
            href="#planner"
            className="group inline-flex items-center gap-2 rounded-full bg-accent px-7 py-3.5 text-base font-semibold text-accent-foreground shadow-glow transition-smooth hover:scale-[1.02]"
          >
            Hitung Resiko Pendakian
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </a>
          <a
            href="#catalog"
            className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-7 py-3.5 text-base font-semibold backdrop-blur-md transition-smooth hover:bg-white/20"
          >
            Lihat Katalog
          </a>
        </div>

        <div className="mt-16 grid max-w-xl grid-cols-3 gap-6 text-left">
          <div>
            <div className="font-display text-3xl font-bold">12+</div>
            <div className="text-sm text-white/70">Gunung tercover</div>
          </div>
          <div>
            <div className="font-display text-3xl font-bold">100+</div>
            <div className="text-sm text-white/70">Alat tersedia</div>
          </div>
          <div>
            <div className="font-display text-3xl font-bold">100%</div>
            <div className="text-sm text-white/70">Rekomendasi otomatis</div>
          </div>
        </div>
      </div>
    </div>
  </section>
);
