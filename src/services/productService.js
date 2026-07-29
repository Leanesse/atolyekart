import { products } from '../data/products.js'
import { reviewsFor, summarize } from './reviewService.js'

const delay = (ms = 80) => new Promise(r => setTimeout(r, ms))

/**
 * Ürüne türetilmiş alanları ekler (fiyat/stok/puan).
 * @param {import('../models/types').Product} product
 * @returns {import('../models/types').ProductView}
 */
function toView(product) {
  const prices = product.variants.map(v => v.price)
  const totalStock = product.variants.reduce((acc, v) => acc + v.stock, 0)
  const { averageRating, reviewCount } = summarize(reviewsFor(product.id))
  return {
    ...product,
    priceFrom: prices.length ? Math.min(...prices) : 0,
    currency: product.variants[0]?.currency ?? 'TRY',
    inStock: product.variants.some(v => v.stock > 0),
    totalStock,
    averageRating,
    reviewCount,
  }
}

/**
 * Tüm ürünleri türetilmiş alanlarıyla döndürür.
 * @returns {Promise<import('../models/types').ProductView[]>}
 */
export async function getProducts() {
  await delay()
  return products.map(toView)
}

/**
 * Belirli kategorideki ürünleri döndürür ('all' → tümü).
 * @param {string} categoryId
 * @returns {Promise<import('../models/types').ProductView[]>}
 */
export async function getProductsByCategory(categoryId) {
  await delay()
  const list = categoryId === 'all'
    ? products
    : products.filter(p => p.categoryId === categoryId)
  return list.map(toView)
}

/**
 * Slug ile tek ürün döndürür.
 * @param {string} slug
 * @returns {Promise<import('../models/types').ProductView | null>}
 */
export async function getProductBySlug(slug) {
  await delay()
  const p = products.find(p => p.slug === slug)
  return p ? toView(p) : null
}
