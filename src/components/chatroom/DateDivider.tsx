import {StyleSheet, Text, View} from 'react-native';

export default function DateDivider({label}: {label: string}) {
  return (
    <View style={styles.wrap}>
      <View style={styles.line} />
      <Text style={styles.text}>{label}</Text>
      <View style={styles.line} />
    </View>
  );
}
const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
    paddingHorizontal: 12,
  },
  line: {flex: 1, height: 1, backgroundColor: '#EEF2F8'},
  text: {marginHorizontal: 8, color: '#B1B8C9', fontSize: 13.5},
});
