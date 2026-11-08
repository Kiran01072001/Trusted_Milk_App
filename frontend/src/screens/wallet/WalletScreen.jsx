import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator, RefreshControl, Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../context/AuthContext';
import { getWalletBalance, getTransactions } from '../../services/walletService';

const { width } = Dimensions.get('window');

const C = {
  blue:    '#2196F3',
  blueDk:  '#025F86',
  green:   '#16A34A',
  red:     '#EF4444',
  bg:      '#F0F4F8',
  white:   '#FFFFFF',
  text:    '#172536',
  sub:     '#728195',
  line:    '#E4EBF2',
  palBlue: '#EBF4FF',
};

// ─── Transaction row ──────────────────────────────────────────────────────────
function TxnRow({ item }) {
  const isCredit = item.type === 'CREDIT';
  return (
    <View style={s.txnRow}>
      <View style={[s.txnIcon, { backgroundColor: isCredit ? '#DCFCE7' : '#FEE2E2' }]}>
        <MaterialCommunityIcons
          name={isCredit ? 'arrow-down-circle-outline' : 'arrow-up-circle-outline'}
          size={22}
          color={isCredit ? C.green : C.red}
        />
      </View>
      <View style={s.txnBody}>
        <Text style={s.txnDesc} numberOfLines={2}>
          {item.description ?? (isCredit ? 'Credit' : 'Debit')}
        </Text>
        <Text style={s.txnDate}>
          {new Date(item.created_at).toLocaleDateString('en-IN', {
            day: '2-digit', month: 'short', year: 'numeric',
          })}
        </Text>
      </View>
      <Text style={[s.txnAmt, { color: isCredit ? C.green : C.red }]}>
        {isCredit ? '+' : '-'}₹{Math.abs(item.amount).toFixed(2)}
      </Text>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function WalletScreen({ navigation }) {
  const insets     = useSafeAreaInsets();
  const { user }   = useAuth();

  const [balance,      setBalance]      = useState(0);
  const [credited,     setCredited]     = useState(0);
  const [debited,      setDebited]      = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [refreshing,   setRefreshing]   = useState(false);

  const loadData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const [walletData, txns] = await Promise.all([
        getWalletBalance(),
        getTransactions(30),
      ]);
      setBalance(walletData.balance      ?? 0);
      setCredited(walletData.totalCredited ?? 0);
      setDebited(walletData.totalDebited   ?? 0);
      setTransactions(txns);
    } catch {
      // Silently retain stale data — network may be unavailable
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  return (
    <View style={s.root}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => loadData(true)} tintColor={C.blue} />
        }
      >
        {/* ── Balance card ─────────────────────────────────────────────── */}
        <LinearGradient
          colors={['#025F86', '#0E8ABE']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[s.balanceCard, { paddingTop: insets.top + 20 }]}
        >
          <Text style={s.balanceGreeting}>
            Hi, {user?.full_name?.split(' ')[0] ?? 'there'} 👋
          </Text>
          <Text style={s.balanceLabel}>Wallet Balance</Text>

          {loading ? (
            <ActivityIndicator size="large" color={C.white} style={{ marginVertical: 10 }} />
          ) : (
            <Text style={s.balanceAmount}>₹{balance.toFixed(2)}</Text>
          )}

          {/* Credit / Debit summary row */}
          <View style={s.summaryRow}>
            <View style={s.summaryItem}>
              <MaterialCommunityIcons name="arrow-down-circle-outline" size={18} color="#86efac" />
              <Text style={s.summaryLabel}>Total Credited</Text>
              <Text style={s.summaryValue}>₹{credited.toFixed(2)}</Text>
            </View>
            <View style={s.summaryDivider} />
            <View style={s.summaryItem}>
              <MaterialCommunityIcons name="arrow-up-circle-outline" size={18} color="#fca5a5" />
              <Text style={s.summaryLabel}>Total Debited</Text>
              <Text style={s.summaryValue}>₹{debited.toFixed(2)}</Text>
            </View>
          </View>
        </LinearGradient>

        {/* ── Info strip ───────────────────────────────────────────────── */}
        <View style={s.infoStrip}>
          <MaterialCommunityIcons name="information-outline" size={15} color={C.sub} />
          <Text style={s.infoText}>
            Earn ₹50 by referring friends. Balance is applied automatically at checkout.
          </Text>
        </View>

        {/* ── Quick action: Refer & Earn ────────────────────────────────── */}
        <TouchableOpacity
          style={s.referBanner}
          onPress={() => navigation.navigate('ReferEarnScreen')}
          activeOpacity={0.88}
        >
          <MaterialCommunityIcons name="gift-outline" size={28} color={C.blue} />
          <View style={s.referBody}>
            <Text style={s.referTitle}>Refer &amp; Earn ₹50</Text>
            <Text style={s.referSub}>Invite a friend, both of you earn when they order</Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={22} color={C.blue} />
        </TouchableOpacity>

        {/* ── Transaction history ───────────────────────────────────────── */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Transaction History</Text>

          {loading ? (
            <ActivityIndicator color={C.blue} style={{ marginTop: 24 }} />
          ) : transactions.length === 0 ? (
            <View style={s.emptyWrap}>
              <MaterialCommunityIcons name="wallet-outline" size={52} color={C.sub} />
              <Text style={s.emptyTitle}>No transactions yet</Text>
              <Text style={s.emptySub}>
                Refer friends to start earning wallet rewards!
              </Text>
            </View>
          ) : (
            <View style={s.txnList}>
              {transactions.map(txn => (
                <TxnRow key={txn.id} item={txn} />
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },

  // Balance hero card
  balanceCard: {
    paddingHorizontal: 24,
    paddingBottom: 28,
    alignItems: 'center',
  },
  balanceGreeting: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
    alignSelf: 'flex-start',
  },
  balanceLabel: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  balanceAmount: {
    color: C.white,
    fontSize: 46,
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    width: '100%',
  },
  summaryItem:   { flex: 1, alignItems: 'center', gap: 3 },
  summaryDivider:{ width: 1, backgroundColor: 'rgba(255,255,255,0.2)', marginVertical: 4 },
  summaryLabel:  { color: 'rgba(255,255,255,0.72)', fontSize: 11, fontWeight: '600' },
  summaryValue:  { color: C.white, fontSize: 15, fontWeight: '900' },

  // Info strip
  infoStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: C.palBlue,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: C.line,
  },
  infoText: { flex: 1, fontSize: 11.5, color: C.sub, fontWeight: '600', lineHeight: 16 },

  // Refer banner
  referBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.white,
    marginHorizontal: 16,
    marginTop: 14,
    borderRadius: 16,
    padding: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    shadowColor: '#1A3040',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  referBody:  { flex: 1 },
  referTitle: { fontSize: 14, fontWeight: '900', color: C.text, marginBottom: 2 },
  referSub:   { fontSize: 11.5, color: C.sub, fontWeight: '600', lineHeight: 16 },

  // Section
  section:      { marginTop: 18, paddingHorizontal: 16 },
  sectionTitle: { fontSize: 15, fontWeight: '900', color: C.text, marginBottom: 12 },

  // Transaction list
  txnList: {
    backgroundColor: C.white,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: C.line,
  },
  txnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: C.line,
    gap: 12,
  },
  txnIcon: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
  },
  txnBody:  { flex: 1 },
  txnDesc:  { fontSize: 13, fontWeight: '700', color: C.text, lineHeight: 18, marginBottom: 2 },
  txnDate:  { fontSize: 11, color: C.sub, fontWeight: '600' },
  txnAmt:   { fontSize: 14, fontWeight: '900', minWidth: 72, textAlign: 'right' },

  // Empty state
  emptyWrap: {
    alignItems: 'center', paddingTop: 32, paddingBottom: 16,
    backgroundColor: C.white, borderRadius: 16,
    borderWidth: 1, borderColor: C.line,
  },
  emptyTitle: { fontSize: 16, fontWeight: '800', color: C.text, marginTop: 12, marginBottom: 6 },
  emptySub:   { fontSize: 13, color: C.sub, textAlign: 'center', paddingHorizontal: 24, lineHeight: 18 },
});
