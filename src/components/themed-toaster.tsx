"use client";

import { useTheme } from "next-themes";
import { Toaster } from "sonner";

export function ThemedToaster() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme !== "light";

  return (
    <Toaster
      position="bottom-right"
      theme={isDark ? "dark" : "light"}
      toastOptions={{
        style: {
          background: isDark ? "#18181b" : "#f6f3ec",
          border: isDark
            ? "1px solid rgba(245,241,233,0.12)"
            : "1px solid rgba(20,18,14,0.14)",
          color: isDark ? "#f5f1e9" : "#17171a",
          borderRadius: "2px",
        },
      }}
    />
  );
}
