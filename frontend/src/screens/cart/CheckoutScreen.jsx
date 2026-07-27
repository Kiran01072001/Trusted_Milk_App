import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function CheckoutScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={styles.root}>
      <TouchableOpacity
        style={[styles.back, { marginTop: insets.top }]}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backTxt}>{'← Back'}</Text>
      </TouchableOpacity>
      <View style={[styles.body, { paddingBottom: insets.bottom }]}>
        <Text style={styles.icon}>{'🧾'}</Text>
        <Text style={styles.title}>Checkout</Text>
        <Text style={styles.sub}>Payment integration coming soon</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FFFFFF' },
  back: { paddingHorizontal: 18, paddingVertical: 12 },
  backTxt: { fontSize: 15, fontWeight: '800', color: '#025F86' },
  body: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  icon: { fontSize: 52, marginBottom: 16 },
  title: { fontSize: 22, fontWeight: '900', color: '#162536', marginBottom: 8 },
  sub: { fontSize: 14, color: '#718096', fontWeight: '600' },
});
