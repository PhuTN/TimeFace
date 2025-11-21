import React from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { authStorage } from '../services/authStorage';

type Props = NativeStackScreenProps<RootStackParamList, 'SubscriptionBlocked'>;

export default function SubscriptionBlockedScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();

  const handleLogout = async () => {
    try {
      await authStorage.clear();
      Toast.show({
        type: 'success',
        text1: 'Đã đăng xuất',
      });
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (e: any) {
      Toast.show({
        type: 'error',
        text1: 'Lỗi khi đăng xuất',
        text2: e?.message || 'Vui lòng thử lại.',
      });
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />
      <View
        style={[
          styles.container,
          { paddingTop: insets.top + 24, paddingBottom: insets.bottom || 16 },
        ]}
      >
        <View style={styles.card}>
          <Text style={styles.title}>Tài khoản tạm bị hạn chế</Text>
          <Text style={styles.subtitle}>
            Công ty của bạn hiện chưa kích hoạt gói dịch vụ.
          </Text>

          <Text style={styles.body}>
            Vui lòng liên hệ quản trị viên (Admin) hoặc bộ phận nhân sự để kích
            hoạt gói Subscription trước khi tiếp tục sử dụng ứng dụng.
          </Text>

          <TouchableOpacity style={styles.btn} onPress={handleLogout}>
            <Text style={styles.btnText}>Đăng xuất</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Toast />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  card: {
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 10,
    textAlign: 'center',
  },
  body: {
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 18,
  },
  btn: {
    marginTop: 4,
    borderRadius: 999,
    backgroundColor: '#111827',
    paddingVertical: 10,
    alignItems: 'center',
  },
  btnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
});
