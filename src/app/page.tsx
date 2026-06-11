import Hero from "@/components/sections/Hero";
import Problem from "@/components/sections/Problem";
import Demo from "@/components/sections/Demo";
import Particles from "@/components/sections/Particles";
import Pricing from "@/components/sections/Pricing";
import Faq from "@/components/sections/Faq";
import FinalCta from "@/components/sections/FinalCta";

export default function Home() {
  return (
    <main className="relative">
      <Hero />
      <Problem />
      <Demo />
      <Particles />
      <Pricing />
      <Faq />
      <FinalCta />
    </main>
  );
}
