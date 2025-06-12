"use client";
import { Search } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "../ui/command";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Fuse from "fuse.js";
// import { Product } from "@/types";

interface ProductSearchInfo {
  ID: string;
  TITLE: string;
}

interface FuseSuggestion<T> {
  item: T;
}

function SearchInput() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  // const [products, setProducts] = useState<Product[]>([]);

  const [vendorSuggestions, setVendorSuggestions] = useState<
    FuseSuggestion<string>[]
  >([]);
  const [productSuggestions, setProductSuggestions] = useState<
    FuseSuggestion<ProductSearchInfo>[]
  >([]);

  const [vendorFuse, setVendorFuse] = useState<Fuse<string> | null>(null);
  const [productFuse, setProductFuse] =
    useState<Fuse<ProductSearchInfo> | null>(null);

  useEffect(() => {
    const fetchSearchData = async () => {
      try {
        const res = await fetch("/api/products?for=suggestions");
        if (!res.ok) throw new Error("Failed to fetch Products");
        const data = await res.json();
        // setProducts(data.products || []);
        const vendors: string[] = data.vendors || [];
        const products: ProductSearchInfo[] = data.products || [];
        setVendorFuse(new Fuse(vendors, { threshold: 0.3, distance: 100 }));
        setProductFuse(
          new Fuse(products, {
            keys: ["TITLE"],
            threshold: 0.3,
            distance: 200,
            includeScore: true,
          })
        );
      } catch (err) {
        console.error("Error Fetching Products", err);
      }
    };
    fetchSearchData();
  }, []);

  // useEffect(() => {
  //   if (products.length > 0) {
  //     console.log(products, "Products");
  //     const vendorsArr = [...new Set(products.map((p) => p.VENDOR))];
  //     setVendorFuse(new Fuse(vendorsArr, { threshold: 0.3, distance: 100 }));
  //     setProductFuse(
  //       new Fuse(products, {
  //         keys: ["TITLE"],
  //         threshold: 0.3,
  //         distance: 200,
  //         includeScore: true,
  //       })
  //     );
  //   }
  // }, [products]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);

    if (newQuery.length > 1) {
      if (vendorFuse) {
        setVendorSuggestions(vendorFuse.search(newQuery, { limit: 3 }));
      }
      if (productFuse) {
        setProductSuggestions(productFuse.search(newQuery, { limit: 5 }));
      }
      if (!open) {
        setOpen(true);
      }
    } else {
      setVendorSuggestions([]);
      setProductSuggestions([]);
      if (open) {
        setOpen(false);
      }
    }

    // setQuery(e.target.value);
    // if (e.target.value.length > 0 && !open) {
    //   setOpen(true);
    // } else if (e.target.value.length === 0) {
    //   setOpen(false);
    // }
  };

  const performSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) {
      return;
    }
    router.push(`/?query=${encodeURIComponent(searchQuery)}`);
    setQuery("");
    setVendorSuggestions([]);
    setProductSuggestions([]);
    setOpen(false);
  };

  const handleSearchClick = () => {
    performSearch(query);
  };

  const handleSuggestionSelect = (selection: string) => {
    setQuery(selection);
    performSearch(selection);
  };

  const hasSuggestions =
    vendorSuggestions.length > 0 || productSuggestions.length > 0;

  return (
    <div className="relative">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          {/* <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-[200px] justify-between"
          ></Button> */}
          <div className="flex items-center md:w-2xl bg-background border border-slate-800 rounded-lg shadow-lg transition-all">
            <span className="pl-4 pr-2">
              <Search className="h-5 w-5 text-slate-500" />
            </span>
            <Input
              type="text"
              placeholder="Search for products or vendors..."
              value={query}
              onChange={handleInputChange}
              // onFocus={() => query && setOpen(true)}
              // onFocus={() => setOpen(true)}
              className="w-full h-12 bg-transparent text-black text-lg font-medium placeholder:text-slate-500 focus:outline-none focus-visible:outline-none focus-within:outline-none border-none rounded-none shadow-none"
            />
            <Button
              onClick={handleSearchClick}
              className="m-1 bg-gray-600 hover:bg-blue-700 text-white rounded-md"
              size="lg"
            >
              Search
            </Button>
          </div>
        </PopoverTrigger>
        <PopoverContent
          className="md:w-2xl p-0"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <Command>
            <CommandList>
              {!hasSuggestions && query.length > 1 ? (
                <CommandEmpty>
                  No Suggestions found. Press Enter to search.
                </CommandEmpty>
              ) : (
                <>
                  {productSuggestions.length > 0 && (
                    <CommandGroup heading="Products">
                      {productSuggestions.map(({ item }) => (
                        <CommandItem
                          key={item.ID}
                          onSelect={() => handleSuggestionSelect(item.TITLE)}
                        >
                          {item.TITLE}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  )}
                  {vendorSuggestions.length > 0 && (
                    <CommandGroup heading="Vendors">
                      {vendorSuggestions.map(({ item }) => (
                        <CommandItem
                          key={item}
                          onSelect={() => handleSuggestionSelect(item)}
                        >
                          {item}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  )}
                </>
              )}
              {/* Press Enter to search...
              <CommandEmpty>Press Enter to search.</CommandEmpty>
              <CommandGroup>
                Suggestions
                <CommandItem>Vendor 1</CommandItem>
                <CommandItem>Vendor 2</CommandItem>
                <CommandItem>Vendor 3</CommandItem>
              </CommandGroup> */}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}

export default SearchInput;
