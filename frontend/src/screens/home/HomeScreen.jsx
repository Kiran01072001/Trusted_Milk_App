import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, FlatList,
  StyleSheet, Dimensions, Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LottieView from 'lottie-react-native';
import { useAddress } from '../../context/AddressContext';
import { useCart } from '../../context/CartContext';
import { CATEGORIES, TODAY_PRODUCTS, TOMORROW_PRODUCTS, TRUST_BADGES } from '../../data/homeData';

const { width } = Dimensions.get('window');
const H_PAD = 16;
const PRODUCT_W = Math.min(148, (width - H_PAD * 2 - 18) / 2.25);
const CART_HEIGHT = 66;
const IMG_RATIO = 1857 / 847;
const ADDR_CARD_H = 54;
const ADDR_OVERLAP = 44;

const C = {
  primary: '#025F86',
  primary2: '#0D7EAA',
  white: '#FFFFFF',
  text: '#162536',
  sub: '#718096',
  line: '#E8EEF3',
  green: '#16A34A',
  mint: '#F2FBF3',
  pale: '#F6FAFC',
};

const cardShadow = {
  shadowColor: '#102A3D',
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.06,
  shadowRadius: 4,
  elevation: 2,
};

// ─── Header ───────────────────────────────────────────────────────────────────
function Header({ topInset, onAddressPress }) {
  const imgH = Math.round(width / IMG_RATIO);
  const headerHeight = topInset + imgH;

  return (
    <View style={{ height: headerHeight + ADDR_OVERLAP }}>
      <Image
        source={require('../../../assets/headers/home_header.png')}
        style={{ position: 'absolute', top: 0, left: 0, width, height: headerHeight }}
        resizeMode="stretch"
      />
      <View style={s.addrWrap}>
        <TouchableOpacity style={s.addrCard} onPress={onAddressPress} activeOpacity={0.88}>
          <View style={s.addrIconCircle}><Text style={s.addrPinIcon}>{'\uD83D\uDCCD'}</Text></View>
          <AddressBody />
          <Text style={s.addrChevron}>{'\u203A'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function AddressBody() {
  const { address } = useAddress();
  return (
    <View style={s.addrBody}>
      <Text style={s.addrLabel}>DELIVER TO</Text>
      <Text style={s.addrText} numberOfLines={1}>{address}</Text>
    </View>
  );
}

// ─── Delivery Cards ───────────────────────────────────────────────────────────
function DeliveryCards() {
  const cards = [
    { icon: '\u2600\uFE0F', title: "Today's\nDelivery", value: '5:00 AM' },
    { icon: '\uD83D\uDCC5', title: "Tomorrow's\nDelivery", value: '5:00 AM' },
    { icon: '\u21BB', title: 'Subscription', value: 'Manage' },
  ];
  return (
    <View style={s.dcRow}>
      {cards.map(item => (
        <TouchableOpacity key={item.title} style={s.dcCard} activeOpacity={0.86}>
          <Text style={s.dcIcon}>{item.icon}</Text>
          <Text style={s.dcTitle}>{item.title}</Text>
          <Text style={s.dcVal}>{item.value}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

// ─── Subscription Card ────────────────────────────────────────────────────────
function SubscriptionCard() {
  return (
    <TouchableOpacity style={s.subCard} activeOpacity={0.9}>
      <View style={s.subLeft}>
        <Text style={s.subHeading}>My Daily Subscription</Text>
        <Text style={s.subName}>Buffalo Milk</Text>
        <Text style={s.subDetail}>2 Litres {'\u2022'} Daily {'\u2022'} 5:00 AM</Text>
        <View style={s.subFooter}>
          <View style={s.activePill}><Text style={s.activeTxt}>Active</Text></View>
          <Text style={s.subLink}>Manage {'\u203A'}</Text>
        </View>
      </View>
      <Image source={require('../../../assets/products/Milk.png')} style={s.subImg} resizeMode="contain" />
    </TouchableOpacity>
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────
function SectionHeader({ title, showSeeAll = true, onSeeAll }) {
  return (
    <View style={s.secHeader}>
      <Text style={s.secTitle}>{title}</Text>
      {showSeeAll && (
        <TouchableOpacity activeOpacity={0.75} onPress={onSeeAll}>
          <Text style={s.seeAll}>See All</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ─── Categories ───────────────────────────────────────────────────────────────
function Categories({ navigation }) {
  const [active, setActive] = useState('1');
  return (
    <View style={s.section}>
      <SectionHeader
        title="Categories"
        onSeeAll={() => navigation.navigate('ProductListScreen', { filter: 'ALL_PRODUCTS' })}
      />
      <FlatList
        data={CATEGORIES}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={item => item.id}
        contentContainerStyle={s.categoryList}
        renderItem={({ item }) => (
          <TouchableOpacity style={s.catItem} onPress={() => setActive(item.id)} activeOpacity={0.84}>
            <View style={[s.catCircle, active === item.id && s.catCircleActive]}>
              {item.image
                ? <Image source={item.image} style={s.catImg} resizeMode="contain" />
                : <Text style={s.moreIcon}>{'\uFF0B'}</Text>}
            </View>
            <Text style={[s.catLabel, active === item.id && s.catLabelActive]} numberOfLines={1}>
              {item.name}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

// ─── Product Card ─────────────────────────────────────────────────────────────
function ProductCard({ item }) {
  const { cart, updateCart } = useCart();
  const qty = cart[item.id]?.qty || 0;

  if (!item.price && item.name.startsWith('+')) {
    return (
      <TouchableOpacity style={[s.prodCard, s.moreCard]} activeOpacity={0.86}>
        <Text style={s.moreTxt}>{item.name}</Text>
        <Text style={s.moreSubTxt}>View all</Text>
      </TouchableOpacity>
    );
  }

  return (
    <View style={s.prodCard}>
      <View style={s.prodImageBox}>
        <Image source={item.image} style={s.prodImg} resizeMode="contain" />
      </View>
      <Text style={s.prodName} numberOfLines={1}>{item.name}</Text>
      <Text style={s.prodQty}>{item.qty}</Text>
      <View style={s.prodBottom}>
        <Text style={s.prodPrice}>{'\u20B9'}{item.price}</Text>
        {qty === 0 ? (
          <TouchableOpacity style={s.addBtn} onPress={() => updateCart(item.id, 1)} activeOpacity={0.8}>
            <Text style={s.addBtnTxt}>+</Text>
          </TouchableOpacity>
        ) : (
          <View style={s.qtyRow}>
            <TouchableOpacity style={s.qtyBtn} onPress={() => updateCart(item.id, -1)}>
              <Text style={s.qtyBtnTxt}>{'\u2212'}</Text>
            </TouchableOpacity>
            <Text style={s.qtyNum}>{qty}</Text>
            <TouchableOpacity style={s.qtyBtn} onPress={() => updateCart(item.id, 1)}>
              <Text style={s.qtyBtnTxt}>+</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

function ProductsSection({ title, data, onSeeAll }) {
  return (
    <View style={s.section}>
      <SectionHeader title={title} onSeeAll={onSeeAll} />
      <FlatList
        data={data}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={item => item.id}
        contentContainerStyle={s.productList}
        renderItem={({ item }) => <ProductCard item={item} />}
      />
    </View>
  );
}

// ─── Refer & Earn Banner ──────────────────────────────────────────────────────
function ReferEarnBanner({ onPress }) {
  return (
    <TouchableOpacity style={s.referWrap} onPress={onPress} activeOpacity={0.9}>
      <View style={s.referInner}>
        <LinearGradient
          colors={['#FFF6ED', '#FFE3CF']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={s.referGrad}
        >
          <LottieView
            source={require('../../../assets/animations/refer and earn button.json')}
            autoPlay loop style={s.referGiftAnim}
          />
          <View style={s.referTextWrap}>
            <Text style={s.referSub}>Invite friends and earn rewards</Text>
          </View>
          <LottieView
            source={require('../../../assets/animations/Share.json')}
            autoPlay loop style={s.shareAnim}
          />
        </LinearGradient>
      </View>
    </TouchableOpacity>
  );
}

// ─── Trust Badges ─────────────────────────────────────────────────────────────
function TrustBadges() {
  return (
    <FlatList
      data={TRUST_BADGES}
      horizontal
      showsHorizontalScrollIndicator={false}
      keyExtractor={item => item.id}
      contentContainerStyle={s.trustList}
      renderItem={({ item }) => (
        <View style={s.trustCard}>
          <View style={s.trustIconBox}><Text style={s.trustIcon}>{item.icon}</Text></View>
          <Text style={s.trustLabel} numberOfLines={2}>{item.label}</Text>
        </View>
      )}
    />
  );
}

// ─── Floating Cart Bar ────────────────────────────────────────────────────────
function FloatingCartBar({ onPress }) {
  const { totalItems, totalAmt, saving } = useCart();
  if (totalItems === 0) return null;
  return (
    <TouchableOpacity style={s.cartBar} onPress={onPress} activeOpacity={0.92}>
      <View style={s.cartLeft}>
        <Text style={s.cartIcon}>{'\uD83D\uDED2'}</Text>
        <View>
          <Text style={s.cartItems}>
            {totalItems} {totalItems === 1 ? 'Item' : 'Items'} {'\u2022'} {'\u20B9'}{totalAmt}
          </Text>
          <Text style={s.cartSaving}>You are saving {'\u20B9'}{saving}</Text>
        </View>
      </View>
      <View style={s.cartBtn}><Text style={s.cartBtnTxt}>View Cart</Text></View>
    </TouchableOpacity>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function HomeScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { totalItems } = useCart();

  return (
    <View style={s.root}>
      <ScrollView
        style={s.scroll}
        contentContainerStyle={[
          s.scrollContent,
          { paddingBottom: CART_HEIGHT + 24 + (totalItems > 0 ? CART_HEIGHT : 0) },
        ]}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <Header
          topInset={insets.top}
          onAddressPress={() => navigation.navigate('LocationSelectionScreen')}
        />

        {/* Single continuous white canvas starts here */}
        <View style={s.body}>
          <DeliveryCards />
          <SubscriptionCard />
          <Categories navigation={navigation} />
          <ProductsSection
            title="Today's Fresh Products"
            data={TODAY_PRODUCTS}
            onSeeAll={() => navigation.navigate('ProductListScreen', { filter: 'TODAYS_PRODUCTS' })}
          />

          <TouchableOpacity
            style={s.bannerWrap}
            onPress={() => navigation.navigate('OfferDetailsScreen')}
            activeOpacity={0.9}
          >
            <Image
              source={require('../../../assets/banners/special_offer_banner.png')}
              style={s.bannerImg}
              resizeMode="cover"
            />
          </TouchableOpacity>

          <ReferEarnBanner onPress={() => navigation.navigate('ReferEarnScreen')} />

          <ProductsSection
            title="Tomorrow's Fresh Products"
            data={TOMORROW_PRODUCTS}
            onSeeAll={() => navigation.navigate('ProductListScreen', { filter: 'TOMORROWS_PRODUCTS' })}
          />

          <View style={[s.section, { marginBottom: 48 }]}>
            <SectionHeader title="Why Choose Us?" showSeeAll={false} />
            <TrustBadges />
          </View>
        </View>
      </ScrollView>

      {/* Cart bar sits inside the layout flow above the tab bar */}
      <FloatingCartBar onPress={() => navigation.navigate('Cart')} />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.white },
  scroll: { flex: 1, backgroundColor: C.white },
  scrollContent: { backgroundColor: C.white, flexGrow: 1, paddingBottom: 16 },

  // Header
  addrWrap: { position: 'absolute', left: 18, bottom: 0, width: width * 0.57, zIndex: 8 },
  addrCard: {
    height: ADDR_CARD_H, borderRadius: 14, paddingHorizontal: 12, backgroundColor: C.white,
    flexDirection: 'row', alignItems: 'center', ...cardShadow,
  },
  addrIconCircle: {
    width: 28, height: 28, borderRadius: 14, backgroundColor: '#E8F7FC',
    alignItems: 'center', justifyContent: 'center', marginRight: 8,
  },
  addrPinIcon: { fontSize: 13 },
  addrBody: { flex: 1, overflow: 'hidden' },
  addrLabel: { fontSize: 8, color: C.sub, fontWeight: '800', letterSpacing: 0.8, marginBottom: 1 },
  addrText: { fontSize: 11.5, color: C.text, fontWeight: '800', flexShrink: 1 },
  addrChevron: { fontSize: 20, color: C.primary, fontWeight: '700', marginLeft: 4 },

  // Body — single continuous white canvas
  body: { backgroundColor: C.white, paddingTop: ADDR_CARD_H / 2 + 10 },

  // Delivery cards — full-width row, flex:1 per card = tall rectangles
  dcRow: { flexDirection: 'row', gap: 10, marginHorizontal: H_PAD, marginBottom: 20 },
  dcCard: {
    flex: 1, height: 88, borderRadius: 14, backgroundColor: C.white,
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6, paddingVertical: 10,
    borderWidth: 1, borderColor: '#F1F5F8', ...cardShadow,
  },
  dcIcon: { fontSize: 20, marginBottom: 5 },
  dcTitle: { fontSize: 10, lineHeight: 13, color: C.text, fontWeight: '700', textAlign: 'center' },
  dcVal: { fontSize: 11, color: C.primary, fontWeight: '900', marginTop: 4 },

  // Subscription card — full content width
  subCard: {
    minHeight: 100, marginHorizontal: H_PAD, marginBottom: 20,
    borderRadius: 16, backgroundColor: C.mint, flexDirection: 'row', alignItems: 'center',
    paddingLeft: 16, paddingVertical: 12, borderWidth: 1, borderColor: '#DFF4E2', ...cardShadow,
  },
  subLeft: { flex: 1 },
  subHeading: { fontSize: 11, color: '#4C7F54', fontWeight: '800', marginBottom: 4 },
  subName: { fontSize: 19, color: C.text, fontWeight: '900', marginBottom: 3 },
  subDetail: { fontSize: 11, color: '#5D7663', fontWeight: '600', marginBottom: 8 },
  subFooter: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  activePill: { backgroundColor: C.green, borderRadius: 13, paddingHorizontal: 10, paddingVertical: 3 },
  activeTxt: { color: C.white, fontSize: 10, fontWeight: '800' },
  subLink: { color: C.primary, fontSize: 12, fontWeight: '900' },
  subImg: { width: 70, height: 70, marginRight: 8 },

  section: { marginBottom: 36 },
  secHeader: {
    paddingHorizontal: H_PAD, marginBottom: 13,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  secTitle: { fontSize: 17, color: C.text, fontWeight: '900' },
  seeAll: { fontSize: 13, color: C.primary2, fontWeight: '800' },

  // Categories
  categoryList: { paddingHorizontal: H_PAD, gap: 15 },
  catItem: { width: 76, alignItems: 'center' },
  catCircle: {
    width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center',
    backgroundColor: C.white, borderWidth: 1, borderColor: C.line, overflow: 'hidden', ...cardShadow,
  },
  catCircleActive: { borderColor: C.primary2, borderWidth: 2 },
  catImg: { width: 57, height: 57 },
  catLabel: { marginTop: 8, fontSize: 12, color: C.text, fontWeight: '700', textAlign: 'center' },
  catLabelActive: { color: C.primary, fontWeight: '900' },
  moreIcon: { fontSize: 24, color: C.primary, fontWeight: '800' },

  // Product cards
  productList: { paddingHorizontal: H_PAD, gap: 12 },
  prodCard: {
    width: PRODUCT_W, height: 184, borderRadius: 16, padding: 11, backgroundColor: C.white,
    ...cardShadow,
  },
  moreCard: { alignItems: 'center', justifyContent: 'center', backgroundColor: '#EFF8FC', borderColor: '#CDECF7' },
  moreTxt: { fontSize: 20, color: C.primary, fontWeight: '900' },
  moreSubTxt: { fontSize: 12, color: C.sub, fontWeight: '700', marginTop: 4 },
  prodImageBox: { width: '100%', height: 88, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  prodImg: { width: '100%', height: '100%' },
  prodName: { color: C.text, fontSize: 13, fontWeight: '900', marginBottom: 3 },
  prodQty: { color: C.sub, fontSize: 11, fontWeight: '600', marginBottom: 8 },
  prodBottom: { height: 32, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' },
  prodPrice: { flex: 1, color: C.text, fontSize: 15, fontWeight: '900' },
  addBtn: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: C.primary },
  addBtnTxt: { color: C.white, fontSize: 24, lineHeight: 29, fontWeight: '500' },
  qtyRow: { width: 82, height: 32, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  qtyBtn: { width: 25, height: 25, borderRadius: 13, alignItems: 'center', justifyContent: 'center', backgroundColor: C.primary },
  qtyBtnTxt: { color: C.white, fontSize: 16, fontWeight: '900' },
  qtyNum: { minWidth: 22, textAlign: 'center', color: C.text, fontSize: 13, fontWeight: '900' },

  bannerWrap: {
    height: 190, borderRadius: 18, overflow: 'hidden',
    marginHorizontal: H_PAD, marginBottom: 36, backgroundColor: '#FFF7ED',
  },
  bannerImg: { width: '100%', height: '100%' },

  referWrap: {
    marginHorizontal: H_PAD, marginBottom: 36, borderRadius: 18, overflow: 'hidden',
    backgroundColor: '#FFF6ED',
  },
  referInner: { height: 92, backgroundColor: '#FFF6ED' },
  referGrad: { flex: 1, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12 },
  referGiftAnim: { width: 132, height: 82 },
  referTextWrap: { flex: 1, alignSelf: 'stretch', justifyContent: 'flex-end', paddingBottom: 16, paddingHorizontal: 6 },
  referSub: { color: '#75523F', fontSize: 12, lineHeight: 16, fontWeight: '800' },
  shareAnim: { width: 66, height: 66 },

  // Trust badges
  trustList: { paddingHorizontal: H_PAD, gap: 9 },
  trustCard: {
    width: 98, minHeight: 72, borderRadius: 15, backgroundColor: C.white, paddingHorizontal: 8,
    paddingVertical: 8, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: '#F1F5F8', ...cardShadow,
  },
  trustIconBox: {
    width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#F0FDF4', marginBottom: 7,
  },
  trustIcon: { fontSize: 16 },
  trustLabel: { color: C.text, fontSize: 9, lineHeight: 12, fontWeight: '800', textAlign: 'center' },

  // Floating cart bar — in-flow, not absolute, sits above tab bar naturally
  cartBar: {
    marginHorizontal: H_PAD, marginBottom: 10, height: CART_HEIGHT, borderRadius: 18,
    backgroundColor: C.primary, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', paddingHorizontal: 14,
    shadowColor: '#092B3F', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2, shadowRadius: 12, elevation: 10,
  },
  cartLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  cartIcon: { fontSize: 23 },
  cartItems: { color: C.white, fontSize: 14, fontWeight: '900' },
  cartSaving: { color: 'rgba(255,255,255,0.82)', fontSize: 11, fontWeight: '600', marginTop: 2 },
  cartBtn: {
    height: 38, borderRadius: 19, paddingHorizontal: 15,
    alignItems: 'center', justifyContent: 'center', backgroundColor: C.white,
  },
  cartBtnTxt: { color: C.primary, fontSize: 13, fontWeight: '900' },
});
