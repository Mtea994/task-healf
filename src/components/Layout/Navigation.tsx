"use client";

import { useState } from "react";
import { ShoppingBag, Search, X } from "lucide-react";
import SearchInput from "../search/SearchInput";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";

function LayoutNavigation() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <header className="bg-accent-foreground flex items-center h-16 w-full">
      <div className="flex w-full max-w-[1440px] items-center justify-between mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={`w-full items-center justify-between ${
            isSearchOpen ? "hidden" : "flex"
          } md:flex`}
        >
          <div className="flex-shrink-0">
            <Link href={"/"}>
              <h4 className="text-background font-semibold text-2xl cursor-pointer">
                Logo
              </h4>
            </Link>
          </div>

          {/* Desktop view */}
          <div className="hidden md:block w-full max-w-2xl px-4">
            <SearchInput />
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsSearchOpen(true)}
            >
              <Search className="h-6 w-6 text-background" />
            </Button>
            <ShoppingBag color="white" size={24} />
          </div>
        </div>

        {/* mobile view */}
        {isSearchOpen && (
          <div className="w-full flex items-center gap-2 md:hidden">
            <SearchInput />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSearchOpen(false)}
            >
              <X className="h-6 w-6 text-background" />
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}

export default LayoutNavigation;
