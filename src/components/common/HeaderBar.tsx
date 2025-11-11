import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';

type Props = {
  title: string;
  onBack?: () => void;
  avatarUri?: string;
  extra?: React.ReactNode;
  topInset?: number;
};

export default function HeaderBar({
  title,
  onBack,
  avatarUri,
  extra,
  topInset = 0,
}: Props) {
  return (
    <View style={[styles.headerBar, {paddingTop: topInset + 6}]}>
      <TouchableOpacity style={styles.headerBtn} onPress={onBack}>
        <Feather name="chevron-left" size={26} color="#5F6AF4" />
      </TouchableOpacity>

      <Text style={styles.headerTitle}>{title}</Text>

      {extra ?? (
        <Image
          source={{uri: avatarUri ?? 'https://i.pravatar.cc/100?img=7'}}
          style={styles.headerAvatar}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  headerBar: {
    paddingHorizontal: 16,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F5F7FA',
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
