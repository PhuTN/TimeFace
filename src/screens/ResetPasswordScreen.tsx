import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, StyleSheet, Text, View, Pressable } from 'react-native';
import FieldLabel from '../components/auth/FieldLabel';
import Input from '../components/auth/Input';
import GradientButton from '../components/auth/GradientButton';
import GridDecor from '../components/auth/GridDecor';
import Toast from 'react-native-toast-message';
import Icon from 'react-native-vector-icons/Ionicons';
import { apiHandle } from '../api/apihandle';
import { Auth } from '../api/endpoint/Auth';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'ResetPassword'>;

export default function ResetPasswordScreen({ navigation, route }: Props) {
  const [email, setEmail] = useState(route.params?.email || '');
  const [code, setCode] = useState('');
  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');
  const [showPw1, setShowPw1] = useState(false);
  const [showPw2, setShowPw2] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    if (!email.trim() || !code.trim() || !pw.trim()) {
      return Toast.show({ type: 'error', text1: 'Thiếu thông tin', text2: 'Email, mã và mật khẩu là bắt buộc.' });
    }
    if (pw !== pw2) {
      return Toast.show({ type: 'error', text1: 'Sai xác nhận', text2: 'Mật khẩu nhập lại không khớp.' });
    }
    try {
      setLoading(true);
      const payload = { email: email.trim(), code: code.trim(), new_password: pw.trim() };
      const { status, res } = await apiHandle.callApi(Auth.ResetPassword, payload).asPromise();
      if (status.isError || !res?.success) throw new Error(res?.error || 'Đặt lại mật khẩu thất bại');

      Toast.show({ type: 'success', text1: 'Đổi mật khẩu thành công 🎉' });
      navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
    } catch (err: any) {
      Toast.show({ type: 'error', text1: 'Thất bại', text2: err?.message || 'Vui lòng thử lại.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={s.safe}>
      <KeyboardAvoidingView style={{flex:1}} behavior={Platform.select({ios:'padding', android:undefined})}>
        <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
          <GridDecor />
          <View style={{ marginTop: 24 }}>
            <Text style={s.title}>Reset Password</Text>
            <Text style={s.caption}>Nhập mã đã nhận qua email và mật khẩu mới.</Text>

            <FieldLabel style={{ marginTop: 16 }}>Email</FieldLabel>
            <Input
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              placeholder="you@company.com"
            />

            <FieldLabel style={{ marginTop: 12 }}>Code</FieldLabel>
            <Input
              value={code}
              onChangeText={setCode}
              keyboardType="number-pad"
              placeholder="6-digit code"
              maxLength={6}
            />

            <FieldLabel style={{ marginTop: 12 }}>New Password</FieldLabel>
            <Input
              value={pw}
              onChangeText={setPw}
              secureTextEntry={!showPw1}
              placeholder="Create a new password"
              rightIcon={
                <Pressable onPress={() => setShowPw1(s => !s)}>
                  <Icon name={showPw1 ? 'eye-off-outline' : 'eye-outline'} size={20} color="#9AA2B1" />
                </Pressable>
              }
            />

            <FieldLabel style={{ marginTop: 12 }}>Confirm Password</FieldLabel>
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

            <GradientButton text={loading ? 'Submitting...' : 'Reset Password'} disabled={loading} onPress={onSubmit} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <Toast />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:{flex:1, backgroundColor:'#fff'},
  scroll:{padding:16, paddingBottom:28},
  title:{fontSize:28, fontWeight:'800', color:'#111'},
  caption:{marginTop:6, color:'#6B7280'},
});
