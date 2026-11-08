import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Image,
  StyleSheet, Dimensions, TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCart } from '../../context/CartContext';
import { useAddress } from '../../context/AddressContext';
import { completeOrder } from '../../services/referralService';
import { getWalletBalance } from '../../services/walletService';

const { width } = Dimensions.get('window');
const SIDE = 14;  // Reduced from 16
const TAB_BAR_SPACE = 90;
const CHECKOUT_H = 60;  // Reduced from 70
const CART_HEADER_RATIO = 2103 / 748;
const OVERLAP = 16;  // Pull content over header

const C = {
  primary: '#025F86', primary2: '#0D7EAA', white: '#FFFFFF',
  text: '#162536', sub: '#718096', line: '#E8EEF3',
  green: '#16A34A', red: '#EF4444', pale: '#F6FAFC', mint: '#F2FBF3',
};
// ─── Header ───────────────────────────────────────────────────────────────────
function Header({ topInset, onBack }) {
  const imgH = Math.round(width / CART_HEADER_RATIO);
  const headerHeight = topInset + imgH;

  return (
    <View style={[styles.header, { height: headerHeight }]}>
      <Image
        source={require('../../../assets/headers/cart_header.png')}
        style={[styles.headerImage, { height: headerHeight }]}
        resizeMode="stretch"
      />
      <View style={[styles.headerRow, { paddingTop: topInset + 10 }]}>
        <TouchableOpacity onPress={onBack} style={styles.roundBtn} activeOpacity={0.8}>
          <Text style={styles.backArrow}>{'\u2039'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Section Card wrapper ─────────────────────────────────────────────────────
function Card({ children, style }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

function SectionTitle({ icon, title }) {
  return (
    <View style={styles.sectionTitle}>
      <Text style={styles.sectionIcon}>{icon}</Text>
      <Text style={styles.sectionTitleTxt}>{title}</Text>
    </View>
  );
}

// ─── Delivery Address ─────────────────────────────────────────────────────────
function DeliveryAddress({ onChange }) {
  const { address } = useAddress();
  return (
    <Card>
      <SectionTitle icon={'\uD83D\uDCCD'} title="Delivery Address" />
      <View style={styles.addrRow}>
        <View style={styles.addrInfo}>
          <Text style={styles.addrLabel}>DELIVER TO</Text>
          <Text style={styles.addrText} numberOfLines={2}>{address}</Text>
        </View>
        <TouchableOpacity style={styles.changeBtn} onPress={onChange} activeOpacity={0.8}>
          <Text style={styles.changeTxt}>Change</Text>
        </TouchableOpacity>
      </View>
    </Card>
  );
}

// ─── Delivery Time ────────────────────────────────────────────────────────────
function DeliveryTime() {
  const [selected, setSelected] = useState('today');
  const options = [
    { id: 'today', label: "Today's Delivery", sub: '5:00 AM', icon: '\u2600\uFE0F' },
    { id: 'tomorrow', label: "Tomorrow's Delivery", sub: '5:00 AM', icon: '\uD83D\uDCC5' },
  ];
  return (
    <Card>
      <SectionTitle icon={'\uD83D\uDE9A'} title="Delivery Time" />
      {options.map(o => (
        <TouchableOpacity key={o.id} style={styles.radioRow} onPress={() => setSelected(o.id)} activeOpacity={0.8}>
          <View style={[styles.radio, selected === o.id && styles.radioActive]}>
            {selected === o.id && <View style={styles.radioDot} />}
          </View>
          <Text style={styles.radioIcon}>{o.icon}</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.radioLabel}>{o.label}</Text>
            <Text style={styles.radioSub}>{o.sub}</Text>
          </View>
        </TouchableOpacity>
      ))}
    </Card>
  );
}

// ─── Cart Item ────────────────────────────────────────────────────────────────
function CartItem({ item, onInc, onDec, onRemove }) {
  const subtotal = item.qty * item.selectedVariant.price;
  return (
    <View style={styles.cartItem}>
      <Image source={item.image} style={styles.itemImg} resizeMode="contain" />
      <View style={styles.itemBody}>
        <View style={styles.itemTopRow}>
          <View style={{ flex: 1 }}>
            <View style={styles.itemBadgeRow}>
              <Text style={styles.freshBadge}>{item.badge}</Text>
            </View>
            <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
            <Text style={styles.itemVariant}>{item.selectedVariant.label} • {'\u20B9'}{item.selectedVariant.price}</Text>
          </View>
          <TouchableOpacity onPress={onRemove} style={styles.deleteBtn} activeOpacity={0.8}>
            <Text style={styles.deleteIcon}>{'\uD83D\uDDD1\uFE0F'}</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.itemBottomRow}>
          <View style={styles.qtyRow}>
            <TouchableOpacity style={styles.qtyBtn} onPress={onDec}>
              <Text style={styles.qtyBtnTxt}>{'\u2212'}</Text>
            </TouchableOpacity>
            <Text style={styles.qtyNum}>{item.qty}</Text>
            <TouchableOpacity style={styles.qtyBtn} onPress={onInc}>
              <Text style={styles.qtyBtnTxt}>+</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.subtotal}>{'\u20B9'}{subtotal}</Text>
        </View>
      </View>
    </View>
  );
}

// ─── Cart Items Section ───────────────────────────────────────────────────────
function CartItemsSection({ cartItems, updateCart, removeItem }) {
  if (cartItems.length === 0) {
    return (
      <Card style={styles.emptyCard}>
        <Text style={styles.emptyIcon}>{'\uD83D\uDED2'}</Text>
        <Text style={styles.emptyTxt}>Your cart is empty</Text>
        <Text style={styles.emptySub}>Add products from Home or Products screen</Text>
      </Card>
    );
  }
  return (
    <Card>
      <SectionTitle icon={'\uD83D\uDED2'} title={`Cart Items (${cartItems.length})`} />
      {cartItems.map((item, idx) => (
        <View key={item.id}>
          <CartItem
            item={item}
            onInc={() => updateCart(item.id, 1)}
            onDec={() => updateCart(item.id, -1)}
            onRemove={() => removeItem(item.id)}
          />
          {idx < cartItems.length - 1 && <View style={styles.divider} />}
        </View>
      ))}
    </Card>
  );
}

// ─── Subscription ─────────────────────────────────────────────────────────────
function Subscription() {
  const [selected, setSelected] = useState('once');
  const opts = [
    { id: 'once', label: 'One Time' },
    { id: 'daily', label: 'Daily' },
    { id: 'alt', label: 'Alternate Days' },
    { id: 'weekly', label: 'Weekly' },
  ];
  return (
    <Card>
      <SectionTitle icon={'\uD83D\uDD04'} title="Order Type" />
      <View style={styles.subRow}>
        {opts.map(o => (
          <TouchableOpacity
            key={o.id}
            style={[styles.subChip, selected === o.id && styles.subChipActive]}
            onPress={() => setSelected(o.id)}
            activeOpacity={0.8}
          >
            <Text style={[styles.subChipTxt, selected === o.id && styles.subChipTxtActive]}>{o.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </Card>
  );
}

// ─── Coupon ───────────────────────────────────────────────────────────────────
function Coupon() {
  const [code, setCode] = useState('');
  return (
    <Card>
      <SectionTitle icon={'\uD83C\uDFF7\uFE0F'} title="Apply Coupon" />
      <View style={styles.couponRow}>
        <TextInput
          style={styles.couponInput}
          placeholder="Enter coupon code"
          placeholderTextColor={C.sub}
          value={code}
          onChangeText={setCode}
          autoCapitalize="characters"
        />
        <TouchableOpacity style={styles.applyBtn} activeOpacity={0.8}>
          <Text style={styles.applyTxt}>Apply</Text>
        </TouchableOpacity>
      </View>
    </Card>
  );
}

// ─── Wallet ───────────────────────────────────────────────────────────────────
function Wallet() {
  const [useWallet, setUseWallet] = useState(false);
  const [walletBal, setWalletBal] = useState(null);

  useEffect(() => {
    getWalletBalance()
      .then(d => setWalletBal(d.balance))
      .catch(() => {});
  }, []);

  const balTxt = walletBal !== null ? `₹${walletBal.toFixed(2)}` : '—';

  return (
    <Card>
      <SectionTitle icon={'\uD83D\uDCB0'} title="Wallet" />
      <View style={styles.walletRow}>
        <View style={styles.walletLeft}>
          <Text style={styles.walletBal}>Balance: {balTxt}</Text>
          <Text style={styles.walletSub}>Available wallet balance</Text>
        </View>
        <TouchableOpacity
          style={[styles.checkbox, useWallet && styles.checkboxActive]}
          onPress={() => setUseWallet(v => !v)}
          activeOpacity={0.8}
        >
          {useWallet && <Text style={styles.checkmark}>{'✓'}</Text>}
        </TouchableOpacity>
      </View>
    </Card>
  );
}

// ─── Bill Details ─────────────────────────────────────────────────────────────
function BillDetails({ totalAmt, saving }) {
  const delivery = totalAmt > 299 ? 0 : 30;
  const walletUsed = 0;
  const discount = saving;
  const payable = totalAmt + delivery - discount - walletUsed;

  const rows = [
    { label: 'Items Total', value: totalAmt, color: C.text },
    { label: 'Delivery Charges', value: delivery === 0 ? 'FREE' : delivery, color: delivery === 0 ? C.green : C.text },
    { label: 'Discount (10%)', value: `-${discount}`, color: C.green },
    { label: 'Wallet Used', value: walletUsed === 0 ? '-' : `-${walletUsed}`, color: C.text },
  ];

  return (
    <Card>
      <SectionTitle icon={'\uD83E\uDDFE'} title="Bill Details" />
      {rows.map(r => (
        <View key={r.label} style={styles.billRow}>
          <Text style={styles.billLabel}>{r.label}</Text>
          <Text style={[styles.billVal, { color: r.color }]}>
            {typeof r.value === 'number' ? `\u20B9${r.value}` : r.value}
          </Text>
        </View>
      ))}
      <View style={styles.billDivider} />
      <View style={styles.billRow}>
        <Text style={styles.billTotal}>Total Payable</Text>
        <Text style={styles.billTotalVal}>{'\u20B9'}{payable}</Text>
      </View>
    </Card>
  );
}

// ─── Payment Method ───────────────────────────────────────────────────────────
function PaymentMethod() {
  const [selected, setSelected] = useState('upi');
  const methods = [
    { id: 'upi', label: 'UPI / Net Banking', icon: '\uD83D\uDCF1' },
    { id: 'cod', label: 'Cash on Delivery', icon: '\uD83D\uDCB5' },
    { id: 'wallet', label: 'Wallet', icon: '\uD83D\uDCB0' },
  ];
  return (
    <Card>
      <SectionTitle icon={'\uD83D\uDCB3'} title="Payment Method" />
      {methods.map(m => (
        <TouchableOpacity key={m.id} style={styles.radioRow} onPress={() => setSelected(m.id)} activeOpacity={0.8}>
          <View style={[styles.radio, selected === m.id && styles.radioActive]}>
            {selected === m.id && <View style={styles.radioDot} />}
          </View>
          <Text style={styles.radioIcon}>{m.icon}</Text>
          <Text style={styles.radioLabel}>{m.label}</Text>
        </TouchableOpacity>
      ))}
    </Card>
  );
}

// ─── Delivery Instructions ────────────────────────────────────────────────────
function DeliveryInstructions() {
  const [selected, setSelected] = useState(null);
  const opts = [
    { id: 'door', label: 'Leave at Door', icon: '\uD83D\uDEAA' },
    { id: 'bell', label: 'Ring Bell', icon: '\uD83D\uDD14' },
    { id: 'call', label: 'Call Me', icon: '\uD83D\uDCDE' },
    { id: 'other', label: 'Other', icon: '\uD83D\uDCDD' },
  ];
  return (
    <Card>
      <SectionTitle icon={'\uD83D\uDCCB'} title="Delivery Instructions" />
      <View style={styles.instrRow}>
        {opts.map(o => (
          <TouchableOpacity
            key={o.id}
            style={[styles.instrChip, selected === o.id && styles.instrChipActive]}
            onPress={() => setSelected(selected === o.id ? null : o.id)}
            activeOpacity={0.8}
          >
            <Text style={styles.instrIcon}>{o.icon}</Text>
            <Text style={[styles.instrTxt, selected === o.id && styles.instrTxtActive]}>{o.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </Card>
  );
}

// ─── Checkout Bar ─────────────────────────────────────────────────────────────
function CheckoutBar({ totalItems, totalAmt, saving, bottomInset, onPress, disabled }) {
  const delivery = totalAmt > 299 ? 0 : 30;
  const payable = totalAmt + delivery - saving;
  return (
    <View style={[styles.checkoutBar, { paddingBottom: Math.max(bottomInset, 12) }]}>
      <View style={styles.checkoutInfo}>
        <Text style={styles.checkoutItems}>{totalItems} {totalItems === 1 ? 'Item' : 'Items'}</Text>
        <Text style={styles.checkoutSave}>You save {'\u20B9'}{saving}</Text>
      </View>
      <TouchableOpacity
        style={[styles.checkoutBtn, disabled && { opacity: 0.6 }]}
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.88}
      >
        <Text style={styles.checkoutAmt}>{'\u20B9'}{payable}</Text>
        <Text style={styles.checkoutBtnTxt}>Proceed to Checkout {'›'}</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function CartScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { cartItems, totalItems, totalAmt, saving, updateCart, removeItem, clearCart } = useCart();
  const [checkingOut, setCheckingOut] = useState(false);

  const handleCheckout = async () => {
    if (checkingOut) return;
    setCheckingOut(true);

    const orderId = `TM${Date.now()}`;

    // Snapshot cart BEFORE clearing — OrderSuccessScreen needs it
    const snapshot = {
      orderId,
      cartItems:   cartItems.map(i => ({ ...i })),
      totalAmt,
      totalItems,
    };

    // Navigate + clear cart immediately for instant UX
    clearCart();
    navigation.navigate('OrderSuccessScreen', snapshot);

    // Fire backend reward call in background — doesn't block the UX
    try {
      await completeOrder(orderId, 'PAID');
    } catch (err) {
      console.warn('[CartScreen] completeOrder failed:', err?.message ?? err);
    } finally {
      setCheckingOut(false);
    }
  };

  return (
    <View style={styles.root}>
      <Header
        topInset={insets.top}
        onBack={() => navigation.goBack()}
      />

      {/* Single continuous white page surface */}
      <View style={styles.page}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          <DeliveryAddress onChange={() => navigation.navigate('LocationSelectionScreen')} />
          <View style={styles.separator} />
          <DeliveryTime />
          <View style={styles.separator} />
          <CartItemsSection cartItems={cartItems} updateCart={updateCart} removeItem={removeItem} />
          <View style={styles.separator} />
          <Subscription />
          <View style={styles.separator} />
          <Coupon />
          <View style={styles.separator} />
          <Wallet />
          <View style={styles.separator} />
          <BillDetails totalAmt={totalAmt} saving={saving} />
          <View style={styles.separator} />
          <PaymentMethod />
          <View style={styles.separator} />
          <DeliveryInstructions />
        </ScrollView>
      </View>

      {totalItems > 0 && (
        <CheckoutBar
          totalItems={totalItems}
          totalAmt={totalAmt}
          saving={saving}
          bottomInset={insets.bottom}
          onPress={handleCheckout}
          disabled={checkingOut}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.white },
  
  // Page surface - single continuous white sheet
  page: {
    flex: 1,
    marginTop: -OVERLAP,
    marginHorizontal: SIDE,
    backgroundColor: C.white,
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#1A3040',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 3,
    marginBottom: 10,
  },
  
  scroll: { paddingBottom: CHECKOUT_H + TAB_BAR_SPACE + 16 },
  
  // Separator between sections
  separator: { borderTopWidth: 1, borderTopColor: C.line },

  // Header
  header: { width, overflow: 'hidden', backgroundColor: C.white },
  headerImage: { position: 'absolute', top: 0, left: 0, width: '100%' },
  headerRow: { paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center' },
  roundBtn: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.18)' },
  backArrow: { color: C.white, fontSize: 32, fontWeight: '500', lineHeight: 32 },

  // Card - now integrated into single page
  card: { backgroundColor: 'transparent', borderRadius: 0, paddingHorizontal: SIDE, paddingVertical: 12, borderBottomWidth: 0 },
  emptyCard: { alignItems: 'center', paddingVertical: 28 },
  emptyIcon: { fontSize: 44, marginBottom: 10 },
  emptyTxt: { fontSize: 15, fontWeight: '800', color: C.text, marginBottom: 5 },
  emptySub: { fontSize: 11.5, color: C.sub, textAlign: 'center' },

  // Section title
  sectionTitle: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  sectionIcon: { fontSize: 15, marginRight: 7 },
  sectionTitleTxt: { fontSize: 14, fontWeight: '900', color: C.text },

  // Address
  addrRow: { flexDirection: 'row', alignItems: 'center' },
  addrInfo: { flex: 1 },
  addrLabel: { fontSize: 9, color: C.sub, fontWeight: '800', letterSpacing: 0.8, marginBottom: 3 },
  addrText: { fontSize: 12.5, color: C.text, fontWeight: '700', lineHeight: 17 },
  changeBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 9, backgroundColor: '#EFF8FC', borderWidth: 1, borderColor: '#C8E8F5' },
  changeTxt: { fontSize: 11.5, color: C.primary, fontWeight: '800' },

  // Radio
  radioRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 7, gap: 9 },
  radio: { width: 19, height: 19, borderRadius: 10, borderWidth: 2, borderColor: C.sub, alignItems: 'center', justifyContent: 'center' },
  radioActive: { borderColor: C.primary },
  radioDot: { width: 9, height: 9, borderRadius: 5, backgroundColor: C.primary },
  radioIcon: { fontSize: 15 },
  radioLabel: { fontSize: 12.5, fontWeight: '700', color: C.text },
  radioSub: { fontSize: 10.5, color: C.sub, fontWeight: '600' },

  // Cart item
  cartItem: { flexDirection: 'row', gap: 11, paddingVertical: 4 },
  itemImg: { width: 68, height: 68, borderRadius: 11, backgroundColor: C.pale },
  itemBody: { flex: 1 },
  itemTopRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 7 },
  itemBadgeRow: { marginBottom: 3 },
  freshBadge: { fontSize: 9, fontWeight: '800', color: C.green, backgroundColor: '#F0FDF4', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 5, overflow: 'hidden', alignSelf: 'flex-start' },
  itemName: { fontSize: 13, fontWeight: '900', color: C.text, marginBottom: 2 },
  itemVariant: { fontSize: 11, color: C.sub, fontWeight: '600' },
  deleteBtn: { padding: 4 },
  deleteIcon: { fontSize: 18 },
  itemBottomRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  qtyBtn: { width: 28, height: 28, borderRadius: 14, backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center' },
  qtyBtnTxt: { color: C.white, fontSize: 16, fontWeight: '900' },
  qtyNum: { minWidth: 20, textAlign: 'center', fontSize: 14, fontWeight: '900', color: C.text },
  subtotal: { fontSize: 15, fontWeight: '900', color: C.text },
  divider: { height: 1, backgroundColor: C.line, marginVertical: 10 },

  // Subscription
  subRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  subChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1.5, borderColor: C.primary, backgroundColor: C.white },
  subChipActive: { backgroundColor: C.primary },
  subChipTxt: { fontSize: 12, fontWeight: '700', color: C.primary },
  subChipTxtActive: { color: C.white },

  // Coupon
  couponRow: { flexDirection: 'row', gap: 10 },
  couponInput: { flex: 1, height: 44, borderRadius: 10, borderWidth: 1.5, borderColor: C.line, paddingHorizontal: 14, fontSize: 13, color: C.text, backgroundColor: C.pale },
  applyBtn: { height: 44, paddingHorizontal: 18, borderRadius: 10, backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center' },
  applyTxt: { color: C.white, fontSize: 13, fontWeight: '800' },

  // Wallet
  walletRow: { flexDirection: 'row', alignItems: 'center' },
  walletLeft: { flex: 1 },
  walletBal: { fontSize: 15, fontWeight: '900', color: C.text },
  walletSub: { fontSize: 11, color: C.sub, marginTop: 2 },
  checkbox: { width: 24, height: 24, borderRadius: 6, borderWidth: 2, borderColor: C.sub, alignItems: 'center', justifyContent: 'center' },
  checkboxActive: { backgroundColor: C.primary, borderColor: C.primary },
  checkmark: { color: C.white, fontSize: 14, fontWeight: '900' },

  // Bill
  billRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 5 },
  billLabel: { fontSize: 13, color: C.sub, fontWeight: '600' },
  billVal: { fontSize: 13, fontWeight: '700' },
  billDivider: { height: 1, backgroundColor: C.line, marginVertical: 8 },
  billTotal: { fontSize: 15, fontWeight: '900', color: C.text },
  billTotalVal: { fontSize: 16, fontWeight: '900', color: C.primary },

  // Instructions
  instrRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  instrChip: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, borderWidth: 1.5, borderColor: C.line, backgroundColor: C.pale },
  instrChipActive: { borderColor: C.primary, backgroundColor: '#EFF8FC' },
  instrIcon: { fontSize: 14 },
  instrTxt: { fontSize: 12, fontWeight: '700', color: C.sub },
  instrTxtActive: { color: C.primary },

  // Checkout bar
  checkoutBar: { backgroundColor: C.white, paddingHorizontal: SIDE, paddingTop: 12, borderTopWidth: 1, borderTopColor: C.line, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  checkoutInfo: { flex: 1 },
  checkoutItems: { fontSize: 13, fontWeight: '800', color: C.text },
  checkoutSave: { fontSize: 11, color: C.green, fontWeight: '700', marginTop: 2 },
  checkoutBtn: { backgroundColor: C.primary, borderRadius: 14, paddingHorizontal: 18, paddingVertical: 10, alignItems: 'center' },
  checkoutAmt: { color: C.white, fontSize: 15, fontWeight: '900' },
  checkoutBtnTxt: { color: 'rgba(255,255,255,0.88)', fontSize: 11, fontWeight: '700', marginTop: 1 },
});
