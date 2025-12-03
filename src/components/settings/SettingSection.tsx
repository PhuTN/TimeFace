import {ReactNode} from 'react';
import {StyleSheet, View} from 'react-native';
import {useUIFactory} from '../../ui/factory/useUIFactory';

const BLUE_BG = '#EAF6FF';      // nền xanh nhạt
const BLUE_BORDER = '#D4E8FF';  // viền xanh nhạt hơn

export default function SettingSection({children}: {children: ReactNode}) {
  const {theme} = useUIFactory();
  const dark = theme?.name === 'dark';

  return (
    <View
      style={[
        styles.box,
        dark
          ? {
              backgroundColor: '#1A1A21',
              borderColor: '#2A2A33',
              shadowOpacity: 0,
            }
          : undefined,
      ]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    backgroundColor: BLUE_BG,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 6,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: {width: 0, height: 4},
    elevation: 2,
    borderWidth: 1,
    borderColor: BLUE_BORDER,
  },
});
