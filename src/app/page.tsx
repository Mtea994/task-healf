"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import ProductCard from "@/components/product/ProductCard";
import { SkeletonCard } from "@/components/Skeleton/SkeletonCard";
import { PaginationControls } from "@/components/Pagination/PaginationControls";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Product } from "@/types";

const PageContent = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // derive state from url
  const query = searchParams.get("query") || "";
  const vendor = searchParams.get("vendor") || "all";
  const type = searchParams.get("type") || "all";
  const sortBy = searchParams.get("sortBy") || "title";
  const sortOrder = searchParams.get("sortOrder") || "asc";
  const page = parseInt(searchParams.get("page") || "1");

  const [products, setProducts] = useState<Product[]>([]);
  const [vendors, setVendors] = useState<string[]>([]);
  const [types, setTypes] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFiltersLoading, setIsFiltersLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(0);
  const [totalResults, setTotalResults] = useState(0);

  const handleUrlUpdate = (key: string, value: string | number) => {
    const currentParams = new URLSearchParams(searchParams.toString());
    currentParams.set(key, String(value));

    // Reset page to 1 whenever a filter or sort option changes
    if (key !== "page") {
      currentParams.set("page", "1");
    }

    router.push(`${pathname}?${currentParams.toString()}`);
  };

  useEffect(() => {
    const fetchFilterMetadata = async () => {
      setIsFiltersLoading(true);
      try {
        const res = await fetch("/api/products?meta=true");
        if (!res.ok) throw new Error(`Failed to fetch metadata: ${res.status}`);
        const data = await res.json();
        setVendors(["all", ...data.vendors]);
        setTypes(["all", ...data.types]);
      } catch (error) {
        console.error("Error fetching filter metadata:", error);
      } finally {
        setIsFiltersLoading(false);
      }
    };
    fetchFilterMetadata();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      const params = new URLSearchParams({
        query,
        vendor,
        type,
        sortBy,
        sortOrder,
        page: String(page),
      });

      try {
        const res = await fetch(`/api/products?${params.toString()}`);
        if (!res.ok) throw new Error(`Failed to fetch products: ${res.status}`);
        const data = await res.json();
        setProducts(data.products || []);
        setTotalPages(data.totalPages || 0);
        setTotalResults(data.totalResults || 0);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, [query, vendor, type, sortBy, sortOrder, page]);

  return (
    <div className="flex items-center justify-center w-full font-[family-name:var(--font-geist-sans)]">
      <main className="w-full max-w-[1440px] md:px-20 px-6 py-10">
        <div className="flex flex-col md:flex-row gap-4 mb-8 items-center sticky top-4 bg-background/80 backdrop-blur-md z-10 p-4 rounded-lg border">
          <div className="flex-grow">
            <p className="text-muted-foreground">
              {query ? `Showing results for "${query}"` : "Browse all products"}
            </p>
          </div>
          <div className="flex gap-4 flex-wrap">
            <Select
              value={vendor}
              onValueChange={(value) => handleUrlUpdate("vendor", value)}
              disabled={isFiltersLoading}
            >
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue
                  placeholder={
                    isFiltersLoading ? "Loading..." : "Filter by Vendor"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {vendors.map((v) => (
                  <SelectItem key={v} value={v}>
                    {v === "all" ? "All Vendors" : v}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={type}
              onValueChange={(value) => handleUrlUpdate("type", value)}
              disabled={isFiltersLoading}
            >
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue
                  placeholder={
                    isFiltersLoading ? "Loading..." : "Filter by Type"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {types.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t === "all" ? "All Types" : t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={`${sortBy}-${sortOrder}`}
              onValueChange={(value) => {
                const [newSortBy, newSortOrder] = value.split("-");
                const currentParams = new URLSearchParams(
                  searchParams.toString()
                );
                currentParams.set("sortBy", newSortBy);
                currentParams.set("sortOrder", newSortOrder);
                currentParams.set("page", "1"); // Reset page when sorting
                router.push(`${pathname}?${currentParams.toString()}`);
              }}
            >
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="title-asc">Title (A-Z)</SelectItem>
                <SelectItem value="title-desc">Title (Z-A)</SelectItem>
                <SelectItem value="price-asc">Price (Low to High)</SelectItem>
                <SelectItem value="price-desc">Price (High to Low)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* --- Results and Pagination (Top) --- */}
        <div className="flex justify-between items-center mb-4 px-2">
          <p className="text-sm text-muted-foreground">
            {isLoading
              ? "Loading..."
              : `Showing ${products.length} of ${totalResults} results`}
          </p>
          {!isLoading && (
            <PaginationControls
              currentPage={page}
              totalPages={totalPages}
              onPageChange={(p) => handleUrlUpdate("page", p)}
            />
          )}
        </div>

        {/* Products display */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {isLoading ? (
            Array.from({ length: 12 }).map((_, index) => (
              <SkeletonCard key={index} />
            ))
          ) : products.length > 0 ? (
            products.map((product) => (
              <ProductCard key={`${product.ID}`} product={product} />
            ))
          ) : (
            <div className="col-span-full text-center py-16">
              <h2 className="text-2xl font-semibold mb-2">No Products Found</h2>
              <p className="text-muted-foreground">
                Try adjusting your search or filter criteria.
              </p>
            </div>
          )}
        </div>

        {/* --- Pagination (Bottom) --- */}
        <div className="mt-8 flex justify-center">
          {!isLoading && totalPages > 1 && (
            <PaginationControls
              currentPage={page}
              totalPages={totalPages}
              onPageChange={(p) => handleUrlUpdate("page", p)}
            />
          )}
        </div>
      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center"></footer>
    </div>
  );
};

export default function Home() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PageContent />
    </Suspense>
  );
}
