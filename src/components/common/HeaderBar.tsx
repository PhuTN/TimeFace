import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useNavigation } from '@react-navigation/native';

type Props = {
  title: string;
  onBack?: () => void;
  avatarUri?: string;
  extra?: React.ReactNode;
  topInset?: number;
  isShowBackButton?: boolean;   // ⭐ thêm thuộc tính
};

const HEADER_HEIGHT = 70;

export default function HeaderBar({
  title,
  onBack,
  avatarUri,
  extra,
  topInset = 0,
  isShowBackButton = true,      // ⭐ mặc định có nút back
}: Props) {

  const navigation = useNavigation<any>();

  const handleBack = () => {
    if (onBack) return onBack();

    try {
      navigation.goBack();
    } catch {
      navigation.navigate('Home');
    }
  };

  return (
    <>
      {/* HEADER FIXED */}
      <View style={[styles.headerBar, { paddingTop: topInset + 6 }]}>

        {/* ⭐ Chỉ hiện khi isShowBackButton === true */}
        {isShowBackButton ? (
          <TouchableOpacity style={styles.headerBtn} onPress={handleBack}>
            <Feather name="chevron-left" size={26} color="#5F6AF4" />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 38 }} />  // giữ layout cân bằng
        )}

        <Text style={styles.headerTitle}>{title}</Text>

        {extra ?? (
          <Image
            source={{ uri: avatarUri ?? 'https://i.pravatar.cc/100?img=7' }}
            style={styles.headerAvatar}
          />
        )}
      </View>

      {/* Spacer chống che */}
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
    height: 70,
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
