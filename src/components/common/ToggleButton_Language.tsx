import {useEffect, useRef} from 'react';
import {Animated, StyleSheet, Text, TouchableOpacity} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

interface ToggleButtonProps {
  value: boolean;
  onToggle: () => void;
  titleLeft?: string;
  titleRight?: string;
}

const ToggleButton_Language = ({
  value,
  onToggle,
  titleLeft = 'Vie',
  titleRight = 'Eng',
}: ToggleButtonProps) => {
  const circleAnim = useRef(new Animated.Value(value ? 0 : 1)).current;

  useEffect(() => {
    Animated.timing(circleAnim, {
      toValue: value ? 0 : 1,
      duration: 250,
      useNativeDriver: false,
    }).start();
  }, [value]);

  const translateX = circleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [4, 32], // vị trí trái -> phải (dựa theo width 60, circle 24, padding)
  });

  return (
    <TouchableOpacity
      style={styles.wrapper}
      onPress={onToggle}
      activeOpacity={0.8}>
      <LinearGradient
        colors={['#6B50F6', '#CC8FED']}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={styles.gradientContainer}>
        {/* Hiển thị title trái nếu value === false */}
        {!value && (
          <Text style={[styles.title, styles.titleLeft]}>{titleLeft}</Text>
        )}

        {/* Hiển thị title phải nếu value === true */}
        {value && (
          <Text style={[styles.title, styles.titleRight]}>{titleRight}</Text>
        )}

        <Animated.View style={[styles.circle, {transform: [{translateX}]}]} />
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: 60,
    height: 32,
    borderRadius: 16,
  },
  gradientContainer: {
    flex: 1,
    borderRadius: 16,
    justifyContent: 'center',
  },
  title: {
    position: 'absolute',
    color: '#FFCF26',
    fontWeight: 'bold',
    fontSize: 12,
  },
  titleLeft: {
    left: 8,
  },
  titleRight: {
    right: 8,
  },
  circle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#fff',
    position: 'absolute',
  },
});

export default ToggleButton_Language;
