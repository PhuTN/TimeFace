import { useState } from 'react';
import {
  ActivityIndicator,
  Button,
  SafeAreaView,
  Text,
  View,
} from 'react-native';
import AddButton from '../components/common/AddButton';
import Footer from '../components/common/Footer';
import Header from '../components/common/Header';
import { setUIState } from '../ui/factory/selector';
import { useUIFactory } from '../ui/factory/useUIFactory';

export default function HomeScreen() {
  const { loading, theme, lang } = useUIFactory();
  const [activeTab, setActiveTab] = useState<number>(2); // mặc định tab giữa

  if (loading || !theme || !lang) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Header
        title="ĐƠN XIN OT"
        showBack={true}
        onBackPress={() => {
          /* navigation.goBack() nếu muốn */
        }}
      />
      <View style={{ flex: 1, padding: theme.spacing(2) }}>
        <Text style={{ color: theme.colors.text, fontSize: 20 }}>
          {lang.t('hello')}
        </Text>
        <View style={{ height: theme.spacing(2) }} />
        <Button
          title={lang.t('theme.dark')}
          onPress={() => setUIState({ theme: 'dark' })}
        />
        <Button
          title={lang.t('theme.light')}
          onPress={() => setUIState({ theme: 'light' })}
        />

        <View style={{ height: theme.spacing(2) }} />
        <Button title="Tiếng Việt" onPress={() => setUIState({ lang: 'vi' })} />
        <Button title="English" onPress={() => setUIState({ lang: 'en' })} />
        <View style={{ height: theme.spacing(2) }} />

        <AddButton
          title="Thêm nhân viên"
          icon={require('../assets/AddIcon.png')}
        />
      </View>

      <Footer
        activeIndex={activeTab}
        onPress={i => {
          setActiveTab(i);
          // nếu cần điều hướng, gọi navigation ở đây
        }}
      />
    </SafeAreaView>
  );
}
