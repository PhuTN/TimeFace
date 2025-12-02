import {useState} from 'react';
import {
  ActivityIndicator,
  Button,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import AddButton from '../components/common/AddButton';
import Footer from '../components/common/Footer';
import Header from '../components/common/Header';
import {setUIState} from '../ui/factory/selector';
import {useUIFactory} from '../ui/factory/useUIFactory';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

const HomeScreen = ({route, navigation}: Props) => {
  const {loading, theme, lang} = useUIFactory();
  const [activeTab, setActiveTab] = useState<number>(2); // mặc định tab giữa

  if (loading || !theme || !lang) {
    return (
      <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: theme.colors.background}}>
      <Header
        title="ĐƠN XIN OT"
        showBack={true}
        onBackPress={() => {
          /* navigation.goBack() nếu muốn */
        }}
      />
      <ScrollView
        style={{flex: 1}}
        contentContainerStyle={{padding: theme.spacing(2), flexGrow: 1}}
        showsVerticalScrollIndicator={false}>
        <Text style={{color: theme.colors.text, fontSize: 20}}>
          {lang.t('hello')}
        </Text>
        <View style={{height: theme.spacing(2)}} />
        <Button
          title={lang.t('theme.dark')}
          onPress={() => setUIState({theme: 'dark'})}
        />
        <Button
          title={lang.t('theme.light')}
          onPress={() => setUIState({theme: 'light'})}
        />

        <View style={{height: theme.spacing(2)}} />
        <Button title="Tiếng Việt" onPress={() => setUIState({lang: 'vi'})} />
        <Button title="English" onPress={() => setUIState({lang: 'en'})} />
        <View style={{height: theme.spacing(2)}} />
        <Button
          title="Department Management"
          onPress={() => navigation.navigate('DepartmentManagement')}
        />
        <View style={{height: theme.spacing(2)}} />
        <Button
          title="Employee Management"
          onPress={() => navigation.navigate('EmployeeManagement')}
        />
        <View style={{height: theme.spacing(2)}} />
        <Button
          title="Job Information"
          onPress={() => navigation.navigate('JobInformation')}
        />
        <View style={{height: theme.spacing(2)}} />
        <Button
          title="Personal Information"
          onPress={() => navigation.navigate('PersonalInformation')}
        />
        <View style={{height: theme.spacing(2)}} />
        <Button
          title="Employee Attendance"
          onPress={() => navigation.navigate('EmployeeAttendance')}
        />
        <View style={{height: theme.spacing(2)}} />
        <Button
          title="Empolyee Face Detection"
          onPress={() => navigation.navigate('EmployeeFaceDetection')}
        />
      </ScrollView>

      <Footer
        activeIndex={activeTab}
        onPress={i => {
          setActiveTab(i);
          // nếu cần điều hướng, gọi navigation ở đây
        }}
      />
    </SafeAreaView>
  );
};

export default HomeScreen;
