"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useCart } from "@/context/CartContext"
import styles from "./ProductCTA.module.css"

type ProductCTAProps = {
  productId: string
}

type ProductInfo = {
  id: string
  name: string
  slug: string
  price: number
  image: string
}

export default function ProductCTA({ productId }: ProductCTAProps) {
  const { addItem } = useCart()
  const router = useRouter()
  const [product, setProduct] = useState<ProductInfo | null>(null)
  const [buyNowLoading, setBuyNowLoading] = useState(false)

  useEffect(() => {
    fetch(`/api/products/${productId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.product) setProduct(data.product)
      })
      .catch(() => {})
  }, [productId])

  const handleAdd = () => {
    if (!product) return
    addItem({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      qty: 1,
      image: product.image,
    })
  }

  const handleBuyNow = async () => {
    if (!product) return
    setBuyNowLoading(true)
    addItem({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      qty: 1,
      image: product.image,
    })
    router.push("/checkout")
  }

  if (!product) {
    return (
      <div className={styles.cta}>
        <button className="btn btn-primary btn-lg" disabled>Loading...</button>
      </div>
    )
  }

  return (
    <div className={styles.cta}>
      <button className="btn btn-primary btn-lg" onClick={handleAdd}>
        Add to Cart
      </button>
      <button
        className="btn btn-secondary btn-lg"
        onClick={handleBuyNow}
        disabled={buyNowLoading}
      >
        {buyNowLoading ? "Processing..." : "Buy Now"}
      </button>
    </div>
  )
}
