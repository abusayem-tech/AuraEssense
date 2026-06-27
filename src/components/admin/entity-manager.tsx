"use client";

import { useState, useTransition } from "react";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Label } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Table, Th, Td, EmptyRow } from "@/components/admin/admin-ui";

export interface FieldDef {
  name: string;
  label: string;
  type?: "text" | "textarea" | "number" | "select" | "checkbox" | "color";
  options?: { value: string; label: string }[];
  required?: boolean;
  placeholder?: string;
  defaultValue?: string;
}

export interface ColumnDef<T> {
  key: string;
  label: string;
  render?: (item: T) => React.ReactNode;
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
  columns: ColumnDef<T>[];
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
      <div className="mb-6 flex items-center justify-between">
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
                    {c.render
                      ? c.render(item)
                      : String((item as Record<string, unknown>)[c.key] ?? "—")}
                  </Td>
                ))}
                <Td className="text-right">
                  <div className="flex justify-end gap-3">
                    <button onClick={() => openEdit(item)} className="text-muted hover:text-gold" aria-label="Edit">
                      <Pencil size={15} />
                    </button>
                    <button
                      onClick={() =>
                        start(async () => {
                          const res = await deleteAction(item.id);
                          if (res.ok) toast.success(`${singular} deleted`);
                          else toast.error(res.error ?? "Could not delete.");
                        })
                      }
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
                  {f.type !== "checkbox" && <Label htmlFor={f.name}>{f.label}</Label>}
                  {f.type === "textarea" ? (
                    <Textarea id={f.name} name={f.name} defaultValue={String(current ?? "")} placeholder={f.placeholder} />
                  ) : f.type === "select" ? (
                    <select
                      id={f.name}
                      name={f.name}
                      defaultValue={String(current ?? "")}
                      className="h-11 w-full border border-line-strong bg-onyx-soft px-3 text-sm text-ivory focus:border-gold focus:outline-none"
                    >
                      {f.options?.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  ) : f.type === "checkbox" ? (
                    <label className="flex items-center gap-2 text-sm text-ivory-dim">
                      <input type="checkbox" name={f.name} defaultChecked={!!current} className="accent-[var(--gold)]" />
                      {f.label}
                    </label>
                  ) : (
                    <Input
                      id={f.name}
                      name={f.name}
                      type={f.type === "number" ? "number" : f.type === "color" ? "text" : "text"}
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
