import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Product } from "@/types";
import Image from "next/image";
import { Button } from "../ui/button";
import { BookmarkIcon } from "lucide-react";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  console.log(product);
  const formattedPrice = formatPrice(product["Variant Price"] || 0);

  // A simple function to strip HTML tags for the description preview
  //   const stripHtml = (html: string) => {
  //     const doc = new DOMParser().parseFromString(html, "text/html");
  //     return doc.body.textContent || "";
  //   };

  //   const description = stripHtml(product["Body (HTML)"]);

  return (
    <Card className="flex flex-col h-full hover:shadow-lg transition-shadow duration-300">
      <CardContent>
        {product?.FEATURED_IMAGE && (
          <Image
            src={product?.FEATURED_IMAGE?.url}
            width={product?.FEATURED_IMAGE?.width}
            height={product?.FEATURED_IMAGE?.height}
            alt={product?.FEATURED_IMAGE?.alt_text || product.TITLE}
          />
        )}
      </CardContent>
      <CardHeader>
        <div className="flex justify-between items-start gap-4">
          <CardTitle className="text-lg leading-tight">
            {product.TITLE}
          </CardTitle>
          {product.PRODUCT_TYPE && (
            <Badge variant="secondary">{product.PRODUCT_TYPE}</Badge>
          )}
        </div>
        <CardDescription>by {product.VENDOR}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col justify-between">
        {/* <div
          className="text-sm text-muted-foreground mb-4 line-clamp-3"
          dangerouslySetInnerHTML={{ __html: product.BODY_HTML }}
        /> */}
        {/* {description || "No description available."} */}
        {/* </p> */}
        {/* {product.PRODUCT_EXCERPT && <p>{product.PRODUCT_EXCERPT}</p>} */}
        <div>
          <p className="text-muted-foreground text-sm">
            Starting from
            <span className="text-lg text-foreground pl-6 font-semibold">
              {formattedPrice}
            </span>
          </p>
        </div>
      </CardContent>
      <CardFooter className="items-center justify-between border-t-1 pt-4 border-t-muted ">
        <Link href={`/product/${product.HANDLE}`}>
          <Button className="cursor-pointer">View Product</Button>
        </Link>
        <BookmarkIcon color="black" size={32} />
      </CardFooter>
    </Card>
  );
};

export default ProductCard;
