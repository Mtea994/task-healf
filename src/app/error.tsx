"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="container mx-auto p-4 md:p-8 text-center h-[70vh] flex flex-col items-center justify-center">
      <h2 className="text-3xl font-bold mb-4">Oops! Something Went Wrong</h2>
      <p className="text-muted-foreground mb-6 max-w-md">
        An unexpected error occurred. You can try to reload the page or return
        to the homepage.
      </p>
      <div className="flex gap-4 justify-center">
        <Button onClick={() => reset()} className="cursor-pointer">
          Try Again
        </Button>
        <Link href="/">
          <Button variant="outline" className="cursor-pointer">
            Go to Homepage
          </Button>
        </Link>
      </div>
    </div>
  );
}
