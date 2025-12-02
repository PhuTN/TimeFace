import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Switch,
  TouchableOpacity,
} from 'react-native';
import {useUIFactory} from '../ui/factory/useUIFactory';
import {setUIState} from '../ui/factory/selector';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../navigation/AppNavigator';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const CommonScreen2: React.FC = () => {
  const {loading, lang, theme} = useUIFactory();
  const navigation = useNavigation<NavigationProp>();

  if (loading || !theme || !lang) {
    return (
      <View>
        <Text>Loading...</Text>
      </View>
    );
  }

  const isDark = theme.name === 'dark';
  const isEnglish = lang.code === 'en';

  const handleToggleTheme = () => {
    setUIState({theme: isDark ? 'light' : 'dark'});
  };

  const handleToggleLanguage = () => {
    setUIState({lang: isEnglish ? 'vi' : 'en'});
  };

  return (
    <SafeAreaView
      style={[styles.container, {backgroundColor: theme.colors.background}]}>
      <View style={{height: 32}} />
      {/* Theme and Language Toggle Buttons */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-around',
          paddingHorizontal: 16,
          paddingVertical: 12,
          backgroundColor: theme.colors.background,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.borderLight,
        }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
          }}>
          <Text style={{color: theme.colors.text, fontSize: 14}}>
            {isDark ? `🌙 ${lang.t('darkMode')}` : `☀️ ${lang.t('lightMode')}`}
          </Text>
          <Switch
            value={isDark}
            onValueChange={handleToggleTheme}
            trackColor={{false: '#767577', true: theme.colors.primary}}
            thumbColor={isDark ? theme.colors.primary : '#f4f3f4'}
          />
        </View>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
          }}>
          <Text style={{color: theme.colors.text, fontSize: 14}}>
            {isEnglish ? '🇺🇸 EN' : '🇻🇳 VI'}
          </Text>
          <Switch
            value={isEnglish}
            onValueChange={handleToggleLanguage}
            trackColor={{false: '#767577', true: theme.colors.primary}}
            thumbColor={isEnglish ? theme.colors.primary : '#f4f3f4'}
          />
        </View>
      </View>

      {/* Navigation Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.navButton, {backgroundColor: theme.colors.primary}]}
          onPress={() => navigation.navigate('ICRequestScreen')}
          activeOpacity={0.8}>
          <Text style={styles.buttonText}>{lang.t('icRequestTitle')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navButton, {backgroundColor: theme.colors.primary}]}
          onPress={() => navigation.navigate('LeaveRequestScreen')}
          activeOpacity={0.8}>
          <Text style={styles.buttonText}>{lang.t('leaveRequestTitle')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navButton, {backgroundColor: theme.colors.primary}]}
          onPress={() => navigation.navigate('OTRequestScreen')}
          activeOpacity={0.8}>
          <Text style={styles.buttonText}>{lang.t('otRequestTitle')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navButton, {backgroundColor: theme.colors.primary}]}
          onPress={() => navigation.navigate('TimesheetScreen')}
          activeOpacity={0.8}>
          <Text style={styles.buttonText}>{lang.t('timesheetTitle')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navButton, {backgroundColor: theme.colors.primary}]}
          onPress={() => navigation.navigate('MonthTimesheetScreen')}
          activeOpacity={0.8}>
          <Text style={styles.buttonText}>{lang.t('monthTimesheetTitle')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navButton, {backgroundColor: theme.colors.primary}]}
          onPress={() => navigation.navigate('DailyRecordScreen')}
          activeOpacity={0.8}>
          <Text style={styles.buttonText}>{lang.t('dailyRecordTitle')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navButton, {backgroundColor: theme.colors.primary}]}
          onPress={() => navigation.navigate('NotificationScreen')}
          activeOpacity={0.8}>
          <Text style={styles.buttonText}>{lang.t('notificationTitle')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navButton, {backgroundColor: theme.colors.primary}]}
          onPress={() => navigation.navigate('OTRecordScreen')}
          activeOpacity={0.8}>
          <Text style={styles.buttonText}>{lang.t('otRecordTitle')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navButton, {backgroundColor: theme.colors.primary}]}
          onPress={() => navigation.navigate('LeaveRecordScreen')}
          activeOpacity={0.8}>
          <Text style={styles.buttonText}>{lang.t('leaveRecordTitle')}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  buttonContainer: {
    flex: 1,
    padding: 16,
    gap: 16,
    justifyContent: 'center',
  },
  navButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
});

export default CommonScreen2;
