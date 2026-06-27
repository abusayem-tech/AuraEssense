"use client";

import { useQueryState, useQueryStates, parseAsArrayOf, parseAsString, parseAsBoolean, parseAsInteger } from "nuqs";
import { SlidersHorizontal, X, Check } from "lucide-react";
import * as Accordion from "@radix-ui/react-accordion";
import { ChevronDown } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetClose } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { GENDERS, CONCENTRATIONS, SEASONS, OCCASIONS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { Brand, FragranceFamily } from "@/types";

const arr = parseAsArrayOf(parseAsString).withDefault([]).withOptions({ shallow: false, clearOnDefault: true });

function useArrayParam(key: string) {
  return useQueryState(key, arr);
}

function CheckRow({
  active,
  onToggle,
  label,
  swatch,
}: {
  active: boolean;
  onToggle: () => void;
  label: string;
  swatch?: string | null;
}) {
  return (
    <button
      onClick={onToggle}
      className="flex w-full items-center gap-3 py-1.5 text-left text-sm text-ivory-dim transition-colors hover:text-ivory"
    >
      <span
        className={cn(
          "flex h-4 w-4 shrink-0 items-center justify-center border transition-colors",
          active ? "border-gold bg-gold text-onyx" : "border-line-strong",
        )}
      >
        {active && <Check size={11} strokeWidth={3} />}
      </span>
      {swatch && (
        <span
          className="h-3 w-3 rounded-full border border-line"
          style={{ backgroundColor: swatch }}
        />
      )}
      <span className="capitalize">{label}</span>
    </button>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Accordion.Item value={title} className="border-b border-line">
      <Accordion.Header>
        <Accordion.Trigger className="group flex w-full items-center justify-between py-4 text-left">
          <span className="text-xs uppercase tracking-widest text-ivory">{title}</span>
          <ChevronDown size={15} className="text-muted transition-transform group-data-[state=open]:rotate-180" />
        </Accordion.Trigger>
      </Accordion.Header>
      <Accordion.Content className="overflow-hidden pb-4 data-[state=closed]:hidden">
        <div className="max-h-56 overflow-y-auto pr-1">{children}</div>
      </Accordion.Content>
    </Accordion.Item>
  );
}

function FiltersBody({
  brands,
  families,
  notes,
}: {
  brands: Brand[];
  families: FragranceFamily[];
  notes: string[];
}) {
  const [, setPage] = useQueryState("page", parseAsInteger);
  const [brand, setBrand] = useArrayParam("brand");
  const [family, setFamily] = useArrayParam("family");
  const [gender, setGender] = useArrayParam("gender");
  const [conc, setConc] = useArrayParam("concentration");
  const [season, setSeason] = useArrayParam("season");
  const [occasion, setOccasion] = useArrayParam("occasion");
  const [selNotes, setSelNotes] = useArrayParam("notes");

  function toggle(list: string[], setList: (v: string[]) => void, value: string) {
    setPage(null);
    setList(list.includes(value) ? list.filter((x) => x !== value) : [...list, value]);
  }

  return (
    <Accordion.Root type="multiple" defaultValue={["Family", "Gender", "Brand"]} className="px-1">
      <Group title="Family">
        {families.map((f) => (
          <CheckRow key={f.id} label={f.name} swatch={f.accent_color} active={family.includes(f.slug)} onToggle={() => toggle(family, setFamily, f.slug)} />
        ))}
      </Group>
      <Group title="Gender">
        {GENDERS.map((g) => (
          <CheckRow key={g} label={g} active={gender.includes(g)} onToggle={() => toggle(gender, setGender, g)} />
        ))}
      </Group>
      <Group title="Brand">
        {brands.map((b) => (
          <CheckRow key={b.id} label={b.name} active={brand.includes(b.slug)} onToggle={() => toggle(brand, setBrand, b.slug)} />
        ))}
      </Group>
      <Group title="Concentration">
        {CONCENTRATIONS.map((c) => (
          <CheckRow key={c} label={c} active={conc.includes(c)} onToggle={() => toggle(conc, setConc, c)} />
        ))}
      </Group>
      <Group title="Season">
        {SEASONS.map((s) => (
          <CheckRow key={s} label={s} active={season.includes(s)} onToggle={() => toggle(season, setSeason, s)} />
        ))}
      </Group>
      <Group title="Occasion">
        {OCCASIONS.map((o) => (
          <CheckRow key={o} label={o} active={occasion.includes(o)} onToggle={() => toggle(occasion, setOccasion, o)} />
        ))}
      </Group>
      <Group title="Notes">
        {notes.map((n) => (
          <CheckRow key={n} label={n} active={selNotes.includes(n)} onToggle={() => toggle(selNotes, setSelNotes, n)} />
        ))}
      </Group>
    </Accordion.Root>
  );
}

export function DesktopFilters(props: { brands: Brand[]; families: FragranceFamily[]; notes: string[] }) {
  return (
    <aside className="hidden w-64 shrink-0 lg:block">
      <FiltersBody {...props} />
    </aside>
  );
}

export function MobileFilters(props: { brands: Brand[]; families: FragranceFamily[]; notes: string[] }) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="lg:hidden">
          <SlidersHorizontal size={14} /> Filters
        </Button>
      </SheetTrigger>
      <SheetContent side="left" showClose={false}>
        <div className="flex items-center justify-between border-b border-line px-6 py-5">
          <SheetTitle className="font-display text-xl text-ivory">Filters</SheetTitle>
          <SheetClose className="text-muted hover:text-ivory"><X size={20} /></SheetClose>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-2">
          <FiltersBody {...props} />
        </div>
        <div className="border-t border-line p-4">
          <SheetClose asChild>
            <Button className="w-full">View Results</Button>
          </SheetClose>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export function SortSelect() {
  const [sort, setSort] = useQueryState("sort", parseAsString.withOptions({ shallow: false }));
  return (
    <select
      value={sort ?? "featured"}
      onChange={(e) => setSort(e.target.value === "featured" ? null : e.target.value)}
      className="h-9 border border-line-strong bg-onyx-soft px-3 text-xs uppercase tracking-widest text-ivory focus:border-gold focus:outline-none"
    >
      <option value="featured">Featured</option>
      <option value="newest">Newest</option>
      <option value="price-asc">Price: Low to High</option>
      <option value="price-desc">Price: High to Low</option>
      <option value="rating">Top Rated</option>
    </select>
  );
}

export function ActiveFilters() {
  const [state, setState] = useQueryStates(
    {
      brand: arr,
      family: arr,
      gender: arr,
      concentration: arr,
      season: arr,
      occasion: arr,
      notes: arr,
      samples: parseAsBoolean.withOptions({ shallow: false }),
    },
  );
  const chips: { key: keyof typeof state; value: string }[] = [];
  (Object.keys(state) as (keyof typeof state)[]).forEach((k) => {
    const v = state[k];
    if (Array.isArray(v)) v.forEach((val) => chips.push({ key: k, value: val }));
  });

  if (chips.length === 0) return null;

  return (
    <div className="mb-6 flex flex-wrap items-center gap-2">
      {chips.map((c) => (
        <button
          key={`${c.key}-${c.value}`}
          onClick={() =>
            setState({
              [c.key]: (state[c.key] as string[]).filter((x) => x !== c.value),
            })
          }
          className="flex items-center gap-1.5 border border-line-strong px-3 py-1 text-xs capitalize text-ivory-dim hover:border-gold hover:text-gold"
        >
          {c.value} <X size={12} />
        </button>
      ))}
      <button
        onClick={() =>
          setState({ brand: [], family: [], gender: [], concentration: [], season: [], occasion: [], notes: [], samples: null })
        }
        className="text-xs uppercase tracking-widest text-muted underline-offset-2 hover:text-rose hover:underline"
      >
        Clear all
      </button>
    </div>
  );
}
