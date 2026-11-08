import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Image, ScrollView,
  StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';


const API = 'http://192.168.1.3:8000';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const HEADER_HEIGHT = SCREEN_WIDTH / 2; // image is exactly 2:1 ratio

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

const GENDERS = ['Male', 'Female', 'Prefer not to say'];

export default function SignupScreen({ navigation }) {
  const [form, setForm] = useState({
    fullName: '', mobile: '', email: '', gender: '', referralCode: '',
  });
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpVerified, setOtpVerified] = useState(false);
  const [terms, setTerms] = useState(false);
  const [timer, setTimer] = useState(0);
  const [loading, setLoading] = useState(false);
  const otpRefs = useRef([]);
  const timerRef = useRef(null);
  const autoVerifyRef = useRef(null);

  useEffect(() => {
    return () => {
      clearInterval(timerRef.current);
    };
  }, []);

  // Auto-verify once OTP is auto-filled
  useEffect(() => {
    if (autoVerifyRef.current && otp.join('').length === 6) {
      handleVerifyOtp(autoVerifyRef.current);
      autoVerifyRef.current = null;
    }
  }, [otp]);

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
    if (!/^[6-9]\d{9}$/.test(form.mobile)) {
      return Alert.alert('Invalid', 'Enter a valid 10-digit mobile number');
    }
    setLoading(true);
    try {
      const res = await fetch(`${API}/otp/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile_number: form.mobile }),
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

  const handleVerifyOtp = async (codeOverride) => {
    const code = typeof codeOverride === 'string' ? codeOverride : otp.join('');
    if (code.length < 6) return Alert.alert('Invalid', 'Enter the 6-digit OTP');
    setLoading(true);
    try {
      const res = await fetch(`${API}/otp/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile_number: form.mobile, otp: code }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        setOtpVerified(true);
        clearInterval(timerRef.current);
      } else {
        Alert.alert('Error', data.message || 'Invalid OTP');
      }
    } catch (e) {
      Alert.alert('Verify Error', e?.message || 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAccount = async () => {
    if (!form.fullName.trim()) return Alert.alert('Required', 'Enter your full name');
    if (!otpVerified) return Alert.alert('Required', 'Verify your mobile number first');
    if (!terms) return Alert.alert('Required', 'Accept Terms & Conditions to continue');

    setLoading(true);
    try {
      const res = await fetch(`${API}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: form.fullName,
          mobile_number: form.mobile,
          email: form.email || null,
          gender: form.gender || null,
          referred_by: form.referralCode || null,
          terms_accepted: terms,
        }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        Alert.alert('Welcome!', `Account created!\nCustomer Code: ${data.customer_code}`, [
          { text: 'Login', onPress: () => navigation.replace('Login') },
        ]);
      } else {
        Alert.alert('Error', data.message || 'Signup failed');
      }
    } catch (e) {
      Alert.alert('Signup Error', e?.message || 'Network error. Please try again.');
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
          {/* Header Image — full bleed to top, status bar floats over it */}
          <Image
            source={require('../../../assets/headers/sign-up_header.png')}
            style={s.header}
            resizeMode="stretch"
          />

          {/* Card */}
          <View style={s.card}>
            <Text style={s.title}>Create Account</Text>
            <Text style={s.subtitle}>Join Trusted Milk – Fresh from the farm</Text>

            {/* Full Name */}
            <Text style={s.label}>Full Name <Text style={s.req}>*</Text></Text>
            <TextInput
              style={s.input}
              placeholder="Enter your full name"
              placeholderTextColor={COLORS.muted}
              value={form.fullName}
              onChangeText={v => setForm(f => ({ ...f, fullName: v }))}
            />

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
                value={form.mobile}
                onChangeText={v => setForm(f => ({ ...f, mobile: v }))}
                editable={!otpVerified}
              />
            </View>

            {/* Send OTP */}
            {!otpVerified && (
              <TouchableOpacity
                style={[s.otpBtn, loading && s.disabled]}
                onPress={otpSent ? undefined : handleSendOtp}
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
            )}

            {/* OTP Input */}
            {otpSent && !otpVerified && (
              <>
                <Text style={[s.label, { marginTop: 16 }]}>Enter OTP</Text>
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
                <TouchableOpacity
                  style={[s.verifyBtn, loading && s.disabled]}
                  onPress={handleVerifyOtp}
                  disabled={loading}
                  activeOpacity={0.8}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={s.verifyBtnText}>Verify OTP</Text>
                  )}
                </TouchableOpacity>
              </>
            )}

            {otpVerified && (
              <View style={s.verifiedBadge}>
                <Text style={s.verifiedText}>✓ Mobile Verified</Text>
              </View>
            )}

            {/* Email */}
            <Text style={[s.label, { marginTop: 16 }]}>
              Email Address <Text style={s.optional}>(Optional)</Text>
            </Text>
            <TextInput
              style={s.input}
              placeholder="Enter your email"
              placeholderTextColor={COLORS.muted}
              keyboardType="email-address"
              autoCapitalize="none"
              value={form.email}
              onChangeText={v => setForm(f => ({ ...f, email: v }))}
            />

            {/* Gender */}
            <Text style={s.label}>Gender</Text>
            <View style={s.genderRow}>
              {GENDERS.map(g => (
                <TouchableOpacity
                  key={g}
                  style={[s.genderChip, form.gender === g && s.genderChipActive]}
                  onPress={() => setForm(f => ({ ...f, gender: g }))}
                  activeOpacity={0.8}
                >
                  <Text style={[s.genderText, form.gender === g && s.genderTextActive]}>
                    {g}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Referral Code */}
            <Text style={s.label}>
              Referral Code <Text style={s.optional}>(Optional)</Text>
            </Text>
            <View style={s.referralRow}>
              <Text style={s.referralIcon}>🎁</Text>
              <TextInput
                style={[s.input, s.flex, { marginBottom: 0 }]}
                placeholder="Enter referral code"
                placeholderTextColor={COLORS.muted}
                autoCapitalize="characters"
                value={form.referralCode}
                onChangeText={v => setForm(f => ({ ...f, referralCode: v }))}
              />
            </View>

            {/* Terms */}
            <TouchableOpacity
              style={s.termsRow}
              onPress={() => setTerms(t => !t)}
              activeOpacity={0.8}
            >
              <View style={[s.checkbox, terms && s.checkboxChecked]}>
                {terms && <Text style={s.checkmark}>✓</Text>}
              </View>
              <Text style={s.termsText}>
                I agree to the{' '}
                <Text style={s.termsLink}>Terms & Conditions</Text>
                {' '}and{' '}
                <Text style={s.termsLink}>Privacy Policy</Text>
              </Text>
            </TouchableOpacity>

            {/* Create Account */}
            <TouchableOpacity
              style={[s.createBtn, (!otpVerified || !terms || loading) && s.disabled]}
              onPress={handleCreateAccount}
              disabled={!otpVerified || !terms || loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={s.createBtnText}>Create Account</Text>
              )}
            </TouchableOpacity>

            {/* Login link */}
            <TouchableOpacity
              style={s.loginRow}
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={s.loginText}>
                Already have an account?{' '}
                <Text style={s.loginLink}>Login</Text>
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
  subtitle: { fontSize: 13, color: COLORS.muted, marginBottom: 20 },

  label: { fontSize: 13, fontWeight: '600', color: COLORS.text, marginBottom: 6 },
  req: { color: COLORS.error },
  optional: { color: COLORS.muted, fontWeight: '400' },

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

  otpRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 },
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

  verifyBtn: {
    backgroundColor: COLORS.green,
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
    marginBottom: 4,
  },
  verifyBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },

  verifiedBadge: {
    backgroundColor: '#E8F8EF',
    borderRadius: 10,
    paddingVertical: 8,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 4,
  },
  verifiedText: { color: COLORS.green, fontWeight: '700', fontSize: 14 },

  genderRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  genderChip: {
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F7F9FB',
  },
  genderChipActive: { borderColor: COLORS.primary, backgroundColor: '#E8F4F8' },
  genderText: { fontSize: 13, color: COLORS.muted, fontWeight: '500' },
  genderTextActive: { color: COLORS.primary, fontWeight: '700' },

  referralRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  referralIcon: { fontSize: 20 },

  termsRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 20 },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  checkboxChecked: { backgroundColor: COLORS.green, borderColor: COLORS.green },
  checkmark: { color: '#fff', fontSize: 13, fontWeight: '700' },
  termsText: { flex: 1, fontSize: 13, color: COLORS.muted, lineHeight: 20 },
  termsLink: { color: COLORS.primary, fontWeight: '600' },

  createBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  createBtnText: { color: '#fff', fontSize: 17, fontWeight: '800', letterSpacing: 0.5 },

  disabled: { opacity: 0.5 },

  loginRow: { alignItems: 'center', marginTop: 18 },
  loginText: { fontSize: 14, color: COLORS.muted },
  loginLink: { color: COLORS.primary, fontWeight: '700' },
});
