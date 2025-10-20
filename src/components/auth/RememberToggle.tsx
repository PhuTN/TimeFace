import {Pressable, StyleSheet, Text, View} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

export default function RememberToggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <Pressable style={styles.wrap} onPress={() => onChange(!checked)}>
      <View style={[styles.checkbox, checked && styles.checkboxOn]}>
        {checked && <Icon name="checkmark" size={12} color="#fff" />}
      </View>
      <Text style={styles.text}>Remember me</Text>
    </Pressable>
  );
}
const styles = StyleSheet.create({
  wrap: {flexDirection: 'row', alignItems: 'center'},
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#B5BECB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  checkboxOn: {backgroundColor: '#2E7CF6', borderColor: '#2E7CF6'},
  text: {fontSize: 13, color: '#6B7280'},
});
