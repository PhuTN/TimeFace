import React, { memo, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, FlatList, ListRenderItem, Pressable, Image } from "react-native";
import BottomSheetModal from "./BottomSheetModal";
import LabeledTextInput from "./LabeledTextInput";
import LabeledSelect from "./LabeledSelect";
import { useUIFactory } from "../../ui/factory/useUIFactory";
import type { Option } from "../../types/common";
import AddEmployeeIntoDepartmentFilter, { EmployeeFilterInDeptValues } from "./AddEmployeeIntoDepartmentFilter";
import FilterIcon from "../../assets/icons/filter_icon.svg"

import { Department, Employee, EMPLOYEES as EMP_FAKE, DEPARTMENTS } from "../../fake_data/Dien/fake_data.tsx";
import FilterChip from "./FilterChip.tsx";

export type AddDepartmentModal = {
    name: string;
    head: string;
    headId: string;
};

type Props = {
    visible: boolean;
    onClose: () => void;
    onSubmit: (payload: AddDepartmentModal) => void;
    /** Giá trị mặc định khi mở modal (optional) */
    initial?: Partial<AddDepartmentModal>;
};

export default function AddEmployeeModal({ visible, onClose, onSubmit, initial }: Props) {
    const { loading, theme, lang } = useUIFactory();

    // ---- HOOKS: luôn khai báo trước mọi guard
    const [name, setName] = React.useState(initial?.name ?? "");
    const [head, setHead] = React.useState(initial?.head ?? "");
    const [headId, setHeadId] = React.useState(initial?.headId ?? "");

    // reset khi mở modal
    React.useEffect(() => {
        if (visible) {
            setName(initial?.name ?? "");
            setHead(initial?.head ?? "");
            setHeadId(initial?.headId ?? "");
        }
    }, [visible, initial?.name, initial?.head, initial?.headId]);

    const [showFilter, setShowFilter] = useState(false);

    // Nguồn dữ liệu đầy đủ (tất cả nhân viên)
    const [employees, setEmployees] = useState<Employee[]>(() => EMP_FAKE.map(e => ({ ...e })));

    // ⬇️ default criteria: hiển thị toàn bộ
    const [criteria, setCriteria] = useState<EmployeeFilterInDeptValues>({
        employeeName: "",
        position: "",
        sortBy: "created_desc"
    });
    const [activeFilters, setActiveFilters] = useState<
        { key: string; mainText: string; subText: string }[]
    >([]);

    // SelectedIds: đang chọn trong phòng này
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    // Helper áp dụng tiêu chí lọc + sort cho một mảng employees
    const applyCriteria = React.useCallback((
        source: Employee[],
        c: EmployeeFilterInDeptValues
    ) => {
        const q = c.employeeName.trim().toLowerCase();
        const p = c.position.trim().toLowerCase();

        let out = source.filter(e => {
            const matchesName = !q || e.name.toLowerCase().includes(q);
            const matchesPos = !p || e.position.toLowerCase().includes(p);
            return matchesName && matchesPos;
        });

        out = out.sort((a, b) => {
            switch (c.sortBy) {
                case "created_asc": return +new Date(a.createdAt) - +new Date(b.createdAt);
                case "name_asc": return a.name.localeCompare(b.name);
                case "name_desc": return b.name.localeCompare(a.name);
                case "created_desc":
                default: return +new Date(b.createdAt) - +new Date(a.createdAt);
            }
        });

        return out;
    }, []);

    // DATA cho FlatList: danh sách đã lọc theo phòng & tiêu chí
    const data = React.useMemo(() => {
        return applyCriteria(employees, criteria);
    }, [employees, criteria, applyCriteria]);

    // ---- Guard
    if (loading || !theme || !lang) return null;
    const S = makeStyles(theme);
    const t = lang.t;

    const DEFAULT_CRITERIA: EmployeeFilterInDeptValues = {
        employeeName: "",
        position: "",
        sortBy: "created_desc",
    };

    const getSortLabel = (value: EmployeeFilterInDeptValues["sortBy"]) => {
        switch (value) {
            case "created_asc":
                return t("sort_created_asc");
            case "name_asc":
                return t("sort_name_asc");
            case "name_desc":
                return t("sort_name_desc");
            case "created_desc":
            default:
                return t("sort_created_desc");
        }
    };

    const buildActiveFilterChips = (values: EmployeeFilterInDeptValues) => {
        const chips: { key: string; mainText: string; subText: string }[] = [];

        if (values.employeeName.trim()) {
            chips.push({
                key: "employeeName",
                mainText: t("employee_name_label"),
                subText: values.employeeName.trim(),
            });
        }

        if (values.position.trim()) {
            chips.push({
                key: "position",
                mainText: t("position_name_label"),
                subText: values.position.trim(),
            });
        }

        chips.push({
            key: "sortBy",
            mainText: t("sort_by_label"),
            subText: getSortLabel(values.sortBy),
        });

        return chips;
    };

    const handleRemoveFilter = (key: string) => {
        const next = { ...criteria };

        if (key === "employeeName") {
            next.employeeName = "";
        } else if (key === "position") {
            next.position = "";
        } else if (key === "sortBy") {
            next.sortBy = DEFAULT_CRITERIA.sortBy;
        }

        setCriteria(next);
        setActiveFilters(prev => prev.filter(c => c.key !== key));
    };

    const toggleSelect = (id: string) => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    const EmployeeRow = memo(({ item }: { item: Employee }) => {
        const checked = selectedIds.has(item.id);
        return (
            <Pressable onPress={() => toggleSelect(item.id)} style={({ pressed }) => [S.card, pressed && { opacity: 0.92 }]}>
                <View style={S.row}>
                    <Image source={item.avatar} style={S.avatar} />
                    <View style={{ flex: 1 }}>
                        <Text style={S.name} numberOfLines={1}>{item.name}</Text>
                        <Text style={S.role} numberOfLines={1}>{item.position}</Text>
                    </View>
                    <View style={[S.checkWrap, checked ? S.checkWrapOn : S.checkWrapOff]}>
                        {checked ? <Text style={S.checkIcon}>✓</Text> : null}
                    </View>
                </View>
            </Pressable>
        );
    });
    const renderItem: ListRenderItem<Employee> = ({ item }) => <EmployeeRow item={item} />;

    const isDisabled = !name.trim();

    const handleClose = () => {
        setSelectedIds(new Set());
        setCriteria(DEFAULT_CRITERIA);
        setActiveFilters([]);
        setShowFilter(false);
        onClose();
    };

    const handleSubmit = () => {
        onSubmit({ name: name.trim(), head: head.trim(), headId: headId.trim() });
        onClose();
    };

    return (
        <BottomSheetModal visible={visible} onClose={handleClose} maxHeightRatio={0.9}>
            <ScrollView contentContainerStyle={S.sheetContent} keyboardShouldPersistTaps="handled">
                {/* Tên phòng ban */}
                <LabeledTextInput
                    label={t("department_label")}
                    placeholder={t("department_name_title")}
                    value={name}
                    onChangeText={setName}
                    theme={theme}
                />

                <View style={{ height: 14 }} />

                {/* Trưởng phòng */}
                <LabeledTextInput
                    label={t("head_of_dept")}
                    placeholder={t("select_department_head")}
                    value={head}
                    onChangeText={setHead}
                    theme={theme}
                />

                <View style={{ height: 14 }} />

                {/* Tiêu đề + Filter */}
                <View style={S.rowHeader}>
                    <Text style={[S.sectionTitle, { color: theme.colors.text }]}>
                        {t("list_employee") ?? "Danh sách nhân viên"}
                    </Text>

                    <TouchableOpacity
                        style={S.filterBtn}
                        onPress={() => setShowFilter(true)}
                        accessibilityRole="button"
                        accessibilityLabel="Open filter"
                    >
                        <FilterIcon width={22} height={22} />
                    </TouchableOpacity>
                </View>

                {activeFilters.length > 0 && (
                    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 8 }}>
                        {activeFilters.map(f => (
                            <FilterChip
                                key={f.key}
                                mainText={f.mainText}
                                subText={f.subText}
                                theme={theme}
                                onRemove={() => handleRemoveFilter(f.key)}
                            />
                        ))}
                    </View>
                )}

                <FlatList
                    scrollEnabled={false}              // giao cho ScrollView cuộn
                    data={data}
                    keyExtractor={(it) => it.id}
                    renderItem={renderItem}
                    ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
                    contentContainerStyle={{ marginTop: 8 }}
                />

                <AddEmployeeIntoDepartmentFilter
                    visible={showFilter}
                    current={criteria}
                    onClose={() => setShowFilter(false)}
                    onApply={(values) => {
                        setCriteria(values);
                        setActiveFilters(buildActiveFilterChips(values));
                    }}
                />
            </ScrollView>
            {/* Nút hành động */}
            <View style={S.rowButtons}>
                <TouchableOpacity style={S.btnCancel} onPress={handleClose}>
                    <Text style={S.btnCancelText}>{t("cancel") ?? "Thoát"}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[S.btnCreate, isDisabled && { opacity: 0.5 }]}
                    onPress={handleSubmit}
                    disabled={isDisabled}
                >
                    <Text style={S.btnCreateText}>
                        {t("add_department") ?? "Thêm phòng ban"}
                    </Text>
                </TouchableOpacity>
            </View>
            <View style={{ height: 8 }} />
            <View style={S.grabber} />
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
            paddingHorizontal: 14
        },
        btnCancel: {
            flex: 1,
            height: 48,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 10,
            backgroundColor: "#FFE9E7",
        },
        btnCancelText: { fontSize: 16, fontWeight: "600", color: "#F04848" },
        btnCreate: {
            flex: 1,
            height: 48,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 10,
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
        rowHeader: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: theme.spacing(1),
            marginBottom: theme.spacing(1),
        },
        sectionTitle: {
            fontSize: 16,
            fontWeight: "600",
        },
        filterBtn: {
            borderRadius: 10,
            alignItems: "center",
            justifyContent: "center",
            padding: 6,
        },
        // employee card
        card: {
            backgroundColor: theme.colors.background,
            borderRadius: 14,
            borderWidth: 1,
            borderColor: theme.colors.contrastBackground,
            padding: 12,
        },
        row: { flexDirection: "row", alignItems: "center", gap: 12 },
        avatar: { width: 44, height: 44, borderRadius: 999 },
        name: { fontSize: 16, fontWeight: "700", color: theme.colors.text },
        role: { fontSize: 13, color: "#666", marginTop: 2 },

        // big check
        checkWrap: {
            width: 36, height: 36, borderRadius: 10,
            alignItems: "center", justifyContent: "center", borderWidth: 2,
        },
        checkWrapOn: { backgroundColor: "#5F8CFF", borderColor: "#5F8CFF" },
        checkWrapOff: { backgroundColor: "transparent", borderColor: "#000" },
        checkIcon: { color: "#fff", fontSize: 20, fontWeight: "800" },
    });
