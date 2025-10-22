import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from "react-native";
import BottomSheetModal from "../common/BottomSheetModal";
import LabeledTextInput from "../common/LabeledTextInput";
import LabeledSelect from "../common/LabeledSelect";
import type { Option } from "../../types/common";
import { useUIFactory } from "../../ui/factory/useUIFactory";

export type EmpInDeptSort = "created_desc" | "created_asc" | "name_asc" | "name_desc";

// ⬇️ THÊM field mới vào type
export type EmployeeFilterInDeptValues = {
    employeeName: string;
    position: string;
    sortBy: EmpInDeptSort;
    inDeptOnly: boolean;
};

type Props = {
    visible: boolean;
    onClose: () => void;
    onApply: (values: EmployeeFilterInDeptValues) => void;
    current?: Partial<EmployeeFilterInDeptValues>;
};

function useSortingOptions<T extends (key: string) => string>(t: T): Option[] {
    return React.useMemo<Option[]>(
        () => [
            { value: "created_desc", label: t("sort_created_desc") },
            { value: "created_asc", label: t("sort_created_asc") },
            { value: "name_asc", label: t("sort_name_asc") },
            { value: "name_desc", label: t("sort_name_desc") },
        ],
        [t]
    );
}

const EmployeeFilterInDepartment: React.FC<Props> = ({ visible, onClose, onApply, current }) => {
    const { loading, theme, lang } = useUIFactory();

    // ---- State
    const [employeeName, setEmployeeName] = React.useState(current?.employeeName ?? "");
    const [position, setPosition] = React.useState(current?.position ?? "");
    const [sortBy, setSortBy] = React.useState<EmpInDeptSort>(current?.sortBy ?? "created_desc");
    const [inDeptOnly, setInDeptOnly] = React.useState<boolean>(current?.inDeptOnly ?? false); // NEW

    const t = React.useCallback((k: any) => (lang?.t ? lang.t(k) : String(k)), [lang]);
    const sortingOptions = useSortingOptions(t);

    // ⬇️ Options cho toggle "Nhân viên trong phòng"
    const scopeOptions: Option[] = React.useMemo(
        () => [
            { value: "all", label: lang?.t("all_employees") ?? "Tất cả nhân viên" },
            { value: "in_dept", label: lang?.t("employees_in_this_dept") ?? "Chỉ nhân viên trong phòng" },
        ],
        [lang]
    );

    React.useEffect(() => {
        if (visible) {
            setEmployeeName(current?.employeeName ?? "");
            setPosition(current?.position ?? "");
            setSortBy((current?.sortBy as EmpInDeptSort) ?? "created_desc");
            setInDeptOnly(current?.inDeptOnly ?? false); // NEW
        }
    }, [visible, current?.employeeName, current?.position, current?.sortBy, current?.inDeptOnly]);

    if (loading || !theme || !lang) return null;
    const S = makeStyles(theme);

    const applyAndClose = () => {
        onApply({ employeeName, position, sortBy, inDeptOnly }); // ⬅️ truyền thêm
        onClose();
    };

    const clearAndClose = () => {
        const reset: EmployeeFilterInDeptValues = {
            employeeName: "",
            position: "",
            sortBy: "created_desc",
            inDeptOnly: false, // reset về hiển thị tất cả
        };
        onApply(reset);
        onClose();
    };

    return (
        <BottomSheetModal visible={visible} onClose={onClose} maxHeightRatio={0.9}>
            <ScrollView contentContainerStyle={S.sheetContent} keyboardShouldPersistTaps="handled">
                {/* Row 1: Tên nhân viên + Tên chức vụ */}
                <View style={S.row}>
                    <LabeledTextInput
                        label={lang.t("employee_name_label")}
                        placeholder={lang.t("employee_placeholder")}
                        value={employeeName}
                        onChangeText={setEmployeeName}
                        theme={theme}
                    />
                    <LabeledTextInput
                        label={lang.t("position_name_label")}
                        placeholder={lang.t("position_placeholder")}
                        value={position}
                        onChangeText={setPosition}
                        theme={theme}
                    />
                </View>

                {/* Row 2: Phạm vi lọc */}
                <Text style={S.sectionLabel}>{lang.t("employees_in_this_dept") ?? "Nhân viên trong phòng"}</Text>
                <LabeledSelect
                    label=""  // label đã đặt trên Text phía trên
                    selected={scopeOptions[inDeptOnly ? 1 : 0]}
                    options={scopeOptions}
                    onSelect={(opt: Option) => setInDeptOnly(opt.value === "in_dept")}
                    theme={theme}
                />

                {/* Row 3: Sắp xếp */}
                <Text style={[S.sectionLabel, { marginTop: 12 }]}>{lang.t("sort_by_label")}</Text>
                <LabeledSelect
                    label=""
                    selected={sortingOptions.find(o => o.value === sortBy)!}
                    options={sortingOptions}
                    onSelect={(opt: Option) => setSortBy(opt.value as EmpInDeptSort)}
                    theme={theme}
                />

                {/* Actions */}
                <View style={S.rowButtons}>
                    <TouchableOpacity style={S.btnClear} onPress={clearAndClose}>
                        <Text style={S.btnClearText}>{lang.t("clear_filters")}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={S.btnApply} onPress={applyAndClose}>
                        <Text style={S.btnApplyText}>{lang.t("apply_filters")}</Text>
                    </TouchableOpacity>
                </View>

                <View style={{ height: 8 }} />
                <View style={S.grabber} />
            </ScrollView>
        </BottomSheetModal>
    );
};

export default EmployeeFilterInDepartment;

const makeStyles = (theme: any) =>
    StyleSheet.create({
        sheetContent: {
            paddingTop: 16,
            paddingBottom: Platform.select({ ios: 28, android: 20 }),
            paddingHorizontal: 16,
            backgroundColor: theme.colors.card ?? "#fff",
            borderTopLeftRadius: 15,
            borderTopRightRadius: 15,
        },
        row: {
            flexDirection: "row",
            gap: 12,
            marginBottom: 12,
        },
        sectionLabel: {
            fontSize: 14,
            color: theme.colors.mutedText ?? "#707070",
            marginBottom: 8,
        },
        rowButtons: {
            flexDirection: "row",
            gap: 12,
            marginTop: 12,
        },
        btnClear: {
            flex: 1,
            height: 48,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 10,
            backgroundColor: "#E8F1FF",
        },
        btnClearText: { fontSize: 16, fontWeight: "600", color: "#0B59F8" },
        btnApply: {
            flex: 1,
            height: 48,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 10,
            backgroundColor: "#6E8BFF",
        },
        btnApplyText: { fontSize: 16, fontWeight: "700", color: "#fff" },
        grabber: {
            alignSelf: "center",
            width: 44,
            height: 5,
            borderRadius: 999,
            backgroundColor: "#D3D3D3",
            marginTop: 16,
        },
    });
