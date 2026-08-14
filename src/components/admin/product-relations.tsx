"use client";

import { AdminMultiSelect } from "@/components/admin/admin-multi-select";
import type { CatalogPick } from "@/types";

export function ProductMultiSelect({
  label,
  hint,
  catalog,
  selectedIds,
  onChange,
}: {
  label: string;
  hint: string;
  catalog: CatalogPick[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}) {
  return (
    <AdminMultiSelect
      label={label}
      hint={hint}
      items={catalog.map((p) => ({
        id: p.id,
        name: p.name,
        hint: p.brandName ?? undefined,
      }))}
      selectedIds={selectedIds}
      onChange={onChange}
      emptyLabel="No other perfumes in the catalog yet"
      placeholder="Select perfumes…"
      searchPlaceholder="Search catalog…"
    />
  );
}
