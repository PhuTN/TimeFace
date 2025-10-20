import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import {useMemo, useState} from 'react';
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
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';

import FieldLabel from '../components/auth/FieldLabel';
import GradientButton from '../components/auth/GradientButton';
import GridDecor from '../components/auth/GridDecor';
import Input from '../components/auth/Input';
import RememberToggle from '../components/auth/RememberToggle';
import SegmentedTabs from '../components/auth/SegmentedTabs';

type TabKey = 'login' | 'signup';

export default function AuthScreen() {
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<TabKey>('login');

  // login
  const [loginEmail, setLoginEmail] = useState('Loisbecket@gmail.com');
  const [loginPw, setLoginPw] = useState('********');
  const [remember, setRemember] = useState(false);
  const [showLoginPw, setShowLoginPw] = useState(false);

  // signup
  const [firstName, setFirstName] = useState('Lois');
  const [lastName, setLastName] = useState('Becket');
  const [signupEmail, setSignupEmail] = useState('Loisbecket@gmail.com');
  const [dob, setDob] = useState<Date>(new Date(2024, 2, 18));
  const [showDobPicker, setShowDobPicker] = useState(false);
  const [phone, setPhone] = useState('(454) 726-0592');
  const [signupPw, setSignupPw] = useState('********');
  const [signupPw2, setSignupPw2] = useState('********');
  const [showPw1, setShowPw1] = useState(false);
  const [showPw2, setShowPw2] = useState(false);

  const dobDisplay = useMemo(() => {
    const d = dob;
    const dd = `${d.getDate()}`.padStart(2, '0');
    const mm = `${d.getMonth() + 1}`.padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  }, [dob]);

  function onPickDob(_: DateTimePickerEvent, selected?: Date) {
    if (Platform.OS === 'android') setShowDobPicker(false);
    if (selected) setDob(selected);
  }

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
          </View>

          <SegmentedTabs
            options={[
              {key: 'login', label: 'Log In'},
              {key: 'signup', label: 'Sign Up Admin'},
            ]}
            value={tab}
            onChange={k => setTab(k as TabKey)}
          />

          {tab === 'login' ? (
            <View>
              <FieldLabel>Email</FieldLabel>
              <Input
                value={loginEmail}
                onChangeText={setLoginEmail}
                keyboardType="email-address"
              />

              <FieldLabel>Password</FieldLabel>
              <Input
                value={loginPw}
                onChangeText={setLoginPw}
                secureTextEntry={!showLoginPw}
                rightIcon={
                  <Pressable onPress={() => setShowLoginPw(s => !s)}>
                    <Icon
                      name={showLoginPw ? 'eye-off-outline' : 'eye-outline'}
                      size={20}
                      color="#9AA2B1"
                    />
                  </Pressable>
                }
              />

              <View style={styles.rowBetween}>
                <RememberToggle checked={remember} onChange={setRemember} />
                <Text style={styles.forgot}>Forgot Password ?</Text>
              </View>

              <GradientButton
                text="Log In"
                onPress={() => Alert.alert('Log In', `Email: ${loginEmail}`)}
              />
            </View>
          ) : (
            <View>
              <View style={styles.rowGap}>
                <View style={{flex: 1}}>
                  <FieldLabel>First Name</FieldLabel>
                  <Input value={firstName} onChangeText={setFirstName} />
                </View>
                <View style={{width: 12}} />
                <View style={{flex: 1}}>
                  <FieldLabel>Last Name</FieldLabel>
                  <Input value={lastName} onChangeText={setLastName} />
                </View>
              </View>

              <FieldLabel style={{marginTop: 12}}>Email</FieldLabel>
              <Input
                value={signupEmail}
                onChangeText={setSignupEmail}
                keyboardType="email-address"
              />

              <FieldLabel style={{marginTop: 12}}>Birth of date</FieldLabel>
              <Input
                value={dobDisplay}
                editable={false}
                rightIcon={
                  <Pressable onPress={() => setShowDobPicker(true)}>
                    <Icon name="calendar-outline" size={20} color="#9AA2B1" />
                  </Pressable>
                }
              />
              {showDobPicker && (
                <DateTimePicker
                  mode="date"
                  value={dob}
                  onChange={onPickDob}
                  display={Platform.OS === 'ios' ? 'inline' : 'default'}
                />
              )}

              <FieldLabel style={{marginTop: 12}}>Phone Number</FieldLabel>
              <Input
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />

              <FieldLabel style={{marginTop: 12}}>Set Password</FieldLabel>
              <Input
                value={signupPw}
                onChangeText={setSignupPw}
                secureTextEntry={!showPw1}
                rightIcon={
                  <Pressable onPress={() => setShowPw1(s => !s)}>
                    <Icon
                      name={showPw1 ? 'eye-off-outline' : 'eye-outline'}
                      size={20}
                      color="#9AA2B1"
                    />
                  </Pressable>
                }
              />

              <FieldLabel style={{marginTop: 12}}>Nhập lại mật khẩu</FieldLabel>
              <Input
                value={signupPw2}
                onChangeText={setSignupPw2}
                secureTextEntry={!showPw2}
                rightIcon={
                  <Pressable onPress={() => setShowPw2(s => !s)}>
                    <Icon
                      name={showPw2 ? 'eye-off-outline' : 'eye-outline'}
                      size={20}
                      color="#9AA2B1"
                    />
                  </Pressable>
                }
              />

              <GradientButton
                text="Register"
                onPress={() => {
                  if (signupPw !== signupPw2)
                    return Alert.alert('Error', 'Passwords do not match');
                  Alert.alert('Register', `${firstName} ${lastName}`);
                }}
              />
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: '#FFFFFF'},
  scroll: {paddingHorizontal: 16},
  title: {
    fontSize: 32,
    lineHeight: 38,
    textAlign: 'center',
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
  rowGap: {flexDirection: 'row'},
});
