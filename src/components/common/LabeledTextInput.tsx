import React from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";

type Props = {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
  theme: any;
};

const LabeledTextInput: React.FC<Props> = ({ label, value, onChangeText, placeholder, theme }) => {
  const S = themedStyles(theme);
  return (
    <View style={S.field}>
      <Text style={S.label}>{label}</Text>
      <View style={S.inputBox}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.placeholder}
          style={S.input}
        />
      </View>
    </View>
  );
};

const themedStyles = (theme: any) =>
  StyleSheet.create({
    field: { flexGrow: 1, flexBasis: "48%", minWidth: "48%" },
    label: { fontSize: 13, color: theme.colors.text, marginBottom: 6 },
    inputBox: {
      borderWidth: 2,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.background,
      borderRadius: 14,
      paddingHorizontal: 14,
      paddingVertical: 5,
      minHeight: 48,
      justifyContent: "center",
    },
    input: { fontSize: 16, color: theme.colors.text },
  });

export default React.memo(LabeledTextInput);
