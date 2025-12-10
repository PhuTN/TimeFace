import React from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  StyleProp,
  TextStyle,
  ViewStyle,
  TextInputProps,
} from 'react-native';

/**
 * Editable props (user có thể nhập)
 */
type EditableProps = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;  // ⭐ bắt buộc khi editable = true
  placeholder?: string;
  theme: any;
  multiline?: boolean;
  numberOfLines?: number;
  containerStyle?: StyleProp<ViewStyle>;
  inputProps?: TextInputProps;
  editable?: true; // ⭐ bật edit
};

/**
 * Readonly props (không cần onChangeText)
 */
type ReadonlyProps = {
  label: string;
  value: string;
  placeholder?: string;
  theme: any;
  multiline?: boolean;
  numberOfLines?: number;
  containerStyle?: StyleProp<ViewStyle>;
  inputProps?: TextInputProps;
  editable: false; // ⭐ khi disable → ko cần onChangeText
};

/**
 * Combined props
 */
type Props = EditableProps | ReadonlyProps;

const LabeledTextInput: React.FC<Props> = ({
  label,
  value,
  placeholder,
  theme,
  multiline = false,
  numberOfLines,
  containerStyle,
  inputProps,
  editable = true,
  ...rest
}) => {
  const S = themedStyles(theme);
  const { style: inputStyle, ...restInputProps } = inputProps ?? {};

  // ⭐ lấy hàm onChangeText nếu editable, còn không thì undefined
  const onChangeText =
    editable && "onChangeText" in rest ? rest.onChangeText : undefined;

  return (
    <View style={[S.field, containerStyle]}>
      <Text style={S.label}>{label}</Text>

      <View
        style={[
          S.inputBox,
          multiline ? S.multilineBox : null,
          !editable && S.disabledBox,
        ]}
      >
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.placeholder}
          multiline={multiline}
          numberOfLines={multiline ? numberOfLines ?? 3 : 1}
          editable={editable}
          style={[
            S.input,
            multiline ? S.multilineInput : null,
            !editable && S.disabledInput,
            inputStyle as StyleProp<TextStyle>,
          ]}
          {...restInputProps}
        />
      </View>
    </View>
  );
};

const themedStyles = (theme: any) =>
  StyleSheet.create({
    field: { flexGrow: 1, flexBasis: '48%', minWidth: '48%' },
    label: { fontSize: 13, color: theme.colors.text, marginBottom: 6 },

    inputBox: {
      borderWidth: 2,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.background,
      borderRadius: 10,
      paddingHorizontal: 14,
      paddingVertical: 5,
      minHeight: 48,
      justifyContent: 'center',
    },

    disabledBox: {
      backgroundColor: '#E5E7EB',
      borderColor: '#D1D5DB',
    },

    multilineBox: {
      paddingVertical: 10,
    },

    input: { fontSize: 16, color: theme.colors.text },

    disabledInput: {
      color: '#6B7280',
    },

    multilineInput: {
      textAlignVertical: 'top',
      minHeight: 80,
    },
  });

export default React.memo(LabeledTextInput);
