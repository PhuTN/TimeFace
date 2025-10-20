import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from "react-native";
import BottomSheetModal from "./BottomSheetModal";
import LabeledTextInput from "./LabeledTextInput";
import LabeledSelect from "./LabeledSelect";
import { useUIFactory } from "../../ui/factory/useUIFactory";
import type { Option } from "../../types/common";
import { DEPARTMENTS } from "../../fake_data/Dien/fake_data.tsx";

export type AddEmployeePayload = {
  name: string;
  position: string;
  departmentId: string;
  email: string; // gmail
};

type Props = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (payload: AddEmployeePayload) => void;
  /** Giá trị mặc định khi mở modal (optional) */
  initial?: Partial<AddEmployeePayload>;
};

export default function AddEmployeeModal({ visible, onClose, onSubmit, initial }: Props) {
  const { loading, theme, lang } = useUIFactory();

  // ---- HOOKS: luôn khai báo trước mọi guard
  const [name, setName] = React.useState(initial?.name ?? "");
  const [position, setPosition] = React.useState(initial?.position ?? "");
  const [departmentId, setDepartmentId] = React.useState(initial?.departmentId ?? "");
  const [email, setEmail] = React.useState(initial?.email ?? "");

  // options phòng ban
  const departmentOptions = React.useMemo<Option[]>(
    () => [{ value: "", label: "—" }, ...DEPARTMENTS.map(d => ({ value: d.id, label: d.name }))],
    []
  );

  // reset khi mở modal
  React.useEffect(() => {
    if (visible) {
      setName(initial?.name ?? "");
      setPosition(initial?.position ?? "");
      setDepartmentId(initial?.departmentId ?? "");
      setEmail(initial?.email ?? "");
    }
  }, [visible, initial?.name, initial?.position, initial?.departmentId, initial?.email]);

  // validate đơn giản
  const emailOk = React.useMemo(() => {
    if (!email) return false;
    // rất cơ bản, đủ để tránh nhập linh tinh
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }, [email]);
  const canSubmit = name.trim().length > 0 && position.trim().length > 0 && departmentId !== "" && emailOk;

  // ---- GUARD
  if (loading || !theme || !lang) return null;

  const S = makeStyles(theme);
  const t = lang.t;

  const handleSubmit = () => {
    if (!canSubmit) return;
    onSubmit({ name: name.trim(), position: position.trim(), departmentId, email: email.trim() });
    onClose();
  };

  return (
    <BottomSheetModal visible={visible} onClose={onClose} maxHeightRatio={0.9}>
      <ScrollView contentContainerStyle={S.sheetContent} keyboardShouldPersistTaps="handled">
        {/* Tên nhân viên */}
        <LabeledTextInput
          label={t("employee_name_label")}
          placeholder={t("employee_placeholder")}
          value={name}
          onChangeText={setName}
          theme={theme}
        />

        <View style={{ height: 14 }} />

        {/* Chức vụ */}
        <LabeledTextInput
          label={t("position_name_label")}
          placeholder={t("position_placeholder")}
          value={position}
          onChangeText={setPosition}
          theme={theme}
        />

        <View style={{ height: 14 }} />

        {/* Phòng ban */}
        <Text style={S.label}>{t("department_label")}</Text>
        <LabeledSelect
          label=""
          selected={departmentOptions.find(o => o.value === departmentId) ?? departmentOptions[0]}
          options={departmentOptions}
          onSelect={(o: Option) => setDepartmentId(o.value)}
          theme={theme}
        />

        <View style={{ height: 14 }} />

        {/* Gmail */}
        <LabeledTextInput
          label={"Gmail"}
          placeholder={"name@example.com"}
          value={email}
          onChangeText={setEmail}
          theme={theme}
        />

        {/* Nút hành động */}
        <View style={S.rowButtons}>
          <TouchableOpacity style={S.btnCancel} onPress={onClose}>
            <Text style={S.btnCancelText}>{t("cancel") ?? "Thoát"}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[S.btnCreate, !canSubmit && { opacity: 0.5 }]}
            onPress={handleSubmit}
            disabled={!canSubmit}
          >
            <Text style={S.btnCreateText}>{t("add_employee") ?? "Thêm nhân viên"}</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 8 }} />
        <View style={S.grabber} />
      </ScrollView>
    </BottomSheetModal>
  );
}

const makeStyles = (theme: any) =>
  StyleSheet.create({
    sheetContent: {
      paddingTop: 16,
      paddingBottom: Platform.select({ ios: 28, android: 20 }),
      paddingHorizontal: 16,
      backgroundColor: theme.colors.card ?? "#fff",
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      rowGap: 0,
    },
    label: {
      fontSize: 13,
      color: theme.colors.mutedText ?? "#707070",
      marginBottom: 6,
    },
    rowButtons: {
      flexDirection: "row",
      gap: 12,
      marginTop: 16,
    },
    btnCancel: {
      flex: 1,
      height: 48,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 12,
      backgroundColor: "#FFE9E7",
    },
    btnCancelText: { fontSize: 16, fontWeight: "600", color: "#F04848" },
    btnCreate: {
      flex: 1,
      height: 48,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 12,
      backgroundColor: "#6E8BFF",
    },
    btnCreateText: { fontSize: 16, fontWeight: "700", color: "#fff" },
    grabber: {
      alignSelf: "center",
      width: 44,
      height: 5,
      borderRadius: 999,
      backgroundColor: "#D3D3D3",
      marginTop: 16,
    },
  });
