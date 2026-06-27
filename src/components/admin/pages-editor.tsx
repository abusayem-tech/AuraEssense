"use client";

import { useState, useTransition } from "react";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/admin/admin-ui";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Label } from "@/components/ui/input";
import { savePage } from "@/lib/actions/admin/content";

interface Page {
  slug: string;
  title: string;
  body: string;
}

export function PagesEditor({ pages }: { pages: Page[] }) {
  return (
    <div className="space-y-6">
      {pages.map((p) => (
        <PageCard key={p.slug} page={p} />
      ))}
    </div>
  );
}

function PageCard({ page }: { page: Page }) {
  const [title, setTitle] = useState(page.title);
  const [body, setBody] = useState(page.body);
  const [pending, start] = useTransition();

  return (
    <Card>
      <p className="mb-3 text-[0.6rem] uppercase tracking-widest text-gold">/{page.slug}</p>
      <Label htmlFor={`title-${page.slug}`}>Title</Label>
      <Input id={`title-${page.slug}`} value={title} onChange={(e) => setTitle(e.target.value)} />
      <Label htmlFor={`body-${page.slug}`} className="mt-4">Body</Label>
      <Textarea
        id={`body-${page.slug}`}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        className="min-h-40"
      />
      <Button
        className="mt-4"
        disabled={pending}
        onClick={() => start(async () => { await savePage(page.slug, title, body); toast.success("Page saved"); })}
      >
        {pending ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
        Save Page
      </Button>
    </Card>
  );
}
