import React, {useCallback} from 'react';
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

type InputType = 'text' | 'number' | 'money';

/* ================== EDITABLE ================== */
type EditableProps = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  theme: any;
  multiline?: boolean;
  numberOfLines?: number;
  containerStyle?: StyleProp<ViewStyle>;
  inputProps?: TextInputProps;
  editable?: true;
  type?: InputType;   // ⭐ NEW
};

/* ================= READONLY ================== */
type ReadonlyProps = {
  label: string;
  value: string;
  placeholder?: string;
  theme: any;
  multiline?: boolean;
  numberOfLines?: number;
  containerStyle?: StyleProp<ViewStyle>;
  inputProps?: TextInputProps;
  editable: false;
  type?: InputType;   // ⭐ có nhưng không dùng
};

type Props = EditableProps | ReadonlyProps;

export default function LabeledTextInput({
  label,
  value,
  placeholder,
  theme,
  multiline = false,
  numberOfLines,
  containerStyle,
  inputProps,
  editable = true,
  type = 'text',
  ...rest
}: Props) {
  const S = themedStyles(theme);
  const {style: inputStyle, ...restInputProps} = inputProps ?? {};

  // ⭐ Handler cho type money / number
  const formatMoney = useCallback((num: string) => {
    const cleaned = num.replace(/[^\d]/g, '');
    if (!cleaned) return '';

    return cleaned.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }, []);

  const onChangeText =
    editable && 'onChangeText' in rest
      ? (text: string) => {
          let final = text;

          if (type === 'number') {
            final = text.replace(/[^\d]/g, '');
          }

          if (type === 'money') {
            final = formatMoney(text);
          }

          rest.onChangeText(final);
        }
      : undefined;

  // ⭐ value hiển thị: nếu type = money → format luôn
  const displayValue =
    type === 'money' ? formatMoney(value ?? '') : value ?? '';

  return (
    <View style={[S.field, containerStyle]}>
      <Text style={S.label}>{label}</Text>

      <View
        style={[
          S.inputBox,
          multiline ? S.multilineBox : null,
          !editable && S.disabledBox,
        ]}>
        <TextInput
          value={displayValue}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.placeholder}
          multiline={multiline}
          numberOfLines={multiline ? numberOfLines ?? 3 : 1}
          editable={editable}
          keyboardType={
            type === 'number' || type === 'money' ? 'numeric' : 'default'
          }
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
}

/* ================== THEME ================== */

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

    disabledBox: {
      backgroundColor: '#E5E7EB',
      borderColor: '#D1D5DB',
    },

    multilineBox: {
      paddingVertical: 10,
    },

    input: {fontSize: 16, color: theme.colors.text},

    disabledInput: {
      color: '#6B7280',
    },

    multilineInput: {
      textAlignVertical: 'top',
      minHeight: 80,
    },
  });
