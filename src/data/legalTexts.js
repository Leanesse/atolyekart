// KVKK metinleri — tek kaynak: hem #gizlilik sayfası hem açık rıza pop-up'ı buradan çizer.
// Not: Bu metin bir taslaktır; yayına almadan önce hukuki gözden geçirme önerilir.

import { site } from './site.js'

export const dataController = {
  name: 'fpvstore atölyesi — Yusuf Karagül',
  address: site.address.display,
  email: site.email.display,
}

/** Aydınlatma Metni (KVKK m. 10) bölümleri. */
export const aydinlatmaMetni = [
  {
    h: '1. Veri Sorumlusu',
    p: [
      `6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") kapsamında kişisel verileriniz, veri sorumlusu olarak ${dataController.name} (${dataController.address}) tarafından aşağıda açıklanan kapsamda işlenmektedir. Talepleriniz için: ${dataController.email}`,
    ],
  },
  {
    h: '2. İşlenen Kişisel Veriler',
    li: [
      'Sipariş formu: ad soyad, e-posta adresi, telefon numarası, seçilen ürün ve adet bilgisi.',
      'Özel baskı (teklif) formu: ad soyad, e-posta adresi, talep detayları (malzeme, renk, adet, notlar/dosya bilgisi).',
      'Stok bildirimi formu: ad soyad, e-posta adresi, takip edilen ürün bilgisi.',
      'Teknik kayıtlar: tarih-saat ve istemci IP adresi (yalnızca spam ve kötüye kullanım koruması için, kısa süreli).',
    ],
  },
  {
    h: '3. İşleme Amaçları',
    p: [
      'Kişisel verileriniz; sipariş veya teklif talebinizin alınması, doğrulanması, talebiniz kapsamında sizinle iletişime geçilmesi ve sürecin takibi ile stok bildirimi talebiniz halinde seçtiğiniz ürün stoğa girdiğinde sizi e-posta ile bilgilendirmek amacıyla işlenir. Verileriniz pazarlama amaçlı kullanılmaz ve üçüncü taraflara satılmaz.',
    ],
  },
  {
    h: '4. Hukuki Sebep',
    p: [
      'Verileriniz; talebinizi karşılamak üzere sözleşmenin kurulması ve ifası (KVKK m. 5/2-c), hukuki yükümlülük ve meşru menfaat (m. 5/2-f) ile stok bilgilendirmesi için açık rızanız (m. 5/1) kapsamında işlenir.',
    ],
  },
  {
    h: '5. Aktarım',
    p: [
      'Verileriniz, talebinizin karşılanması için gerekli olduğu ölçüde ve yalnızca bu amaçla; internet sitesinin barındırılması için altyapı hizmeti aldığımız Vercel Inc. ile talep kaydı ve bildirim e-postası işlemleri için kullandığımız iş akışı platformuna aktarılabilir. Altyapının yurt dışında bulunması nedeniyle yurt dışına aktarım söz konusu olabilir; bu aktarımlar KVKK m. 9\'da öngörülen tedbirler alınarak yapılır.',
    ],
  },
  {
    h: '6. Saklama Süresi',
    p: [
      'Kişisel verileriniz, talebinizin karşılanması için gerekli süre ve ilgili mevzuattaki yasal saklama süreleri boyunca saklanır; süre sonunda silinir, yok edilir veya anonimleştirilir.',
    ],
  },
  {
    h: '7. Haklarınız (KVKK m. 11)',
    li: [
      'Kişisel verilerinizin işlenip işlenmediğini öğrenme;',
      'İşlenmişse buna ilişkin bilgi talep etme;',
      'İşleme amacını ve amaca uygun kullanılıp kullanılmadığını öğrenme;',
      'Yurt içinde veya yurt dışında verilerin aktarıldığı üçüncü kişileri bilme;',
      'Eksik veya yanlış işlenmiş verilerin düzeltilmesini isteme;',
      'Silinmesini veya yok edilmesini isteme;',
      'Bu işlemlerin üçüncü kişilere bildirilmesini isteme;',
      'Münhasıran otomatik sistemlerle işlenmesi sebebiyle aleyhinize bir sonuca itiraz etme;',
      'Kanuna aykırı işleme sebebiyle zararınızın giderilmesini talep etme.',
    ],
  },
  {
    h: '8. Başvuru Yolu',
    p: [
      `Yukarıdaki haklarınıza ilişkin taleplerinizi ${dataController.email} adresine iletebilirsiniz. Talebiniz en geç 30 (otuz) gün içinde ücretsiz yanıtlanır; işlemin ayrıca bir maliyet gerektirmesi hâlinde KVKK\'da öngörülen ücret tarifesi uygulanabilir.`,
    ],
  },
]

/** Açık Rıza Metni — rıza pop-up'ında onaylanan beyan. */
export const acikRizaMetni = [
  {
    h: '1. Rızanın Kapsamı',
    p: [
      'İşbu açık rıza beyanı; sitemizdeki sipariş, özel baskı (teklif) ve stok bildirimi formları aracılığıyla paylaştığınız kişisel verilerin, aşağıda belirtilen amaçla işlenmesine ilişkin onayınızı kapsar. Bu onay, pazarlama amaçlı elektronik ileti onayı değildir.',
    ],
  },
  {
    h: '2. İşlenecek Veriler ve Amaç',
    li: [
      'Ad soyad, e-posta adresi ve (sipariş formunda) telefon numaranız;',
      'Talebinizi değerlendirmek, talebinizle ilgili sizinle iletişime geçmek, sipariş/teklif sürecini yürütmek;',
      'Stok bildirimi talebiniz varsa, seçtiğiniz ürün stoğa girdiğinde sizi e-posta ile bilgilendirmek.',
    ],
  },
  {
    h: '3. Saklama ve Aktarım',
    p: [
      'Verileriniz yalnızca bu amaçla, talebin karşılanması için gerekli süre boyunca saklanır. Aktarım koşulları Aydınlatma Metni\'nin 5. bölümünde açıklanmıştır.',
    ],
  },
  {
    h: '4. Rızanın Geri Çekilmesi',
    p: [
      `Açık rızanızı dilediğiniz zaman, gerekçe göstermeksizin ${dataController.email} adresine yazarak geri çekebilirsiniz. Geri çekme, geri çekilme tarihinden önce yapılan işlemlerin hukuka uygunluğunu etkilemez.`,
    ],
  },
  {
    h: '5. Onay Beyanı',
    p: [
      'İşbu Aydınlatma Metni\'ni okuduğumu ve anladığımı; kişisel verilerimin yukarıda belirtilen amaç ve kapsamda işlenmesine açık rıza verdiğini beyan ederim.',
    ],
  },
]
