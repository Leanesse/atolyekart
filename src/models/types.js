// fpvstore veri modelleri — JSDoc typedef'leri (tek kaynak).
// Kullanım: /** @type {import('../models/types').Product} */
// Bu dosya çalışma zamanında bir şey export etmez; yalnızca tip dokümantasyonudur.

/**
 * @typedef {Object} Category
 * @property {string} id           - Benzersiz kimlik (ör. 'frame')
 * @property {string} label        - Görünen ad (ör. 'Frame')
 * @property {string} [icon]       - Emoji/ikon
 * @property {string} [description]- Kısa açıklama
 */

/**
 * @typedef {Object} MaterialColor
 * @property {string} name - Renk adı (ör. 'Siyah')
 * @property {string} hex  - Renk kodu (ör. '#1a1a1c')
 */

/**
 * @typedef {Object} Material
 * @property {string} id            - Benzersiz kimlik (ör. 'petg')
 * @property {string} name          - Malzeme adı (ör. 'PETG')
 * @property {string} description   - Açıklama
 * @property {{strength:string, flexibility:string, tempResistance:string}} properties
 * @property {MaterialColor[]} colors
 */

/**
 * @typedef {Object} ProductVariant
 * @property {string} id         - Benzersiz varyant kimliği
 * @property {string} sku        - Stok kodu
 * @property {string} materialId - İlgili Material.id
 * @property {string} color      - Renk adı
 * @property {string} colorHex   - Renk kodu
 * @property {number} price      - Fiyat (sayı, ör. 749)
 * @property {string} currency   - Para birimi (ör. 'TRY')
 * @property {number} stock      - Stok adedi (0 = tükendi)
 */

/**
 * @typedef {Object} ProductSpecs
 * @property {string} [weight]        - Ağırlık (ör. '32 g')
 * @property {string} [dimensions]    - Ölçü (ör. '220 mm / 5 inç')
 * @property {string} [compatibility] - Uyumluluk notu
 */

/**
 * @typedef {Object} Product
 * @property {string} id
 * @property {string} slug
 * @property {string} name
 * @property {string} categoryId    - İlgili Category.id
 * @property {string} [emoji]       - Görsel yoksa fallback emoji
 * @property {string[]} images      - Gerçek foto URL'leri (şimdilik boş)
 * @property {string[]} tags        - Rozetler (ör. ['Yeni'])
 * @property {string} description
 * @property {ProductSpecs} specs
 * @property {ProductVariant[]} variants
 */

/**
 * Serviste ürüne eklenen türetilmiş alanlar.
 * @typedef {Product & {priceFrom:number, currency:string, inStock:boolean, totalStock:number, averageRating:number, reviewCount:number}} ProductView
 */

/**
 * @typedef {Object} Review
 * @property {string} id
 * @property {string} productId
 * @property {string} author
 * @property {number} rating      - 1..5
 * @property {string} comment
 * @property {boolean} verified
 * @property {string} createdAt   - ISO tarih
 */

/**
 * @typedef {Object} CustomPrintRequest
 * @property {string} id
 * @property {string} name
 * @property {string} email
 * @property {string} [phone]
 * @property {string} [fileName]   - Yüklenen STL/OBJ adı
 * @property {string} [materialId]
 * @property {string} [color]
 * @property {number} quantity
 * @property {string} [notes]
 * @property {'new'|'reviewing'|'quoted'|'done'} status
 * @property {string} createdAt    - ISO tarih
 */

export {}
