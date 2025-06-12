// interface for the FEATURED_IMAGE object
interface FeaturedImage {
  alt_text: string | "";
  height: number;
  id: string;
  url: string;
  width: number;
}

// The main Product interface.
export interface Product {
  ID: string;
  TITLE: string;
  VENDOR: string;
  STATUS: string;
  PRODUCT_TYPE: string;
  TAGS: string;
  BODY_HTML: string;
  HANDLE: string;
  FEATURED_IMAGE: FeaturedImage | null;
  PRODUCT_EXCERPT: string | null;
  //   cuutom field
  "Variant Price": number;
}
