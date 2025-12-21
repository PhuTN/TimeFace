import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TextInput,
  View,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';

export default function ComposerBar({
  value,
  onChange,
  onSend,
  onPickImage,
  uploading,
}: {
  value: string;
  onChange: (t: string) => void;
  onSend: () => void;
  onPickImage: () => void;
  uploading: boolean;
}) {
  return (
    <KeyboardAvoidingView
      behavior={Platform.select({ios: 'padding', android: undefined})}>
      <SafeAreaView edges={['bottom']} style={styles.safe}>
        <View style={styles.wrap}>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={onPickImage}
            disabled={uploading}>
            {uploading ? (
              <ActivityIndicator size="small" color="#7AA2FF" />
            ) : (
              <Icon name="image-outline" size={22} color="#7AA2FF" />
            )}
          </TouchableOpacity>

          <TextInput
            value={value}
            onChangeText={onChange}
            placeholder="Nhắn tin..."
            placeholderTextColor="#B7C1D6"
            style={styles.input}
            multiline
          />

          <TouchableOpacity onPress={onSend}>
            <Icon name="send" size={20} color="#7AA2FF" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  safe: {backgroundColor: '#fff'},
  wrap: {
    marginHorizontal: 12,
    marginTop: 4,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 22,
    backgroundColor: '#F5F7FB',
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#2B3654',
    marginRight: 8,
    maxHeight: 96,
  },
});
