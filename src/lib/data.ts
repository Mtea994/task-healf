import path from "path";
import { promises as fsPromises } from "fs";
import neatCsv from "neat-csv";
import { Product } from "@/types";

let activeProductsCache: Product[] | null = null;
let cacheInitializationPromise: Promise<Product[]> | null = null;

const safeJsonParse = (str: any) => {
  if (typeof str !== "string" || !str) {
    return str;
  }
  try {
    return JSON.parse(str);
  } catch (e) {
    return str;
  }
};

const processProductRow = (row: any): Product => {
  const seo = safeJsonParse(row.SEO);
  const priceRange = safeJsonParse(row.PRICE_RANGE_V2);
  return {
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
};

export const initializeActiveProductsCache = (): Promise<Product[]> => {
  // already cached then return.
  if (activeProductsCache) {
    return Promise.resolve(activeProductsCache);
  }
  // If not finished then, wait.
  if (cacheInitializationPromise) {
    return cacheInitializationPromise;
  }
  // create the cache.
  const initialize = async (): Promise<Product[]> => {
    try {
      const filePath = path.join(process.cwd(), "public", "products.csv");
      const fileContents = await fsPromises.readFile(filePath, "utf8");
      const allProductsRaw: any[] = await neatCsv(fileContents);
      const processedProducts = allProductsRaw.map(processProductRow);
      const activeProducts = processedProducts.filter(
        (p) =>
          p.STATUS &&
          p.STATUS.toUpperCase() === "ACTIVE" &&
          p["Variant Price"] > 0
      );
      console.log(`Active products cached: ${activeProducts.length}`);
      activeProductsCache = activeProducts;
      return activeProducts;
    } catch (error) {
      console.error("Failed to initialize product cache:", error);
      activeProductsCache = [];
      return [];
    }
  };

  cacheInitializationPromise = initialize();
  return cacheInitializationPromise;
};

// get a single product by handle
export const getProductByHandle = async (
  handle: string
): Promise<Product | null> => {
  const products = await initializeActiveProductsCache();
  const product = products.find((p) => p.HANDLE === handle);
  return product || null;
};
