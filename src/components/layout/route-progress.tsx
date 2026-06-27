"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

const START_EVENT = "route-progress:start";

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

export function RouteProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  // Timers kept in refs so they survive re-renders and can be cleared.
  const showDelay = useRef<ReturnType<typeof setTimeout> | null>(null);
  const trickle = useRef<ReturnType<typeof setInterval> | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const active = useRef(false);

  useEffect(() => {
    function clearTimers() {
      if (showDelay.current) clearTimeout(showDelay.current);
      if (trickle.current) clearInterval(trickle.current);
      if (hideTimer.current) clearTimeout(hideTimer.current);
    }

    function begin() {
      if (active.current) return;
      active.current = true;
      clearTimers();
      // Small delay avoids a flash on instant (prefetched) navigations.
      showDelay.current = setTimeout(() => {
        setVisible(true);
        setProgress(8);
        trickle.current = setInterval(() => {
          setProgress((p) => (p >= 90 ? p : p + (90 - p) * 0.12));
        }, 200);
      }, 90);
    }

    function start() {
      begin();
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
      // Same-page link (only hash/scroll changes) — no navigation feedback needed.
      if (
        url.pathname === window.location.pathname &&
        url.search === window.location.search
      ) {
        return;
      }
      begin();
    }

    document.addEventListener("click", onClick, { capture: true });
    window.addEventListener(START_EVENT, start);
    return () => {
      document.removeEventListener("click", onClick, { capture: true });
      window.removeEventListener(START_EVENT, start);
      clearTimers();
    };
  }, []);

  // When the route (path or query) actually changes, finish the bar.
  useEffect(() => {
    if (!active.current) return;
    if (showDelay.current) clearTimeout(showDelay.current);
    if (trickle.current) clearInterval(trickle.current);
    active.current = false;

    setProgress(100);
    setVisible(true);
    hideTimer.current = setTimeout(() => {
      setVisible(false);
      setProgress(0);
    }, 280);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, searchParams]);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-x-0 top-0 z-[100] h-[2px]"
      style={{ opacity: visible ? 1 : 0, transition: "opacity 200ms ease" }}
    >
      <div
        className="h-full bg-gold shadow-[0_0_8px_rgba(0,0,0,0.2)]"
        style={{
          width: `${progress}%`,
          transition: "width 200ms ease",
        }}
      />
    </div>
  );
}
