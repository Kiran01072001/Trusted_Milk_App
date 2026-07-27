import React, { useState, useRef, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  StyleSheet, ActivityIndicator, Alert, Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import { useAddress } from '../../context/AddressContext';
import MapView, { Marker } from 'react-native-maps';

const C = {
  primary: '#025F86',
  primary2: '#0D7EAA',
  white: '#fff',
  bg: '#F4F8FB',
  text: '#1A2B3C',
  sub: '#6B7280',
  border: '#E5E7EB',
};

// Default coords: Hyderabad
const DEFAULT_LAT = 17.385;
const DEFAULT_LNG = 78.4867;


// ─── Branded Header ───────────────────────────────────────────────────────────
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
        <Text style={styles.pageTitle}>Select Location</Text>
      </View>
      <View style={{ width: 40 }} />
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function LocationSelectionScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { setAddress } = useAddress();
  const mapRef = useRef(null);

  const [search, setSearch] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [mapCoords, setMapCoords] = useState({ lat: DEFAULT_LAT, lng: DEFAULT_LNG });
  const [selectedLabel, setSelectedLabel] = useState('');
  const [showMap, setShowMap] = useState(false);
  const searchTimer = useRef(null);

  // ── Nominatim autocomplete ──────────────────────────────────────────────────
  const fetchSuggestions = useCallback((text) => {
    clearTimeout(searchTimer.current);
    if (text.trim().length < 2) { setSuggestions([]); return; }
    searchTimer.current = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(text)}&format=json&addressdetails=1&limit=8&countrycodes=in`;
        const res = await fetch(url, { headers: { 'Accept-Language': 'en', 'User-Agent': 'TrustedMilkApp/1.0' } });
        const data = await res.json();
        setSuggestions(data);
      } catch {
        setSuggestions([]);
      }
      setSearchLoading(false);
    }, 400);
  }, []);

  const handleSearchChange = (text) => {
    setSearch(text);
    fetchSuggestions(text);
  };

  // ── Select a suggestion ─────────────────────────────────────────────────────
  const handleSelectSuggestion = (item) => {
    const lat = parseFloat(item.lat);
    const lng = parseFloat(item.lon);
    const label = item.display_name;
    setSearch(label);
    setSuggestions([]);
    setSelectedLabel(label);
    setMapCoords({ lat, lng });
    setShowMap(true);
    mapRef.current?.animateToRegion({ latitude: lat, longitude: lng, latitudeDelta: 0.01, longitudeDelta: 0.01 });
  };

  // ── GPS ─────────────────────────────────────────────────────────────────────
  const handleGPS = async () => {
    setGpsLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required.');
        setGpsLoading(false);
        return;
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const { latitude: lat, longitude: lng } = loc.coords;
      const [geo] = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
      const label = [geo.name, geo.street, geo.district, geo.city, geo.region]
        .filter(Boolean).join(', ');
      setSelectedLabel(label);
      setSearch(label);
      setSuggestions([]);
      setMapCoords({ lat, lng });
      setShowMap(true);
      mapRef.current?.animateToRegion({ latitude: lat, longitude: lng, latitudeDelta: 0.01, longitudeDelta: 0.01 });
    } catch {
      Alert.alert('Error', 'Could not detect location. Please try again.');
    }
    setGpsLoading(false);
  };

  // ── Map marker drag ─────────────────────────────────────────────────────────
  const handleMarkerDrag = (e) => {
    const { latitude: lat, longitude: lng } = e.nativeEvent.coordinate;
    setMapCoords({ lat, lng });
  };

  // ── Confirm ─────────────────────────────────────────────────────────────────
  const handleConfirm = () => {
    if (!selectedLabel) {
      Alert.alert('Select a location', 'Please search or use GPS to pick a location.');
      return;
    }
    navigation.navigate('AddAddressScreen', {
      detectedAddress: selectedLabel,
      lat: mapCoords.lat,
      lng: mapCoords.lng,
    });
  };

  return (
    <View style={styles.root}>
      <BrandedHeader topInset={insets.top} onBack={() => navigation.goBack()} />

      <View style={styles.body}>
        {/* Search box */}
        <View style={styles.searchWrap}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search city, area, street, landmark..."
            placeholderTextColor={C.sub}
            value={search}
            onChangeText={handleSearchChange}
            autoCorrect={false}
          />
          {searchLoading && <ActivityIndicator size="small" color={C.primary} style={{ marginLeft: 6 }} />}
          {search.length > 0 && !searchLoading && (
            <TouchableOpacity onPress={() => { setSearch(''); setSuggestions([]); }} style={styles.clearBtn}>
              <Text style={styles.clearTxt}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Autocomplete suggestions */}
        {suggestions.length > 0 && (
          <View style={styles.suggestionsBox}>
            <FlatList
              data={suggestions}
              keyExtractor={(item) => item.place_id.toString()}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => {
                const a = item.address || {};
                const primary = a.amenity || a.building || a.road || a.neighbourhood || a.suburb || item.display_name.split(',')[0];
                const secondary = [a.suburb, a.city || a.town || a.village, a.state].filter(Boolean).join(', ');
                return (
                  <TouchableOpacity
                    style={styles.suggestionItem}
                    onPress={() => handleSelectSuggestion(item)}
                    activeOpacity={0.75}
                  >
                    <Text style={styles.suggestionPin}>📍</Text>
                    <View style={styles.suggestionText}>
                      <Text style={styles.suggestionPrimary} numberOfLines={1}>{primary}</Text>
                      {secondary ? <Text style={styles.suggestionSecondary} numberOfLines={1}>{secondary}</Text> : null}
                    </View>
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        )}

        {/* GPS button */}
        <TouchableOpacity style={styles.gpsCard} onPress={handleGPS} disabled={gpsLoading} activeOpacity={0.85}>
          <View style={styles.gpsLeft}>
            <Text style={styles.gpsIcon}>📍</Text>
            <View>
              <Text style={styles.gpsTitle}>Use Current Location</Text>
              <Text style={styles.gpsSub}>Detect via GPS</Text>
            </View>
          </View>
          {gpsLoading
            ? <ActivityIndicator color={C.primary} />
            : <Text style={styles.gpsArrow}>›</Text>}
        </TouchableOpacity>

        {/* Map */}
        {showMap && (
          <View style={styles.mapContainer}>
            <MapView
              ref={mapRef}
              style={styles.map}
              initialRegion={{
                latitude: mapCoords.lat,
                longitude: mapCoords.lng,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
            >
              <Marker
                coordinate={{ latitude: mapCoords.lat, longitude: mapCoords.lng }}
                draggable
                onDragEnd={handleMarkerDrag}
              />
            </MapView>
            <View style={styles.mapLabel}>
              <Text style={styles.mapLabelTxt} numberOfLines={2}>{selectedLabel}</Text>
            </View>
          </View>
        )}

        {/* Confirm button */}
        {selectedLabel !== '' && (
          <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirm} activeOpacity={0.88}>
            <Text style={styles.confirmBtnText}>Confirm Location  ›</Text>
          </TouchableOpacity>
        )}
      </View>
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

  // Body
  body: { flex: 1, padding: 14 },

  // Search
  searchWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: C.white, borderRadius: 12,
    paddingHorizontal: 12, paddingVertical: 10, marginBottom: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07, shadowRadius: 6, elevation: 3,
  },
  searchIcon: { fontSize: 15, marginRight: 8 },
  searchInput: { flex: 1, fontSize: 14, color: C.text },
  clearBtn: { padding: 4 },
  clearTxt: { fontSize: 13, color: C.sub },

  // Suggestions
  suggestionsBox: {
    backgroundColor: C.white, borderRadius: 12, maxHeight: 220,
    marginBottom: 8, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1, shadowRadius: 8, elevation: 6,
  },
  suggestionItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 11,
    borderBottomWidth: 1, borderBottomColor: '#F3F4F6',
  },
  suggestionPin: { fontSize: 16, marginRight: 10 },
  suggestionText: { flex: 1 },
  suggestionPrimary: { fontSize: 13, fontWeight: '700', color: C.text },
  suggestionSecondary: { fontSize: 11, color: C.sub, marginTop: 1 },

  // GPS
  gpsCard: {
    backgroundColor: C.white, borderRadius: 14, padding: 14,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderWidth: 1.5, borderColor: '#BFDBFE', marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07, shadowRadius: 6, elevation: 3,
  },
  gpsLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  gpsIcon: { fontSize: 26 },
  gpsTitle: { fontSize: 14, fontWeight: '700', color: C.text },
  gpsSub: { fontSize: 11, color: C.primary, marginTop: 2 },
  gpsArrow: { fontSize: 22, color: C.primary, fontWeight: '700' },

  // Map
  mapContainer: {
    height: 240, borderRadius: 16, overflow: 'hidden',
    marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1, shadowRadius: 8, elevation: 5,
  },
  map: { flex: 1 },
  mapLabel: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: 'rgba(2,95,134,0.88)', paddingHorizontal: 12, paddingVertical: 8,
  },
  mapLabelTxt: { color: C.white, fontSize: 12, fontWeight: '600' },

  // Confirm
  confirmBtn: {
    backgroundColor: C.primary, borderRadius: 12,
    paddingVertical: 14, alignItems: 'center',
    shadowColor: C.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 6,
  },
  confirmBtnText: { color: C.white, fontSize: 15, fontWeight: '800' },
});
