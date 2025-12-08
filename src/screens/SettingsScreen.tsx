import {useState} from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';

import Divider from '../components/settings/Divider';
import ProfileCard from '../components/settings/ProfileCard';
import SettingRow from '../components/settings/SettingRow';
import SettingSection from '../components/settings/SettingSection';
import ToggleButton_Language from '../components/common/ToggleButton_Language';
import ToggleButton_Notification from '../components/common/ToggleButton_Notification';
import ToggleButton_Theme from '../components/common/ToggleButton_Theme';
import HeaderBar from '../components/common/HeaderBar';   // ⭐ ADD
import Footer from '../components/common/Footer';

import {useNavigation} from '@react-navigation/native';
import {setUIState} from '../ui/factory/selector';
import {useUIFactory} from '../ui/factory/useUIFactory';
import {logout} from '../features/auth/authService';

export default function SettingsScreen() {
  const {theme, lang} = useUIFactory();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();

  const [notifications, setNotifications] = useState(true);

  const L = lang?.code === 'en'
    ? {
        settings: 'Settings',
        account: 'Account',
        personalInfo: 'Personal info',
        workInfo: 'Work info',
        application: 'Application',
        language: 'Language',
        notifications: 'Notifications',
        logout: 'Logout',
        other: 'Others',
        privacy: 'Privacy policy',
        contact: 'Contact us',
      }
    : {
        settings: 'Cài đặt',
        account: 'Tài khoản',
        personalInfo: 'Thông tin cá nhân',
        workInfo: 'Thông tin công việc',
        application: 'Ứng dụng',
        language: 'Ngôn ngữ',
        notifications: 'Thông báo',
        logout: 'Đăng xuất',
        other: 'Khác',
        privacy: 'Chính sách bảo mật',
        contact: 'Liên hệ chúng tôi',
      };

  const isDark = theme?.name === 'dark';
  const isEnglish = lang?.code === 'en';

  const handleThemeToggle = () => setUIState({theme: isDark ? 'light' : 'dark'});
  const handleLanguageToggle = () => setUIState({lang: isEnglish ? 'vi' : 'en'});
  const handleNotificationToggle = () => setNotifications(prev => !prev);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme?.colors.background }}>

      {/* ⭐ HEADER BAR — ẨN NÚT BACK */}
      <HeaderBar
        title={L.settings}
        topInset={insets.top}
        isShowAvatar={false}
        isShowBackButton={false}   // ⭐ KHÔNG CHO HIỂN THỊ BACK
      />

      <ScrollView
        contentContainerStyle={[
          styles.container,
          { paddingBottom: 120 } // ⭐ tránh footer che
        ]}
        showsVerticalScrollIndicator={false}>

        <ProfileCard
          name="Tonald Drump"
          subtitle="Junior Full Stack Developer"
          verified
          avatarUri="https://i.pravatar.cc/200?img=3"
        />

        {/* ACCOUNT */}
        <View style={styles.group}>
          <Text
            style={[
              styles.groupTitle,
              {color: isDark ? '#A1A1AA' : '#6b7280'},
            ]}>
            {L.account}
          </Text>

          <SettingSection>
            <SettingRow
              icon={<Feather name="user" size={18} color={BLUE} />}
              label={L.personalInfo}
              right={<Feather name="chevron-right" size={18} color="#9ca3af" />}
              onPress={() => navigation.navigate('PersonalInformation')}
            />

            <Divider />

            <SettingRow
              icon={<Feather name="briefcase" size={18} color={BLUE} />}
              label={L.workInfo}
              right={<Feather name="chevron-right" size={18} color="#9ca3af" />}
            />
          </SettingSection>
        </View>

        {/* APPLICATION */}
        <View style={styles.group}>
          <Text
            style={[
              styles.groupTitle,
              {color: isDark ? '#A1A1AA' : '#6b7280'},
            ]}>
            {L.application}
          </Text>

          <SettingSection>
            <SettingRow
              icon={<Feather name="moon" size={18} color={BLUE} />}
              label="Theme"
              right={<ToggleButton_Theme value={isDark} onToggle={handleThemeToggle} />}
            />

            <Divider />

            <SettingRow
              icon={<Feather name="globe" size={18} color={BLUE} />}
              label={L.language}
              right={<ToggleButton_Language value={isEnglish} onToggle={handleLanguageToggle} />}
            />

            <Divider />

            <SettingRow
              icon={<Feather name="bell" size={18} color={BLUE} />}
              label={L.notifications}
              right={<ToggleButton_Notification value={notifications} onToggle={handleNotificationToggle} />}
            />

            <Divider />

            <SettingRow
              icon={<Feather name="log-out" size={18} color="#e45858" />}
              label={L.logout}
              labelStyle={{color: '#e45858', fontWeight: '600'}}
              right={<Feather name="chevron-right" size={18} color="#e45858" />}
              onPress={() => logout()}
            />
          </SettingSection>
        </View>

        {/* OTHERS */}
        <View style={styles.group}>
          <Text
            style={[
              styles.groupTitle,
              {color: isDark ? '#A1A1AA' : '#6b7280'},
            ]}>
            {L.other}
          </Text>

          <SettingSection>
            <SettingRow
              icon={<Feather name="shield" size={18} color={BLUE} />}
              label={L.privacy}
              right={<Feather name="chevron-right" size={18} color="#9ca3af" />}
            />

            <Divider />

            <SettingRow
              icon={<Feather name="mail" size={18} color={BLUE} />}
              label={L.contact}
              right={<Feather name="chevron-right" size={18} color="#9ca3af" />}
            />
          </SettingSection>
        </View>

      </ScrollView>

      {/* ⭐ FOOTER FIXED */}
      <Footer
        activeIndex={3}
        onPress={() => navigation.navigate('Home')}
      />

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
  },
});
