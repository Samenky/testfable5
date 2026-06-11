"use client";

import dynamic from "next/dynamic";

const Scene = dynamic(() => import("./Scene"), {
  ssr: false,
  loading: () => <div className="fixed inset-0 z-0 bg-midnight" />,
});

export default function SceneMount() {
  return <Scene />;
}
