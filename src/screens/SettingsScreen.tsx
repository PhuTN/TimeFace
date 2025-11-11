import {useState} from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';

import Divider from '../components/settings/Divider';
import ProfileCard from '../components/settings/ProfileCard';
import SettingRow from '../components/settings/SettingRow';
import SettingSection from '../components/settings/SettingSection';
import ToggleButton_Language from '../components/common/ToggleButton_Language';
import ToggleButton_Notification from '../components/common/ToggleButton_Notification';
import ToggleButton_Theme from '../components/common/ToggleButton_Theme';
import {setUIState} from '../ui/factory/selector';
import {useUIFactory} from '../ui/factory/useUIFactory';

export default function SettingsScreen() {
  const {theme, lang} = useUIFactory();
  const [notifications, setNotifications] = useState(true);

  const vi = {
    settings: 'Cài đặt',
    account: 'Tài khoản',
    personalInfo: 'Thông tin cá nhân',
    workInfo: 'Thông tin công việc',
    application: 'Ứng dụng',
    language: 'Ngôn ngữ',
    notifications: 'Thông báo',
    logout: 'Logout',
    other: 'Khác',
    privacy: 'Chính sách bảo mật',
    contact: 'Liên hệ chúng tôi',
  } as const;
  const en = {
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
  } as const;
  const L = lang?.code === 'en' ? en : vi;

  const isDark = theme?.name === 'dark';
  const isEnglish = lang?.code === 'en';

  const handleThemeToggle = () => {
    setUIState({theme: isDark ? 'light' : 'dark'});
  };

  const handleLanguageToggle = () => {
    setUIState({lang: isEnglish ? 'vi' : 'en'});
  };

  const handleNotificationToggle = () => {
    setNotifications(prev => !prev);
  };

  return (
    <SafeAreaView
      style={[styles.safe, {backgroundColor: theme?.colors.background}]}
      edges={['top', 'left', 'right', 'bottom']}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>{L.settings}</Text>

        <ProfileCard
          name="Tonald Drump"
          subtitle="Junior Full Stack Developer"
          verified
          avatarUri="https://i.pravatar.cc/200?img=3"
        />

        <View style={styles.group}>
          <Text style={[styles.groupTitle, {color: isDark ? '#A1A1AA' : '#6b7280'}]}>{L.account}</Text>
          <SettingSection>
            <SettingRow
              icon={<Feather name="user" size={18} color={PURPLE} />}
              label={L.personalInfo}
              onPress={() => {}}
              right={<Feather name="chevron-right" size={18} color="#9ca3af" />}
            />
            <Divider />
            <SettingRow
              icon={<Feather name="briefcase" size={18} color={PURPLE} />}
              label={L.workInfo}
              onPress={() => {}}
              right={<Feather name="chevron-right" size={18} color="#9ca3af" />}
            />
          </SettingSection>
        </View>

        <View style={styles.group}>
          <Text style={[styles.groupTitle, {color: isDark ? '#A1A1AA' : '#6b7280'}]}>{L.application}</Text>
          <SettingSection>
            <SettingRow
              icon={<Feather name="moon" size={18} color={PURPLE} />}
              label="Theme"
              right={
                <ToggleButton_Theme value={isDark} onToggle={handleThemeToggle} />
              }
            />
            <Divider />
            <SettingRow
              icon={<Feather name="globe" size={18} color={PURPLE} />}
              label={L.language}
              right={
                <ToggleButton_Language
                  value={isEnglish}
                  onToggle={handleLanguageToggle}
                />
              }
            />
            <Divider />
            <SettingRow
              icon={<Feather name="bell" size={18} color={PURPLE} />}
              label={L.notifications}
              right={
                <ToggleButton_Notification
                  value={notifications}
                  onToggle={handleNotificationToggle}
                />
              }
            />
            <Divider />
            <SettingRow
              icon={<Feather name="log-out" size={18} color="#e45858" />}
              label={L.logout}
              labelStyle={{color: '#e45858', fontWeight: '600'}}
              onPress={() => {}}
              right={<Feather name="chevron-right" size={18} color="#e45858" />}
            />
          </SettingSection>
        </View>

        <View style={styles.group}>
          <Text style={[styles.groupTitle, {color: isDark ? '#A1A1AA' : '#6b7280'}]}>{L.other}</Text>
          <SettingSection>
            <SettingRow
              icon={<Feather name="shield" size={18} color={PURPLE} />}
              label={L.privacy}
              onPress={() => {}}
              right={<Feather name="chevron-right" size={18} color="#9ca3af" />}
            />
            <Divider />
            <SettingRow
              icon={<Feather name="mail" size={18} color={PURPLE} />}
              label={L.contact}
              onPress={() => {}}
              right={<Feather name="chevron-right" size={18} color="#9ca3af" />}
            />
          </SettingSection>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const PURPLE = '#7C6AF2';

const styles = StyleSheet.create({
  safe: {flex: 1},
  container: {padding: 20, paddingBottom: 40},
  title: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 1,
    color: PURPLE,
    textAlign: 'center',
    marginBottom: 8,
  },
  group: {marginTop: 18},
  groupTitle: {fontSize: 14, marginBottom: 8},
});
