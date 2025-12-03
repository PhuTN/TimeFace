import {useState} from 'react';
import {ActivityIndicator, SafeAreaView, ScrollView, View} from 'react-native';
import AddButton from '../components/common/AddButton';
import Footer from '../components/common/Footer';
import HeaderBar from '../components/common/HeaderBar'; // ⭐ đổi component
import {useUIFactory} from '../ui/factory/useUIFactory';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

const HomeScreen = ({navigation}: Props) => {
  const {loading, theme, lang} = useUIFactory();
  const [activeTab, setActiveTab] = useState<number>(0);

  if (loading || !theme || !lang) {
    return (
      <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: theme.colors.background}}>
      {/* ⭐ Header fixed trên cùng */}
      <HeaderBar title="Trang Chủ" isShowBackButton={false} />

      {/* ⭐ ScrollView cần chừa khoảng trống cho header + footer */}
      <ScrollView
        style={{flex: 1}}
        contentContainerStyle={{
          padding: theme.spacing(2),
          paddingTop: 86, // header height
          paddingBottom: 100, // footer height
          flexGrow: 1,
        }}
        showsVerticalScrollIndicator={false}>
        {/* TODO: content */}
      </ScrollView>

      {/* ⭐ Footer fixed dưới đáy */}
      <Footer
        activeIndex={0}
        onPress={i => {
          setActiveTab(i);
          // điều hướng nếu cần
          // navigation.navigate(...)
        }}
      />
    </SafeAreaView>
  );
};

export default HomeScreen;
