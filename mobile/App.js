import { useEffect, useState } from 'react'
import { SafeAreaView, ScrollView, View, Text, TextInput, Button, FlatList, Switch, Alert, StyleSheet } from 'react-native'
import { fetchProducts, postOrder, postStockNotify } from './src/api'

export default function App() {
  const [products, setProducts] = useState([])
  const [order, setOrder] = useState({ name: '', email: '', phone: '', productId: '', quantity: '1', consent: false })
  const [stock, setStock] = useState({ name: '', email: '', productId: '' })

  useEffect(() => { fetchProducts().then(setProducts).catch(() => {}) }, [])

  async function submitOrder() {
    try {
      const p = products.find(x => x.id === order.productId)
      await postOrder({ ...order, productName: p?.name, quantity: Number(order.quantity) || 1 })
      Alert.alert('Tamam', 'Siparişin alındı.')
    } catch (e) { Alert.alert('Hata', e.message) }
  }
  async function submitStock() {
    try {
      const p = products.find(x => x.id === stock.productId)
      await postStockNotify({ ...stock, productName: p?.name })
      Alert.alert('Tamam', 'Bildirim kaydedildi.')
    } catch (e) { Alert.alert('Hata', e.message) }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.wrap}>
        <Text style={styles.h1}>fpvstore</Text>

        <Text style={styles.h2}>Katalog</Text>
        <FlatList
          scrollEnabled={false}
          data={products}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>{item.emoji} {item.name}</Text>
              <Text style={styles.muted}>{item.priceFrom} {item.currency} · {item.inStock ? 'Stokta' : 'Tükendi'}</Text>
            </View>
          )}
        />

        <Text style={styles.h2}>Sipariş Ver</Text>
        <TextInput style={styles.input} placeholder="Ad Soyad" value={order.name} onChangeText={v => setOrder({ ...order, name: v })} />
        <TextInput style={styles.input} placeholder="E-posta" autoCapitalize="none" value={order.email} onChangeText={v => setOrder({ ...order, email: v })} />
        <TextInput style={styles.input} placeholder="Telefon" value={order.phone} onChangeText={v => setOrder({ ...order, phone: v })} />
        <TextInput style={styles.input} placeholder="Ürün ID (ör. gopro-mount-30)" autoCapitalize="none" value={order.productId} onChangeText={v => setOrder({ ...order, productId: v })} />
        <TextInput style={styles.input} placeholder="Adet" keyboardType="numeric" value={order.quantity} onChangeText={v => setOrder({ ...order, quantity: v })} />
        <View style={styles.row}>
          <Switch value={order.consent} onValueChange={v => setOrder({ ...order, consent: v })} />
          <Text style={styles.consent}>KVKK açık rıza veriyorum</Text>
        </View>
        <Button title="Sipariş Ver" onPress={submitOrder} />

        <Text style={styles.h2}>Stok Bildirimi İste</Text>
        <TextInput style={styles.input} placeholder="Ad Soyad" value={stock.name} onChangeText={v => setStock({ ...stock, name: v })} />
        <TextInput style={styles.input} placeholder="E-posta" autoCapitalize="none" value={stock.email} onChangeText={v => setStock({ ...stock, email: v })} />
        <TextInput style={styles.input} placeholder="Ürün ID" autoCapitalize="none" value={stock.productId} onChangeText={v => setStock({ ...stock, productId: v })} />
        <Button title="Bildir" onPress={submitStock} />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  wrap: { padding: 20, gap: 8 },
  h1: { fontSize: 24, fontWeight: '600', marginBottom: 8 },
  h2: { fontSize: 18, fontWeight: '600', marginTop: 20, marginBottom: 8 },
  card: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#eee' },
  cardTitle: { fontSize: 15 },
  muted: { color: '#777', fontSize: 13 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 6, padding: 10, marginBottom: 8 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  consent: { fontSize: 13, color: '#444' },
})
