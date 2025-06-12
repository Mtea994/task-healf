import { NextRequest, NextResponse } from "next/server";
import { initializeActiveProductsCache } from "@/lib/data";

export async function GET(request: NextRequest) {
  try {
    const allActiveProducts = await initializeActiveProductsCache();
    const { searchParams } = new URL(request.url);

    // Search Suggestions
    if (searchParams.get("for") === "suggestions") {
      const uniqueVendors = [...new Set(allActiveProducts.map((p) => p.VENDOR))]
        .filter(Boolean)
        .sort();
      const productSearchData = allActiveProducts.map((p) => ({
        ID: p.ID,
        TITLE: p.TITLE,
      }));
      return NextResponse.json({
        vendors: uniqueVendors,
        products: productSearchData,
      });
    }

    // Filters Metadata
    if (searchParams.get("meta") === "true") {
      const vendors = [...new Set(allActiveProducts.map((p) => p.VENDOR))]
        .filter(Boolean)
        .sort();
      const types = [...new Set(allActiveProducts.map((p) => p.PRODUCT_TYPE))]
        .filter(Boolean)
        .sort();
      return NextResponse.json({ vendors, types });
    }

    // Default pagination and filtred products
    const query = searchParams.get("query")?.toLowerCase() || "";
    const vendor = searchParams.get("vendor")?.toLowerCase() || "";
    const type = searchParams.get("type")?.toLowerCase() || "";
    const sortBy = searchParams.get("sortBy") || "title";
    const sortOrder = searchParams.get("sortOrder") || "asc";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = 12;

    let filteredProducts = allActiveProducts;

    if (vendor && vendor !== "all") {
      filteredProducts = filteredProducts.filter(
        (p) => p.VENDOR?.toLowerCase() === vendor
      );
    }
    if (type && type !== "all") {
      filteredProducts = filteredProducts.filter(
        (p) => p.PRODUCT_TYPE?.toLowerCase() === type
      );
    }
    if (query) {
      filteredProducts = filteredProducts.filter(
        (product) =>
          (product.VENDOR?.toLowerCase() || "").includes(query) ||
          (product.TITLE?.toLowerCase() || "").includes(query) ||
          (product.BODY_HTML?.toLowerCase() || "").includes(query) ||
          (product.TAGS || "").toLowerCase().includes(query)
      );
    }

    filteredProducts.sort((a, b) => {
      let valA: string | number, valB: string | number;
      if (sortBy === "price") {
        valA = a["Variant Price"] || 0;
        valB = b["Variant Price"] || 0;
      } else {
        valA = a.TITLE?.toLowerCase() || "";
        valB = b.TITLE?.toLowerCase() || "";
      }
      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    const totalResults = filteredProducts.length;
    const totalPages = Math.ceil(totalResults / limit);
    const startIndex = (page - 1) * limit;
    const paginatedProducts = filteredProducts.slice(
      startIndex,
      startIndex + limit
    );

    return NextResponse.json({
      products: paginatedProducts,
      totalPages,
      totalResults,
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Failed to load product data" },
      { status: 500 }
    );
  }
}
