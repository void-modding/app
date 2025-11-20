import { RocketIcon } from "lucide-react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/primitives/card";

function NoGameView() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-8">
      <div className="rounded-2xl border border-border/40 bg-muted/30 p-10 text-center shadow-lg">
        <RocketIcon className="mx-auto mb-6 h-16 w-16 text-muted-foreground" />
        <h2 className="mb-3 font-semibold text-2xl">
          Select a game to get started
        </h2>
        <p className="mx-auto max-w-lg text-muted-foreground">
          Use the game selector in the sidebar to choose which game you want to
          manage. Once selected, this dashboard will show you mods, downloads
          and other alerts.
        </p>
      </div>
      <div className="flex gap-4">
        <Card className="w-72 border-dashed bg-background/40">
          <CardHeader>
            <CardTitle className="text-sm">
              Why do I need to pick a game?
            </CardTitle>
            <CardDescription className="text-xs leading-relaxed">
              We need a context to query discovery results, installed mods and
              apply actions like installing, updating or removing mods.
            </CardDescription>
          </CardHeader>
        </Card>
        <Card className="w-72 border-dashed bg-background/40">
          <CardHeader>
            <CardTitle className="text-sm">
              Why is my game not listed?
            </CardTitle>
            <CardDescription className="text-xs leading-relaxed">
              Providers can be added via plugins in the future. For now only
              bundled providers are available.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}

export default NoGameView;
