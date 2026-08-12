import { products } from '../../src/data/products.js'

export function getCatalog() {
  return products.map((p) => {
    const prices = p.variants.map((v) => v.price)
    return {
      id: p.id,
      slug: p.slug,
      name: p.name,
      categoryId: p.categoryId,
      emoji: p.emoji,
      description: p.description,
      priceFrom: prices.length ? Math.min(...prices) : 0,
      currency: p.variants[0]?.currency ?? 'TRY',
      inStock: p.variants.some((v) => v.stock > 0),
    }
  })
}
