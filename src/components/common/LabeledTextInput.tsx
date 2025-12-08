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

type Props = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  theme: any;
  multiline?: boolean;
  numberOfLines?: number;
  containerStyle?: StyleProp<ViewStyle>;
  inputProps?: TextInputProps;
  editable?: boolean; // ⭐ ADD
};

const LabeledTextInput: React.FC<Props> = ({
  label,
  value,
  onChangeText,
  placeholder,
  theme,
  multiline = false,
  numberOfLines,
  containerStyle,
  inputProps,
  editable = true, // ⭐ DEFAULT
}) => {
  const S = themedStyles(theme);
  const {style: inputStyle, ...restInputProps} = inputProps ?? {};

  return (
    <View style={[S.field, containerStyle]}>
      <Text style={S.label}>{label}</Text>

      <View
        style={[
          S.inputBox,
          multiline ? S.multilineBox : null,
          !editable && S.disabledBox, // ⭐ style disable
        ]}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.placeholder}
          multiline={multiline}
          numberOfLines={multiline ? numberOfLines ?? 3 : 1}
          editable={editable} // ⭐ Enable/Disable
          style={[
            S.input,
            multiline ? S.multilineInput : null,
            !editable && S.disabledInput, // ⭐ input mờ
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
    field: {flexGrow: 1, flexBasis: '48%', minWidth: '48%'},
    label: {fontSize: 13, color: theme.colors.text, marginBottom: 6},

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

    // ⭐ Khi disable → nền xám nhẹ
    disabledBox: {
      backgroundColor: '#E5E7EB',
      borderColor: '#D1D5DB',
    },

    multilineBox: {
      paddingVertical: 10,
    },

    input: {fontSize: 16, color: theme.colors.text},

    // ⭐ Text mờ khi disable
    disabledInput: {
      color: '#6B7280',
    },

    multilineInput: {
      textAlignVertical: 'top',
      minHeight: 80,
    },
  });

export default React.memo(LabeledTextInput);
