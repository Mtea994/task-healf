import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { promises as fsPromises } from "fs";
import neatCsv from "neat-csv";
import { Product } from "@/types";

let activeProductsCache: Product[] | null = null;

// parse stringified JSON
const safeJsonParse = (str: string) => {
  try {
    // parse the string
    return JSON.parse(str);
  } catch (e) {
    // it's not a JSON string, return the original string
    console.log(e);
    return str;
  }
};

// single product row, parsing JSON fields
const processProductRow = (row: any): Product => {
  const seo = safeJsonParse(row.SEO);
  const priceRange = safeJsonParse(row.PRICE_RANGE_V2);

  const slimProduct: Product = {
    ID: row.ID,
    TITLE: seo?.title || row.TITLE,
    VENDOR: row.VENDOR,
    STATUS: row.STATUS,
    PRODUCT_TYPE: row.PRODUCT_TYPE,
    TAGS: row.TAGS,
    BODY_HTML: row.BODY_HTML,
    HANDLE: row.HANDLE,
    FEATURED_IMAGE: safeJsonParse(row.FEATURED_IMAGE),
    PRODUCT_EXCERPT: seo?.description || null,
    "Variant Price": parseFloat(priceRange?.min_variant_price?.amount) || 0,
  };

  return slimProduct;
};

// Initializes the cache on start, only ACTIVE products
const initializeActiveProductsCache = async (): Promise<Product[]> => {
  if (activeProductsCache) {
    return activeProductsCache;
  }
  try {
    const filePath = path.join(process.cwd(), "public", "products.csv");
    const fileContents = await fsPromises.readFile(filePath, "utf8");
    const allProductsRaw: any[] = await neatCsv(fileContents);

    console.log(`Total rows parsed from CSV: ${allProductsRaw.length}`);
    console.log(allProductsRaw[0]);

    // Filter for ACTIVE products first, then process them
    const activeProducts = allProductsRaw
      .filter(
        (row) =>
          row.STATUS &&
          row.STATUS.toUpperCase() === "ACTIVE" &&
          processProductRow(row)["Variant Price"] > 0
      )
      .map(processProductRow);

    console.log(`Active products cached: ${activeProducts.length}`);

    activeProductsCache = activeProducts;
    return activeProductsCache;
  } catch (error) {
    console.error("Failed to initialize product cache:", error);
    activeProductsCache = []; // Prevent future errors on failure
    return [];
  }
};

const getMetadata = async () => {
  const products = await initializeActiveProductsCache(); // Ensures cache is ready
  const vendors = [
    ...new Set(products.map((p) => p.VENDOR).filter(Boolean)),
  ].sort();
  const types = [
    ...new Set(products.map((p) => p.PRODUCT_TYPE).filter(Boolean)),
  ].sort();
  return { vendors, types };
};

initializeActiveProductsCache();

// getMetadata();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    if (searchParams.get("meta") === "true") {
      const metadata = await getMetadata();
      return NextResponse.json(metadata);
    }

    // initialize active cached products
    const allActiveProducts = await initializeActiveProductsCache();

    const query = searchParams.get("query")?.toLowerCase() || "";
    const vendor = searchParams.get("vendor")?.toLowerCase() || "";
    const type = searchParams.get("type")?.toLowerCase() || "";
    const sortBy = searchParams.get("sortBy") || "title";
    const sortOrder = searchParams.get("sortOrder") || "asc";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = 12; // Products per page

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

    // Sort the filtered results
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

    // pagination
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
