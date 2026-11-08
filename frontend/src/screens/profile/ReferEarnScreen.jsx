import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Share, ActivityIndicator, ScrollView, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LottieView from 'lottie-react-native';
import { useAuth } from '../../context/AuthContext';
import { getReferralStats } from '../../services/referralService';
import { getWalletBalance } from '../../services/walletService';

const C = {
  primary: '#025F86',
  white:   '#fff',
  bg:      '#F4F8FB',
  text:    '#1A2B3C',
  sub:     '#6B7280',
  green:   '#16A34A',
  gold:    '#F59E0B',
};

// ─── Small stat chip ──────────────────────────────────────────────────────────
function StatChip({ label, value, color = C.primary }) {
  return (
    <View style={styles.statChip}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export default function ReferEarnScreen({ navigation }) {
  const insets      = useSafeAreaInsets();
  const { user }    = useAuth();

  const [referralCode,  setReferralCode]  = useState(user?.referral_code ?? user?.customer_code ?? '…');
  const [friendsCount,  setFriendsCount]  = useState(0);
  const [rewardsPaid,   setRewardsPaid]   = useState(0);
  const [totalEarned,   setTotalEarned]   = useState(0);
  const [walletBalance, setWalletBalance] = useState(0);
  const [loading,       setLoading]       = useState(true);

  const loadData = useCallback(async () => {
    try {
      const [stats, wallet] = await Promise.all([
        getReferralStats(),
        getWalletBalance(),
      ]);
      setReferralCode(stats.referralCode  ?? referralCode);
      setFriendsCount(stats.friendsCount  ?? 0);
      setRewardsPaid(stats.rewardsPaid    ?? 0);
      setTotalEarned(stats.totalEarned    ?? 0);
      setWalletBalance(wallet.balance     ?? 0);
    } catch {
      // Keep whatever we already have (e.g. customer_code from AuthContext)
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleShare = async () => {
    try {
      await Share.share({
        message:
          `🥛 Try Trusted Milk – Fresh, Pure & Hygienic dairy delivered daily!\n` +
          `Use my referral code *${referralCode}* when you sign up and we both earn ₹50!\n` +
          `Download now and enjoy farm-fresh products every morning. 🌅`,
      });
    } catch (e) {
      Alert.alert('Error', 'Could not open share sheet.');
    }
  };

  return (
    <View style={styles.root}>
      {/* Header */}
      <LinearGradient
        colors={['#025F86', '#0E7FB0']}
        style={[styles.header, { paddingTop: insets.top + 14 }]}
      >
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Refer &amp; Earn</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

      <ScrollView
        contentContainerStyle={[styles.body, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Animation */}
        <LottieView
          source={require('../../../assets/animations/refer and earn button.json')}
          autoPlay
          loop
          style={styles.mainLottie}
        />

        <Text style={styles.title}>Invite Friends &amp; Earn</Text>
        <Text style={styles.sub}>
          Share your referral code. When a friend signs up and places their first order,
          you both earn{' '}
          <Text style={styles.highlight}>₹50</Text> in your wallet!
        </Text>

        {/* Wallet balance pill */}
        <View style={styles.balancePill}>
          <Text style={styles.balanceIcon}>💰</Text>
          <Text style={styles.balanceLabel}>Wallet Balance</Text>
          <Text style={styles.balanceAmount}>₹{walletBalance.toFixed(2)}</Text>
        </View>

        {/* Referral code card */}
        <View style={styles.codeCard}>
          <Text style={styles.codeLabel}>Your Referral Code</Text>
          {loading ? (
            <ActivityIndicator color={C.primary} style={{ marginVertical: 8 }} />
          ) : (
            <Text style={styles.code} selectable>{referralCode}</Text>
          )}
          <Text style={styles.codeHint}>Tap &amp; hold to copy</Text>
        </View>

        {/* Stats row */}
        <View style={styles.statsRow}>
          <StatChip label="Friends Joined" value={friendsCount}     color={C.primary} />
          <View style={styles.statDivider} />
          <StatChip label="Rewards Paid"   value={rewardsPaid}      color={C.green}   />
          <View style={styles.statDivider} />
          <StatChip label="Total Earned"   value={`₹${totalEarned}`} color={C.gold}   />
        </View>

        {/* Share button */}
        <TouchableOpacity style={styles.shareBtn} onPress={handleShare} activeOpacity={0.88}>
          <LottieView
            source={require('../../../assets/animations/Share.json')}
            autoPlay
            loop
            style={styles.shareLottie}
          />
          <Text style={styles.shareBtnText}>Share Now</Text>
        </TouchableOpacity>

        {/* How it works */}
        <View style={styles.stepsWrap}>
          {[
            { step: '1', text: 'Share your referral code with friends' },
            { step: '2', text: 'Friend signs up using your code' },
            { step: '3', text: 'Friend places their first order' },
            { step: '4', text: 'You both earn ₹50 instantly! 🎉' },
          ].map(s => (
            <View key={s.step} style={styles.stepRow}>
              <View style={styles.stepNum}>
                <Text style={styles.stepNumText}>{s.step}</Text>
              </View>
              <Text style={styles.stepText}>{s.text}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },

  // Header
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingBottom: 14,
  },
  backBtn:     { width: 40, alignItems: 'flex-start' },
  backIcon:    { fontSize: 32, color: C.white, lineHeight: 36 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: C.white },

  // Body
  body: { alignItems: 'center', padding: 20 },

  mainLottie: { width: 190, height: 190 },

  title: {
    fontSize: 22, fontWeight: '800', color: C.text,
    marginBottom: 8, textAlign: 'center',
  },
  sub: {
    fontSize: 13.5, color: C.sub, textAlign: 'center',
    lineHeight: 20, marginBottom: 20, paddingHorizontal: 8,
  },
  highlight: { color: C.green, fontWeight: '800' },

  // Wallet balance pill
  balancePill: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#E8F8EE', borderRadius: 30,
    paddingHorizontal: 18, paddingVertical: 10,
    marginBottom: 18, gap: 8,
    borderWidth: 1, borderColor: '#BBE8CC',
  },
  balanceIcon:   { fontSize: 18 },
  balanceLabel:  { fontSize: 13, color: C.sub, fontWeight: '600', flex: 1 },
  balanceAmount: { fontSize: 17, fontWeight: '900', color: C.green },

  // Referral code card
  codeCard: {
    backgroundColor: C.white, borderRadius: 18, padding: 20,
    alignItems: 'center', width: '100%', marginBottom: 16,
    borderWidth: 2, borderColor: '#BFDBFE',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 6, elevation: 4,
  },
  codeLabel: { fontSize: 11, color: C.sub, fontWeight: '700', marginBottom: 8, letterSpacing: 0.5 },
  code: {
    fontSize: 30, fontWeight: '900', color: C.primary,
    letterSpacing: 5, marginBottom: 4,
  },
  codeHint: { fontSize: 11, color: C.sub, marginTop: 2 },

  // Stats
  statsRow: {
    flexDirection: 'row', backgroundColor: C.white, borderRadius: 16,
    width: '100%', marginBottom: 20,
    paddingVertical: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  statChip: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 20, fontWeight: '900', marginBottom: 3 },
  statLabel: { fontSize: 10.5, color: C.sub, fontWeight: '600', textAlign: 'center' },
  statDivider: { width: 1, backgroundColor: '#E5E7EB', marginVertical: 4 },

  // Share button
  shareBtn: {
    backgroundColor: '#FF6B35', borderRadius: 14,
    paddingVertical: 13, paddingHorizontal: 32,
    flexDirection: 'row', alignItems: 'center', gap: 8,
    marginBottom: 28, width: '100%', justifyContent: 'center',
    shadowColor: '#FF6B35', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 6,
  },
  shareLottie:   { width: 32, height: 32 },
  shareBtnText:  { color: C.white, fontSize: 15, fontWeight: '800' },

  // Steps
  stepsWrap: { width: '100%', gap: 12 },
  stepRow:   { flexDirection: 'row', alignItems: 'center', gap: 12 },
  stepNum: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center',
  },
  stepNumText: { color: C.white, fontWeight: '800', fontSize: 14 },
  stepText:    { fontSize: 13.5, color: C.text, flex: 1, lineHeight: 19 },
});
