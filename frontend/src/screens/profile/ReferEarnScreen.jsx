import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Share } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LottieView from 'lottie-react-native';

const C = { primary: '#025F86', white: '#fff', bg: '#F4F8FB', text: '#1A2B3C', sub: '#6B7280' };

export default function ReferEarnScreen({ navigation }) {
  const insets = useSafeAreaInsets();

  const handleShare = async () => {
    await Share.share({
      message: '🥛 Try Trusted Milk – Fresh, Pure & Hygienic dairy delivered daily! Use my referral code MILK50 and get ₹50 off your first order.',
    });
  };

  return (
    <View style={styles.root}>
      <LinearGradient colors={['#025F86', '#0E7FB0']} style={[styles.header, { paddingTop: insets.top + 14 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Refer & Earn</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

      <View style={styles.body}>
        <LottieView
          source={require('../../../assets/animations/refer and earn button.json')}
          autoPlay loop style={styles.mainLottie}
        />

        <Text style={styles.title}>Invite Friends & Earn</Text>
        <Text style={styles.sub}>Share your referral code and earn ₹50 for every friend who places their first order.</Text>

        <View style={styles.codeCard}>
          <Text style={styles.codeLabel}>Your Referral Code</Text>
          <Text style={styles.code}>MILK50</Text>
        </View>

        <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
          <LottieView
            source={require('../../../assets/animations/Share.json')}
            autoPlay loop style={styles.shareLottie}
          />
          <Text style={styles.shareBtnText}>Share Now</Text>
        </TouchableOpacity>

        <View style={styles.stepsWrap}>
          {[
            { step: '1', text: 'Share your referral code with friends' },
            { step: '2', text: 'Friend signs up & places first order' },
            { step: '3', text: 'You earn ₹50 in your wallet!' },
          ].map(s => (
            <View key={s.step} style={styles.stepRow}>
              <View style={styles.stepNum}><Text style={styles.stepNumText}>{s.step}</Text></View>
              <Text style={styles.stepText}>{s.text}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingBottom: 14,
  },
  backBtn: { width: 40, alignItems: 'flex-start' },
  backIcon: { fontSize: 32, color: C.white, lineHeight: 36 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: C.white },
  body: { flex: 1, alignItems: 'center', padding: 24 },
  mainLottie: { width: 200, height: 200 },
  title: { fontSize: 24, fontWeight: '800', color: C.text, marginBottom: 8, textAlign: 'center' },
  sub: { fontSize: 14, color: C.sub, textAlign: 'center', lineHeight: 20, marginBottom: 24 },
  codeCard: {
    backgroundColor: C.white, borderRadius: 16, padding: 20,
    alignItems: 'center', width: '100%', marginBottom: 20,
    borderWidth: 2, borderColor: '#BFDBFE',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 6, elevation: 4,
  },
  codeLabel: { fontSize: 12, color: C.sub, fontWeight: '600', marginBottom: 6 },
  code: { fontSize: 32, fontWeight: '900', color: C.primary, letterSpacing: 4 },
  shareBtn: {
    backgroundColor: '#FF6B35', borderRadius: 14, paddingVertical: 14,
    paddingHorizontal: 32, flexDirection: 'row', alignItems: 'center',
    gap: 8, marginBottom: 28,
    shadowColor: '#FF6B35', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 6,
  },
  shareLottie: { width: 32, height: 32 },
  shareBtnText: { color: C.white, fontSize: 16, fontWeight: '800' },
  stepsWrap: { width: '100%', gap: 12 },
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  stepNum: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center',
  },
  stepNumText: { color: C.white, fontWeight: '800', fontSize: 14 },
  stepText: { fontSize: 14, color: C.text, flex: 1 },
});
