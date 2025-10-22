import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from "react-native";
import BottomSheetModal from "../common/BottomSheetModal";
import LabeledTextInput from "../common/LabeledTextInput";
import LabeledSelect from "../common/LabeledSelect";
import type { Option } from "../../types/common";
import { useUIFactory } from "../../ui/factory/useUIFactory";

export type DeptSortValue = "created_desc" | "created_asc" | "name_asc" | "name_desc";

export type DepartmentFilterValues = {
    departmentName: string;
    headName: string;
    sortBy: DeptSortValue;
};

type Props = {
    visible: boolean;
    onClose: () => void;
    /** gọi khi user bấm Áp dụng hoặc Xóa lọc (reset) */
    onApply: (values: DepartmentFilterValues) => void;
    /** giá trị hiện tại trên danh sách (để đổ sẵn vào form) */
    current?: Partial<DepartmentFilterValues>;
};

function useSortingOptions<T extends (...args: any[]) => string>(t: T): Option[] {
    return React.useMemo<Option[]>(() => [
        { value: "created_desc", label: t("sort_created_desc" as any) },
        { value: "created_asc", label: t("sort_created_asc" as any) },
        { value: "name_asc", label: t("sort_name_asc" as any) },
        { value: "name_desc", label: t("sort_name_desc" as any) },
    ], [t]);
}

export default function DepartmentFilter({ visible, onClose, onApply, current }: Props) {
    const { loading, theme, lang } = useUIFactory();

    // Form state (không ảnh hưởng tới list cho đến khi nhấn Áp dụng)
    const [departmentName, setDepartmentName] = useState<string>(current?.departmentName ?? "");
    const [headName, setHeadName] = useState<string>(current?.headName ?? "");
    const [sortBy, setSortBy] = useState<DeptSortValue>(current?.sortBy ?? "created_desc");

    const t = React.useCallback((k: any) => (lang?.t ? lang.t(k) : String(k)), [lang]);
    const sortingOptions = useSortingOptions(t);

    // Mỗi lần mở modal, đồng bộ giá trị hiện tại vào form
    React.useEffect(() => {
        if (visible) {
            setDepartmentName(current?.departmentName ?? "");
            setHeadName(current?.headName ?? "");
            setSortBy((current?.sortBy as DeptSortValue) ?? "created_desc");
        }
    }, [visible]);

    if (loading || !theme || !lang) return null;
    
    const S = makeStyles(theme!);

    const applyAndClose = () => {
        onApply({ departmentName, headName, sortBy });
        onClose();
    };

    const clearAndClose = () => {
        const reset: DepartmentFilterValues = {
            departmentName: "",
            headName: "",
            sortBy: "created_desc", // mặc định yêu cầu
        };
        onApply(reset);
        onClose();
    };

    return (
        <BottomSheetModal visible={visible} onClose={onClose} maxHeightRatio={0.9}>
            <ScrollView
                contentContainerStyle={[S.sheetContent]}
                keyboardShouldPersistTaps="handled"
            >
                <LabeledTextInput
                    label={lang.t("department_name_title")}
                    placeholder={lang?.t("department_name_title")}
                    value={departmentName}
                    onChangeText={setDepartmentName}
                    theme={theme}
                />

                <View style={{ height: 16 }} />

                <LabeledTextInput
                    label={lang.t("head_of_dept")}
                    placeholder={lang?.t("head_of_dept")}
                    value={headName}
                    onChangeText={setHeadName}
                    theme={theme}
                />

                <View style={{ height: 18 }} />

                <Text style={[S.sectionLabel]}>{lang?.t("sort_by_label") || "Sắp xếp bởi"}</Text>
                <LabeledSelect
                    label=""
                    selected={sortingOptions.find(o => o.value === sortBy)!}
                    options={sortingOptions}
                    onSelect={(opt: Option) => setSortBy(opt.value as DeptSortValue)}
                    theme={theme}
                />

                <View style={{ height: 20 }} />

                <View style={S.rowButtons}>
                    <TouchableOpacity style={S.btnClear} onPress={clearAndClose} accessibilityRole="button">
                        <Text style={S.btnClearText}>{lang?.t("clear_filters")}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={S.btnApply} onPress={applyAndClose} accessibilityRole="button">
                        <Text style={S.btnApplyText}>{lang?.t("apply_filters")}</Text>
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
            borderTopLeftRadius: 15,
            borderTopRightRadius: 15,
        },
        sectionLabel: {
            fontSize: 14,
            color: theme.colors.mutedText ?? "#707070",
            marginBottom: 8,
        },
        rowButtons: {
            flexDirection: "row",
            gap: 12,
            marginTop: 8,
        },
        btnClear: {
            flex: 1,
            height: 48,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 10,
            backgroundColor: "#E8F1FF",
        },
        btnClearText: {
            fontSize: 16,
            fontWeight: "600",
            color: "#0B59F8",
        },
        btnApply: {
            flex: 1,
            height: 48,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 10,
            backgroundColor: "#6E8BFF",
        },
        btnApplyText: {
            fontSize: 16,
            fontWeight: "700",
            color: "#fff",
        },
        grabber: {
            alignSelf: "center",
            width: 44,
            height: 5,
            borderRadius: 999,
            backgroundColor: "#D3D3D3",
            marginTop: 16,
        },
    });
