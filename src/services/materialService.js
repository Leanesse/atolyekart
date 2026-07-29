import { materials } from '../data/materials.js'

const delay = (ms = 40) => new Promise(r => setTimeout(r, ms))

/**
 * Tüm malzemeleri döndürür.
 * @returns {Promise<import('../models/types').Material[]>}
 */
export async function getMaterials() {
  await delay()
  return materials
}

/**
 * Kimlik ile malzeme döndürür.
 * @param {string} id
 * @returns {Promise<import('../models/types').Material | null>}
 */
export async function getMaterialById(id) {
  await delay()
  return materials.find(m => m.id === id) ?? null
}
