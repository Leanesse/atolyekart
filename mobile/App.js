import { useEffect, useState } from 'react'
import {
  SafeAreaView, ScrollView, View, Text, TextInput, TouchableOpacity,
  FlatList, Switch, Modal, Alert, StatusBar, StyleSheet,
} from 'react-native'
import { fetchProducts, postOrder, postStockNotify } from './src/api'

// Minimalist gri/antrasit tema — web (fpvstore) diliyle uyumlu.
const C = {
  bg: '#f4f4f5', card: '#ffffff', border: '#e4e4e7',
  text: '#18181b', muted: '#71717a', accent: '#18181b',
  ok: '#15803d', okBg: '#dcfce7', danger: '#b91c1c',
}

const KVKK_TEXT = `Kişisel Verilerin Korunması — Aydınlatma Metni

Veri Sorumlusu: fpvstore atölyesi.

1) Toplanan veriler
Sipariş ve stok bildirimi formlarında ad soyad, e-posta adresi ve telefon numaranız toplanır.

2) İşleme amacı
Bu veriler yalnızca siparişinizle ilgili iletişim ve talep ettiğiniz ürün stoğa girdiğinde bilgilendirme amacıyla işlenir.

3) Hukuki sebep
Verileriniz açık rızanıza ve talebinizin (sözleşmenin) yerine getirilmesi gerekliliğine dayanılarak işlenir.

4) Aktarım
Verileriniz, hizmetin sağlanması için gerekli olduğu ölçüde işlenir; üçüncü taraflara pazarlama amacıyla satılmaz veya devredilmez.

5) Saklama süresi
Verileriniz, talebinizin karşılanması için gereken süre boyunca saklanır ve ardından silinir/anonimleştirilir.

6) Haklarınız (KVKK m.11)
Kişisel verilerinize erişme, düzeltilmesini, silinmesini veya işlenmesine itiraz etme haklarına sahipsiniz. Taleplerinizi iletişim bölümündeki e-posta adresi üzerinden iletebilirsiniz.

Bu metin bir taslaktır; yayına almadan önce hukuki gözden geçirme önerilir.`

const emptyOrder = { name: '', email: '', phone: '', productId: '', quantity: '1', consent: false }
const emptyStock = { name: '', email: '', productId: '' }

export default function App() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [order, setOrder] = useState(emptyOrder)
  const [stock, setStock] = useState(emptyStock)
  const [kvkkOpen, setKvkkOpen] = useState(false)
  const [kvkkRead, setKvkkRead] = useState(false)

  useEffect(() => {
    fetchProducts()
      .then(setProducts)
      .catch(() => Alert.alert('Bağlantı', 'Katalog yüklenemedi.'))
      .finally(() => setLoading(false))
  }, [])

  function priceLabel(p) {
    const cur = p.currency === 'TRY' ? '₺' : (p.currency || '')
    return `${p.priceFrom} ${cur}`.trim()
  }

  async function submitOrder() {
    if (!order.productId) return Alert.alert('Eksik', 'Lütfen bir ürün seçin.')
    if (!order.consent) return Alert.alert('KVKK', 'Devam için önce KVKK metnini okuyup onay verin.')
    try {
      const p = products.find(x => x.id === order.productId)
      await postOrder({
        name: order.name, email: order.email, phone: order.phone,
        productId: order.productId, productName: p?.name,
        quantity: Number(order.quantity) || 1, consent: order.consent,
      })
      Alert.alert('Teşekkürler', 'Siparişin alındı. En kısa sürede dönüş yapacağız.')
      setOrder(emptyOrder); setKvkkRead(false)
    } catch (e) {
      Alert.alert('Hata', e.message)
    }
  }

  async function submitStock() {
    if (!stock.productId) return Alert.alert('Eksik', 'Lütfen bir ürün seçin.')
    try {
      const p = products.find(x => x.id === stock.productId)
      await postStockNotify({
        name: stock.name, email: stock.email,
        productId: stock.productId, productName: p?.name,
      })
      Alert.alert('Kaydedildi', 'Ürün stoğa girince e-posta ile haber vereceğiz.')
      setStock(emptyStock)
    } catch (e) {
      Alert.alert('Hata', e.message)
    }
  }

  // Yatay, dokunulabilir ürün seçici (yazmak yerine seç).
  function ProductPicker({ value, onSelect }) {
    return (
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chips}
        contentContainerStyle={{ gap: 8, paddingVertical: 2 }}>
        {products.map(p => {
          const active = value === p.id
          return (
            <TouchableOpacity key={p.id} onPress={() => onSelect(p.id)}
              style={[styles.chip, active && styles.chipActive]}>
              <Text style={[styles.chipText, active && styles.chipTextActive]}>
                {p.emoji} {p.name}
              </Text>
            </TouchableOpacity>
          )
        })}
      </ScrollView>
    )
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />
      <ScrollView contentContainerStyle={styles.wrap}>
        {/* Marka başlığı */}
        <View style={styles.brand}>
          <Text style={styles.brandName}>fpvstore</Text>
          <Text style={styles.brandSub}>3D baskı FPV / drone parçaları</Text>
        </View>

        {/* Katalog */}
        <Text style={styles.kicker}>Katalog</Text>
        <Text style={styles.h2}>Öne Çıkan Parçalar</Text>
        {loading ? (
          <Text style={styles.muted}>Ürünler yükleniyor…</Text>
        ) : (
          <FlatList
            scrollEnabled={false}
            data={products}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <View style={styles.prodCard}>
                <Text style={styles.prodEmoji}>{item.emoji}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.prodName}>{item.name}</Text>
                  <Text style={styles.muted} numberOfLines={1}>{item.description}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.price}>{priceLabel(item)}</Text>
                  <View style={[styles.badge, item.inStock ? styles.badgeOk : styles.badgeOut]}>
                    <Text style={[styles.badgeText, item.inStock ? styles.badgeTextOk : styles.badgeTextOut]}>
                      {item.inStock ? 'Stokta' : 'Tükendi'}
                    </Text>
                  </View>
                </View>
              </View>
            )}
          />
        )}

        {/* Sipariş Ver */}
        <View style={styles.formCard}>
          <Text style={styles.kicker}>Sipariş</Text>
          <Text style={styles.h2}>Sipariş Ver</Text>

          <Text style={styles.label}>Ad Soyad</Text>
          <TextInput style={styles.input} placeholder="Adınız Soyadınız" placeholderTextColor={C.muted}
            value={order.name} onChangeText={v => setOrder({ ...order, name: v })} />

          <Text style={styles.label}>E-posta</Text>
          <TextInput style={styles.input} placeholder="ornek@mail.com" placeholderTextColor={C.muted}
            autoCapitalize="none" keyboardType="email-address"
            value={order.email} onChangeText={v => setOrder({ ...order, email: v })} />

          <Text style={styles.label}>Telefon</Text>
          <TextInput style={styles.input} placeholder="+90 5xx xxx xx xx" placeholderTextColor={C.muted}
            keyboardType="phone-pad"
            value={order.phone} onChangeText={v => setOrder({ ...order, phone: v })} />

          <Text style={styles.label}>Ürün</Text>
          <ProductPicker value={order.productId} onSelect={id => setOrder({ ...order, productId: id })} />

          <Text style={styles.label}>Adet</Text>
          <TextInput style={[styles.input, { width: 100 }]} placeholder="1" placeholderTextColor={C.muted}
            keyboardType="numeric"
            value={order.quantity} onChangeText={v => setOrder({ ...order, quantity: v })} />

          {/* KVKK: önce oku, sonra switch aktifleşir */}
          <View style={styles.kvkkRow}>
            <Switch
              value={order.consent}
              disabled={!kvkkRead}
              onValueChange={v => setOrder({ ...order, consent: v })}
              trackColor={{ true: C.accent, false: '#d4d4d8' }}
            />
            <Text style={[styles.kvkkText, !kvkkRead && { color: C.muted }]}>
              KVKK aydınlatma metnini okudum, kişisel verilerimin işlenmesine açık rıza veriyorum.
            </Text>
          </View>
          {!kvkkRead && (
            <TouchableOpacity onPress={() => setKvkkOpen(true)}>
              <Text style={styles.link}>KVKK Metnini Oku →</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={[styles.btn, !order.consent && styles.btnDisabled]}
            onPress={submitOrder} disabled={!order.consent}>
            <Text style={styles.btnText}>Sipariş Ver</Text>
          </TouchableOpacity>
        </View>

        {/* Stok Bildirimi */}
        <View style={styles.formCard}>
          <Text style={styles.kicker}>Stok Bildirimi</Text>
          <Text style={styles.h2}>Stoğa Gelince Haber Ver</Text>

          <Text style={styles.label}>Ad Soyad</Text>
          <TextInput style={styles.input} placeholder="Adınız Soyadınız" placeholderTextColor={C.muted}
            value={stock.name} onChangeText={v => setStock({ ...stock, name: v })} />

          <Text style={styles.label}>E-posta</Text>
          <TextInput style={styles.input} placeholder="ornek@mail.com" placeholderTextColor={C.muted}
            autoCapitalize="none" keyboardType="email-address"
            value={stock.email} onChangeText={v => setStock({ ...stock, email: v })} />

          <Text style={styles.label}>Ürün</Text>
          <ProductPicker value={stock.productId} onSelect={id => setStock({ ...stock, productId: id })} />

          <TouchableOpacity style={styles.btn} onPress={submitStock}>
            <Text style={styles.btnText}>Bildir</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.footer}>© fpvstore — örnek/placeholder içerik</Text>
      </ScrollView>

      {/* KVKK Modal */}
      <Modal visible={kvkkOpen} animationType="slide" transparent onRequestClose={() => setKvkkOpen(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>KVKK Aydınlatma Metni</Text>
            <ScrollView style={styles.modalScroll}>
              <Text style={styles.modalBody}>{KVKK_TEXT}</Text>
            </ScrollView>
            <TouchableOpacity style={styles.btn}
              onPress={() => { setKvkkRead(true); setKvkkOpen(false) }}>
              <Text style={styles.btnText}>Okudum, Kapat</Text>
            </TouchableOpacity>
            <Text style={styles.modalHint}>Kapattıktan sonra onay anahtarı aktifleşir.</Text>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  wrap: { padding: 18, paddingBottom: 40 },
  brand: { marginBottom: 20 },
  brandName: { fontSize: 26, fontWeight: '700', color: C.text, letterSpacing: 0.3 },
  brandSub: { fontSize: 13, color: C.muted, marginTop: 2 },
  kicker: { fontSize: 11, fontWeight: '700', color: C.muted, textTransform: 'uppercase', letterSpacing: 1, marginTop: 6 },
  h2: { fontSize: 20, fontWeight: '700', color: C.text, marginBottom: 12 },
  muted: { color: C.muted, fontSize: 13 },
  // ürün kartı
  prodCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: C.card, borderWidth: 1, borderColor: C.border, borderRadius: 12, padding: 12, marginBottom: 10 },
  prodEmoji: { fontSize: 26 },
  prodName: { fontSize: 15, fontWeight: '600', color: C.text },
  price: { fontSize: 15, fontWeight: '700', color: C.text },
  badge: { marginTop: 4, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999 },
  badgeOk: { backgroundColor: C.okBg }, badgeOut: { backgroundColor: '#f4f4f5' },
  badgeText: { fontSize: 11, fontWeight: '700' },
  badgeTextOk: { color: C.ok }, badgeTextOut: { color: C.muted },
  // form
  formCard: { backgroundColor: C.card, borderWidth: 1, borderColor: C.border, borderRadius: 14, padding: 16, marginTop: 22 },
  label: { fontSize: 13, fontWeight: '600', color: C.text, marginTop: 12, marginBottom: 6 },
  input: { borderWidth: 1, borderColor: C.border, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 15, color: C.text, backgroundColor: '#fafafa' },
  chips: { marginTop: 2 },
  chip: { borderWidth: 1, borderColor: C.border, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#fafafa' },
  chipActive: { backgroundColor: C.accent, borderColor: C.accent },
  chipText: { fontSize: 13, color: C.text },
  chipTextActive: { color: '#fff', fontWeight: '600' },
  kvkkRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 16 },
  kvkkText: { flex: 1, fontSize: 13, color: C.text, lineHeight: 18 },
  link: { color: C.accent, fontWeight: '700', fontSize: 13, marginTop: 8, textDecorationLine: 'underline' },
  btn: { backgroundColor: C.accent, borderRadius: 10, paddingVertical: 13, alignItems: 'center', marginTop: 18 },
  btnDisabled: { backgroundColor: '#a1a1aa' },
  btnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  footer: { textAlign: 'center', color: C.muted, fontSize: 12, marginTop: 28 },
  // modal
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: C.card, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: '80%' },
  modalTitle: { fontSize: 18, fontWeight: '700', color: C.text, marginBottom: 12 },
  modalScroll: { marginBottom: 8 },
  modalBody: { fontSize: 14, color: '#3f3f46', lineHeight: 21 },
  modalHint: { textAlign: 'center', color: C.muted, fontSize: 12, marginTop: 10 },
})
