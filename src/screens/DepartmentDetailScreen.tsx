import React, { memo, useMemo, useState } from "react";
import {
    View, Text, StyleSheet, SafeAreaView, TouchableOpacity,
    FlatList, ListRenderItem, Image, Pressable, Alert, ScrollView
} from "react-native";
import { useUIFactory } from "../ui/factory/useUIFactory";
import Header from "../components/common/Header";
import LabeledTextInput from "../components/common/LabeledTextInput";
import LabeledSelect from "../components/common/LabeledSelect";
import type { Option } from "../types/common";
import { Department, Employee, EMPLOYEES as EMP_FAKE, DEPARTMENTS } from "../fake_data/Dien/fake_data.tsx";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import FilterIcon from "../assets/icons/filter_icon.svg";
import EmployeeFilterInDepartment, { EmployeeFilterInDeptValues } from
    "../components/common/EmployeeFilterInDepartment";
import HeaderBar from "../components/common/HeaderBar.tsx";
import FilterChip from "../components/common/FilterChip.tsx";


type Props = NativeStackScreenProps<RootStackParamList, 'DepartmentDetail'>;

const UNASSIGNED_DEPT_ID = "unassigned";

export default function DepartmentDetailScreen({ route, navigation }: Props) {
    const { loading, theme, lang } = useUIFactory();
    const [departmentDetail, setDepartmentDetail] = useState(route.params?.departmentDetail ?? null);
    const [showFilter, setShowFilter] = useState(false);

    // Nguồn dữ liệu đầy đủ (tất cả nhân viên)
    const [employees, setEmployees] = useState<Employee[]>(() => EMP_FAKE.map(e => ({ ...e })));

    // ⬇️ default criteria: hiển thị toàn bộ
    const [criteria, setCriteria] = useState<EmployeeFilterInDeptValues>({
        employeeName: "",
        position: "",
        sortBy: "created_desc",
        inDeptOnly: false, // NEW: mặc định tắt
    });
    const [activeFilters, setActiveFilters] = useState<
        { key: string; mainText: string; subText: string }[]
    >([]);

    // Danh sách hiển thị sau khi áp dụng tiêu chí + phòng hiện tại
    const [visibleEmployees, setVisibleEmployees] = useState<Employee[]>([]);

    // Các field editable của phòng
    const [deptName, setDeptName] = useState<string>(departmentDetail?.name ?? "");
    const [deptHead, setDeptHead] = useState<string>(departmentDetail?.head ?? "");
    const [deptActive, setDeptActive] = useState<boolean>(!!departmentDetail?.active);

    const dept = useMemo<Department | undefined>(
        () => (departmentDetail?.id ? DEPARTMENTS.find(d => d.id === departmentDetail.id) : undefined),
        [departmentDetail?.id]
    );

    // SelectedIds: đang chọn trong phòng này
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    // Sync lần đầu & mỗi khi đổi phòng hoặc employees thay đổi
    React.useEffect(() => {
        if (!departmentDetail?.id) return;
        const initSelected = new Set(
            employees.filter(e => e.departmentId === departmentDetail.id).map(e => e.id)
        );
        setSelectedIds(initSelected);
    }, [departmentDetail?.id, employees]);

    // Helper áp dụng tiêu chí lọc + sort cho một mảng employees
    const applyCriteria = React.useCallback((
        source: Employee[],
        deptId: string,
        c: EmployeeFilterInDeptValues
    ) => {
        const q = c.employeeName.trim().toLowerCase();
        const p = c.position.trim().toLowerCase();

        let out = source.filter(e => {
            const matchesDept = c.inDeptOnly ? (e.departmentId === deptId) : true; // NEW
            const matchesName = !q || e.name.toLowerCase().includes(q);
            const matchesPos = !p || e.position.toLowerCase().includes(p);
            return matchesDept && matchesName && matchesPos;
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

    // Cập nhật visibleEmployees khi có phòng/tiêu chí/employees đổi
    React.useEffect(() => {
        if (departmentDetail?.id) {
            setVisibleEmployees(applyCriteria(employees, departmentDetail.id, criteria));
        } else {
            setVisibleEmployees([]);
        }
    }, [employees, departmentDetail?.id, criteria, applyCriteria]);

    React.useEffect(() => {
        if (departmentDetail) {
            setDeptName(departmentDetail.name ?? "");
            setDeptHead(departmentDetail.head ?? "");
            setDeptActive(!!departmentDetail.active);
        }
    }, [departmentDetail]);

    const statusOptions: Option[] = [
        { value: "active", label: lang?.t("department_active") ?? "Hoạt động" },
        { value: "inactive", label: lang?.t("department_inactive") ?? "Ngừng hoạt động" },
    ];
    const selectedStatus = deptActive ? statusOptions[0] : statusOptions[1];

    // ---- Guard
    if (loading || !theme || !lang || !dept) return null;
    const S = makeStyles(theme);
    const t = lang.t;

    const DEFAULT_CRITERIA: EmployeeFilterInDeptValues = {
        employeeName: "",
        position: "",
        sortBy: "created_desc",
        inDeptOnly: false,
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

    const scopeMainText = lang.code === "en" ? "Scope" : "Pham vi";

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

        if (values.inDeptOnly) {
            chips.push({
                key: "inDeptOnly",
                mainText: scopeMainText,
                subText: t("employees_in_this_dept"),
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
        } else if (key === "inDeptOnly") {
            next.inDeptOnly = DEFAULT_CRITERIA.inDeptOnly;
        } else if (key === "sortBy") {
            next.sortBy = DEFAULT_CRITERIA.sortBy;
        }

        setCriteria(next);
        if (departmentDetail?.id) {
            const updated = applyCriteria(employees, departmentDetail.id, next);
            setVisibleEmployees(updated);
        } else {
            setVisibleEmployees([]);
        }
        setActiveFilters(prev => prev.filter(c => c.key !== key));
    };

    const toggleSelect = (id: string) => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    const saveChanges = () => {
        // 1) Lưu thay đổi của phòng
        setDepartmentDetail((prev: Department | null) => {
            if (!prev) return null; // phòng trường hợp null
            return {
                ...prev,
                name: deptName,
                head: deptHead,
                active: deptActive,
            };
        });

        // 2) Cập nhật departmentId cho nhân viên theo chọn/bỏ
        setEmployees(prev => {
            const updated = prev.map(e => {
                if (departmentDetail && e.departmentId === departmentDetail.id && !selectedIds.has(e.id)) {
                    // bỏ khỏi phòng hiện tại
                    return { ...e, departmentId: UNASSIGNED_DEPT_ID as any };
                }
                if (departmentDetail && e.departmentId !== departmentDetail.id && selectedIds.has(e.id)) {
                    // (trong UI hiện tại bạn chỉ chọn từ danh sách phòng, nên nhánh này ít khi xảy ra)
                    return { ...e, departmentId: departmentDetail.id };
                }
                return e;
            });

            // 3) Rebuild danh sách hiển thị sau lưu
            if (departmentDetail?.id) {
                const refreshed = applyCriteria(updated, departmentDetail.id, criteria);
                setVisibleEmployees(refreshed);
            } else {
                setVisibleEmployees([]);
            }

            return updated;
        });

        Alert.alert(t("settings") ?? "Thông báo", "Lưu thay đổi thành công!");
    };

    // DATA cho FlatList: danh sách đã lọc theo phòng & tiêu chí
    const data = visibleEmployees;

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

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
            {/* Header CỐ ĐỊNH */}
            <HeaderBar
                title={lang.t("department_detail")}
                onBack={() => navigation?.goBack?.()}
            />
            <View style={{ height: theme.spacing(2) }} />

            <View style={S.footerBar}>
                <TouchableOpacity style={S.saveBtn} onPress={saveChanges} activeOpacity={0.85}>
                    <Text style={S.saveText}>{t("save") ?? "Lưu thay đổi"}</Text>
                </TouchableOpacity>
            </View>

            {/* BODY CUỘN ĐƯỢC */}
            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ paddingHorizontal: 14, paddingTop: 14, paddingBottom: 96 /* chừa chỗ cho footer */ }}
                keyboardShouldPersistTaps="handled"
            >
                <LabeledTextInput
                    label={t("department_name_title")}
                    placeholder={dept.name}
                    value={deptName}
                    onChangeText={setDeptName}
                    theme={theme}
                />
                <View style={{ height: 12 }} />

                <LabeledTextInput
                    label={t("head_of_dept")}
                    placeholder={dept.head}
                    value={deptHead}
                    onChangeText={setDeptHead}
                    theme={theme}
                />
                <View style={{ height: 12 }} />

                <LabeledSelect
                    label={t("department_status")}
                    selected={selectedStatus}
                    options={statusOptions}
                    onSelect={(opt: Option) => setDeptActive(opt.value === "active")}
                    theme={theme}
                />

                <View style={{ height: 18 }} />
                <View style={S.pill}><Text style={S.pillText}>{t("list_of_dp_employees") ?? "DANH SÁCH NHÂN VIÊN CỦA PHÒNG"}</Text></View>
                <View style={S.rowHeader}>
                    <Text style={[S.sectionTitle, { color: theme.colors.text }]}>
                        {lang.t("list_employee")}
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

                <EmployeeFilterInDepartment
                    visible={showFilter}
                    current={criteria}
                    onClose={() => setShowFilter(false)}
                    onApply={(values) => {
                        setCriteria(values);
                        if (departmentDetail?.id) {
                            const next = applyCriteria(employees, departmentDetail.id, values);
                            setVisibleEmployees(next);
                        } else {
                            setVisibleEmployees([]);
                        }
                        setActiveFilters(buildActiveFilterChips(values));
                    }}
                />
            </ScrollView>
        </SafeAreaView>
    );
}

const makeStyles = (theme: any) =>
    StyleSheet.create({
        label: { fontSize: 13, color: theme.colors.mutedText ?? "#737373", marginBottom: 6 },
        pill: {
            alignSelf: "center",
            paddingHorizontal: 14,
            paddingVertical: 8,
            backgroundColor: theme.colors.card,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: theme.colors.contrastBackground,
            marginTop: 10,
        },
        addEmployee: {
            alignSelf: "flex-end"
        },
        pillText: { fontWeight: "700", color: theme.colors.text, fontSize: 12 },
        rowHeader: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: theme.spacing(2),
            marginBottom: theme.spacing(1),
            paddingHorizontal: 12
        },
        sectionTitle: {
            fontSize: 16,
            fontWeight: "600",
        },
        filterBtn: {
            borderRadius: 10,
            alignItems: "center",
            justifyContent: "center",
        },
        // employee card
        card: {
            backgroundColor: theme.colors.background,
            borderRadius: 10,
            borderWidth: 1.5,
            borderColor: theme.colors.cardBoder,
            padding: 13,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.2,
            shadowRadius: 2,
            elevation: 2,
        },
        row: { flexDirection: "row", alignItems: "center", gap: 12, },
        avatar: { width: 44, height: 44, borderRadius: 999 },
        name: { fontSize: 16, fontWeight: "700", color: theme.colors.text },
        role: { fontSize: 13, color: "#666", marginTop: 2 },

        // big check
        checkWrap: {
            width: 36, height: 36, borderRadius: 7,
            alignItems: "center", justifyContent: "center", borderWidth: 2,
        },
        checkWrapOn: { backgroundColor: "#5F8CFF", borderColor: "#5F8CFF" },
        checkWrapOff: { backgroundColor: "transparent", borderColor: "#000" },
        checkIcon: { color: "#fff", fontSize: 20, fontWeight: "800" },

        // footer fixed
        footerBar: {
            marginBottom: 10,
            justifyContent: "center",
            paddingHorizontal: 14
        },
        saveBtn: {
            alignSelf: "center",
            backgroundColor: "#6E8BFF",
            paddingHorizontal: 24,
            paddingVertical: 12,
            borderRadius: 10,
            minWidth: 180,
            alignItems: "center",
        },
        saveText: { color: "#fff", fontWeight: "700" },
    });
