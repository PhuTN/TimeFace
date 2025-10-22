import {Pressable, StyleSheet, Text, View} from 'react-native';

export default function SegmentedTabs({
  options,
  value,
  onChange,
}: {
  options: {key: string; label: string}[];
  value: string;
  onChange: (k: string) => void;
}) {
  return (
    <View style={styles.tabs}>
      {options.map(opt => (
        <Pressable
          key={opt.key}
          onPress={() => onChange(opt.key)}
          style={[styles.tabBtn, value === opt.key && styles.tabActive]}>
          <Text style={[styles.tabText, value === opt.key && styles.tabTextOn]}>
            {opt.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}
const styles = StyleSheet.create({
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#F2F4F8',
    borderRadius: 10,
    padding: 2,
    marginHorizontal: 4,
    marginBottom: 16,
  },
  tabBtn: {
    flex: 1,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  tabText: {fontSize: 14, color: '#7B8794', fontWeight: '700'},
  tabTextOn: {color: '#1B2333'},
});
