# Next.js Task

This application built with Next.js, TypeScript, and shadcn/ui.
It provides a intuitive interface to search and discover products from a large CSV dataset.

## Features

- **Advanced Search**: A global search bar with fuzzy-search suggestions for both product titles and vendors.
- **URL-Driven State**: All filters, sorting, search queries, and pagination are stored in the URL, making the application state fully shareable and bookmarkable.
- **Dynamic Product Pages**: Each product has its own unique, server-rendered page with detailed information.
- **Efficient Data Handling**: A robust server-side caching strategy handles a large (50MB+) CSV file without sacrificing performance.
- **Comprehensive Filtering & Sorting**: Filter products by Vendor and Type, and sort by Title or Price.
- **Fully Responsive Design**: A mobile-first UI provides a seamless experience on all devices.
- **Robust UI States**: Includes skeleton loaders, a global loading page, and global error and not-found pages.

## Technical Deep Dive

### 1. CSV Data Parsing and Caching Strategy

To efficiently handle a large CSV dataset, this project uses a "cache-on-startup" strategy.
The server reads and parses the entire file only **once** on the first API request, filtering for `ACTIVE` products and storing the optimized results in a global cache.
Every subsequent request accesses this fast in-memory cache, avoiding slow disk I/O and ensuring extremely fast API responses.

**Code Example (`/lib/data.ts`):**

This function ensures the cache is built only once and that concurrent requests wait for it to finish, preventing race conditions.

```ts
// /lib/data.ts
let activeProductsCache: Product[] | null = null;
let cacheInitializationPromise: Promise<Product[]> | null = null;

export const initializeActiveProductsCache = (): Promise<Product[]> => {
  if (activeProductsCache) return Promise.resolve(activeProductsCache);
  if (cacheInitializationPromise) return cacheInitializationPromise;

  const initialize = async (): Promise<Product[]> => {
    try {
      const filePath = path.join(process.cwd(), "public", "products.csv");
      const fileContents = await fsPromises.readFile(filePath, "utf8");
      const allProductsRaw: any[] = await neatCsv(fileContents);
      const processedProducts = allProductsRaw.map(processProductRow);
      const activeProducts = processedProducts.filter(
        (p) => p.STATUS?.toUpperCase() === "ACTIVE" && p["Variant Price"] > 0
      );
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
```

**Why This Approach is Better:**
An alternative like stream-parsing the CSV on every request is impractical here. Features like **sorting** and **pagination** require the complete dataset to be available. Our caching model reads the file from disk once, making all subsequent user interactions that rely on the full dataset significantly faster.
for very large files the initial request time might be long for that we can implement stream parsing of rows but here i had to parse the whole document to make filters , sorting and pagination work which requires the whole dataset thats why i chose this strategy.

### 2. Fuzzy Search with Suggestions

made the global search input to provide intelligent suggestions using **`fuse.js`**, a fuzzy-search library.
On mount, the component fetches a list of all vendors and product titles from the API.
then initialize two `fuse.js` instances—one for vendors, one for products—and uses them to provide real-time suggestions in separate, organized groups as the user types.

**Code Example (`/components/search/SearchInput.tsx`):**

```tsx
// /components/search/SearchInput.tsx
useEffect(() => {
  const fetchSearchData = async () => {
    try {
      const res = await fetch("/api/products?for=suggestions");
      const data = await res.json();

      setVendorFuse(new Fuse(data.vendors, { threshold: 0.3, distance: 100 }));
      setProductFuse(
        new Fuse(data.products, {
          keys: ["TITLE"],
          threshold: 0.3,
          distance: 200,
        })
      );
    } catch (err) {
      console.error("Error Fetching Search Data:", err);
    }
  };
  fetchSearchData();
}, []);

const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const newQuery = e.target.value;
  setQuery(newQuery);

  if (newQuery.length > 1) {
    if (vendorFuse)
      setVendorSuggestions(vendorFuse.search(newQuery, { limit: 3 }));
    if (productFuse)
      setProductSuggestions(productFuse.search(newQuery, { limit: 5 }));
  } else {
    setVendorSuggestions([]);
    setProductSuggestions([]);
  }
};
```

### 3. URL-Based State Management

The application uses the **URL as the single source of truth** for state to create a shareable and robust user experience.
Instead of `useState`, the main page uses the `useSearchParams` hook to read filters, sorting, and the search query directly from the URL.
User interactions call a handler function that updates these URL parameters, triggering a re-render with the new state.

**Code Example (`/app/page.tsx`):**

```tsx
// /app/page.tsx
const PageContent = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const vendor = searchParams.get("vendor") || "all";
  // ... (other params)

  const handleUrlUpdate = (key: string, value: string | number) => {
    const currentParams = new URLSearchParams(searchParams.toString());
    currentParams.set(key, String(value));
    if (key !== "page") currentParams.set("page", "1");
    router.push(`${pathname}?${currentParams.toString()}`);
  };

  return (
    <Select
      value={vendor}
      onValueChange={(value) => handleUrlUpdate("vendor", value)}
    ></Select>
  );
};
```

**Why This Approach is Better:**
Using local state can cause the UI and URL to de-sync and breaks shareability. This URL-driven approach ensures the application state is always predictable, the back button works correctly, and users can share links to specific filtered views.

**Many optimization and features can be easily integrated in this project**

## Setup and Installation

To run this project locally, follow these steps:

1. **Clone the repository:**

   ```
   git clone <repository-url>
   cd <repository-directory>
   ```

2. **Install dependencies:**

   ```
   npm install
   ```

3. **Place the CSV file:**
   Ensure your product data CSV file is named `products.csv` and placed inside the `/public` directory at the root of the project.

4. **Run the development server:**

   ```
   npm run dev
   ```

5. Open <http://localhost:3000> with your browser to see the result.
