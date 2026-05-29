export type Product = {
  id: string;
  name: string;
  slug: string;
  price: number;
  mrp: number;
  rating: number;
  reviewCount: number;
  shortDescription: string;
  badge?: string;
  image: string;
};

export const products: Product[] = [
  {
    id: "p1",
    name: "Ubtan Radiance Face Pack",
    slug: "ubtan-radiance-face-pack",
    price: 599,
    mrp: 799,
    rating: 4.8,
    reviewCount: 248,
    shortDescription:
      "Detan, brighten, and glow with turmeric, sandalwood, and saffron.",
    badge: "Bestseller",
    image: "/images/product-1.svg",
  },
  {
    id: "p2",
    name: "Saffron Nourish Mask",
    slug: "saffron-nourish-mask",
    price: 699,
    mrp: 899,
    rating: 4.7,
    reviewCount: 190,
    shortDescription:
      "Deeply nourishes dull skin with saffron extract and almond milk.",
    badge: "New",
    image: "/images/product-2.svg",
  },
  {
    id: "p3",
    name: "Rose Clay Detox Polish",
    slug: "rose-clay-detox-polish",
    price: 549,
    mrp: 699,
    rating: 4.6,
    reviewCount: 132,
    shortDescription:
      "Gently detoxifies pores with rose clay and neem for balanced skin.",
    badge: "Limited",
    image: "/images/product-3.svg",
  },
];
