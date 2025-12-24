import React, {useState, useCallback, useEffect} from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Switch,
  Alert,
  Linking,
  AppState,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';

import Footer from '../components/common/Footer';
import HeaderBar from '../components/common/HeaderBar';
import Divider from '../components/settings/Divider';
import ProfileCard from '../components/settings/ProfileCard';
import SettingRow from '../components/settings/SettingRow';
import SettingSection from '../components/settings/SettingSection';

import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {apiHandle} from '../api/apihandle';
import {User} from '../api/endpoint/User';

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();

  const [notifications, setNotifications] = useState(false);
  const [user, setUser] = useState<any>(null);

  // Load user
  useFocusEffect(
    useCallback(() => {
      const load = async () => {
        try {
          const res = await apiHandle.callApi(User.GetMe).asPromise();
          if (!res?.status?.isError) {
            setUser(res.res.data.user);
          }
        } catch (e) {
          console.log('Load user error:', e);
        }
      };
      load();
    }, []),
  );

  // Check notification permission (Android)
  const checkNotificationPermission = async () => {
    if (Platform.OS !== 'android') return;

    const granted = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
    );
    setNotifications(granted);
  };

  // Khi mở màn
  useEffect(() => {
    checkNotificationPermission();
  }, []);

  // Khi quay lại app từ background
  useEffect(() => {
    const sub = AppState.addEventListener('change', state => {
      if (state === 'active') {
        checkNotificationPermission();
      }
    });
    return () => sub.remove();
  }, []);

  // Toggle thông báo → mở setting hệ thống
  const handleNotificationToggle = () => {
    Alert.alert(
      'Cài đặt thông báo',
      'Thông báo được quản lý bởi hệ thống. Bạn có thể bật hoặc tắt trong cài đặt ứng dụng.',
      [
        {text: 'Huỷ', style: 'cancel'},
        {
          text: 'Mở cài đặt',
          onPress: () => Linking.openSettings(),
        },
      ],
    );
  };

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: '#F9FAFB'}}>
      <HeaderBar
        title="Cài đặt"
        topInset={insets.top}
        isShowAvatar={false}
        isShowBackButton={false}
      />

      <ScrollView
        contentContainerStyle={[styles.container, {paddingBottom: 120}]}
        showsVerticalScrollIndicator={false}>
        {/* PROFILE */}
        <ProfileCard
          name={user?.full_name || '—'}
          subtitle={user?.job_title || '—'}
          verified={user?.profile_approved}
          avatarUri={
            user?.avatar ||
            'https://cdn-icons-png.freepik.com/512/6858/6858504.png'
          }
        />

        {/* TÀI KHOẢN */}
        <View style={styles.group}>
          <Text style={styles.groupTitle}>Tài khoản</Text>

          <SettingSection>
            <SettingRow
              icon={<Feather name="user" size={18} color={BLUE} />}
              label="Thông tin cá nhân"
              right={<Feather name="chevron-right" size={18} color="#9CA3AF" />}
              onPress={() => navigation.navigate('PersonalInformation')}
            />

            <Divider />

            <SettingRow
              icon={<Feather name="briefcase" size={18} color={BLUE} />}
              label="Cài đặt tài khoản"
              right={<Feather name="chevron-right" size={18} color="#9CA3AF" />}
              onPress={() => navigation.navigate('AccountSettings')}
            />
          </SettingSection>
        </View>

        {/* ỨNG DỤNG */}
        <View style={styles.group}>
          <Text style={styles.groupTitle}>Ứng dụng</Text>

          <SettingSection>
            <SettingRow
              icon={<Feather name="bell" size={18} color={BLUE} />}
              label="Thông báo"
              right={
                <Switch
                  value={notifications}
                  onValueChange={handleNotificationToggle}
                  trackColor={{false: '#D1D5DB', true: '#93C5FD'}}
                  thumbColor={notifications ? '#2563EB' : '#F3F4F6'}
                />
              }
            />
          </SettingSection>
        </View>

        {/* KHÁC */}
        <View style={styles.group}>
          <Text style={styles.groupTitle}>Khác</Text>

          <SettingSection>
            <SettingRow
              icon={<Feather name="shield" size={18} color={BLUE} />}
              label="Chính sách bảo mật"
              right={<Feather name="chevron-right" size={18} color="#9CA3AF" />}
            />

            <Divider />

            <SettingRow
              icon={<Feather name="mail" size={18} color={BLUE} />}
              label="Liên hệ chúng tôi"
              right={<Feather name="chevron-right" size={18} color="#9CA3AF" />}
            />
          </SettingSection>
        </View>
      </ScrollView>

      <Footer activeIndex={3} onPress={() => navigation.navigate('Home')} />
    </SafeAreaView>
  );
}

const BLUE = '#3C9CDC';

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  group: {
    marginTop: 18,
  },
  groupTitle: {
    fontSize: 14,
    marginBottom: 8,
    fontWeight: '600',
    color: '#6B7280',
  },
});
