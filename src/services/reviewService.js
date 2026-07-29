import { reviews } from '../data/reviews.js'

// Küçük bir gecikme ile ağ çağrısını taklit eder (ileride gerçek fetch olacak).
const delay = (ms = 60) => new Promise(r => setTimeout(r, ms))

/**
 * Bir ürünün yorumlarını döndürür.
 * @param {string} productId
 * @returns {Promise<import('../models/types').Review[]>}
 */
export async function getReviewsByProduct(productId) {
  await delay()
  return reviews.filter(r => r.productId === productId)
}

/**
 * Bir ürünün puan özetini döndürür.
 * @param {string} productId
 * @returns {Promise<{averageRating:number, reviewCount:number}>}
 */
export async function getRatingSummary(productId) {
  const list = reviews.filter(r => r.productId === productId)
  return {
    averageRating: summarize(list).averageRating,
    reviewCount: list.length,
  }
}

// Senkron yardımcı — productService'in türetilmiş alanları için de kullanılır.
export function summarize(list) {
  if (!list.length) return { averageRating: 0, reviewCount: 0 }
  const sum = list.reduce((acc, r) => acc + r.rating, 0)
  return { averageRating: Math.round((sum / list.length) * 10) / 10, reviewCount: list.length }
}

export function reviewsFor(productId) {
  return reviews.filter(r => r.productId === productId)
}
