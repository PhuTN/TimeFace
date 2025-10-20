import {StyleSheet, Text, TouchableOpacity} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

export default function GradientButton({
  text,
  onPress,
}: {
  text: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={{marginTop: 18}}>
      <LinearGradient
        colors={['#2E7CF6', '#1D5EEA']}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 0}}
        style={styles.btn}>
        <Text style={styles.btnText}>{text}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}
const styles = StyleSheet.create({
  btn: {
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: {color: '#fff', fontSize: 16.5, fontWeight: '800'},
});
