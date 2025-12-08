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

  const [phase, setPhase] = useState<Phase>('form');
  const [loading, setLoading] = useState(false);

  // Form fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');
  const [showPw1, setShowPw1] = useState(false);
  const [showPw2, setShowPw2] = useState(false);

  const [companyName, setCompanyName] = useState('');
  const [companyAddress, setCompanyAddress] = useState('');
  const [companyEmail, setCompanyEmail] = useState('');
  const [companyPhone, setCompanyPhone] = useState('');

  // Verify
  const [code, setCode] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setInterval(() => setResendCooldown(s => s - 1), 1000);
    return () => clearInterval(t);
  }, [resendCooldown]);

  // ===== Helpers =====
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
  //       REGISTER
  // =======================

  const onSubmitRegister = async () => {
    const t = trimmed;

    if (!t.full_name) return Toast.show({ type: 'error', text1: 'Thiếu họ tên' });
    if (!t.email) return Toast.show({ type: 'error', text1: 'Thiếu email' });
    if (!t.password || !t.password2) return Toast.show({ type: 'error', text1: 'Thiếu mật khẩu' });
    if (t.password !== t.password2) return Alert.alert('Lỗi', 'Mật khẩu nhập lại không khớp');
    if (!t.company_name) return Toast.show({ type: 'error', text1: 'Thiếu tên công ty' });
    if (!t.company_address) return Toast.show({ type: 'error', text1: 'Thiếu địa chỉ công ty' });
    if (!t.company_email) return Toast.show({ type: 'error', text1: 'Thiếu email công ty' });
    if (!t.company_phone) return Toast.show({ type: 'error', text1: 'Thiếu số điện thoại công ty' });

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
        throw new Error(res?.error || res?.message || 'Đăng ký thất bại');
      }

      Toast.show({
        type: 'success',
        text1: 'Đăng ký thành công 🎉',
        text2: 'Vui lòng kiểm tra email để lấy mã xác nhận.',
      });

      setPhase('verify');
      setResendCooldown(60);

    } catch (e: any) {
      Toast.show({
        type: 'error',
        text1: 'Đăng ký thất bại',
        text2: e?.message || 'Vui lòng thử lại.',
      });
    } finally {
      setLoading(false);
    }
  };

  // =======================
  //       VERIFY OTP
  // =======================

  const onSubmitVerify = async () => {
    const e = email.trim();
    const c = code.trim();

    if (!e) return Toast.show({ type: 'error', text1: 'Thiếu email' });
    if (!c) return Toast.show({ type: 'error', text1: 'Thiếu mã xác nhận' });

    try {
      setLoading(true);

      const { status, res } = await apiHandle
        .callApi(Auth.Verify, { email: e, code: c })
        .asPromise();

      if (status.isError || !res?.success) {
        throw new Error(res?.error || res?.message || 'Xác nhận thất bại');
      }

      Toast.show({
        type: 'success',
        text1: 'Xác nhận thành công 🎉',
        text2: 'Bạn có thể đăng nhập ngay.',
      });

      navigation.replace('Login');

    } catch (e: any) {
      Toast.show({
        type: 'error',
        text1: 'Xác nhận thất bại',
        text2: e?.message || 'Vui lòng kiểm tra lại mã.',
      });
    } finally {
      setLoading(false);
    }
  };

  // =======================
  //      RESEND OTP
  // =======================

  const onResendCode = async () => {
    const e = email.trim();

    if (!e)
      return Toast.show({
        type: 'error',
        text1: 'Thiếu email',
        text2: 'Bạn cần nhập email ở bước đăng ký.',
      });

    if (resendCooldown > 0) return;

    try {
      setLoading(true);

      const { status, res } = await apiHandle
        .callApi(Auth.ResendCode, { email: e })
        .asPromise();

      if (status.isError || !res?.success) {
        throw new Error(res?.error || res?.message || 'Không thể gửi mã');
      }

      Toast.show({
        type: 'success',
        text1: 'Đã gửi lại mã xác nhận',
        text2: 'Vui lòng kiểm tra email.',
      });

      setResendCooldown(60);

    } catch (e: any) {
      Toast.show({
        type: 'error',
        text1: 'Gửi lại mã thất bại',
        text2: e?.message || 'Vui lòng thử lại.',
      });
    } finally {
      setLoading(false);
    }
  };

  // =======================
  //       RENDER UI
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
              {phase === 'form' ? 'Đăng ký quản trị viên' : 'Xác nhận email'}
            </Text>
          </View>

          {/* ================= FORM ================= */}
          {phase === 'form' ? (
            <>
              <FieldLabel>Họ và tên*</FieldLabel>
              <Input placeholder="Nguyễn Văn A" value={fullName} onChangeText={setFullName} />

              <FieldLabel style={{ marginTop: 12 }}>Email*</FieldLabel>
              <Input
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                placeholder="you@company.com"
              />

              <FieldLabel style={{ marginTop: 12 }}>Mật khẩu*</FieldLabel>
              <Input
                value={pw}
                onChangeText={setPw}
                secureTextEntry={!showPw1}
                placeholder="Tạo mật khẩu"
                rightIcon={
                  <Pressable onPress={() => setShowPw1(s => !s)}>
                    <Icon name={showPw1 ? 'eye-off-outline' : 'eye-outline'} size={20} color="#9AA2B1" />
                  </Pressable>
                }
              />

              <FieldLabel style={{ marginTop: 12 }}>Nhập lại mật khẩu*</FieldLabel>
              <Input
                value={pw2}
                onChangeText={setPw2}
                secureTextEntry={!showPw2}
                placeholder="Nhập lại mật khẩu"
                rightIcon={
                  <Pressable onPress={() => setShowPw2(s => !s)}>
                    <Icon name={showPw2 ? 'eye-off-outline' : 'eye-outline'} size={20} color="#9AA2B1" />
                  </Pressable>
                }
              />

              <FieldLabel style={{ marginTop: 14 }}>Tên công ty*</FieldLabel>
              <Input placeholder="Công ty ABC" value={companyName} onChangeText={setCompanyName} />

              <FieldLabel style={{ marginTop: 12 }}>Địa chỉ công ty*</FieldLabel>
              <Input placeholder="Số nhà, đường, quận, TP" value={companyAddress} onChangeText={setCompanyAddress} />

              <FieldLabel style={{ marginTop: 12 }}>Email công ty*</FieldLabel>
              <Input
                value={companyEmail}
                onChangeText={setCompanyEmail}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                placeholder="contact@company.com"
              />

              <FieldLabel style={{ marginTop: 12 }}>Số điện thoại công ty*</FieldLabel>
              <Input
                value={companyPhone}
                onChangeText={setCompanyPhone}
                keyboardType="phone-pad"
                placeholder="0123456789"
              />

              <GradientButton
                text={loading ? 'Đang đăng ký...' : 'Đăng ký'}
                disabled={loading || !isFormValid}
                onPress={onSubmitRegister}
              />

              <View style={{ alignItems: 'center', marginTop: 14 }}>
                <Text style={{ color: '#6B7280' }}>
                  Đã có tài khoản?{' '}
                  <Text
                    onPress={() => navigation.replace('Login')}
                    style={{ color: '#4C74E6', fontWeight: '700' }}
                  >
                    Đăng nhập
                  </Text>
                </Text>
              </View>
            </>
          ) : (
            <>
              {/* ================= VERIFY ================= */}
              <Text style={{ color: '#6B7280', marginTop: 6 }}>
                Mã xác nhận đã được gửi đến{' '}
                <Text style={{ fontWeight: '700' }}>{email}</Text>.
              </Text>

              <FieldLabel style={{ marginTop: 12 }}>Mã xác nhận*</FieldLabel>
              <Input
                value={code}
                onChangeText={setCode}
                keyboardType="number-pad"
                maxLength={6}
                placeholder="Nhập mã 6 chữ số"
              />

              <GradientButton
                text={loading ? 'Đang xác nhận...' : 'Xác nhận tài khoản'}
                disabled={loading || !code.trim()}
                onPress={onSubmitVerify}
              />

              <View style={{ alignItems: 'center', marginTop: 12 }}>
                <Text style={{ color: '#6B7280' }}>
                  Không nhận được mã?{' '}
                  <Text
                    onPress={resendCooldown > 0 ? undefined : onResendCode}
                    style={{
                      color: resendCooldown > 0 ? '#9AA2B1' : '#4C74E6',
                      fontWeight: '700',
                    }}
                  >
                    {resendCooldown > 0 ? `Gửi lại sau ${resendCooldown}s` : 'Gửi lại mã'}
                  </Text>
                </Text>
              </View>

              <View style={{ alignItems: 'center', marginTop: 14 }}>
                <Text style={{ color: '#6B7280' }}>
                  Nhập sai email?{' '}
                  <Text
                    onPress={() => setPhase('form')}
                    style={{ color: '#4C74E6', fontWeight: '700' }}
                  >
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
