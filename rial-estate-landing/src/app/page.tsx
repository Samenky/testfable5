import SceneOrchestrator from "@/components/scene/SceneOrchestrator";
import Hero from "@/components/sections/Hero";
import Problem from "@/components/sections/Problem";
import Solution from "@/components/sections/Solution";
import Territory from "@/components/sections/Territory";
import FinalCTA from "@/components/sections/FinalCTA";

export default function Home() {
  return (
    <>
      <SceneOrchestrator />
      <main className="relative z-10">
        <Hero />
        <Problem />
        <Solution />
        <Territory />
        <FinalCTA />
      </main>
    </>
  );
}
