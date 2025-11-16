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
}) => {
  const S = themedStyles(theme);
  const {style: inputStyle, ...restInputProps} = inputProps ?? {};

  return (
    <View style={[S.field, containerStyle]}>
      <Text style={S.label}>{label}</Text>
      <View style={[S.inputBox, multiline ? S.multilineBox : null]}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.placeholder}
          multiline={multiline}
          numberOfLines={multiline ? numberOfLines ?? 3 : 1}
          style={[
            S.input,
            multiline ? S.multilineInput : null,
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
    multilineBox: {
      paddingVertical: 10,
    },
    input: {fontSize: 16, color: theme.colors.text},
    multilineInput: {
      textAlignVertical: 'top',
      minHeight: 80,
    },
  });

export default React.memo(LabeledTextInput);
