import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const C = { primary: '#025F86', white: '#FFFFFF', text: '#162536', sub: '#718096' };

export default function ProductDetailsScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const product = route?.params?.product;

  return (
    <View style={styles.root}>
      <TouchableOpacity
        style={[styles.backBtn, { marginTop: insets.top }]}
        onPress={() => navigation.goBack()}
        activeOpacity={0.8}
      >
        <Text style={styles.backTxt}>{'\u2190'} Back</Text>
      </TouchableOpacity>
      <ScrollView
        contentContainerStyle={[styles.body, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        {product?.image && (
          <Image source={product.image} style={styles.img} resizeMode="contain" />
        )}
        <Text style={styles.name}>{product?.name ?? 'Product Details'}</Text>
        <Text style={styles.desc}>{product?.desc ?? ''}</Text>
        <Text style={styles.price}>{'\u20B9'}{product?.price}</Text>
        <View style={styles.placeholder}>
          <Text style={styles.phTxt}>Full product details coming soon</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.white },
  backBtn: { paddingHorizontal: 18, paddingVertical: 12 },
  backTxt: { fontSize: 15, fontWeight: '800', color: C.primary },
  body: { alignItems: 'center', paddingHorizontal: 24 },
  img: { width: 180, height: 180, marginBottom: 16 },
  name: { fontSize: 22, fontWeight: '900', color: C.text, marginBottom: 8 },
  desc: { fontSize: 14, color: C.sub, textAlign: 'center', lineHeight: 20, marginBottom: 12 },
  price: { fontSize: 24, fontWeight: '900', color: C.primary, marginBottom: 24 },
  placeholder: { paddingVertical: 16, paddingHorizontal: 24, borderRadius: 12, backgroundColor: '#F6FAFC' },
  phTxt: { fontSize: 13, color: C.sub, fontWeight: '600' },
});
