import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Image,
  StyleSheet, Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import LottieView from 'lottie-react-native';

const { width } = Dimensions.get('window');

// ── Layout constants ──────────────────────────────────────────────────────────
const SIDE          = 16;                   // uniform left/right margin for all content
const INNER         = width - SIDE * 2;     // usable width inside the page
const HEADER_RATIO  = 1898 / 829;
const NAV_SPACE     = 90;
const OVERLAP       = 18;                   // how many px the white sheet rises over the header wave

// ── Colours ───────────────────────────────────────────────────────────────────
const C = {
  blue:      '#2196F3',
  blueDark:  '#025F86',
  green:     '#19A25B',
  greenDark: '#118345',
  white:     '#FFFFFF',
  bg:        '#FFFFFF',          // entire page is white — no grey gaps
  text:      '#172536',
  sub:       '#7A8899',
  line:      '#E4EBF2',
  palBlue:   '#EBF4FF',
  palGreen:  '#EAF9F1',
};

// ── Section separator ─────────────────────────────────────────────────────────
const ROW_SEP = { borderTopWidth: 1, borderTopColor: C.line };

// ── Fallback items ────────────────────────────────────────────────────────────
const FALLBACK = [
  { id:'f1', name:'Buffalo Milk', qty:2,
    selectedVariant:{ label:'2 Litre', price:100 },
    image: require('../../../assets/products/Milk.png') },
  { id:'f2', name:'Paneer', qty:1,
    selectedVariant:{ label:'500 gm', price:300 },
    image: require('../../../assets/products/Paneer.png') },
  { id:'f3', name:'Pot Curd', qty:2,
    selectedVariant:{ label:'500 gm', price:25 },
    image: require('../../../assets/products/Pot Curd.png') },
];

// ─────────────────────────────────────────────────────────────────────────────
//  HEADER  — blue gradient image + title row
// ─────────────────────────────────────────────────────────────────────────────
function Header({ topInset, onBack }) {
  const imgH = topInset + Math.round(width / HEADER_RATIO);
  return (
    <View style={[s.header, { height: imgH }]}>
      <Image
        source={require('../../../assets/headers/order_confirm.png')}
        style={[s.headerImg, { height: imgH }]}
        resizeMode="stretch"
      />
      <View style={[s.headerRow, { paddingTop: topInset + 10 }]}>
        <TouchableOpacity style={s.backBtn} onPress={onBack} activeOpacity={0.82}>
          <MaterialCommunityIcons name="chevron-left" size={28} color={C.white} />
        </TouchableOpacity>
        <View style={s.headerCopy}>
          <Text style={s.headerTitle}>Order Confirmed</Text>
          <Text style={s.headerSub}>Thank you for choosing Trusted Milk</Text>
        </View>
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  SUCCESS SECTION  — animation + checkmark + title
// ─────────────────────────────────────────────────────────────────────────────
function SuccessSection() {
  return (
    <View style={s.successSection}>
      <LottieView
        source={require('../../../assets/animations/Bird pair love and flying sky.json')}
        autoPlay
        loop
        style={s.birdAnim}
      />
      {/* Small green checkmark badge */}
      <View style={s.checkOuter}>
        <View style={s.checkInner}>
          <View style={s.checkCircle}>
            <MaterialCommunityIcons name="check" size={20} color={C.white} />
          </View>
        </View>
      </View>
      <Text style={s.successTitle}>Order Placed Successfully!</Text>
      <Text style={s.successSub}>Your order has been confirmed.</Text>
      <Text style={s.successSub}>We will deliver fresh &amp; pure products to your doorstep.</Text>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  ESTIMATED DELIVERY ROW
// ─────────────────────────────────────────────────────────────────────────────
function DeliveryRow() {
  return (
    <View style={[s.row, s.deliveryRow]}>
      <View style={s.deliveryIcon}>
        <MaterialCommunityIcons name="truck-delivery-outline" size={22} color={C.green} />
      </View>
      <View style={s.deliveryBody}>
        <Text style={s.deliveryKicker}>Estimated Delivery</Text>
        <Text style={s.deliveryDay}>Tomorrow</Text>
        <Text style={s.deliveryTime}>5:00 AM – 7:00 AM</Text>
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  ORDER DETAILS  2 × 2 grid
// ─────────────────────────────────────────────────────────────────────────────
function DetailsGrid({ amount, count, orderId }) {
  // Available width inside the card:
  //   page has marginHorizontal: SIDE (16 each side)
  //   row  has paddingHorizontal: SIDE (16 each side)
  //   gap between two cells: 8
  const CARD_INNER = width - SIDE * 4;          // subtract page margin + row padding both sides
  const CELL_W     = (CARD_INNER - 8) / 2;      // half of inner width minus the gap

  const cells = [
    { label: 'Order ID',    value: orderId || 'TM2026001258',                    icon: 'text-box-outline' },
    { label: 'Payment',     value: 'UPI',                                        icon: 'cellphone-check'  },
    { label: 'Amount Paid', value: `\u20B9${amount}`,                             icon: 'cash-check'       },
    { label: 'Items',       value: `${count} ${count === 1 ? 'Item' : 'Items'}`, icon: 'basket-outline'   },
  ];
  return (
    <View style={s.row}>
      <Text style={s.secTitle}>Order Details</Text>
      <View style={s.detailGrid}>
        {cells.map(c => (
          <View key={c.label} style={[s.detailCell, { width: CELL_W }]}>
            <MaterialCommunityIcons name={c.icon} size={15} color={C.blue} />
            <Text style={s.detailLabel}>{c.label}</Text>
            <Text style={s.detailValue} numberOfLines={1}>{c.value}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  ORDERED ITEMS
// ─────────────────────────────────────────────────────────────────────────────
function ItemsList({ items }) {
  return (
    <View style={s.row}>
      <Text style={s.secTitle}>Ordered Items</Text>
      {items.map((item, i) => {
        const price = item.qty * item.selectedVariant.price;
        return (
          <View key={item.id} style={[s.itemRow, i > 0 && ROW_SEP]}>
            <Image source={item.image} style={s.itemImg} resizeMode="contain" />
            <View style={s.itemInfo}>
              <Text style={s.itemName} numberOfLines={1}>{item.name}</Text>
              <Text style={s.itemSize}>{item.selectedVariant.label}</Text>
            </View>
            <View style={s.qtyBadge}>
              <Text style={s.qtyTxt}>Qty: {item.qty}</Text>
            </View>
            <Text style={s.itemPrice}>{'\u20B9'}{price}</Text>
          </View>
        );
      })}
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  ACTIONS
// ─────────────────────────────────────────────────────────────────────────────
function ActionsRow({ navigation }) {
  return (
    <View style={[s.row, { gap: 8 }]}>
      {/* Track Order — primary green CTA */}
      <TouchableOpacity style={s.trackBtn} activeOpacity={0.88}>
        <MaterialCommunityIcons name="map-marker-outline" size={18} color={C.white} />
        <Text style={s.trackTxt}>Track Order</Text>
        <MaterialCommunityIcons name="arrow-right" size={18} color={C.white} />
      </TouchableOpacity>
      {/* Secondary pair */}
      <View style={s.secRow}>
        <TouchableOpacity
          style={s.secBtn}
          onPress={() => navigation.navigate('Products')}
          activeOpacity={0.84}
        >
          <MaterialCommunityIcons name="shopping-outline" size={15} color={C.blue} />
          <Text style={s.secTxt}>Continue Shopping</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.secBtn} activeOpacity={0.84}>
          <MaterialCommunityIcons name="file-download-outline" size={15} color={C.blue} />
          <Text style={s.secTxt}>Download Invoice</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  SUPPORT ROW
// ─────────────────────────────────────────────────────────────────────────────
function SupportRow() {
  return (
    <View style={[s.row, s.inlineRow]}>
      <View style={s.iconCircleBlue}>
        <MaterialCommunityIcons name="headset" size={19} color={C.blue} />
      </View>
      <View style={s.inlineBody}>
        <Text style={s.inlineTitle}>Need Help?</Text>
        <Text style={s.inlineSub}>Our support team is always here to help you.</Text>
      </View>
      <TouchableOpacity style={s.inlineCta} activeOpacity={0.82}>
        <Text style={s.inlineCtaTxt}>Contact Support</Text>
        <MaterialCommunityIcons name="chevron-right" size={13} color={C.blue} />
      </TouchableOpacity>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  TRUST ROW
// ─────────────────────────────────────────────────────────────────────────────
function TrustRow() {
  return (
    <View style={[s.row, s.inlineRow, s.trustRow]}>
      <View style={s.iconCircleGreen}>
        <MaterialCommunityIcons name="shield-check-outline" size={19} color={C.green} />
      </View>
      <View style={s.inlineBody}>
        <Text style={s.inlineTitle}>Freshness You Can Trust, Every Morning!</Text>
        <Text style={s.inlineSub}>Thank you for being a part of the Trusted Milk family.</Text>
      </View>
      <MaterialCommunityIcons name="heart" size={18} color="#F87171" />
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  SCREEN
// ─────────────────────────────────────────────────────────────────────────────
export default function OrderSuccessScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();

  // Cart data is passed as route params from CartScreen (before clearCart runs)
  // Falls back to static demo data so the screen always shows something.
  const {
    orderId    = 'TM2026001258',
    cartItems  = FALLBACK,
    totalAmt   = 420,
    totalItems: paramCount,
  } = route?.params ?? {};

  const items  = cartItems.length > 0 ? cartItems : FALLBACK;
  const count  = paramCount ?? items.reduce((sum, i) => sum + i.qty, 0);
  const amount = totalAmt ?? 420;

  return (
    <View style={s.root}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: NAV_SPACE + insets.bottom }}
      >
        <Header topInset={insets.top} onBack={() => navigation.goBack()} />

        {/*
          ── Single white page surface ────────────────────────────────────────
          marginTop: -OVERLAP pulls the sheet up over the header wave bottom,
          eliminating any grey gap between header and content.
        */}
        <View style={s.page}>
          <SuccessSection />
          <View style={ROW_SEP} />
          <DeliveryRow />
          <View style={ROW_SEP} />
          <DetailsGrid amount={amount} count={count} orderId={orderId} />
          <View style={ROW_SEP} />
          <ItemsList items={items} />
          <View style={ROW_SEP} />
          <ActionsRow navigation={navigation} />
          <View style={ROW_SEP} />
          <SupportRow />
          <View style={ROW_SEP} />
          <TrustRow />
        </View>
      </ScrollView>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  STYLES
// ─────────────────────────────────────────────────────────────────────────────
const styles_detailCell_base = {
  minHeight: 66,
  borderRadius: 10,
  backgroundColor: '#F4F8FC',
  padding: 9,
  borderWidth: 1,
  borderColor: C.line,
};

const s = StyleSheet.create({

  // ── Root
  root: { flex: 1, backgroundColor: C.bg },

  // ── Header
  header:    { width, overflow: 'hidden', backgroundColor: C.blueDark },
  headerImg: { position: 'absolute', top: 0, left: 0, width: '100%' },
  headerRow: {
    paddingHorizontal: SIDE,
    flexDirection: 'row', alignItems: 'center',
  },
  backBtn: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center', justifyContent: 'center',
  },
  headerCopy:  { flex: 1, paddingHorizontal: 10 },
  headerTitle: { color: C.white, fontSize: 19, fontWeight: '900', lineHeight: 24 },
  headerSub:   { color: 'rgba(255,255,255,0.85)', fontSize: 10.5, fontWeight: '700', marginTop: 1 },

  // ── Page surface — single white sheet, overlaps header wave
  page: {
    marginTop: -OVERLAP,
    marginHorizontal: SIDE,
    backgroundColor: C.white,
    borderRadius: 20,
    overflow: 'hidden',
    // single soft shadow so the sheet separates gently from bg
    shadowColor: '#1A3040',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
    marginBottom: 10,
  },

  // ── Generic section row — consistent padding
  row: {
    paddingHorizontal: SIDE,
    paddingVertical: 14,
  },

  // ── Success section
  successSection: {
    alignItems: 'center',
    paddingTop: 0,
    paddingBottom: 14,
  },
  birdAnim: {
    width: INNER,
    height: 145,
  },
  checkOuter: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: '#D0F5E3',
    alignItems: 'center', justifyContent: 'center',
    marginTop: -4, marginBottom: 10,
  },
  checkInner: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#A8ECC6',
    alignItems: 'center', justifyContent: 'center',
  },
  checkCircle: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: C.green,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: C.green,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3, shadowRadius: 6, elevation: 4,
  },
  successTitle: {
    fontSize: 16, fontWeight: '900', color: C.green,
    textAlign: 'center', marginBottom: 4, paddingHorizontal: 16,
  },
  successSub: {
    fontSize: 12, fontWeight: '600', color: C.sub,
    textAlign: 'center', lineHeight: 17, paddingHorizontal: 20,
  },

  // ── Delivery row
  deliveryRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: C.palGreen,
  },
  deliveryIcon: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: C.white,
    alignItems: 'center', justifyContent: 'center',
    marginRight: 12,
  },
  deliveryBody:   { flex: 1 },
  deliveryKicker: { color: C.greenDark, fontSize: 10, fontWeight: '800', marginBottom: 1 },
  deliveryDay:    { color: C.text, fontSize: 15, fontWeight: '900' },
  deliveryTime:   { color: C.sub, fontSize: 11, fontWeight: '700', marginTop: 1 },

  // ── Section title
  secTitle: { fontSize: 13, fontWeight: '900', color: C.text, marginBottom: 10 },

  // ── Details 2×2 grid
  detailGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  detailCell: { ...styles_detailCell_base },
  detailLabel: { color: C.sub, fontSize: 9.5, fontWeight: '800', marginTop: 4, marginBottom: 2 },
  detailValue: { color: C.text, fontSize: 12, fontWeight: '900' },

  // ── Ordered items
  itemRow:  { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  itemImg:  { width: 44, height: 44, borderRadius: 10, backgroundColor: '#EFF4FA', marginRight: 10 },
  itemInfo: { flex: 1 },
  itemName: { color: C.text, fontSize: 12.5, fontWeight: '900', marginBottom: 2 },
  itemSize: { color: C.sub, fontSize: 10.5, fontWeight: '700' },
  qtyBadge: {
    minWidth: 46, height: 22, borderRadius: 11,
    backgroundColor: C.palBlue,
    alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 6, marginHorizontal: 6,
  },
  qtyTxt:    { color: C.blue, fontSize: 10.5, fontWeight: '900' },
  itemPrice: { width: 46, textAlign: 'right', color: C.text, fontSize: 12.5, fontWeight: '900' },

  // ── Actions
  trackBtn: {
    height: 46, borderRadius: 13,
    backgroundColor: C.green,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    marginBottom: 8,
    shadowColor: C.green,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.22, shadowRadius: 6, elevation: 3,
  },
  trackTxt: { color: C.white, fontSize: 14, fontWeight: '900' },
  secRow:   { flexDirection: 'row', gap: 8 },
  secBtn: {
    flex: 1, height: 38, borderRadius: 10,
    backgroundColor: C.white,
    borderWidth: 1, borderColor: '#BEDAF5',
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5,
  },
  secTxt: { color: C.blue, fontSize: 10.5, fontWeight: '900', flexShrink: 1, textAlign: 'center' },

  // ── Inline rows (support + trust)
  inlineRow: { flexDirection: 'row', alignItems: 'center' },
  trustRow:  { backgroundColor: '#F0FBF4' },
  iconCircleBlue: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: C.palBlue,
    alignItems: 'center', justifyContent: 'center', marginRight: 10,
  },
  iconCircleGreen: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: C.white,
    alignItems: 'center', justifyContent: 'center', marginRight: 10,
    borderWidth: 1, borderColor: C.line,
  },
  inlineBody:   { flex: 1 },
  inlineTitle:  { color: C.text, fontSize: 12.5, fontWeight: '900', marginBottom: 1 },
  inlineSub:    { color: C.sub, fontSize: 10.5, fontWeight: '700', lineHeight: 14 },
  inlineCta:    { flexDirection: 'row', alignItems: 'center', gap: 1, paddingLeft: 6 },
  inlineCtaTxt: { color: C.blue, fontSize: 10.5, fontWeight: '900' },
});
