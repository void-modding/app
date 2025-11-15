import { createTauRPCProxy } from "@/generated/types";

let _proxy: ReturnType<typeof createTauRPCProxy> | null = null;

/**
 * Get's a TauRPC proxy client
 * @returns (lazy init) the TauRPC proxy
 * @throws Error, if called and the window is undefined.
 */
export function getTauRCP() {
  if (typeof window === "undefined") {
    throw new Error("TauRPC must be used in a browser/Tauri context.");
  }
  if (_proxy == null) {
    _proxy = createTauRPCProxy();
  }
  return _proxy;
}
