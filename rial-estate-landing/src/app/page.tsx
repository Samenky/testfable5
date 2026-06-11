import SceneMount from "@/components/scene3d/SceneMount";
import Hero from "@/components/sections/Hero";
import Problem from "@/components/sections/Problem";
import Solution from "@/components/sections/Solution";
import Territory from "@/components/sections/Territory";
import FinalCTA from "@/components/sections/FinalCTA";

export default function Home() {
  return (
    <>
      <SceneMount />
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
