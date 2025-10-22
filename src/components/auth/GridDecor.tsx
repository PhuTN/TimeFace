import {StyleSheet, View} from 'react-native';

export default function GridDecor() {
  return (
    <>
      <View style={styles.row}>
        <View style={styles.square} />
        <View style={styles.square} />
        <View style={styles.square} />
      </View>
      <View style={[styles.row, {marginTop: 8}]}>
        <View style={styles.square} />
        <View style={styles.square} />
        <View style={styles.square} />
      </View>
    </>
  );
}
const styles = StyleSheet.create({
  row: {flexDirection: 'row-reverse', alignSelf: 'flex-end', gap: 12},
  square: {
    width: 48,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EEF1F6',
    backgroundColor: '#FFFFFF',
  },
});
