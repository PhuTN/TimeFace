import React from 'react';
import {
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';

type Props = {
  name: string;
  role?: string;
  avatar: string;
  online?: boolean;
  navigation?: any;
};

export default function Header({
  name,
  role,
  avatar,
  online = false,
  navigation,
}: Props) {
  const extraTop = Platform.OS === 'android' ? 4 : 0;

  const handleBack = () => {
    navigation?.goBack?.();
  };

  return (
    <SafeAreaView edges={['top']} style={[styles.safe, {paddingTop: extraTop}]}>
      <View style={styles.row}>
        {/* BACK */}
        <Pressable style={styles.backBtn} onPress={handleBack}>
          <Icon name="chevron-back" size={20} color="#6B5AED" />
        </Pressable>

        {/* AVATAR */}
        <View style={styles.avatarWrap}>
          <Image source={{uri: avatar}} style={styles.avatar} />
          {online && <View style={styles.statusDot} />}
        </View>

        {/* INFO */}
        <View style={styles.titleWrap}>
          <Text style={styles.name} numberOfLines={1}>
            {name}
          </Text>

          {!!role && (
            <Text style={styles.role} numberOfLines={1}>
              {role}
            </Text>
          )}

          <View style={styles.statusRow}>
            <View
              style={[
                styles.indicator,
                {backgroundColor: online ? '#4CD964' : '#C7C7CC'},
              ]}
            />
            <Text
              style={[
                styles.active,
                {color: online ? '#4CD964' : '#999'},
              ]}>
              {online ? 'Đang hoạt động' : 'Ngoại tuyến'}
            </Text>
          </View>
        </View>

        {/* RIGHT PLACEHOLDER */}
        <View style={{width: 26}} />
      </View>

      <View style={styles.divider} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 6,
    elevation: 3,
  },

  row: {
    height: 78,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
  },

  backBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1EDFF',
    shadowColor: '#7C6AF2',
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 3,
  },

  avatarWrap: {
    position: 'relative',
    marginHorizontal: 12,
  },

  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 1.5,
    borderColor: '#F0F0F5',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 3,
    elevation: 3,
  },

  statusDot: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: '#35C48D',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },

  titleWrap: {
    flex: 1,
    minWidth: 0,
  },

  name: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2B3654',
    letterSpacing: 0.3,
  },

  role: {
    fontSize: 12,
    color: '#8C97B3',
    fontWeight: '500',
    marginTop: 1,
  },

  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },

  indicator: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    marginRight: 6,
  },

  active: {
    fontSize: 11.5,
    fontWeight: '500',
  },

  divider: {
    height: 1,
    backgroundColor: '#EDF0F6',
    marginTop: 2,
  },
});
