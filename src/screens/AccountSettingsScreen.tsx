import React, {useState} from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from 'react-native';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
import HeaderBar from '../components/common/HeaderBar';
import LabeledTextInput from '../components/common/LabeledTextInput';
import GradientButton from '../components/common/GradientButton';
import Toast from 'react-native-toast-message';

import {useUIFactory} from '../ui/factory/useUIFactory';
import {apiHandle} from '../api/apihandle';
import {Auth} from '../api/endpoint/Auth';
import {logout} from '../features/auth/authService';
import Feather from 'react-native-vector-icons/Feather';

export default function AccountSettingsScreen() {
  const {theme} = useUIFactory();
  const insets = useSafeAreaInsets();

  const [oldPass, setOldPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [saving, setSaving] = useState(false);

  if (!theme)
    return (
      <SafeAreaView>
        <Text>Loading…</Text>
      </SafeAreaView>
    );

  const S = makeStyles(theme);

  const validate = () => {
    if (!oldPass || !newPass || !confirmPass)
      return 'Vui lòng nhập đầy đủ thông tin';

    if (newPass.length < 6)
      return 'Mật khẩu mới phải ít nhất 6 ký tự';

    if (newPass !== confirmPass)
      return 'Xác nhận mật khẩu không khớp';

    return null;
  };

  const doChangePassword = async () => {
    const msg = validate();
    if (msg) {
      Toast.show({type: 'error', text1: 'Lỗi', text2: msg});
      return;
    }

    try {
      setSaving(true);

      const payload = {
        old_password: oldPass,
        new_password: newPass,
      };

      const res = await apiHandle.callApi(Auth.ChangePassword, payload).asPromise();
      if (res.status.isError) throw new Error(res.status.errorMessage);

      Toast.show({
        type: 'success',
        text1: 'Thành công',
        text2: 'Bạn cần đăng nhập lại.',
      });

      setTimeout(() => logout(), 1200);
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: err?.message || 'Đổi mật khẩu thất bại',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = () => {
    Alert.alert('Xác nhận', 'Bạn có chắc muốn đổi mật khẩu?', [
      {text: 'Hủy', style: 'cancel'},
      {text: 'Đồng ý', onPress: doChangePassword},
    ]);
  };

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: theme.colors.background}}>
      <HeaderBar
        title="Cài đặt tài khoản"
        topInset={insets.top}
        isShowAvatar={false}
      />

      <ScrollView contentContainerStyle={S.container}>

        {/* CARD */}
        <View style={S.card}>
          <Text style={S.cardTitle}>Đổi mật khẩu</Text>
          <Text style={S.cardSubtitle}>
            Đảm bảo mật khẩu mạnh để tài khoản của bạn an toàn hơn.
          </Text>

          <View style={S.spacingLarge} />

          <LabeledTextInput
            label="Mật khẩu hiện tại"
            value={oldPass}
            onChangeText={setOldPass}
            theme={theme}
            inputProps={{secureTextEntry: true}}
          />

          <View style={S.spacing} />

          <LabeledTextInput
            label="Mật khẩu mới"
            value={newPass}
            onChangeText={setNewPass}
            theme={theme}
            inputProps={{secureTextEntry: true}}
          />

          <View style={S.spacing} />

          <LabeledTextInput
            label="Xác nhận mật khẩu mới"
            value={confirmPass}
            onChangeText={setConfirmPass}
            theme={theme}
            inputProps={{secureTextEntry: true}}
          />

          <View style={{marginTop: 32}}>
            <GradientButton
              text={saving ? 'Đang xử lý...' : 'Đổi mật khẩu'}
              onPress={handleSubmit}
            />
          </View>
        </View>

        {/* LOGOUT */}
        <TouchableOpacity style={S.logoutRow} onPress={() => logout()}>
          <View style={S.logoutBtn}>
            <Feather name="log-out" size={20} color="#ff6b6b" />
            <Text style={S.logoutText}>Đăng xuất</Text>
          </View>
        </TouchableOpacity>

        <View style={{height: 100}} />
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      padding: 20,
      paddingBottom: 120,
    },

    // CARD SIÊU ĐẸP
    card: {
      backgroundColor: theme.colors.card || '#fff',
      padding: 22,
      borderRadius: 20,
      shadowColor: '#000',
      shadowOpacity: 0.05,
      shadowRadius: 12,
      elevation: 4,
      marginTop: 16,
    },

    cardTitle: {
      fontSize: 22,
      fontWeight: '800',
      color: theme.colors.text,
    },

    cardSubtitle: {
      marginTop: 6,
      fontSize: 14,
      color: theme.colors.mutedText || '#8e8e8e',
    },

    spacing: {height: 16},
    spacingLarge: {height: 24},

    // Logout đẹp + tinh tế
    logoutRow: {
      marginTop: 40,
      alignItems: 'center',
    },

    logoutBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      backgroundColor: theme.colors.background2 || '#f8f8f8',
      paddingVertical: 14,
      paddingHorizontal: 22,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: '#ff6b6b33',
    },

    logoutText: {
      color: '#ff6b6b',
      fontWeight: '700',
      fontSize: 16,
    },
  });
