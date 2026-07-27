import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, Alert, Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAddress } from '../../context/AddressContext';

const C = {
  primary: '#025F86',
  white: '#fff',
  bg: '#F4F8FB',
  text: '#1A2B3C',
  sub: '#6B7280',
  border: '#E5E7EB',
};

const FIELDS = [
  { key: 'society', label: 'Apartment / Society Name', placeholder: 'e.g. Green Hills Apartments' },
  { key: 'tower', label: 'Tower / Block No', placeholder: 'e.g. Tower A' },
  { key: 'house', label: 'House / Plot No', placeholder: 'e.g. 123' },
  { key: 'floor', label: 'Floor', placeholder: 'e.g. 3rd Floor' },
  { key: 'street', label: 'Street, Area, Colony', placeholder: 'e.g. MG Road, Banjara Hills' },
  { key: 'landmark', label: 'Landmark', placeholder: 'e.g. Near City Mall' },
  { key: 'phone', label: 'Contact Number', placeholder: 'e.g. 9876543210', keyboardType: 'phone-pad' },
  { key: 'name', label: 'Contact Name', placeholder: 'e.g. Ravi Kumar' },
];

function BrandedHeader({ topInset, onBack }) {
  return (
    <View style={[styles.header, { paddingTop: topInset + 10 }]}>
      <TouchableOpacity onPress={onBack} style={styles.backBtn}>
        <Text style={styles.backIcon}>‹</Text>
      </TouchableOpacity>
      <View style={styles.headerCenter}>
        <Image
          source={require('../../../assets/icons/App Icon & Logo.jpeg')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.brandName}>Trusted Milk</Text>
        <Text style={styles.tagline}>Fresh | Pure | Hygienic</Text>
        <Text style={styles.pageTitle}>Add Address</Text>
      </View>
      <View style={{ width: 40 }} />
    </View>
  );
}

export default function AddAddressScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const { setAddress } = useAddress();
  const [form, setForm] = useState({
    society: route.params?.detectedAddress || '',
    tower: '', house: '', floor: '',
    street: '', landmark: '', phone: '', name: '',
  });

  const handleSave = async () => {
    if (!form.house || !form.street || !form.phone || !form.name) {
      Alert.alert('Required', 'Please fill House No, Street, Contact Number and Name.');
      return;
    }
    const label = `${form.house}, ${form.society || form.street}`;
    await AsyncStorage.setItem('savedAddress', label);
    setAddress(label);
    navigation.popToTop();
  };

  return (
    <View style={styles.root}>
      <BrandedHeader topInset={insets.top} onBack={() => navigation.goBack()} />

      <ScrollView
        contentContainerStyle={[styles.body, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {FIELDS.map(f => (
          <View key={f.key} style={styles.fieldWrap}>
            <Text style={styles.fieldLabel}>{f.label}</Text>
            <TextInput
              style={styles.input}
              placeholder={f.placeholder}
              placeholderTextColor={C.sub}
              value={form[f.key]}
              onChangeText={v => setForm(p => ({ ...p, [f.key]: v }))}
              keyboardType={f.keyboardType || 'default'}
            />
          </View>
        ))}

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.88}>
          <Text style={styles.saveBtnText}>💾  Save Address</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },

  // Header
  header: {
    backgroundColor: C.primary,
    paddingHorizontal: 16,
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  backBtn: { width: 40, paddingTop: 4 },
  backIcon: { fontSize: 32, color: C.white, lineHeight: 36 },
  headerCenter: { flex: 1, alignItems: 'center' },
  logo: { width: 52, height: 52, borderRadius: 12, marginBottom: 4 },
  brandName: { fontSize: 18, fontWeight: '900', color: C.white, letterSpacing: 0.5 },
  tagline: { fontSize: 11, color: 'rgba(255,255,255,0.82)', fontWeight: '600', letterSpacing: 0.8, marginTop: 1 },
  pageTitle: {
    marginTop: 6, fontSize: 13, fontWeight: '700', color: C.white,
    backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 14,
    paddingVertical: 4, borderRadius: 20,
  },

  // Form
  body: { padding: 16 },
  fieldWrap: { marginBottom: 14 },
  fieldLabel: {
    fontSize: 12, fontWeight: '700', color: C.sub,
    marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5,
  },
  input: {
    backgroundColor: C.white, borderRadius: 10, borderWidth: 1.5,
    borderColor: C.border, paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 14, color: C.text,
  },
  saveBtn: {
    backgroundColor: C.primary, borderRadius: 12,
    paddingVertical: 15, alignItems: 'center', marginTop: 10,
    shadowColor: C.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 6,
  },
  saveBtnText: { color: C.white, fontSize: 16, fontWeight: '800' },
});
