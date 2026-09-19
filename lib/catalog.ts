export type Filter =
  | "all"
  | "cakes"
  | "cupcakes"
  | "jar-cakes"
  | "brownies"
  | "popsicles"
  | "hampers";

export type ProductSize = {
  label: string;
  price: number;
};

export type Product = {
  slug: string;
  name: string;
  category: Exclude<Filter, "all">;
  tag: string;
  description: string;
  details: string;
  image: string;
  sizes: ProductSize[];
};

export const whatsappLink = "https://wa.me/919869600561";

export function formatPrice(price: number) {
  return `₹${price.toLocaleString("en-IN")}`;
}
