"use client";
import { useEffect, useState } from "react";
import { useViewManager } from "@/lib/viewSystem/useViewManager";
import { View } from "@/lib/viewSystem/View";
import GameView from "@/views/dashboard/gameView";
import NoGameView from "@/views/dashboard/nogame";

const VIEWS = ["nogame", "game"] as const;
type ViewName = (typeof VIEWS)[number];

const Home = () => {
  const { showView, isActive } = useViewManager<ViewName>("nogame", VIEWS);
  const [gameSelected, setGameSelected] = useState(true);

  useEffect(() => {
    const handleGameChanged = () => {
      setGameSelected(true);
    };

    showView("game");
    window.addEventListener("gameChanged", handleGameChanged);
    return () => window.removeEventListener("gameChanged", handleGameChanged);
  });

  return (
    <main className="flex h-full flex-col gap-6 pr-4 pl-4">
      <View name="nogame" isActive={isActive}>
        <NoGameView />
      </View>
      <View name="game" isActive={isActive}>
        <GameView />
      </View>
    </main>
  );
};

export default Home;
