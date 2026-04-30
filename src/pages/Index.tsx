import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { TripPlanner } from "@/components/TripPlanner";
import { HowItWorks } from "@/components/HowItWorks";
import { Catalog } from "@/components/Catalog";
import { MountainsList } from "@/components/MountainsList";
import { Footer } from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <Hero />
        <TripPlanner />
        <HowItWorks />
        <Catalog />
        <MountainsList />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
