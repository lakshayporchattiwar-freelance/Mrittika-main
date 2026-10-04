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
  category?: string;
  isNew?: boolean;
  weight?: number;
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
    category: "Face",
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
    category: "Face",
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
    category: "Face",
  },
  {
    id: "p4",
    name: "Mrittika Soft Glow Soap",
    slug: "soft-glow-soap",
    price: 130,
    rating: 0,
    reviewCount: 0,
    shortDescription:
      "Natural soap enriched with Manjistha, Mulethi & Chandan for de-tanning and radiant skin. Suitable for face and body.",
    image: "/images/products/soft-glow-soap.webp",
    images: [
      "/images/products/soft-glow-soap.webp",
    ],
    description:
      "Mrittika Soft Glow Soap is crafted from the same potent botanicals that make our Soft Glow Face Pack so beloved. Enriched with Manjistha for blood purification and complexion brightening, Mulethi for deep de-pigmentation, Masoor Dal for gentle exfoliation, Chandan (Sandalwood) powder for its cooling and anti-inflammatory properties, and Rose Powder for natural fragrance and skin softening — this soap is a complete daily ritual for your face and body. Use it twice a day followed by a moisturiser for visibly brighter, de-tanned, and dullness-free skin within weeks.",
    ingredients: [
      "Manjistha (Indian Madder) — brightens complexion, purifies skin",
      "Mulethi (Licorice Root) — reduces pigmentation and dark spots",
      "Masoor Dal (Red Lentil) — gentle exfoliation and glow",
      "Chandan Powder (Sandalwood) — cooling, anti-inflammatory",
      "Rose Powder — softens skin, natural fragrance",
    ],
    howToUse: [
      "Wet your face and/or body with lukewarm water",
      "Lather the soap between your palms and apply gently in circular motions",
      "Leave on for 30 seconds for maximum benefit",
      "Rinse thoroughly with water",
      "Pat dry and apply a moisturiser immediately after",
    ],
    category: "Body",
    isNew: true,
    weight: 0.10,
  },
];
