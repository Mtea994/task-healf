import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Product } from "@/types";
import Image from "next/image";

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  //   console.log(product);
  const formattedPrice = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(product["Variant Price"] || 0);

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
        {product.PRODUCT_EXCERPT && <p>{product.PRODUCT_EXCERPT}</p>}
        <div>
          <p className="text-lg font-semibold">{formattedPrice}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
