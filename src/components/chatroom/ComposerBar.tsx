import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';

export default function ComposerBar({
  value,
  onChange,
  onSend,
}: {
  value: string;
  onChange: (t: string) => void;
  onSend: () => void;
}) {
  return (
    <KeyboardAvoidingView
      behavior={Platform.select({ios: 'padding', android: undefined})}>
      <SafeAreaView edges={['bottom']} style={styles.safe}>
        <View style={styles.wrap}>
          <TextInput
            value={value}
            onChangeText={onChange}
            placeholder="Send Message"
            placeholderTextColor="#B7C1D6"
            style={styles.input}
            multiline
          />
          <Icon name="send" size={20} color="#7AA2FF" onPress={onSend} />
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
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 22,
    backgroundColor: '#F5F7FB',
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    fontSize: 14.5,
    color: '#2B3654',
    marginRight: 8,
    maxHeight: 96,
  },
});
