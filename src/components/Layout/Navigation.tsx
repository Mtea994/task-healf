// import { Input } from "@/components/ui/input";
import { ShoppingBag } from "lucide-react";
import SearchInput from "../search/SearchInput";

function LayoutNavigation() {
  return (
    <header className="bg-accent-foreground flex items-center h-16 w-full">
      <div className="flex w-full max-w-[1440px] items-center justify-between mx-auto">
        <div>
          <h4 className="text-background font-semibold text-2xl">Logo</h4>
        </div>
        <div>
          {/* <Input
            className="bg-background w-2xl"
            placeholder="Search Products"
          /> */}
          <SearchInput />
        </div>
        <div>
          <ShoppingBag color="white" size={24} />
        </div>
      </div>
    </header>
  );
}

export default LayoutNavigation;
