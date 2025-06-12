import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="w-full max-w-[1440px] flex items-center justify-center p-4 md:p-8 text-center">
      <h2 className="text-4xl font-bold mb-4">404 - Product Not Found</h2>
      <p className="text-muted-foreground mb-6">
        Sorry, we couldn&apos;t find the product you were looking for.
      </p>
      <Link href="/">
        <Button>Return to All Products</Button>
      </Link>
    </div>
  );
}
