import React, {useState} from 'react';
import {
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
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import Toast from 'react-native-toast-message';
import FieldLabel from '../components/auth/FieldLabel';
import GradientButton from '../components/auth/GradientButton';
import GridDecor from '../components/auth/GridDecor';
import Input from '../components/auth/Input';
import RememberToggle from '../components/auth/RememberToggle';

// 🔑 gọi API login (RN dùng AsyncStorage)
import {login as loginApi} from '../features/auth/authService';
import {authStorage} from '../services/authStorage';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export default function LoginScreen({navigation}: Props) {
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [remember, setRemember] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

const handleLogin = async () => {
  const e = email.trim();
  const p = pw.trim();

  if (!e || !p) {
    return Toast.show({
      type: 'error',
      text1: 'Thiếu thông tin',
      text2: 'Vui lòng nhập email và mật khẩu.',
    });
  }

  try {
    setLoading(true);

    // 🔐 Gọi API login
    const { user, token } = await loginApi(e, p);

    Toast.show({
      type: 'success',
      text1: 'Đăng nhập thành công 🎉',
      text2: `Chào mừng ${user.full_name || user.email}`,
    });

    // (nếu loginApi có lưu sẵn vào storage thì cái này chỉ để debug)
    const stored = await authStorage.load();
    console.log('🧠 authStorage:', stored, 'token:', token);

    const role = user.role;
    const subscriptionStatus = user.subscription_status || 'unactive';

    // ===== Điều hướng theo role + subscription_status =====
    if (role === 'admin') {
      // admin nhưng chưa active -> bắt chọn gói
      if (subscriptionStatus !== 'active') {
        navigation.reset({
          index: 0,
          routes: [{ name: 'SubscriptionPlans' as never }],
        });
      } else {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Home' as never }],
        });
      }
    } else if (role === 'user') {
      // user mà sub chưa active -> chặn, đưa vào màn blocked
      if (subscriptionStatus !== 'active') {
        navigation.reset({
          index: 0,
          routes: [{ name: 'SubscriptionBlocked' as never }],
        });
      } else {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Home' as never }],
        });
      }
    } else {
      // sys_admin hoặc role khác -> cho vào Home
      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' as never }],
      });
    }
  } catch (err: any) {
    Toast.show({
      type: 'error',
      text1: 'Đăng nhập thất bại 😞',
      text2: err?.message || 'Có lỗi xảy ra, thử lại sau.',
    });
    console.log('❌ Login error:', err);
  } finally {
    setLoading(false);
  }
};


  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView
        style={{flex: 1}}
        behavior={Platform.select({ios: 'padding', android: undefined})}>
        <ScrollView
          contentContainerStyle={[
            styles.scroll,
            {paddingTop: insets.top + 12, paddingBottom: 28},
          ]}
          keyboardShouldPersistTaps="handled">
          <GridDecor />

          <View style={{alignItems: 'center', marginTop: 6}}>
            <Image
              source={require('../assets/Auth/LoginIcon.png')}
              style={{width: 44, height: 44, resizeMode: 'contain'}}
            />
            <Text style={styles.title}>FCI</Text>
            <Text style={{fontSize: 16, color: '#6B7280'}}>Welcome back</Text>
          </View>

          <View style={{marginTop: 20}}>
            <FieldLabel>Email</FieldLabel>
            <Input
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              placeholder="your@email.com"
            />

            <FieldLabel>Password</FieldLabel>
            <Input
              value={pw}
              onChangeText={setPw}
              secureTextEntry={!showPw}
              placeholder="Enter your password"
              rightIcon={
                <Pressable onPress={() => setShowPw(s => !s)}>
                  <Icon
                    name={showPw ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color="#9AA2B1"
                  />
                </Pressable>
              }
            />

            <View style={styles.rowBetween}>
              {/* <RememberToggle checked={remember} onChange={setRemember} /> */}
              <Pressable onPress={()=>navigation.navigate('ForgotPassword')}>
                <Text style={styles.forgot}>Forgot Password ?</Text>
              </Pressable>
            </View>

            <GradientButton
              text={loading ? 'Logging in...' : 'Log In'}
              disabled={loading}
              onPress={handleLogin}
            />

            <View style={{alignItems: 'center', marginTop: 14}}>
              <Text style={{color: '#6B7280'}}>
                Don’t have an account?{' '}
                <Text
                  onPress={() => navigation.navigate('Register')}
                  style={{color: '#4C74E6', fontWeight: '700'}}>
                  Sign Up
                </Text>
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Toast />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: '#FFFFFF'},
  scroll: {paddingHorizontal: 16},
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#222',
    marginTop: 6,
    marginBottom: 10,
  },
  rowBetween: {
    marginTop: 8,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  forgot: {fontSize: 13, color: '#4C74E6', fontWeight: '700'},
});
