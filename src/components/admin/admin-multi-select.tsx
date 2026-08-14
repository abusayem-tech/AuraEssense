"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, X } from "lucide-react";
import { Label } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface AdminSelectItem {
  id: string;
  name: string;
  hint?: string;
}

export function AdminMultiSelect({
  label,
  hint,
  items,
  selectedIds,
  onChange,
  emptyLabel = "Nothing to choose yet",
  placeholder = "Select…",
  searchPlaceholder = "Search…",
}: {
  label: string;
  hint?: string;
  items: AdminSelectItem[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  emptyLabel?: string;
  placeholder?: string;
  searchPlaceholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const selected = useMemo(
    () =>
      selectedIds
        .map((id) => items.find((item) => item.id === id))
        .filter((item): item is AdminSelectItem => Boolean(item)),
    [items, selectedIds],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        (item.hint?.toLowerCase().includes(q) ?? false),
    );
  }, [items, query]);

  function toggle(id: string) {
    if (selectedIds.includes(id)) onChange(selectedIds.filter((x) => x !== id));
    else onChange([...selectedIds, id]);
  }

  return (
    <div ref={rootRef} className="relative">
      <Label>{label}</Label>
      {hint && <p className="-mt-1 mb-2 text-xs text-muted">{hint}</p>}
      {selected.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1.5">
          {selected.map((item) => (
            <span
              key={item.id}
              className="inline-flex items-center gap-1.5 border border-line bg-onyx px-2 py-1 text-xs text-ivory"
            >
              {item.name}
              <button
                type="button"
                onClick={() => toggle(item.id)}
                className="text-muted hover:text-rose"
                aria-label={`Remove ${item.name}`}
              >
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      )}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex h-11 w-full items-center justify-between border border-line-strong bg-onyx-soft px-3 text-sm text-ivory focus:border-gold focus:outline-none"
      >
        <span className={selected.length ? "text-ivory" : "text-muted"}>
          {items.length === 0
            ? emptyLabel
            : selected.length
              ? `${selected.length} selected`
              : placeholder}
        </span>
        <ChevronDown
          size={16}
          className={cn("text-muted transition-transform", open && "rotate-180")}
        />
      </button>
      {open && items.length > 0 && (
        <div className="absolute z-30 mt-1 w-full border border-line-strong bg-onyx-soft shadow-lg">
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={searchPlaceholder}
            className="h-10 w-full border-b border-line bg-transparent px-3 text-sm text-ivory placeholder:text-muted focus:outline-none"
          />
          <ul className="max-h-56 overflow-y-auto">
            {filtered.length === 0 ? (
              <li className="px-3 py-6 text-center text-xs text-muted">No matches.</li>
            ) : (
              filtered.map((item) => {
                const on = selectedIds.includes(item.id);
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => toggle(item.id)}
                      className={cn(
                        "flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left text-sm hover:bg-onyx-raised",
                        on && "text-gold",
                      )}
                    >
                      <span>
                        <span className="text-ivory">{item.name}</span>
                        {item.hint && (
                          <span className="ml-2 text-xs text-muted">{item.hint}</span>
                        )}
                      </span>
                      {on && <Check size={14} className="shrink-0 text-gold" />}
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
