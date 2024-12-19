"use client";

import dynamic from "next/dynamic";

export default function Home() {
  const GraphCanvas = dynamic(() => import("@/components/graph-canvas"), { ssr: false });

  return (
    <main className="h-svh grid place-items-center text-[#80002a]">
      <h1 className="text-4xl font-bold">Graph Visualization</h1>
      <GraphCanvas />
    </main>
  );
}
