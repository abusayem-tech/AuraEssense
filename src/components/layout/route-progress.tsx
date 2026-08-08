"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";

const START_EVENT = "route-progress:start";

type ProgressState = {
  active: boolean;
  visible: boolean;
  progress: number;
};

let state: ProgressState = { active: false, visible: false, progress: 0 };
const listeners = new Set<() => void>();
let showDelay: ReturnType<typeof setTimeout> | null = null;
let trickle: ReturnType<typeof setInterval> | null = null;
let hideTimer: ReturnType<typeof setTimeout> | null = null;
let watchTimer: ReturnType<typeof setInterval> | null = null;
let lastRouteKey = "";
let targetKey: string | null = null;

function emit() {
  listeners.forEach((l) => l());
}

function setState(patch: Partial<ProgressState>) {
  state = { ...state, ...patch };
  emit();
}

function clearTimers() {
  if (showDelay) clearTimeout(showDelay);
  if (trickle) clearInterval(trickle);
  if (hideTimer) clearTimeout(hideTimer);
  if (watchTimer) clearInterval(watchTimer);
  showDelay = null;
  trickle = null;
  hideTimer = null;
  watchTimer = null;
}

function routeKey(url: { pathname: string; search: string }) {
  return `${url.pathname}${url.search}`;
}

function currentKey() {
  return routeKey(window.location);
}

function begin(nextTarget?: string | null) {
  if (state.active) return;
  clearTimers();
  targetKey = nextTarget ?? null;
  setState({ active: true, visible: true, progress: 12 });
  trickle = setInterval(() => {
    setState({
      progress:
        state.progress >= 92
          ? state.progress
          : state.progress + (92 - state.progress) * 0.1,
    });
  }, 180);

  // Catch search-param-only navigations without remounting via useSearchParams.
  watchTimer = setInterval(() => {
    if (!state.active) return;
    const key = currentKey();
    if (targetKey && key === targetKey) {
      lastRouteKey = key;
      finish();
      return;
    }
    if (!targetKey && key !== lastRouteKey && lastRouteKey) {
      lastRouteKey = key;
      finish();
    }
  }, 80);
}

function finish() {
  if (!state.active && !state.visible) return;
  clearTimers();
  targetKey = null;
  setState({ active: false, progress: 100, visible: true });
  hideTimer = setTimeout(() => {
    setState({ visible: false, progress: 0 });
    hideTimer = null;
  }, 320);
}

/**
 * Manually trigger the top progress bar. Use this right before a programmatic
 * navigation (e.g. router.push) so the user gets immediate feedback.
 */
export function startRouteProgress() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(START_EVENT));
  }
}

function isModifiedEvent(e: MouseEvent) {
  return e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot() {
  return state;
}

function getServerSnapshot(): ProgressState {
  return { active: false, visible: false, progress: 0 };
}

export function RouteProgress() {
  const pathname = usePathname();
  const snap = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [, bump] = useState(0);

  useEffect(() => subscribe(() => bump((n) => n + 1)), []);

  useEffect(() => {
    lastRouteKey = currentKey();

    function onStart() {
      begin(null);
    }

    function onClick(e: MouseEvent) {
      if (e.defaultPrevented || isModifiedEvent(e)) return;
      const anchor = (e.target as HTMLElement | null)?.closest("a");
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#")) return;
      const target = anchor.getAttribute("target");
      if (target && target !== "_self") return;
      if (anchor.hasAttribute("download")) return;

      let url: URL;
      try {
        url = new URL(anchor.href, window.location.href);
      } catch {
        return;
      }
      if (url.origin !== window.location.origin) return;
      if (
        url.pathname === window.location.pathname &&
        url.search === window.location.search
      ) {
        return;
      }
      begin(routeKey(url));
    }

    document.addEventListener("click", onClick, { capture: true });
    window.addEventListener(START_EVENT, onStart);
    return () => {
      document.removeEventListener("click", onClick, { capture: true });
      window.removeEventListener(START_EVENT, onStart);
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const key = currentKey();
    if (!lastRouteKey) {
      lastRouteKey = key;
      return;
    }
    if (key === lastRouteKey) return;
    lastRouteKey = key;
    finish();
  }, [pathname]);

  return (
    <>
      <div
        aria-hidden
        className="pointer-events-none fixed inset-x-0 top-0 z-[100] h-[3px]"
        style={{ opacity: snap.visible ? 1 : 0, transition: "opacity 180ms ease" }}
      >
        <div
          className="h-full bg-gold shadow-[0_0_12px_rgba(200,169,106,0.55)]"
          style={{
            width: `${snap.progress}%`,
            transition: "width 200ms ease",
          }}
        />
      </div>
      {snap.active && (
        <div
          aria-hidden
          className="pointer-events-none fixed inset-0 z-[90] bg-[var(--photo-ink)]/10"
        />
      )}
    </>
  );
}
