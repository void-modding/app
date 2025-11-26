"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/primitives/button";
import type { FormSchema } from "@/generated/types";
import { getTauRPC } from "@/lib/taurpc/useTaurpc";
import { useViewManager } from "@/lib/viewSystem/useViewManager";
import { View } from "@/lib/viewSystem/View";

async function getCurrentGame(): Promise<string> {
  return "a";
}

export interface Mod {
  name: string;
}

async function fetchModsForGame(name: string): Promise<Mod[]> {
  await new Promise((r) => setTimeout(r, Math.random() * 150));
  if (Math.random() < 0.2) {
    throw new Error(`Failed to fetch mods for game: ${name}`);
  }
  const count = Math.floor(Math.random() * 10);
  return Array.from({ length: count }, () => ({
    name: `mod_${Math.random().toString(36).slice(2, 8)}`,
  }));
}

const VIEWS = ["modSelect", "missingMods", "loading"] as const;
type ViewName = (typeof VIEWS)[number];

export default function DebugPage() {
  const { showView, isActive } = useViewManager<ViewName>("loading", VIEWS);
  const [mods, setMods] = useState<Mod[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Debug tools
  const [keyResult, setKeyResult] = useState<string>("None");
  const [formResult, setFormResult] = useState<FormSchema | null>();

  function formToJson(form: FormSchema): string {
    try {
      return JSON.stringify(
        {
          title: form.title ?? "",
          description: form.description ?? "",
          fields: form.fields ?? [],
        },
        null,
        2,
      );
    } catch {
      return "Invalid form data";
    }
  }

  const loadMods = useCallback(async () => {
    // Kick into loading view immediately
    showView("loading");
    setError(null);

    let cancelled = false;
    try {
      const game = await getCurrentGame();
      const loadedMods = await fetchModsForGame(game);
      if (cancelled) return;

      if (loadedMods.length > 0) {
        setMods(loadedMods);
        showView("modSelect");
      } else {
        setMods([]);
        showView("missingMods");
      }
    } catch (err: unknown) {
      if (cancelled) return;
      const message =
        err instanceof Error ? err.message : "Unknown error fetching mods";
      setError(message);
      setMods(null);
      showView("missingMods");
    }

    return () => {
      cancelled = true;
    };
  }, [showView]);

  useEffect(() => {
    // Initial load
    void loadMods();
  }, [loadMods]);

  const retry = useCallback(() => {
    void loadMods();
  }, [loadMods]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <header className="mb-6">
        <h1 className="font-semibold text-2xl tracking-tight">Debug Page</h1>
        <p className="text-muted-foreground text-sm">Why are you even here?</p>
      </header>

      {/* Toolbar */}
      <div className="mb-6 flex flex-wrap gap-2">
        <Button
          variant="secondary"
          onClick={() => {
            (async () => {
              const rpc = getTauRPC();
              await rpc.download_mod("1");
            })();
          }}
        >
          Download mod
        </Button>

        <Button
          variant="secondary"
          onClick={() => {
            (async () => {
              const rpc = getTauRPC();
              const result = await rpc.capabilities.list_capabilities();
              setKeyResult(result.valueOf().toString());
            })();
          }}
        >
          Query API key capability
        </Button>

        <Button
          variant="secondary"
          onClick={() => {
            (async () => {
              const rpc = getTauRPC();
              const result = await rpc.capabilities.api_key_should_show();
              setFormResult(result);
            })();
          }}
        >
          Call form
        </Button>

        <Button onClick={retry}>Reload mods</Button>
      </div>

      {/* Debug results */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border bg-card p-3">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="font-medium text-sm">API Key Capability</h2>
          </div>
          <pre className="mt-2 max-h-40 overflow-auto rounded bg-muted p-2 text-xs">
            Result: {keyResult}
          </pre>
        </div>

        <div className="rounded-lg border bg-card p-3">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="font-medium text-sm">Form Result</h2>
          </div>
          <pre className="mt-2 max-h-40 overflow-auto rounded bg-muted p-2 text-xs">
            {formResult ? formToJson(formResult) : "None"}
          </pre>
        </div>
      </div>

      {/* View-managed content */}
      <section className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold text-lg">Mods (test for ViewSystem)</h2>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              onClick={() => showView("loading")}
              className="text-xs"
            >
              Show Loading
            </Button>
            <Button
              variant="ghost"
              onClick={() => showView("modSelect")}
              className="text-xs"
            >
              Show Mod Select
            </Button>
            <Button
              variant="ghost"
              onClick={() => showView("missingMods")}
              className="text-xs"
            >
              Show Missing Mods
            </Button>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-4">
          <View name="loading" isActive={isActive}>
            <div className="space-y-3">
              <p className="text-muted-foreground text-sm">Loading mods…</p>
              <div className="animate-pulse space-y-2">
                <div className="h-4 w-1/2 rounded bg-muted" />
                <div className="h-4 w-2/3 rounded bg-muted" />
                <div className="h-4 w-1/3 rounded bg-muted" />
              </div>
            </div>
          </View>

          <View name="modSelect" isActive={isActive}>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm">
                  {mods && mods.length > 0
                    ? `Found ${mods.length} mod${mods.length === 1 ? "" : "s"}`
                    : "No mods loaded."}
                </p>
                <Button size="sm" onClick={retry}>
                  Refresh
                </Button>
              </div>

              {mods && mods.length > 0 ? (
                <ul className="divide-y rounded border">
                  {mods.map((m) => (
                    <li
                      key={m.name}
                      className="flex items-center justify-between px-3 py-2 text-sm"
                    >
                      <span className="font-mono">{m.name}</span>
                      <Button variant="secondary" size="sm">
                        Inspect
                      </Button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="rounded border border-dashed p-4 text-center text-muted-foreground text-sm">
                  No mods loaded.
                </div>
              )}
            </div>
          </View>

          <View name="missingMods" isActive={isActive}>
            <div className="space-y-4">
              {error ? (
                <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3">
                  <p className="font-medium text-sm">Failed to load mods</p>
                  <pre className="mt-2 overflow-auto rounded bg-muted p-2 text-destructive text-xs">
                    {error}
                  </pre>
                  <div className="mt-3 flex gap-2">
                    <Button onClick={retry}>Try again</Button>
                    <Button
                      variant="secondary"
                      onClick={() => showView("loading")}
                    >
                      Show loading
                    </Button>
                  </div>
                </div>
              ) : mods?.length === 0 ? (
                <div className="rounded-md border border-yellow-200 bg-yellow-50 p-3">
                  <p className="text-sm">
                    No mods found for this game. You can retry or check sources.
                  </p>
                  <div className="mt-3">
                    <Button onClick={retry}>Retry</Button>
                  </div>
                </div>
              ) : (
                <div className="rounded-md border bg-muted p-3 text-sm">
                  Mods unavailable.
                </div>
              )}
            </div>
          </View>
        </div>
      </section>
    </div>
  );
}
