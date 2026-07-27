import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function OfferDetailsScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={styles.root}>
      <LinearGradient colors={['#025F86', '#0E7FB0']} style={[styles.header, { paddingTop: insets.top + 14 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Special Offers</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>
      <View style={styles.body}>
        <Text style={styles.icon}>🎁</Text>
        <Text style={styles.title}>Special Offers</Text>
        <Text style={styles.sub}>Coming Soon</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F4F8FB' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingBottom: 14,
  },
  backBtn: { width: 40, alignItems: 'flex-start' },
  backIcon: { fontSize: 32, color: '#fff', lineHeight: 36 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#fff' },
  body: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  icon: { fontSize: 56, marginBottom: 12 },
  title: { fontSize: 22, fontWeight: '700', color: '#025F86', marginBottom: 6 },
  sub: { fontSize: 15, color: '#9CA3AF' },
});
