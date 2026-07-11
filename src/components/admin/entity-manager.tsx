"use client";

import { useState, useTransition } from "react";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Label } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Table, Th, Td, EmptyRow } from "@/components/admin/admin-ui";
import { formatBDT } from "@/lib/format";

export interface FieldDef {
  name: string;
  label: string;
  type?: "text" | "textarea" | "number" | "select" | "checkbox" | "color";
  options?: { value: string; label: string }[];
  required?: boolean;
  placeholder?: string;
  defaultValue?: string;
}

/** Serializable column formats — no functions across the RSC → client boundary. */
export type ColumnFormat =
  | "text"
  | "mono"
  | "currency"
  | "badge-active"
  | "badge-hidden"
  | "badge-featured"
  | "badge-published"
  | "badge-status"
  | "family-swatch"
  | "promo-value"
  | "promo-used";

export interface ColumnDef {
  key: string;
  label: string;
  format?: ColumnFormat;
}

function Cell({
  item,
  column,
}: {
  item: Record<string, unknown>;
  column: ColumnDef;
}) {
  const value = item[column.key];
  switch (column.format ?? "text") {
    case "mono":
      return <span className="font-mono text-ivory">{String(value ?? "—")}</span>;
    case "currency":
      return <>{formatBDT(Number(value ?? 0))}</>;
    case "badge-active":
      return value ? (
        <Badge variant="emerald">Active</Badge>
      ) : (
        <Badge variant="muted">Inactive</Badge>
      );
    case "badge-hidden":
      return value ? (
        <Badge variant="emerald">Active</Badge>
      ) : (
        <Badge variant="muted">Hidden</Badge>
      );
    case "badge-featured":
      return value ? <Badge variant="gold">Featured</Badge> : <>—</>;
    case "badge-published":
      return value ? (
        <Badge variant="emerald">Published</Badge>
      ) : (
        <Badge variant="muted">Draft</Badge>
      );
    case "badge-status": {
      const status = String(value ?? "");
      return status === "active" ? (
        <Badge variant="emerald">Active</Badge>
      ) : (
        <Badge variant="muted">{status || "—"}</Badge>
      );
    }
    case "family-swatch":
      return (
        <span className="flex items-center gap-2">
          <span
            className="h-3 w-3 rounded-full"
            style={{ backgroundColor: String(item.accent_color ?? "#888") }}
          />
          {String(item.name ?? "—")}
        </span>
      );
    case "promo-value": {
      const type = String(item.type ?? "");
      const amount = Number(item.value ?? 0);
      if (type === "percent") return <>{amount}%</>;
      if (type === "fixed") return <>{formatBDT(amount)}</>;
      return <>Free Shipping</>;
    }
    case "promo-used": {
      const used = Number(item.used_count ?? 0);
      const limit = item.usage_limit;
      return (
        <>
          {used}
          {limit != null && limit !== "" ? `/${limit}` : ""}
        </>
      );
    }
    default:
      return <>{value == null || value === "" ? "—" : String(value)}</>;
  }
}

export function EntityManager<T extends { id: string }>({
  title,
  singular,
  items,
  columns,
  fields,
  saveAction,
  deleteAction,
}: {
  title: string;
  singular: string;
  items: T[];
  columns: ColumnDef[];
  fields: FieldDef[];
  saveAction: (fd: FormData) => Promise<{ ok: boolean; error?: string }>;
  deleteAction: (id: string) => Promise<{ ok: boolean; error?: string }>;
}) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<T | null>(null);
  const [pending, start] = useTransition();

  function openNew() {
    setEditing(null);
    setOpen(true);
  }
  function openEdit(item: T) {
    setEditing(item);
    setOpen(true);
  }

  async function onSubmit(fd: FormData) {
    if (editing) fd.set("id", editing.id);
    const res = await saveAction(fd);
    if (res.ok) {
      toast.success(`${singular} saved`);
      setOpen(false);
    } else toast.error(res.error ?? "Could not save.");
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl text-ivory">{title}</h1>
        <Button onClick={openNew} size="sm">
          <Plus size={14} /> Add {singular}
        </Button>
      </div>

      <Table>
        <thead>
          <tr>
            {columns.map((c) => (
              <Th key={c.key}>{c.label}</Th>
            ))}
            <Th className="text-right">Actions</Th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <EmptyRow colSpan={columns.length + 1} label={`No ${title.toLowerCase()} yet.`} />
          ) : (
            items.map((item) => (
              <tr key={item.id}>
                {columns.map((c) => (
                  <Td key={c.key}>
                    <Cell item={item as unknown as Record<string, unknown>} column={c} />
                  </Td>
                ))}
                <Td className="text-right">
                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => openEdit(item)}
                      className="text-muted hover:text-gold"
                      aria-label="Edit"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      onClick={() => {
                        if (
                          !confirm(
                            `Delete this ${singular.toLowerCase()}? This cannot be undone.`,
                          )
                        )
                          return;
                        start(async () => {
                          const res = await deleteAction(item.id);
                          if (res.ok) toast.success(`${singular} deleted`);
                          else toast.error(res.error ?? "Could not delete.");
                        });
                      }}
                      disabled={pending}
                      className="text-muted hover:text-rose"
                      aria-label="Delete"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </Td>
              </tr>
            ))
          )}
        </tbody>
      </Table>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogTitle className="font-display text-2xl text-ivory">
            {editing ? `Edit ${singular}` : `Add ${singular}`}
          </DialogTitle>
          <form action={onSubmit} className="mt-5 space-y-4">
            {fields.map((f) => {
              const current =
                editing != null
                  ? (editing as Record<string, unknown>)[f.name]
                  : f.defaultValue;
              return (
                <div key={f.name}>
                  {f.type !== "checkbox" && (
                    <Label htmlFor={f.name}>{f.label}</Label>
                  )}
                  {f.type === "textarea" ? (
                    <Textarea
                      id={f.name}
                      name={f.name}
                      defaultValue={String(current ?? "")}
                      placeholder={f.placeholder}
                    />
                  ) : f.type === "select" ? (
                    <select
                      id={f.name}
                      name={f.name}
                      defaultValue={String(current ?? "")}
                      className="h-11 w-full border border-line-strong bg-onyx-soft px-3 text-sm text-ivory focus:border-gold focus:outline-none"
                    >
                      {f.options?.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  ) : f.type === "checkbox" ? (
                    <label className="flex items-center gap-2 text-sm text-ivory-dim">
                      <input
                        type="checkbox"
                        name={f.name}
                        defaultChecked={!!current}
                        className="accent-[var(--gold)]"
                      />
                      {f.label}
                    </label>
                  ) : (
                    <Input
                      id={f.name}
                      name={f.name}
                      type={
                        f.type === "number"
                          ? "number"
                          : f.type === "color"
                            ? "text"
                            : "text"
                      }
                      defaultValue={String(current ?? "")}
                      placeholder={f.placeholder}
                      required={f.required}
                    />
                  )}
                </div>
              );
            })}
            <Button type="submit" className="w-full" disabled={pending}>
              {pending && <Loader2 size={15} className="animate-spin" />}
              Save {singular}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
