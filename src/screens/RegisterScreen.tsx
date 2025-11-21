import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';

import FieldLabel from '../components/auth/FieldLabel';
import GradientButton from '../components/auth/GradientButton';
import GridDecor from '../components/auth/GridDecor';
import Input from '../components/auth/Input';
import Toast from 'react-native-toast-message';

import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';

import { apiHandle } from '../api/apihandle';
import { Auth } from '../api/endpoint/Auth';

type Props = NativeStackScreenProps<RootStackParamList, 'Register'>;
type Phase = 'form' | 'verify';

export default function RegisterScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();

  // ===== Phase
  const [phase, setPhase] = useState<Phase>('form');
  const [loading, setLoading] = useState(false);

  // ===== Fields (ALL REQUIRED)
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');
  const [showPw1, setShowPw1] = useState(false);
  const [showPw2, setShowPw2] = useState(false);

  // company (ALL REQUIRED)
  const [companyName, setCompanyName] = useState('');
  const [companyAddress, setCompanyAddress] = useState('');
  const [companyEmail, setCompanyEmail] = useState('');
  const [companyPhone, setCompanyPhone] = useState('');

  // verify
  const [code, setCode] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  // cooldown resend
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setInterval(() => setResendCooldown(s => s - 1), 1000);
    return () => clearInterval(t);
  }, [resendCooldown]);

  // ===== helpers
  const trimmed = {
    full_name: fullName.trim(),
    email: email.trim(),
    password: pw.trim(),
    password2: pw2.trim(),
    company_name: companyName.trim(),
    company_address: companyAddress.trim(),
    company_email: companyEmail.trim(),
    company_phone: companyPhone.trim(),
  };

  const isFormValid = useMemo(() => {
    const t = trimmed;
    return (
      !!t.full_name &&
      !!t.email &&
      !!t.password &&
      !!t.password2 &&
      t.password === t.password2 &&
      !!t.company_name &&
      !!t.company_address &&
      !!t.company_email &&
      !!t.company_phone
    );
  }, [fullName, email, pw, pw2, companyName, companyAddress, companyEmail, companyPhone]);

  // =======================
  //   ACTIONS
  // =======================

  // Register
  const onSubmitRegister = async () => {
    const t = trimmed;

    // validate từng lỗi cụ thể
    if (!t.full_name) return Toast.show({ type: 'error', text1: 'Thiếu họ tên' });
    if (!t.email) return Toast.show({ type: 'error', text1: 'Thiếu email' });
    if (!t.password || !t.password2) return Toast.show({ type: 'error', text1: 'Thiếu mật khẩu' });
    if (t.password !== t.password2) return Alert.alert('Error', 'Passwords do not match');
    if (!t.company_name) return Toast.show({ type: 'error', text1: 'Thiếu company_name' });
    if (!t.company_address) return Toast.show({ type: 'error', text1: 'Thiếu company_address' });
    if (!t.company_email) return Toast.show({ type: 'error', text1: 'Thiếu company_email' });
    if (!t.company_phone) return Toast.show({ type: 'error', text1: 'Thiếu company_phone' });

    try {
      setLoading(true);
      const payload = {
        email: t.email,
        password: t.password,
        full_name: t.full_name,
        company_name: t.company_name,
        company_address: t.company_address,
        company_email: t.company_email,
        company_phone: t.company_phone,
      };

      const { status, res } = await apiHandle.callApi(Auth.Register, payload).asPromise();
      if (status.isError || !res?.success) {
        throw new Error(res?.error || res?.message || 'Register failed');
      }

      Toast.show({
        type: 'success',
        text1: 'Đăng ký thành công 🎉',
        text2: 'Kiểm tra email để lấy mã xác nhận.',
      });

      setPhase('verify');
      setResendCooldown(60);
    } catch (e: any) {
      Toast.show({ type: 'error', text1: 'Đăng ký thất bại', text2: e?.message || 'Vui lòng thử lại.' });
    } finally {
      setLoading(false);
    }
  };

  // Verify
  const onSubmitVerify = async () => {
    const e = email.trim();
    const c = code.trim();
    if (!e) return Toast.show({ type: 'error', text1: 'Thiếu email' });
    if (!c) return Toast.show({ type: 'error', text1: 'Thiếu mã xác nhận' });

    try {
      setLoading(true);
      const { status, res } = await apiHandle.callApi(Auth.Verify, { email: e, code: c }).asPromise();
      if (status.isError || !res?.success) {
        throw new Error(res?.error || res?.message || 'Verify failed');
      }
      Toast.show({ type: 'success', text1: 'Xác nhận thành công 🎉', text2: 'Bạn có thể đăng nhập ngay.' });
      navigation.replace('Login');
    } catch (e: any) {
      Toast.show({ type: 'error', text1: 'Xác nhận thất bại', text2: e?.message || 'Vui lòng kiểm tra lại mã.' });
    } finally {
      setLoading(false);
    }
  };

  // Resend
  const onResendCode = async () => {
    const e = email.trim();
    if (!e) return Toast.show({ type: 'error', text1: 'Thiếu email', text2: 'Nhập email ở bước đăng ký.' });
    if (resendCooldown > 0) return;

    try {
      setLoading(true);
      const { status, res } = await apiHandle.callApi(Auth.ResendCode, { email: e }).asPromise();
      if (status.isError || !res?.success) {
        throw new Error(res?.error || res?.message || 'Resend failed');
      }
      Toast.show({ type: 'success', text1: 'Đã gửi lại mã ✅', text2: 'Kiểm tra email của bạn.' });
      setResendCooldown(60);
    } catch (e: any) {
      Toast.show({ type: 'error', text1: 'Gửi lại mã thất bại', text2: e?.message || 'Vui lòng thử lại.' });
    } finally {
      setLoading(false);
    }
  };

  // =======================
  //   RENDER
  // =======================

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.select({ ios: 'padding', android: undefined })}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scroll,
            { paddingTop: insets.top + 12, paddingBottom: 28 },
          ]}
          keyboardShouldPersistTaps="handled"
        >
          <GridDecor />

          <View style={{ alignItems: 'center', marginTop: 6 }}>
            <Image
              source={require('../assets/Auth/LoginIcon.png')}
              style={{ width: 44, height: 44, resizeMode: 'contain' }}
            />
            <Text style={styles.title}>
              {phase === 'form' ? 'Register Admin' : 'Verify your Email'}
            </Text>
          </View>

          {phase === 'form' ? (
            <>
              {/* Required fields */}
              <FieldLabel>Full Name*</FieldLabel>
              <Input value={fullName} onChangeText={setFullName} placeholder="Nguyễn Văn A" />

              <FieldLabel style={{ marginTop: 12 }}>Email*</FieldLabel>
              <Input
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                placeholder="you@company.com"
              />

              <FieldLabel style={{ marginTop: 12 }}>Password*</FieldLabel>
              <Input
                value={pw}
                onChangeText={setPw}
                secureTextEntry={!showPw1}
                placeholder="Create a password"
                rightIcon={
                  <Pressable onPress={() => setShowPw1(s => !s)}>
                    <Icon name={showPw1 ? 'eye-off-outline' : 'eye-outline'} size={20} color="#9AA2B1" />
                  </Pressable>
                }
              />

              <FieldLabel style={{ marginTop: 12 }}>Confirm Password*</FieldLabel>
              <Input
                value={pw2}
                onChangeText={setPw2}
                secureTextEntry={!showPw2}
                placeholder="Re-enter password"
                rightIcon={
                  <Pressable onPress={() => setShowPw2(s => !s)}>
                    <Icon name={showPw2 ? 'eye-off-outline' : 'eye-outline'} size={20} color="#9AA2B1" />
                  </Pressable>
                }
              />

              <FieldLabel style={{ marginTop: 14 }}>Company Name*</FieldLabel>
              <Input value={companyName} onChangeText={setCompanyName} placeholder="Công ty ABC" />

              <FieldLabel style={{ marginTop: 12 }}>Company Address*</FieldLabel>
              <Input value={companyAddress} onChangeText={setCompanyAddress} placeholder="Số nhà, đường, quận, TP" />

              <FieldLabel style={{ marginTop: 12 }}>Company Email*</FieldLabel>
              <Input
                value={companyEmail}
                onChangeText={setCompanyEmail}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                placeholder="contact@company.com"
              />

              <FieldLabel style={{ marginTop: 12 }}>Company Phone*</FieldLabel>
              <Input value={companyPhone} onChangeText={setCompanyPhone} keyboardType="phone-pad" placeholder="0123456789" />

              <GradientButton
                text={loading ? 'Registering...' : 'Register'}
                disabled={loading || !isFormValid}
                onPress={onSubmitRegister}
              />

              <View style={{ alignItems: 'center', marginTop: 14 }}>
                <Text style={{ color: '#6B7280' }}>
                  Already have an account?{' '}
                  <Text onPress={() => navigation.replace('Login')} style={{ color: '#4C74E6', fontWeight: '700' }}>
                    Log In
                  </Text>
                </Text>
              </View>
            </>
          ) : (
            // ===== PHASE: VERIFY OTP =====
            <>
              <Text style={{ color: '#6B7280', marginTop: 6 }}>
                Mã xác nhận đã gửi đến <Text style={{ fontWeight: '700' }}>{email}</Text>.
              </Text>

              {/* <FieldLabel style={{ marginTop: 16 }}>Email*</FieldLabel>
              <Input
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
              /> */}

              <FieldLabel style={{ marginTop: 12 }}>Verification Code*</FieldLabel>
              <Input
                value={code}
                onChangeText={setCode}
                keyboardType="number-pad"
                placeholder="6-digit code"
                maxLength={6}
              />

              <GradientButton
                text={loading ? 'Verifying...' : 'Verify Account'}
                disabled={loading || !email.trim() || !code.trim()}
                onPress={onSubmitVerify}
              />

              <View style={{ alignItems: 'center', marginTop: 12 }}>
                <Text style={{ color: '#6B7280' }}>
                  Không nhận được mã?{' '}
                  <Text
                    onPress={resendCooldown > 0 ? undefined : onResendCode}
                    style={{ color: resendCooldown > 0 ? '#9AA2B1' : '#4C74E6', fontWeight: '700' }}
                  >
                    {resendCooldown > 0 ? `Gửi lại sau ${resendCooldown}s` : 'Gửi lại mã'}
                  </Text>
                </Text>
              </View>

              <View style={{ alignItems: 'center', marginTop: 14 }}>
                <Text style={{ color: '#6B7280' }}>
                  Nhập sai email?{' '}
                  <Text onPress={() => setPhase('form')} style={{ color: '#4C74E6', fontWeight: '700' }}>
                    Sửa thông tin
                  </Text>
                </Text>
              </View>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      <Toast />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFFFFF' },
  scroll: { paddingHorizontal: 16 },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#222',
    marginTop: 6,
    marginBottom: 10,
  },
});
