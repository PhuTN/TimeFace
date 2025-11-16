import {useEffect, useRef} from 'react';
import {
  Animated,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Feather from 'react-native-vector-icons/Feather';

interface ToggleButtonProps {
  value: boolean;
  onToggle: () => void;
  style?: ViewStyle;
}

const ToggleButton_Theme = ({value, onToggle, style}: ToggleButtonProps) => {
  const circleAnim = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(circleAnim, {
      toValue: value ? 1 : 0,
      duration: 250,
      useNativeDriver: false,
    }).start();
  }, [value, circleAnim]);

  const translateX = circleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [4, 32],
  });

  const gradientColors = value
    ? ['#0F172A', '#1E1B4B']
    : ['#FFE27A', '#FDBA74'];

  return (
    <TouchableOpacity
      style={[styles.wrapper, style]}
      onPress={onToggle}
      activeOpacity={0.8}>
      <LinearGradient colors={gradientColors} style={styles.gradientContainer}>
        <Animated.View
          style={[
            styles.circle,
            {
              transform: [{translateX}],
              backgroundColor: value ? '#1E1B4B' : '#FFFFFF',
            },
          ]}>
          <Feather
            name={value ? 'moon' : 'sun'}
            size={14}
            color={value ? '#FDE047' : '#F97316'}
          />
        </Animated.View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: 60,
    height: 32,
    borderRadius: 16,
    overflow: 'hidden',
  },
  gradientContainer: {
    flex: 1,
    borderRadius: 16,
    justifyContent: 'center',
  },
  circle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 1.5,
    elevation: 2,
  },
});

export default ToggleButton_Theme;
