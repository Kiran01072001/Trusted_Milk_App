import React, { useState, useMemo } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  Dimensions, Image, TextInput, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ALL_PRODUCTS, PRODUCT_CATEGORIES } from '../../data/homeData';
import { useCart } from '../../context/CartContext';

const { width } = Dimensions.get('window');
const H_PAD = 16;
const CARD_W = (width - H_PAD * 2 - 12) / 2;
const TAB_BAR_SPACE = 16;
const CART_HEIGHT = 66;
const IMG_RATIO = 1857 / 847;  // same ratio as home header — adjust if products_header differs

const C = {
  primary: '#025F86',
  primary2: '#0D7EAA',
  white: '#FFFFFF',
  text: '#162536',
  sub: '#718096',
  line: '#E8EEF3',
  green: '#16A34A',
  pale: '#F6FAFC',
};

const shadow = {
  shadowColor: '#102A3D',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.09,
  shadowRadius: 10,
  elevation: 5,
};

// Header
function Header({ topInset, onMenuPress, onBellPress }) {
  const imgH = Math.round(width / IMG_RATIO);
  const headerHeight = topInset + imgH;

  return (
    <View style={{ height: headerHeight, overflow: 'hidden' }}>
      <Image
        source={require('../../../assets/headers/products_header.png')}
        style={{ position: 'absolute', top: 0, left: 0, width, height: headerHeight }}
        resizeMode="stretch"
      />
      {/* Single row: menu | title+subtitle | bell */}
      <View style={[styles.headerTop, { paddingTop: topInset + 14 }]}>
        <TouchableOpacity onPress={onMenuPress} style={styles.roundIconBtn} activeOpacity={0.8}>
          <View style={styles.hamburger}>
            <View style={styles.hLine} />
            <View style={[styles.hLine, { width: 16 }]} />
            <View style={styles.hLine} />
          </View>
        </TouchableOpacity>
        <View style={styles.headerCopy}>
          <Text style={styles.headerTitle}>Products</Text>
          <Text style={styles.headerSub} numberOfLines={1}>Fresh dairy products delivered to your doorstep</Text>
        </View>
        <TouchableOpacity onPress={onBellPress} style={styles.roundIconBtn} activeOpacity={0.8}>
          <Text style={styles.headerIcon}>{'\uD83D\uDD14'}</Text>
          <View style={styles.badge}><Text style={styles.badgeTxt}>3</Text></View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Search Bar
function SearchBar({ value, onChange }) {
  return (
    <View style={styles.searchBox}>
      <Text style={styles.searchIcon}>{'\uD83D\uDD0D'}</Text>
      <TextInput
        style={styles.searchInput}
        placeholder="Search milk, curd, paneer..."
        placeholderTextColor={C.sub}
        value={value}
        onChangeText={onChange}
      />
    </View>
  );
}

// Category Chips
function CategoryChips({ active, onSelect }) {
  return (
    <FlatList
      data={PRODUCT_CATEGORIES}
      horizontal
      showsHorizontalScrollIndicator={false}
      keyExtractor={item => item.id}
      contentContainerStyle={styles.chipList}
      renderItem={({ item }) => {
        const isActive = active === item.id;
        return (
          <TouchableOpacity
            style={[styles.chip, isActive && styles.chipActive]}
            onPress={() => onSelect(item.id)}
            activeOpacity={0.8}
          >
            <Text style={[styles.chipTxt, isActive && styles.chipTxtActive]}>{item.name}</Text>
          </TouchableOpacity>
        );
      }}
    />
  );
}

// Product Card
function ProductCard({ item, onPress }) {
  const { cart, updateCart } = useCart();
  const [selectedVariant, setSelectedVariant] = useState(0);
  const currentPrice = item.variants[selectedVariant]?.price ?? item.price;
  const qty = cart[item.id]?.qty || 0;

  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.92} onPress={onPress}>
      <View style={styles.cardImageBox}>
        <Image source={item.image} style={styles.cardImg} resizeMode="contain" />
      </View>

      <Text style={styles.cardName} numberOfLines={1}>{item.name}</Text>
      <Text style={styles.cardDesc} numberOfLines={1}>{item.unit} {'\u2022'} {'\u20B9'}{item.variants[0].price}/{item.variants[0].label}</Text>

      <View style={styles.variantRow}>
        {item.variants.map((v, i) => (
          <TouchableOpacity
            key={v.label}
            style={[styles.variantChip, selectedVariant === i && styles.variantChipActive]}
            onPress={e => { e.stopPropagation?.(); setSelectedVariant(i); }}
            activeOpacity={0.8}
          >
            <Text style={[styles.variantTxt, selectedVariant === i && styles.variantTxtActive]}>{v.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.cardBottom}>
        <Text style={styles.cardPrice}>{'\u20B9'}{currentPrice}</Text>
        {qty === 0 ? (
          <TouchableOpacity style={styles.addBtn} onPress={() => updateCart(item.id, 1)} activeOpacity={0.8}>
            <Text style={styles.addBtnTxt}>Add</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.qtyRow}>
            <TouchableOpacity style={styles.qtyBtn} onPress={() => updateCart(item.id, -1)}>
              <Text style={styles.qtyBtnTxt}>{'\u2212'}</Text>
            </TouchableOpacity>
            <Text style={styles.qtyNum}>{qty}</Text>
            <TouchableOpacity style={styles.qtyBtn} onPress={() => updateCart(item.id, 1)}>
              <Text style={styles.qtyBtnTxt}>+</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

// Floating Cart Bar
function FloatingCartBar({ bottomInset, onPress }) {
  const { totalItems, totalAmt, saving } = useCart();
  if (totalItems === 0) return null;
  return (
    <TouchableOpacity
      style={[styles.cartBar, { bottom: TAB_BAR_SPACE + bottomInset }]}
      onPress={onPress}
      activeOpacity={0.92}
    >
      <View style={styles.cartLeft}>
        <Text style={styles.cartIcon}>{'\uD83D\uDED2'}</Text>
        <View>
          <Text style={styles.cartItems}>{totalItems} {totalItems === 1 ? 'Item' : 'Items'} {'\u2022'} {'\u20B9'}{totalAmt}</Text>
          <Text style={styles.cartSaving}>You are saving {'\u20B9'}{saving}</Text>
        </View>
      </View>
      <View style={styles.cartBtn}><Text style={styles.cartBtnTxt}>View Cart</Text></View>
    </TouchableOpacity>
  );
}

// Main Screen
export default function ProductListScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const filter = route?.params?.filter ?? 'ALL_PRODUCTS';

  const [activeCategory, setActiveCategory] = useState('all');
  const [search, setSearch] = useState('');

  const { updateCart } = useCart();

  // Reset category/search when filter changes
  React.useEffect(() => {
    setActiveCategory('all');
    setSearch('');
  }, [filter]);

  const TODAYS_IDS = ['p1', 'p2', 'p3', 'p4'];
  const TOMORROWS_IDS = ['p1', 'p5', 'p7', 'p9', 'p10'];

  const baseList = useMemo(() => {
    if (filter === 'TODAYS_PRODUCTS') return ALL_PRODUCTS.filter(p => TODAYS_IDS.includes(p.id));
    if (filter === 'TOMORROWS_PRODUCTS') return ALL_PRODUCTS.filter(p => TOMORROWS_IDS.includes(p.id));
    return ALL_PRODUCTS;
  }, [filter]);

  const displayed = useMemo(() => {
    let list = baseList;
    if (activeCategory !== 'all') list = list.filter(p => p.category === activeCategory);
    if (search.trim()) list = list.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
    return list;
  }, [baseList, activeCategory, search]);

  return (
    <View style={styles.root}>
      <Header
        topInset={insets.top}
        onMenuPress={() => {}}
        onBellPress={() => {}}
      />

      <View style={styles.stickyBar}>
        <SearchBar value={search} onChange={setSearch} />
        <CategoryChips active={activeCategory} onSelect={setActiveCategory} />
      </View>

      <FlatList
        data={displayed}
        keyExtractor={item => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={[
          styles.grid,
          { paddingBottom: TAB_BAR_SPACE + CART_HEIGHT + 24 },
        ]}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <ProductCard
            item={item}
            onPress={() => navigation.navigate('ProductDetailsScreen', { product: item })}
          />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>{'\uD83E\uDD5B'}</Text>
            <Text style={styles.emptyTxt}>No products found</Text>
          </View>
        }
      />

      <FloatingCartBar
        bottomInset={insets.bottom}
        onPress={() => navigation.navigate('Cart')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.white },

// Header styles
  header: {},
  headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18 },
  headerCopy: { flex: 1, paddingHorizontal: 12 },
  headerTitle: { color: C.white, fontSize: 20, fontWeight: '900', lineHeight: 24 },
  headerSub: { color: 'rgba(255,255,255,0.85)', fontSize: 10, fontWeight: '600', marginTop: 2 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  roundIconBtn: {
    width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.16)', position: 'relative',
  },
  hamburger: { width: 22, gap: 5 },
  hLine: { width: 22, height: 2.5, borderRadius: 2, backgroundColor: C.white },
  headerIcon: { fontSize: 19, color: C.white },
  badge: {
    position: 'absolute', top: -3, right: -2, minWidth: 18, height: 18, borderRadius: 9,
    alignItems: 'center', justifyContent: 'center', backgroundColor: '#EF4444', borderWidth: 1.5, borderColor: C.white,
  },
  badgeTxt: { color: C.white, fontSize: 10, fontWeight: '800' },

  // Sticky bar
  stickyBar: { backgroundColor: C.white, paddingTop: 12, paddingBottom: 4, zIndex: 10 },

  // Search
  searchBox: {
    marginHorizontal: H_PAD, height: 46, borderRadius: 23, backgroundColor: C.pale,
    borderWidth: 1, borderColor: C.line, paddingHorizontal: 14, marginBottom: 10,
    flexDirection: 'row', alignItems: 'center',
  },
  searchIcon: { fontSize: 15, marginRight: 8 },
  searchInput: { flex: 1, fontSize: 13.5, color: C.text, paddingVertical: Platform.OS === 'ios' ? 10 : 4 },

  // Category chips
  chipList: { paddingHorizontal: H_PAD, gap: 8, paddingBottom: 4 },
  chip: {
    paddingHorizontal: 16, height: 32, borderRadius: 16, borderWidth: 1.5,
    borderColor: C.primary, alignItems: 'center', justifyContent: 'center', backgroundColor: C.white,
  },
  chipActive: { backgroundColor: C.green, borderColor: C.green },
  chipTxt: { fontSize: 12.5, fontWeight: '700', color: C.primary },
  chipTxtActive: { color: C.white },

  // Grid
  grid: { paddingHorizontal: H_PAD, paddingTop: 12 },
  row: { justifyContent: 'space-between', marginBottom: 12 },

  // Product card
  card: {
    width: CARD_W, height: 244, borderRadius: 16, backgroundColor: C.white,
    padding: 11, borderWidth: 1, borderColor: '#F1F5F8', ...shadow,
  },
  cardImageBox: { width: '100%', height: 92, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  cardImg: { width: '100%', height: '100%' },
  cardName: { fontSize: 13, fontWeight: '900', color: C.text, marginBottom: 2 },
  cardDesc: { fontSize: 10.5, color: C.sub, lineHeight: 14, marginBottom: 7 },
  variantRow: { minHeight: 44, flexDirection: 'row', gap: 5, marginBottom: 8, flexWrap: 'wrap', alignContent: 'flex-start' },
  variantChip: {
    paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6,
    backgroundColor: '#EFF8FC', borderWidth: 1, borderColor: '#C8E8F5',
  },
  variantChipActive: { backgroundColor: C.primary, borderColor: C.primary },
  variantTxt: { fontSize: 9.5, color: C.primary, fontWeight: '700' },
  variantTxtActive: { color: C.white },
  cardBottom: { height: 32, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' },
  cardPrice: { flex: 1, fontSize: 15, fontWeight: '900', color: C.text },
  addBtn: {
    width: 62, height: 30, borderRadius: 15,
    backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center',
  },
  addBtnTxt: { color: C.white, fontSize: 12, fontWeight: '800' },
  qtyRow: { width: 86, height: 30, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  qtyBtn: {
    width: 26, height: 26, borderRadius: 13,
    backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center',
  },
  qtyBtnTxt: { color: C.white, fontSize: 15, fontWeight: '900' },
  qtyNum: { minWidth: 22, textAlign: 'center', fontSize: 13, fontWeight: '900', color: C.text },

  // Empty
  empty: { alignItems: 'center', marginTop: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTxt: { fontSize: 15, color: C.sub, fontWeight: '700' },

  // Cart bar
  cartBar: {
    position: 'absolute', left: H_PAD, right: H_PAD, height: CART_HEIGHT, borderRadius: 18,
    backgroundColor: C.primary, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', paddingHorizontal: 14, zIndex: 40,
    shadowColor: '#092B3F', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.24, shadowRadius: 18, elevation: 18,
  },
  cartLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  cartIcon: { fontSize: 22 },
  cartItems: { color: C.white, fontSize: 13.5, fontWeight: '900' },
  cartSaving: { color: 'rgba(255,255,255,0.82)', fontSize: 11, fontWeight: '600', marginTop: 1 },
  cartBtn: { height: 36, borderRadius: 18, paddingHorizontal: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: C.white },
  cartBtnTxt: { color: C.primary, fontSize: 12.5, fontWeight: '900' },
});



