import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, Alert, ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../context/AuthContext';

const C = {
  blue:   '#2196F3',
  blueDk: '#025F86',
  green:  '#16A34A',
  red:    '#EF4444',
  bg:     '#F0F4F8',
  white:  '#FFFFFF',
  text:   '#172536',
  sub:    '#728195',
  line:   '#E4EBF2',
};

// ─── Menu row ─────────────────────────────────────────────────────────────────
function MenuRow({ icon, label, sublabel, onPress, color = C.text, iconBg = '#EBF4FF' }) {
  return (
    <TouchableOpacity style={s.menuRow} onPress={onPress} activeOpacity={0.78}>
      <View style={[s.menuIcon, { backgroundColor: iconBg }]}>
        <MaterialCommunityIcons name={icon} size={20} color={color === C.red ? C.red : C.blue} />
      </View>
      <View style={s.menuBody}>
        <Text style={[s.menuLabel, { color }]}>{label}</Text>
        {sublabel ? <Text style={s.menuSub}>{sublabel}</Text> : null}
      </View>
      <MaterialCommunityIcons name="chevron-right" size={20} color={C.sub} />
    </TouchableOpacity>
  );
}

// ─── Section header ───────────────────────────────────────────────────────────
function SectionHead({ title }) {
  return <Text style={s.sectionHead}>{title}</Text>;
}

export default function AccountScreen({ navigation }) {
  const insets        = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            setLoggingOut(true);
            try {
              await logout();
              // RootNavigator in App.jsx detects user=null and shows AuthNavigator
            } catch {
              setLoggingOut(false);
            }
          },
        },
      ],
    );
  };

  const fullName      = user?.full_name      ?? '—';
  const customerCode  = user?.customer_code  ?? '—';
  const mobile        = user?.mobile_number  ?? '—';
  const email         = user?.email          ?? 'Not set';
  const initials      = fullName
    .split(' ')
    .map(w => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <View style={s.root}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
      >
        {/* ── Avatar header ────────────────────────────────────────── */}
        <LinearGradient
          colors={['#025F86', '#0E8ABE']}
          style={[s.heroCard, { paddingTop: insets.top + 20 }]}
        >
          <View style={s.avatarCircle}>
            <Text style={s.avatarInitials}>{initials || '👤'}</Text>
          </View>
          <Text style={s.heroName}>{fullName}</Text>
          <View style={s.heroPill}>
            <MaterialCommunityIcons name="identifier" size={13} color="rgba(255,255,255,0.8)" />
            <Text style={s.heroPillTxt}>{customerCode}</Text>
          </View>
          <View style={s.heroMeta}>
            {mobile !== '—' && (
              <View style={s.heroMetaItem}>
                <MaterialCommunityIcons name="phone-outline" size={13} color="rgba(255,255,255,0.7)" />
                <Text style={s.heroMetaTxt}>{mobile}</Text>
              </View>
            )}
            {email !== 'Not set' && (
              <View style={s.heroMetaItem}>
                <MaterialCommunityIcons name="email-outline" size={13} color="rgba(255,255,255,0.7)" />
                <Text style={s.heroMetaTxt}>{email}</Text>
              </View>
            )}
          </View>
        </LinearGradient>

        {/* ── My Activity ──────────────────────────────────────────── */}
        <View style={s.card}>
          <SectionHead title="My Activity" />
          <MenuRow
            icon="shopping-outline"
            label="My Orders"
            sublabel="Track and view past orders"
            iconBg="#EBF4FF"
            onPress={() => {}}
          />
          <View style={s.rowDivider} />
          <MenuRow
            icon="wallet-outline"
            label="Wallet & Rewards"
            sublabel="Check balance and transactions"
            iconBg="#EBF4FF"
            onPress={() => navigation.navigate('Wallet')}
          />
          <View style={s.rowDivider} />
          <MenuRow
            icon="calendar-sync-outline"
            label="Subscriptions"
            sublabel="Manage your daily subscriptions"
            iconBg="#EBF4FF"
            onPress={() => navigation.navigate('Subscriptions')}
          />
        </View>

        {/* ── Refer & Earn ─────────────────────────────────────────── */}
        <View style={s.card}>
          <SectionHead title="Rewards" />
          <MenuRow
            icon="gift-outline"
            label="Refer & Earn"
            sublabel="Share your code and earn ₹50"
            iconBg="#FEF3C7"
            onPress={() => navigation.navigate('ReferEarnScreen')}
          />
        </View>

        {/* ── Support ──────────────────────────────────────────────── */}
        <View style={s.card}>
          <SectionHead title="Help & Support" />
          <MenuRow
            icon="headset"
            label="Contact Support"
            sublabel="We're here to help"
            iconBg="#EBF4FF"
            onPress={() => {}}
          />
          <View style={s.rowDivider} />
          <MenuRow
            icon="shield-check-outline"
            label="Privacy Policy"
            iconBg="#EBF4FF"
            onPress={() => {}}
          />
        </View>

        {/* ── Logout ───────────────────────────────────────────────── */}
        <View style={s.card}>
          <TouchableOpacity
            style={s.logoutBtn}
            onPress={handleLogout}
            disabled={loggingOut}
            activeOpacity={0.84}
          >
            {loggingOut ? (
              <ActivityIndicator color={C.red} />
            ) : (
              <>
                <MaterialCommunityIcons name="logout" size={20} color={C.red} />
                <Text style={s.logoutTxt}>Logout</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },

  // Hero
  heroCard: {
    paddingHorizontal: 24,
    paddingBottom: 28,
    alignItems: 'center',
  },
  avatarCircle: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 2.5, borderColor: 'rgba(255,255,255,0.5)',
  },
  avatarInitials: { fontSize: 28, fontWeight: '900', color: C.white },
  heroName:  { fontSize: 22, fontWeight: '900', color: C.white, marginBottom: 6 },
  heroPill: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 12, paddingVertical: 4,
    borderRadius: 20, marginBottom: 12,
  },
  heroPillTxt: { color: 'rgba(255,255,255,0.9)', fontSize: 12, fontWeight: '700' },
  heroMeta: { flexDirection: 'column', gap: 4, alignItems: 'center' },
  heroMetaItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  heroMetaTxt: { color: 'rgba(255,255,255,0.75)', fontSize: 12, fontWeight: '600' },

  // Card container
  card: {
    backgroundColor: C.white,
    marginHorizontal: 16,
    marginTop: 14,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1, borderColor: C.line,
    shadowColor: '#1A3040',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },

  sectionHead: {
    fontSize: 11, fontWeight: '800', color: C.sub,
    letterSpacing: 0.6, textTransform: 'uppercase',
    paddingHorizontal: 16, paddingTop: 12, paddingBottom: 4,
  },

  // Menu row
  menuRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 13, gap: 12,
  },
  menuIcon: {
    width: 38, height: 38, borderRadius: 19,
    alignItems: 'center', justifyContent: 'center',
  },
  menuBody:  { flex: 1 },
  menuLabel: { fontSize: 14, fontWeight: '800', color: C.text, marginBottom: 1 },
  menuSub:   { fontSize: 11.5, color: C.sub, fontWeight: '600' },

  rowDivider: { height: 1, backgroundColor: C.line, marginLeft: 64 },

  // Logout
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 10, paddingVertical: 15,
  },
  logoutTxt: { fontSize: 15, fontWeight: '900', color: C.red },
});
