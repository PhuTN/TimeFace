import {StyleSheet, TextInput, View} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

export default function SearchBar({
  value,
  onChange,
}: {
  value: string;
  onChange: (t: string) => void;
}) {
  return (
    <View style={styles.wrap}>
      <Icon name="search-outline" size={20} color="#9AA6C0" />
      <TextInput
        style={styles.input}
        placeholder="Search tên nhân viên / email"
        placeholderTextColor="#9AA6C0"
        value={value}
        onChangeText={onChange}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F2F5FA',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    marginHorizontal: 12,
    marginBottom: 12,
  },
  input: {flex: 1, marginLeft: 8, color: '#1B2333', fontSize: 15},
});
