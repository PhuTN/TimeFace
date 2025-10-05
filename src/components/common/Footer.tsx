import React from 'react';
import {Image, StyleSheet, TouchableOpacity, View} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

type Props = {
  activeIndex: number;
  onPress: (index: number) => void;
};

// Xanh đậm hơn
const ACTIVE = '#007AFF'; // iOS blue đậm. Có thể đổi "#0066FF" nếu thích
const INACTIVE = '#B8BDC7';
const BG = '#FFFFFF';

const Footer: React.FC<Props> = ({activeIndex, onPress}) => {
  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        {/* Home */}
        <TouchableOpacity
          style={styles.tab}
          activeOpacity={0.85}
          onPress={() => onPress(0)}>
          <Ionicons
            name="home-outline"
            size={28}
            color={activeIndex === 0 ? ACTIVE : INACTIVE}
          />
        </TouchableOpacity>

        {/* Checklist */}
        <TouchableOpacity
          style={styles.tab}
          activeOpacity={0.85}
          onPress={() => onPress(1)}>
          <Ionicons
            name="checkbox-outline"
            size={28}
            color={activeIndex === 1 ? ACTIVE : INACTIVE}
          />
        </TouchableOpacity>

        {/* Center FAB - luôn xanh */}
        <View style={styles.centerSlot}>
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => onPress(2)}
            style={[styles.fab, {borderColor: ACTIVE}]} // luôn xanh
          >
            <Image
              source={require('../../assets/Footer/FaceIcon.png')}
              style={{
                width: 34,
                height: 34,
                borderRadius: 17 /* , tintColor: ACTIVE  // bật nếu icon đơn sắc */,
              }}
            />
          </TouchableOpacity>
        </View>

        {/* Settings */}
        <TouchableOpacity
          style={styles.tab}
          activeOpacity={0.85}
          onPress={() => onPress(3)}>
          <Ionicons
            name="settings-outline"
            size={28}
            color={activeIndex === 3 ? ACTIVE : INACTIVE}
          />
        </TouchableOpacity>

        {/* Bell */}
        <TouchableOpacity
          style={styles.tab}
          activeOpacity={0.85}
          onPress={() => onPress(4)}>
          <Ionicons
            name="notifications-outline"
            size={28}
            color={activeIndex === 4 ? ACTIVE : INACTIVE}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {paddingBottom: 18, paddingTop: 6, alignItems: 'center'},
  container: {
    width: '90%',
    height: 74,
    backgroundColor: BG,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    elevation: 12,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 20,
    shadowOffset: {width: 0, height: 8},
  },
  tab: {flex: 1, alignItems: 'center'},
  centerSlot: {width: 92, alignItems: 'center'},
  fab: {
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: BG,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
});

export default Footer;
