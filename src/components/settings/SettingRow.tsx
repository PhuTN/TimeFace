import {ReactNode} from 'react';
import {
  Pressable,
  StyleSheet,
  Switch,
  Text,
  TextStyle,
  View,
} from 'react-native';
import {useUIFactory} from '../../ui/factory/useUIFactory';

type RowProps = {
  icon?: ReactNode;
  label: string;
  onPress?: () => void;
  right?: ReactNode;
  switchProps?: {
    value: boolean;
    onValueChange: (v: boolean) => void;
  };
  labelStyle?: TextStyle;
};

const BLUE = '#3C9CDC';
const BLUE_LIGHT = '#DBEEFF';

export default function SettingRow({
  icon,
  label,
  onPress,
  right,
  switchProps,
  labelStyle,
}: RowProps) {
  const {theme} = useUIFactory();
  const dark = theme?.name === 'dark';

  const contentRight = switchProps ? (
    <Switch
      value={switchProps.value}
      onValueChange={switchProps.onValueChange}
      trackColor={{false: BLUE_LIGHT, true: BLUE}}
      ios_backgroundColor={BLUE_LIGHT}
      thumbColor="#FFFFFF"
    />
  ) : (
    right
  );

  return (
    <Pressable
      onPress={onPress}
      style={({pressed}) => [styles.row, pressed && styles.rowPressed]}>
      <View style={styles.left}>
        {icon ? <View style={styles.iconWrap}>{icon}</View> : null}
        <Text
          style={[
            styles.label,
            {color: dark ? '#E5E7EB' : '#111827'},
            labelStyle,
          ]}>
          {label}
        </Text>
      </View>
      {contentRight ? <View style={styles.right}>{contentRight}</View> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowPressed: {opacity: 0.7},
  left: {flexDirection: 'row', alignItems: 'center', gap: 10, flexShrink: 1},
  iconWrap: {width: 22, alignItems: 'center'},
  label: {fontSize: 16, color: '#111827', fontWeight: '500'},
  right: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
});
