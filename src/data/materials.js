/** @type {import('../models/types').Material[]} */
export const materials = [
  {
    id: 'petg',
    name: 'PETG',
    description: 'Dayanıklı, darbeye ve UV’ye dirençli genel amaçlı filament.',
    properties: { strength: 'yüksek', flexibility: 'orta', tempResistance: 'orta' },
    colors: [
      { name: 'Siyah', hex: '#1a1a1c' },
      { name: 'Beyaz', hex: '#f2f2f4' },
      { name: 'Kırmızı', hex: '#d23a3a' },
    ],
  },
  {
    id: 'abs',
    name: 'ABS',
    description: 'Yüksek sıcaklığa dayanıklı, sağlam ama daha kırılgan mühendislik filamenti.',
    properties: { strength: 'yüksek', flexibility: 'düşük', tempResistance: 'yüksek' },
    colors: [
      { name: 'Siyah', hex: '#1a1a1c' },
      { name: 'Gri', hex: '#8a8a90' },
    ],
  },
  {
    id: 'tpu',
    name: 'TPU',
    description: 'Esnek ve titreşim emici, mount ve koruyucular için ideal.',
    properties: { strength: 'orta', flexibility: 'yüksek', tempResistance: 'orta' },
    colors: [
      { name: 'Siyah', hex: '#1a1a1c' },
      { name: 'Mavi', hex: '#2f6fd2' },
      { name: 'Turuncu', hex: '#e07b2f' },
    ],
  },
]
