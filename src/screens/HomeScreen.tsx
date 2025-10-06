import React, { useState } from "react";
import { View, Text, Button, ActivityIndicator } from "react-native";

import { useUIFactory } from "../ui/factory/useUIFactory";
import { setUIState } from "../ui/factory/selector";
import BottomSheetModal from "../components/common/BottomSheetModal";
import CommonScreen3 from "./CommonScreen3";

export default function HomeScreen() {
  const { loading, theme, lang } = useUIFactory();
  const [showCommon3, setShowCommon3] = useState(false);

  if (loading || !theme || !lang) {
    return <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <ActivityIndicator />
    </View>;
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background, padding: theme.spacing(2) }}>
      <Text style={{ color: theme.colors.text, fontSize: 20 }}>{lang.t("hello")}</Text>

      <View style={{ height: theme.spacing(2) }} />

      {/* Đổi theme */}
      <Button title={lang.t("theme.dark")} onPress={() => setUIState({ theme: "dark" })} />
      <Button title={lang.t("theme.light")} onPress={() => setUIState({ theme: "light" })} />

      <View style={{ height: theme.spacing(2) }} />

      {/* Đổi ngôn ngữ */}
      <Button title="Tiếng Việt" onPress={() => setUIState({ lang: "vi" })} />
      <Button title="English" onPress={() => setUIState({ lang: "en" })} />

      <View style={{ height: theme.spacing(2) }} />

      {/* Mở CommonScreen3 dưới dạng modal */}
      <Button title="CommonScreen3" onPress={() => setShowCommon3(true)} />

      <BottomSheetModal visible={showCommon3} onClose={() => setShowCommon3(false)} maxHeightRatio={0.9}>
        {/* Lưu ý: ĐỂ CommonScreen3 TỰ GIÃN CAO, không set flex:1 ở container bên trong */}
        <CommonScreen3 />
      </BottomSheetModal>
    </View>
  );
}
