/** @type {import('../models/types').Category[]} */
export const categories = [
  { id: 'frame',    label: 'Frame',    icon: '🕸️', description: 'Gövde, şasi ve kanopi parçaları' },
  { id: 'mount',    label: 'Mount',    icon: '🎥', description: 'Kamera ve bileşen montaj parçaları' },
  { id: 'koruyucu', label: 'Koruyucu', icon: '🛡️', description: 'Darbe ve ısıya karşı koruma parçaları' },
  { id: 'aksesuar', label: 'Aksesuar', icon: '🔧', description: 'Tutucular, yataklar ve diğer aksesuarlar' },
]

// Filtre çubuğu için "Tümü" dahil liste
export const filterCategories = [{ id: 'all', label: 'Tümü' }, ...categories]
