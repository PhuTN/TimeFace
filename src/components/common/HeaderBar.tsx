import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useNavigation } from '@react-navigation/native';
import { authStorage } from '../../services/authStorage';

type Props = {
  title: string;
  onBack?: () => void;
  extra?: React.ReactNode;
  topInset?: number;
  isShowBackButton?: boolean;
  isShowAvatar?: boolean;     // ⭐ thêm prop
};

const HEADER_HEIGHT = 70;

export default function HeaderBar({
  title,
  onBack,
  extra,
  topInset = 0,
  isShowBackButton = true,
  isShowAvatar = true,        // ⭐ mặc định là hiện avatar
}: Props) {

  const navigation = useNavigation<any>();
  const [avatar, setAvatar] = useState<string | null>(null);

  useEffect(() => {
    const loadAvatar = async () => {
      const user = await authStorage.getUser();
      setAvatar(user?.avatar ?? null);
    };

    loadAvatar();
    const unsubscribe = navigation.addListener('focus', loadAvatar);
    return unsubscribe;
  }, [navigation]);

  const handleBack = () => {
    if (onBack) return onBack();
    if (navigation.canGoBack()) return navigation.goBack();
    navigation.navigate('Home');
  };

  // ⭐ Bấm avatar → mở màn hình PersonalInformation
  const goToProfile = () => {
    navigation.navigate('PersonalInformation');
  };

  return (
    <>
      <View style={[styles.headerBar, { paddingTop: topInset + 6 }]}>

        {isShowBackButton ? (
          <TouchableOpacity style={styles.headerBtn} onPress={handleBack}>
            <Feather name="chevron-left" size={26} color="#5F6AF4" />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 38 }} />
        )}

        <Text style={styles.headerTitle}>{title}</Text>

        {/* ⭐ Hiện avatar hay không */}
        {isShowAvatar ? (
          <TouchableOpacity onPress={goToProfile} activeOpacity={0.8}>
            <Image
              source={{
                uri: avatar || 'https://cdn-icons-png.freepik.com/512/6858/6858504.png',
              }}
              style={styles.headerAvatar}
            />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 34 }} />
        )}
      </View>

      <View style={{ height: HEADER_HEIGHT + topInset }} />
    </>
  );
}

const styles = StyleSheet.create({
  headerBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 999,
    paddingHorizontal: 16,
    height: 80,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F5F7FA',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },

  headerBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },

  headerTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#1D5EE3',
    letterSpacing: 0.3,
  },

  headerAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 2,
    borderColor: '#5F6AF4',
  },
});
