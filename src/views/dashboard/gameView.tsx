import {
  AlertCircleIcon,
  DownloadCloudIcon,
  PackageIcon,
  RefreshCwIcon,
  SettingsIcon,
  XCircleIcon,
} from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/primitives/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/primitives/card";
import type { GameIcon, GameMetadata } from "@/generated/types";
import { cn } from "@/lib/styleUtils";

function StatPill({
  label,
  value,
  variant,
}: {
  label: string;
  value: string;
  variant?: "default" | "ok" | "warn";
}) {
  return (
    <div
      className={cn(
        "flex flex-col justify-between rounded-md border border-border/40 bg-muted/30 p-3",
        variant === "ok" && "border-green-600/40 bg-green-600/10",
        variant === "warn" && "border-amber-600/40 bg-amber-600/10",
      )}
    >
      <span className="font-medium text-[10px] text-muted-foreground uppercase tracking-wide">
        {label}
      </span>
      <span className="mt-1 font-semibold text-lg tabular-nums">{value}</span>
    </div>
  );
}

const installedModsError = undefined;
// "This version of lib-vmm doesn't support loading mods";

const installedMods = [
  {
    id: "mod1",
    thumbnail: "test",
    name: "Mod 1",
    version: "1.0",
    summary: {
      short_description: "I am a test mod!",
    },
    description: "b",
  },
  {
    id: "mod2",
    thumbnail: "test",
    name: "mod2",
    version: "1.0",
    summary: {
      short_description: "I am another test mod!",
    },
    description: "b",
  },
  {
    id: "mod3",
    thumbnail: "test",
    name: "mod3",
    version: "1.0",
    summary: {
      short_description: "They'll never guess what I am",
    },
    description: "b",
  },
];

function ModsArea() {
  return (
    <Card className="max-h-fit min-h-[300px] flex-1">
      <CardHeader className="border-b">
        <CardTitle className="flex items-center gap-2 text-base">
          <PackageIcon h-4 w-4 />
          Installed mods
        </CardTitle>
        <CardAction>
          <Button size={"sm"} variant={"outline"}>
            <RefreshCwIcon /> Refresh
          </Button>
        </CardAction>
        <CardDescription className="text-xs">
          Showing mods detected as installed for:{" "}
          <span className="font-medium">Display name</span>
          {/*LOADING STATE*/}
        </CardDescription>
      </CardHeader>
      <CardContent className="h-full w-full pt-4">
        {installedModsError && (
          <div className="mb-4 flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-destructive">
            <div className="flex-1 text-xs">
              Failed to load installed mods:
              <br />
              <code className="font-mono">{installedModsError}</code>
            </div>
          </div>
        )}
        {installedMods.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-border/30 bg-muted/20 p-8 text-center">
            <PackageIcon className="h-8 w-8 text-muted-foreground" />
            <p className="font-medium text-sm">No mods detected</p>
            <p className="max-w-xs text-muted-foreground text-xs">
              Either you have not installed any mods yet or your provider
              doesn't support it.
            </p>
          </div>
        )}
        {installedMods.length > 0 && (
          <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {installedMods.map((mod) => (
              <li
                key={mod.id}
                className="group flex items-center gap-3 overflow-hidden rounded-md border border-border/40 bg-card/60 p-2 transition hover:border-border/70"
              >
                <div className="relative h-10 w-16 min-w-16 overflow-hidden rounded bg-muted/30">
                  <Image
                    src={mod.thumbnail}
                    alt={mod.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="64px"
                  />
                  <span className="absolute bottom-1 left-1 rounded bg-background/80 px-1 py-0.5 font-medium text-[9px] tracking-wide">
                    v{mod.version || "?"}
                  </span>
                </div>
                <div className="flex min-w-0 flex-1 flex-col">
                  <h3 className="line-clamp-1 font-semibold text-xs">
                    {mod.name}
                  </h3>
                  <p className="line-clamp-1 text-[11px] text-muted-foreground">
                    {mod.summary.short_description}
                  </p>
                </div>
                <div className="ml-2 flex flex-col gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7"
                    // onClick={() => uninstallMod(mod.id)}
                  >
                    <XCircleIcon className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-7 w-7">
                    <SettingsIcon className="h-4 w-4" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
      <CardFooter className="mt-4 border-t">
        <p className="text-[11px] text-muted-foreground">
          Shown view: Mods (3)
        </p>
      </CardFooter>
    </Card>
  );
}

const activeDownloads = [];
const finishedDownloads = [];

function GameHeader(metadata: GameMetadata) {
  return (
    <Card className="relative overflow-hidden">
      <CardHeader className="border-b">
        <div className="flex items-center gap-4">
          <div className="relative h-14 w-14 overflow-hidden rounded-md border border-border/40 bg-muted">
            <Image
              src={metadata.icon.Path}
              alt={`${metadata.display_name}'s icon`}
              fill
              className="object-cover"
              sizes="56px"
            />
          </div>
          <div className="flex flex-col">
            <CardTitle>{metadata.display_name}</CardTitle>
            <CardDescription className="font-mono text-xs uppercase tracking-wide">
              ID: {metadata.id} {"///"} Source:{" "}
              {typeof metadata.provider_source === "string"
                ? metadata.provider_source
                : "Plugin"}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <StatPill label="Installed mods" value="0" />
          <StatPill label="Active Downloads" value="0" />
          <StatPill label="Alerts" value="0" />
        </div>
      </CardContent>
      <CardFooter className="mt-4 border-t">
        <p className="text-[11px] text-muted-foreground">
          Dashboard overview for current game context.
        </p>
      </CardFooter>
    </Card>
  );
}

function DownloadsArea() {
  return (
    <Card className="max-h-fit min-h-[300px] flex-1">
      <CardHeader className="border-b">
        <CardTitle className="flex items-center gap-2 text-base">
          <DownloadCloudIcon />
          Recent Downloads
        </CardTitle>
        <CardDescription className="text-xs">
          Active & last finished downloads (This session only).
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        {activeDownloads.length === 0 && finishedDownloads.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center gap-2 rounded-md border border-border/40 border-dashed bg-muted/20 p-8 text-center">
            <DownloadCloudIcon className="h-8 w-8 text-muted-foreground" />
            <p className="font-medium text-sm">No downloads yet</p>
            <p className="max-w-xs text-muted-foreground text-xs">
              Start a mod install from the Discover page to see progress appear
              here
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

const alerts = [
  "Provider error | core:PAYDAY_2 experienced an unhandled error and was disabled.",
  "An update for the plugin 'MoreProviders' is avalible!",
  "News from provider: New mods avalible for christmas, check them out from the Discover page!",
];

function AlertsArea() {
  return (
    <Card className="max-h-fit min-h-[220px] w-fit lg:w-96">
      <CardHeader className="border-b">
        <CardTitle className="flex items-center gap-2 text-base">
          <AlertCircleIcon />
          Alerts & Messages
        </CardTitle>
        <CardDescription className="text-xs">
          System messages, warnings, and recent notices.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        {alerts.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-2 rounded-md border border-border/40 border-dashed bg-muted/20 p-6 text-center">
            <AlertCircleIcon className="h-8 w-8 text-muted-foreground" />
            <p className="font-medium text-sm">All good!</p>
            <p className="max-w-xs text-muted-foreground text-xs">
              No alerts. Actions & errors will appear here!
            </p>
          </div>
        )}
        {alerts.length > 0 && (
          <ul className="space-y-2">
            {alerts
              .slice()
              .reverse()
              .map((msg) => (
                <li
                  key={msg}
                  className="flex items-start gap-2 rounded-md border border-border/40 bg-muted/30 p-2"
                >
                  <span className="text-[11px] leading-relaxed">{msg}</span>
                </li>
              ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

const icon: GameIcon = {
  Path: "a",
};
function GameView() {
  return (
    <div className="flex h-full flex-col gap-6">
      <div className="mt-2">
        <GameHeader
          short_name="Short name"
          display_name="Display name"
          icon={icon}
          id="GAME_ID"
          provider_source={"Core"}
        />
      </div>
      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="flex flex-1 flex-col gap-6 lg:flex-row">
          <div className="flex flex-1 flex-col gap-6">
            <ModsArea />
            <DownloadsArea />
          </div>
          <div className="w-full lg:w-96">
            <AlertsArea />
          </div>
        </div>
      </div>
    </div>
  );
}

export default GameView;
