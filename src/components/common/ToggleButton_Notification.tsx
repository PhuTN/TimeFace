import {useEffect, useRef} from 'react';
import {Animated, StyleSheet, TouchableOpacity, View} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

interface ToggleButtonProps {
  value: boolean;
  onToggle: () => void;
}

const ToggleButton_Notification = ({value, onToggle}: ToggleButtonProps) => {
  const circleAnim = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(circleAnim, {
      toValue: value ? 1 : 0,
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
      
      {value ? (
        <LinearGradient
          colors={['#3C9CDC', '#6EC8FF']}  // 🌊 xanh dương gradient
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={styles.gradientContainer}>
          <Animated.View style={[styles.circle, {transform: [{translateX}]}]} />
        </LinearGradient>
      ) : (
        <View style={styles.blueOffBackground}>  {/* nền xanh nhạt */}
          <Animated.View style={[styles.circle, {transform: [{translateX}]}]} />
        </View>
      )}
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
  blueOffBackground: {
    flex: 1,
    borderRadius: 16,
    backgroundColor: '#DBEEFF', // xanh nhạt thay vì xám
    justifyContent: 'center',
  },
  circle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#fff',
    position: 'absolute',
  },
});

export default ToggleButton_Notification;