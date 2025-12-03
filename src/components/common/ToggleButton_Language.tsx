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
    outputRange: [4, 32], // trái → phải
  });

  return (
    <TouchableOpacity
      style={styles.wrapper}
      onPress={onToggle}
      activeOpacity={0.8}>
      <LinearGradient
        colors={['#3C9CDC', '#6EC8FF']}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={styles.gradientContainer}>

        {!value && <Text style={[styles.title, styles.titleLeft]}>{titleLeft}</Text>}
        {value && <Text style={[styles.title, styles.titleRight]}>{titleRight}</Text>}

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
    color: '#FFFFFF',   // đổi vàng → trắng
    fontWeight: 'bold',
    fontSize: 12,
  },
  titleLeft: { left: 8 },
  titleRight: { right: 8 },
  circle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#fff',
    position: 'absolute',
  },
});

export default ToggleButton_Language;
