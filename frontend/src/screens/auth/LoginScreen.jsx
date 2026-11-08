import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Image, ScrollView,
  StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../context/AuthContext';

const API = 'http://192.168.1.70:8000';
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const HEADER_HEIGHT = SCREEN_WIDTH / 2;

const COLORS = {
  primary: '#1F6F8B',
  green: '#27AE60',
  bg: '#F0F4F8',
  card: '#FCFCFA',
  border: '#DDE3EA',
  text: '#1A2B3C',
  muted: '#7A8FA6',
  error: '#E74C3C',
};

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const [mobile, setMobile] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(0);
  const [loading, setLoading] = useState(false);
  const otpRefs = useRef([]);
  const timerRef = useRef(null);

  useEffect(() => () => clearInterval(timerRef.current), []);

  const startTimer = () => {
    setTimer(45);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimer(t => {
        if (t <= 1) { clearInterval(timerRef.current); return 0; }
        return t - 1;
      });
    }, 1000);
  };

  const handleSendOtp = async () => {
    if (!/^[6-9]\d{9}$/.test(mobile)) {
      return Alert.alert('Invalid', 'Enter a valid 10-digit mobile number');
    }
    setLoading(true);
    try {
      const res = await fetch(`${API}/otp/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile_number: mobile }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        setOtpSent(true);
        startTimer();
      } else {
        Alert.alert('Error', data.message || 'Failed to send OTP');
      }
    } catch (e) {
      Alert.alert('Error', e?.message || 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (val, idx) => {
    const next = [...otp];
    next[idx] = val.replace(/\D/, '');
    setOtp(next);
    if (val && idx < 5) otpRefs.current[idx + 1]?.focus();
    if (!val && idx > 0) otpRefs.current[idx - 1]?.focus();
  };

  const handleLogin = async () => {
    const code = otp.join('');
    if (code.length < 6) return Alert.alert('Invalid', 'Enter the 6-digit OTP');
    setLoading(true);
    try {
      const res = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mobile_number: mobile,
          otp: code,
          device_info: `${Platform.OS} app`,
        }),
      });
      const data = await res.json();
      if (data.status === 'success') {
          // Persist token for apiFetch and update AuthContext state
          await AsyncStorage.multiSet([
            ['token',         data.token],
            ['customer_code', data.customer_code],
            ['full_name',     data.full_name],
            ['user_id',       data.user_id ?? ''],
          ]);
          await login({
            token:         data.token,
            customer_code: data.customer_code,
            full_name:     data.full_name,
            user_id:       data.user_id ?? '',
          });
          // AuthContext.login() sets user state → RootNavigator in App.jsx
          // automatically swaps to AppNavigator. No manual navigation needed.
        } else {
        Alert.alert('Error', data.message || 'Login failed');
      }
    } catch (e) {
      Alert.alert('Error', e?.message || 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const pad = n => String(n).padStart(2, '0');

  return (
    <SafeAreaView style={s.safe} edges={['left', 'right', 'bottom']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={s.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Same header as signup */}
          <Image
            source={require('../../../assets/headers/sign-up_header.png')}
            style={s.header}
            resizeMode="stretch"
          />

          {/* Card */}
          <View style={s.card}>
            <Text style={s.title}>Welcome Back 👋</Text>
            <Text style={s.subtitle}>Login to your Trusted Milk account</Text>

            {/* Mobile */}
            <Text style={s.label}>Mobile Number <Text style={s.req}>*</Text></Text>
            <View style={s.row}>
              <View style={s.countryCode}>
                <Text style={s.countryText}>🇮🇳 +91</Text>
              </View>
              <TextInput
                style={[s.input, s.flex, { marginBottom: 0 }]}
                placeholder="10-digit mobile"
                placeholderTextColor={COLORS.muted}
                keyboardType="phone-pad"
                maxLength={10}
                value={mobile}
                onChangeText={setMobile}
                editable={!otpSent}
              />
            </View>

            {/* Send / Resend OTP */}
            <TouchableOpacity
              style={[s.otpBtn, (loading || (otpSent && timer > 0)) && s.disabled]}
              onPress={handleSendOtp}
              disabled={loading || (otpSent && timer > 0)}
              activeOpacity={0.8}
            >
              {loading && !otpSent ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={s.otpBtnText}>
                  {otpSent ? `Resend OTP (${pad(0)}:${pad(timer)})` : 'Send OTP'}
                </Text>
              )}
            </TouchableOpacity>

            {/* OTP Boxes */}
            {otpSent && (
              <>
                <Text style={[s.label, { marginTop: 20 }]}>Enter OTP</Text>
                <View style={s.otpRow}>
                  {otp.map((digit, i) => (
                    <TextInput
                      key={i}
                      ref={r => (otpRefs.current[i] = r)}
                      style={s.otpBox}
                      keyboardType="number-pad"
                      maxLength={1}
                      value={digit}
                      onChangeText={v => handleOtpChange(v, i)}
                      textAlign="center"
                    />
                  ))}
                </View>

                {/* Login Button */}
                <TouchableOpacity
                  style={[s.loginBtn, loading && s.disabled]}
                  onPress={handleLogin}
                  disabled={loading}
                  activeOpacity={0.85}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={s.loginBtnText}>Login</Text>
                  )}
                </TouchableOpacity>
              </>
            )}

            {/* Signup link */}
            <TouchableOpacity
              style={s.signupRow}
              onPress={() => navigation.navigate('Signup')}
            >
              <Text style={s.signupText}>
                New to Trusted Milk?{' '}
                <Text style={s.signupLink}>Create Account</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { paddingBottom: 40 },
  header: { width: SCREEN_WIDTH, height: HEADER_HEIGHT },

  card: {
    marginHorizontal: 16,
    marginTop: -24,
    backgroundColor: COLORS.card,
    borderRadius: 24,
    padding: 24,
    shadowColor: '#1F6F8B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },

  title: { fontSize: 22, fontWeight: '700', color: COLORS.text, marginBottom: 4 },
  subtitle: { fontSize: 13, color: COLORS.muted, marginBottom: 24 },

  label: { fontSize: 13, fontWeight: '600', color: COLORS.text, marginBottom: 6 },
  req: { color: COLORS.error },

  input: {
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: COLORS.text,
    backgroundColor: '#F7F9FB',
    marginBottom: 14,
  },

  row: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  flex: { flex: 1 },
  countryCode: {
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#F7F9FB',
  },
  countryText: { fontSize: 14, color: COLORS.text },

  otpBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
    marginTop: 4,
  },
  otpBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },

  otpRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  otpBox: {
    width: 46,
    height: 52,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 12,
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    backgroundColor: '#F7F9FB',
  },

  loginBtn: {
    backgroundColor: COLORS.green,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: COLORS.green,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  loginBtnText: { color: '#fff', fontSize: 17, fontWeight: '800', letterSpacing: 0.5 },

  disabled: { opacity: 0.5 },

  signupRow: { alignItems: 'center', marginTop: 24 },
  signupText: { fontSize: 14, color: COLORS.muted },
  signupLink: { color: COLORS.primary, fontWeight: '700' },
});
