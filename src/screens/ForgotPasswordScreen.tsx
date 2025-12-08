import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import FieldLabel from '../components/auth/FieldLabel';
import Input from '../components/auth/Input';
import GradientButton from '../components/auth/GradientButton';
import GridDecor from '../components/auth/GridDecor';
import Toast from 'react-native-toast-message';

import { apiHandle } from '../api/apihandle';
import { Auth } from '../api/endpoint/Auth';

import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'ForgotPassword'>;

export default function ForgotPasswordScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    const e = email.trim();

    if (!e) {
      return Toast.show({
        type: 'error',
        text1: 'Thiếu email',
        text2: 'Vui lòng nhập email để nhận mã đặt lại mật khẩu.',
      });
    }

    try {
      setLoading(true);

      const { status, res } = await apiHandle
        .callApi(Auth.ForgotPassword, { email: e })
        .asPromise();

      if (status.isError || !res?.success)
        throw new Error(res?.error || 'Không thể gửi mã');

      Toast.show({
        type: 'success',
        text1: 'Đã gửi mã xác nhận 🎉',
        text2: 'Vui lòng kiểm tra email của bạn.',
      });

      navigation.navigate('ResetPassword', { email: e });

    } catch (err: any) {
      Toast.show({
        type: 'error',
        text1: 'Gửi mã thất bại',
        text2: err?.message || 'Vui lòng thử lại sau.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={s.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.select({ ios: 'padding', android: undefined })}
      >
        <ScrollView
          contentContainerStyle={s.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <GridDecor />

          <View style={{ marginTop: 24 }}>
            <Text style={s.title}>Quên mật khẩu</Text>
            <Text style={s.caption}>
              Nhập email của bạn, chúng tôi sẽ gửi mã xác nhận.
            </Text>

            <FieldLabel style={{ marginTop: 16 }}>Email</FieldLabel>

            <Input
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              placeholder="you@company.com"
            />

            <GradientButton
              text={loading ? 'Đang gửi...' : 'Gửi mã xác nhận'}
              disabled={loading}
              onPress={onSubmit}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Toast />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  scroll: { padding: 16, paddingBottom: 28 },
  title: { fontSize: 28, fontWeight: '800', color: '#111' },
  caption: { marginTop: 6, color: '#6B7280' },
});
