import React from "react";
import { View, Text, Button, ActivityIndicator } from "react-native";

import { useUIFactory } from "../ui/factory/useUIFactory";
import { setUIState } from "../ui/factory/selector";

export default function HomeScreen() {
  const { loading, theme, lang } = useUIFactory();

  if (loading || !theme || !lang) {
    return <View style={{ flex:1, alignItems:"center", justifyContent:"center" }}>
      <ActivityIndicator />
    </View>;
  }

  return (
    <View style={{ flex:1, backgroundColor: theme.colors.background, padding: theme.spacing(2) }}>
      <Text style={{ color: theme.colors.text, fontSize: 20 }}>{lang.t("hello")}</Text>

      <View style={{ height: theme.spacing(2) }} />

      {/* Đổi theme */}
      <Button title={lang.t("theme.dark")} onPress={() => setUIState({ theme: "dark" })} />
      <Button title={lang.t("theme.light")} onPress={() => setUIState({ theme: "light" })} />

      <View style={{ height: theme.spacing(2) }} />

      {/* Đổi ngôn ngữ */}
      <Button title="Tiếng Việt" onPress={() => setUIState({ lang: "vi" })} />
      <Button title="English" onPress={() => setUIState({ lang: "en" })} />
    </View>
  );
}
