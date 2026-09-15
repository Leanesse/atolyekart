// Site genelinde kullanılan marka ve iletişim bilgileri — tek kaynak.
// Gerçek bilgiler değişirse sadece bu dosya güncellenir.

const instagramHandle = 'karagulyusuf'
const addressQuery = 'Kocaeli Çayırova OSB'

export const site = {
  name: 'fpvstore',
  tagline: '3D baskı drone parçaları',

  phone: {
    display: '+90 555 555 55 55',
    href: 'tel:+905555555555',
  },
  email: {
    display: 'yusuf.karagul70@gmail.com',
    href: 'mailto:yusuf.karagul70@gmail.com',
  },
  instagram: {
    display: '@karagulyusuf',
    href: `https://instagram.com/${instagramHandle}`,
  },
  address: {
    display: 'Kocaeli Çayırova OSB',
    href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addressQuery)}`,
  },
}
