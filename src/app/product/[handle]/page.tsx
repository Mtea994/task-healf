import { notFound } from "next/navigation";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BookmarkIcon, ShoppingCart } from "lucide-react";
import { getProductByHandle } from "@/lib/data";
import { formatPrice } from "@/lib/utils";

// dynamic meta data to be added.

export default async function ProductPage({
  params,
}: {
  params: { handle: string };
}) {
  const product = await getProductByHandle(params.handle);

  if (!product) {
    notFound();
  }

  const formattedPrice = formatPrice(product["Variant Price"] || 0);

  return (
    <div className="w-full md:w-max[1440px] mx-auto p-4 md:p-8">
      <div className="mb-8">
        <Link href="/" passHref>
          <Button
            variant="outline"
            className="inline-flex items-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to All Products
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        {/* Image Column */}
        <div className="aspect-square relative w-full bg-secondary rounded-lg overflow-hidden md:px-10 ">
          {product.FEATURED_IMAGE?.url ? (
            <Image
              src={product.FEATURED_IMAGE.url}
              alt={product.FEATURED_IMAGE.alt_text || product.TITLE}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-muted-foreground">No Image</span>
            </div>
          )}
        </div>

        {/* Details Column */}
        <div className="flex flex-col md:px-10">
          {product.PRODUCT_TYPE && (
            <Badge className="w-fit mb-2">{product.PRODUCT_TYPE}</Badge>
          )}
          <h1 className="text-3xl lg:text-4xl font-bold mb-2">
            {product.TITLE}
          </h1>
          <p className="text-lg text-muted-foreground mb-4">
            by {product.VENDOR}
          </p>
          <p className="text-3xl font-bold mb-6">{formattedPrice}</p>

          <div className="flex items-center gap-4 mb-8">
            <Button size="lg" className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Add to Cart
            </Button>
            <Button size="lg" variant="outline">
              <BookmarkIcon className="h-5 w-5" />
            </Button>
          </div>

          <div className="prose prose-slate dark:prose-invert max-w-none">
            <h2 className="text-xl font-semibold">Description</h2>
            <div
              dangerouslySetInnerHTML={{
                __html: product.BODY_HTML || "<p>No description available.</p>",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
