// src/components/chat/HeaderBar.tsx
import {Image, Platform, StyleSheet, Text, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';

export default function HeaderBar() {
  // extra offset mainly for Android punch-hole devices
  const extraTop = Platform.OS === 'android' ? -50 : 2;

  return (
    <SafeAreaView edges={['top']} style={[styles.safe, {paddingTop: extraTop}]}>
      <View style={styles.wrap}>
        <Icon name="chevron-back" size={24} color="#6C79A0" />
        <Text style={styles.title}>Nhắn tin</Text>
        <Image
          source={{uri: 'https://randomuser.me/api/portraits/men/32.jpg'}}
          style={styles.avatar}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    backgroundColor: '#FFFFFF',
  },
  wrap: {
    height: 52, // a bit taller for breathing room
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#2A3553',
  },
  avatar: {width: 34, height: 34, borderRadius: 17},
});
