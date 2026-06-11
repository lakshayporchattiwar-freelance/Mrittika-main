export type Product = {
  id: string;
  name: string;
  slug: string;
  price: number;
  rating: number;
  reviewCount: number;
  shortDescription: string;
  image: string;
  images: string[];
  description?: string;
  ingredients?: string[];
  howToUse?: string[];
};

export const products: Product[] = [
  {
    id: "p1",
    name: "Ubtan Mix Face Pack",
    slug: "ubtan-mix-face-pack",
    price: 139,
    rating: 4.5,
    reviewCount: 4,
    shortDescription:
      "Brightening ubtan blend with turmeric, sandalwood & gram flour.",
    image: "/images/products/ubtan-mix-face-pack.webp",
    images: [
      "/images/products/ubtan-mix-face-pack.webp",
      "/images/products/ubtan-mix-face-pack-front.webp",
      "/images/products/ubtan-mix-face-pack-back.webp",
    ],
    description:
      "Brightening ubtan blend with turmeric, sandalwood & gram flour. Gently de-tans and gives natural glow for Indian skin.",
    ingredients: ["Turmeric", "Sandalwood", "Gram Flour", "Rose Water", "Multani Mitti"],
    howToUse: [
      "Mix 2 tablespoons with curd or rose water to form a smooth paste.",
      "Apply evenly on cleansed face and neck.",
      "Leave on for 15 minutes, then wash off with lukewarm water using gentle circular motions.",
    ],
  },
  {
    id: "p2",
    name: "Soft Glow Face Pack",
    slug: "soft-glow-face-pack",
    price: 129,
    rating: 4.4,
    reviewCount: 2,
    shortDescription:
      "Illuminating face pack with natural botanicals for a healthy radiance.",
    image: "/images/products/soft-glow-face-pack.webp",
    images: [
      "/images/products/soft-glow-face-pack.webp",
      "/images/products/soft-glow-face-pack-front.webp",
      "/images/products/soft-glow-face-pack-back.webp",
    ],
    description:
      "Illuminating face pack with natural botanicals that softens skin texture and adds a healthy radiance.",
    ingredients: ["Chamomile", "Licorice Root", "Aloe Vera", "Saffron", "Oatmeal"],
    howToUse: [
      "Blend 1–2 spoons with milk or aloe vera gel until creamy.",
      "Spread a thin, even layer across face and décolletage.",
      "Relax for 15–20 minutes, then rinse with cool water for a soft, dewy finish.",
    ],
  },
  {
    id: "p3",
    name: "Oil Control Face Pack",
    slug: "oil-control-face-pack",
    price: 119,
    rating: 4.3,
    reviewCount: 3,
    shortDescription:
      "Balances excess sebum with neem, multani mitti & rose water.",
    image: "/images/products/oil-control-face-pack.webp",
    images: [
      "/images/products/oil-control-face-pack.webp",
      "/images/products/oil-control-face-pack-front.webp",
      "/images/products/oil-control-face-pack-back.webp",
    ],
    description:
      "Balances excess sebum with neem, multani mitti & rose water. Ideal for oily and combination skin types.",
    ingredients: ["Neem", "Multani Mitti", "Rose Water", "Tea Tree Oil", "Kaolin Clay"],
    howToUse: [
      "Mix with rose water or plain water to a thick, spreadable consistency.",
      "Apply on the T-zone and oily areas of the face.",
      "Allow to dry for 10–12 minutes, then wash off with cold water to tighten pores.",
    ],
  },
];
