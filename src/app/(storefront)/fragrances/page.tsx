import type { Metadata } from "next";
import { Container, EmptyState } from "@/components/ui/misc";
import { PageHeader } from "@/components/ui/page-header";
import { ProductGrid } from "@/components/product/product-grid";
import {
  DesktopFilters,
  MobileFilters,
  SortSelect,
  ActiveFilters,
} from "@/components/catalog/filter-controls";
import { Pagination } from "@/components/catalog/pagination";
import { getCatalog, parseFilters, getAllNotes } from "@/lib/catalog";
import { getBrands, getFamilies } from "@/lib/queries";
import { getWishlistIds } from "@/lib/actions/wishlist";
import { SearchX } from "lucide-react";

export const metadata: Metadata = {
  title: "Fragrances",
  description:
    "Explore our complete collection of luxury perfumes — filter by family, notes, brand and more.",
};

export default async function FragrancesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const filters = parseFilters(sp);

  const [result, brands, families, notes, wishlist] = await Promise.all([
    getCatalog(filters),
    getBrands(),
    getFamilies(),
    getAllNotes(),
    getWishlistIds(),
  ]);

  return (
    <>
      <PageHeader
        eyebrow="The Collection"
        title={filters.q ? `Results for “${filters.q}”` : "All Fragrances"}
        description="A curated library of the world's most coveted scents."
      />

      <Container className="py-12">
        <div className="flex gap-10">
          <DesktopFilters brands={brands} families={families} notes={notes} />

          <div className="min-w-0 flex-1">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <MobileFilters brands={brands} families={families} notes={notes} />
                <p className="text-xs uppercase tracking-widest text-muted">
                  {result.total} {result.total === 1 ? "scent" : "scents"}
                </p>
              </div>
              <SortSelect />
            </div>

            <ActiveFilters />

            {result.products.length === 0 ? (
              <EmptyState
                icon={<SearchX size={36} />}
                title="No fragrances found"
                description="Try adjusting your filters to discover more of the collection."
              />
            ) : (
              <>
                <ProductGrid products={result.products} wishlist={wishlist} />
                <Pagination pageCount={result.pageCount} />
              </>
            )}
          </div>
        </div>
      </Container>
    </>
  );
}
