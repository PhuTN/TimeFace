// src/screens/EmployeeManagementScreen.tsx
import React, { memo, useMemo, useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    ListRenderItem,
    Pressable,
    FlatList,
    Image,
} from "react-native";
import { useUIFactory } from "../ui/factory/useUIFactory";
import HeaderBar from "../components/common/HeaderBar.tsx";
import Footer from "../components/common/Footer";
import FilterIcon from "../assets/icons/filter_icon.svg";
import AddButton from "../components/common/AddButton";
import EmployeeFilter, { EmployeeFilterValues, EmpSortValue } from "../components/common/EmployeeFilter";
import { Employee, EMPLOYEES, DEPARTMENTS, PasswordChangeStatus } from "../fake_data/Dien/fake_data.tsx";
import AddEmployeeModal from "../components/common/AddEmployeeModal";
import Chip from "../components/common/Chip.tsx";
import FilterChip from "../components/common/FilterChip.tsx";


type Props = any; // hoặc: NativeStackScreenProps<RootStackParamList, 'EmployeeManagement'>

function formatVNDate(iso: string) {
    const d = new Date(iso);
    const dd = `${d.getDate()}`.padStart(2, "0");
    const mm = `${d.getMonth() + 1}`.padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
}
function formatENDate(iso: string) {
    const d = new Date(iso);
    const dd = `${d.getDate()}`.padStart(2, "0");
    const mm = `${d.getMonth() + 1}`.padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${mm}/${dd}/${yyyy}`;
}

export type PwdKey = "password_changed" | "waiting_for_password_change" | "do_not_change";

export const PWD_STATUS_TO_KEY: Record<PasswordChangeStatus, PwdKey> = {
    [PasswordChangeStatus.password_changed]: "password_changed",
    [PasswordChangeStatus.waiting_for_password_change]: "waiting_for_password_change",
    [PasswordChangeStatus.do_not_change]: "do_not_change",
};

export function toPwdKey(s: PasswordChangeStatus | string | undefined): PwdKey | "" {
    if (!s) return "";
    // nếu là enum value -> map
    if (s in PWD_STATUS_TO_KEY) return PWD_STATUS_TO_KEY[s as PasswordChangeStatus];
    // nếu đã là key ngắn từ filter -> giữ nguyên
    if (s === "password_changed" || s === "waiting_for_password_change" || s === "do_not_change") return s;
    return "";
}

export default function EmployeeManagementScreen({ navigation }: Props) {
    const { loading, theme, lang } = useUIFactory();

    // ---------- HOOKS (luôn đặt trước mọi return có điều kiện)
    const [activeTab, setActiveTab] = useState<number>(2);
    const [showFilter, setShowFilter] = useState(false);
    const [showAdd, setShowAdd] = useState(false);

    // mặc định sort created_desc
    const [displayed, setDisplayed] = useState<Employee[]>(() =>
        [...EMPLOYEES].sort(
            (a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)
        )
    );

    const [criteria, setCriteria] = useState<EmployeeFilterValues>({
        employeeName: "",
        passwordChangeStatus: "",
        accountActive: "",
        departmentId: "",
        position: "",
        sortBy: "created_desc",
    });
    const [activeFilters, setActiveFilters] = useState<
        { key: string; mainText: string; subText: string }[]
    >([]);

    const formatDate = useMemo(
        () => (lang?.code === "en" ? formatENDate : formatVNDate),
        [lang?.code]
    );

    // ---------- GUARD
    if (loading || !theme || !lang) return null;

    const S = makeStyles(theme);
    const t = lang.t;

    const DEFAULT_CRITERIA: EmployeeFilterValues = {
        employeeName: "",
        passwordChangeStatus: "",
        accountActive: "",
        departmentId: "",
        position: "",
        sortBy: "created_desc",
    };

    const departmentNameById = (id: string) =>
        DEPARTMENTS.find(d => d.id === id)?.name ?? id;

    const getAccountLabel = (value: EmployeeFilterValues["accountActive"]) => {
        if (value === "active") return t("active");
        if (value === "inactive") return t("inactive");
        return "";
    };

    const getPasswordLabel = (value: EmployeeFilterValues["passwordChangeStatus"]) => {
        switch (value) {
            case "changed":
                return t("password_changed");
            case "waiting_for_changed":
                return t("waiting_for_password_change");
            case "do_not_change":
                return t("do_not_change_password");
            default:
                return "";
        }
    };

    const getSortLabel = (value: EmployeeFilterValues["sortBy"]) => {
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

    const buildActiveFilterChips = (values: EmployeeFilterValues) => {
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

        if (values.departmentId?.trim()) {
            chips.push({
                key: "departmentId",
                mainText: t("department_label"),
                subText: departmentNameById(values.departmentId.trim()),
            });
        }

        if (values.accountActive) {
            chips.push({
                key: "accountActive",
                mainText: t("account_status_label"),
                subText: getAccountLabel(values.accountActive),
            });
        }

        if (values.passwordChangeStatus) {
            chips.push({
                key: "passwordChangeStatus",
                mainText: t("password_change_label"),
                subText: getPasswordLabel(values.passwordChangeStatus),
            });
        }

        chips.push({
            key: "sortBy",
            mainText: t("sort_by_label"),
            subText: getSortLabel(values.sortBy),
        });

        return chips;
    };

    // ---------- ITEM
    const EmployeeCard = memo(
        ({ item, onPress }: { item: Employee; onPress?: () => void }) => {
            // tương thích tên field: accountActive
            const isActive = Boolean((item as any).accountActive);

            // tương thích tên field: passwordChangeStatus
            type PasswordStatusForChip =
                | 'password_changed'
                | 'waiting_for_password_change'
                | 'do_not_change_password';

            /** 
             * Map giá trị gốc (backend) sang 3 status hợp lệ cho Chip 
             */
            function toPwdStatus(raw: any): PasswordStatusForChip {
                if (!raw) return 'do_not_change_password';
                const val = String(raw).toLowerCase().trim();

                if (['password_changed'].includes(val)) {
                    return 'password_changed';
                }
                if (['waiting_for_password_change'].includes(val)) {
                    return 'waiting_for_password_change';
                }
                return 'do_not_change_password';
            }
            const pwdStatus = toPwdStatus((item as any).passwordChangeStatus);

            return (
                <Pressable onPress={onPress} style={({ pressed }) => [S.card, pressed && { opacity: 0.92 }]}>
                    <View style={S.row}>
                        {/* Avatar (nếu có) */}
                        <Image
                            source={item.avatar}
                            style={S.avatar}
                        />

                        <View style={{ flex: 1, paddingRight: 8 }}>
                            <Text style={S.name} numberOfLines={1}>{item.name}</Text>
                            <Text style={S.role} numberOfLines={1}>{item.position}</Text>
                        </View>

                        {/* badges ở cột phải */}
                        <View style={{ gap: 5, alignItems: "flex-end" }}>
                            <Chip status={isActive ? 'active' : 'inactive'} />
                            <Chip status={pwdStatus} />
                        </View>
                    </View>
                </Pressable>
            );
        }
    );

    const renderItem: ListRenderItem<Employee> = ({ item }) => (
        <EmployeeCard
            item={item}
            onPress={() => {
                // navigation.navigate("EmployeeDetail", { id: item.id });
            }}
        />
    );

    // ---------- FILTER APPLY
    const filterEmployeesData = (values: EmployeeFilterValues) => {
        const name = values.employeeName.trim().toLowerCase();
        const position = values.position.trim().toLowerCase();
        const depId = values.departmentId?.trim() || "";
        const accountSel = values.accountActive; // "active" | "inactive" | ""
        const pwdSel = values.passwordChangeStatus; // "changed" | "waiting_for_changed" | "do_not_change" | ""

        let next = EMPLOYEES.filter((e) => {
            const isActive = !!e.accountActive;

            // 🔧 Chuẩn hoá enum trong data sang key ngắn để so sánh với filter
            const pwdKey = toPwdKey(e.passwordChangeStatus);

            const okName = !name || e.name.toLowerCase().includes(name);
            const okPos = !position || e.position.toLowerCase().includes(position);
            const okDep = !depId || e.departmentId === depId;
            const okAcc = !accountSel || (accountSel === "active" ? isActive : !isActive);
            const okPwd = !pwdSel || pwdKey === pwdSel;

            return okName && okPos && okDep && okAcc && okPwd;
        });

        next = next.sort((a, b) => {
            switch (values.sortBy) {
                case "created_asc": return +new Date(a.createdAt) - +new Date(b.createdAt);
                case "name_asc": return a.name.localeCompare(b.name);
                case "name_desc": return b.name.localeCompare(a.name);
                case "created_desc":
                default: return +new Date(b.createdAt) - +new Date(a.createdAt);
            }
        });

        return next;
    };

    const applyFilter = (values: EmployeeFilterValues) => {
        setCriteria(values);
        const next = filterEmployeesData(values);
        setDisplayed(next);
        setActiveFilters(buildActiveFilterChips(values));
    };

    const handleRemoveFilter = (key: string) => {
        const next: EmployeeFilterValues = { ...criteria };

        if (key === "employeeName") {
            next.employeeName = "";
        } else if (key === "position") {
            next.position = "";
        } else if (key === "departmentId") {
            next.departmentId = "";
        } else if (key === "accountActive") {
            next.accountActive = "";
        } else if (key === "passwordChangeStatus") {
            next.passwordChangeStatus = "";
        } else if (key === "sortBy") {
            next.sortBy = DEFAULT_CRITERIA.sortBy;
        }

        const updated = filterEmployeesData(next);
        setCriteria(next);
        setDisplayed(updated);
        setActiveFilters(prev => prev.filter(c => c.key !== key));
    };

    const sortCompare = (a: Employee, b: Employee, by: EmpSortValue) => {
        switch (by) {
            case "created_asc":
                return +new Date(a.createdAt) - +new Date(b.createdAt);
            case "name_asc":
                return a.name.localeCompare(b.name);
            case "name_desc":
                return b.name.localeCompare(a.name);
            case "created_desc":
            default:
                return +new Date(b.createdAt) - +new Date(a.createdAt);
        }
    };

    // ---------- UI
    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
            <HeaderBar
                title={t("employee_management")}
                onBack={() => navigation?.goBack?.()}
            />

            <View style={[S.screen, { backgroundColor: theme.colors.background }]}>
                {/* Nút thêm nhân viên (optional) */}
                <View style={S.addEmployee}>
                    <AddButton
                        title={t("add_employee") ?? "Thêm nhân viên"}
                        icon={require("../assets/AddIcon.png")}
                        onPress={() => setShowAdd(true)}
                    />
                </View>

                <AddEmployeeModal
                    visible={showAdd}
                    onClose={() => setShowAdd(false)}
                    onSubmit={(p) => {
                        // ví dụ thêm tạm thời lên danh sách
                        const newEmp: Employee = {
                            id: String(Date.now()),
                            name: p.name,
                            avatar: require("../assets/images/meow.jpg"),
                            passwordChangeStatus: PasswordChangeStatus.waiting_for_password_change,
                            accountActive: true,
                            departmentId: p.departmentId,
                            position: p.position,
                            createdAt: new Date().toISOString(),
                        };
                        setDisplayed(prev => [newEmp, ...prev]); // thêm đầu danh sách
                    }}
                />

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

                {/* Danh sách */}
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
                    data={displayed}
                    keyExtractor={(it) => it.id}
                    renderItem={renderItem}
                    contentContainerStyle={S.listContent}
                    ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
                    showsVerticalScrollIndicator={false}
                />

                {/* Modal Filter */}
                <EmployeeFilter
                    visible={showFilter}
                    current={criteria}
                    onClose={() => setShowFilter(false)}
                    onApply={applyFilter}
                />
            </View>

            <Footer
                activeIndex={activeTab}
                onPress={(i: number) => setActiveTab(i)}
            />
        </SafeAreaView>
    );
}

const makeStyles = (theme: any) =>
    StyleSheet.create({
        screen: {
            flex: 1,
            paddingHorizontal: 12,
            paddingTop: 12,
        },
        addEmployee: {
            alignSelf: "flex-end",
            paddingBottom: 8,
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

        // Card
        card: {
            backgroundColor: theme.colors.background,
            borderRadius: 10,
            borderColor: theme.colors.cardBoder,
            borderWidth: 1.5,
            padding: 13,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.2,
            shadowRadius: 2,
            elevation: 2,
        },
        row: {
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
        },
        avatar: {
            width: 46,
            height: 46,
            borderRadius: 999,
            backgroundColor: "#EEE",
        },
        name: {
            fontSize: 16,
            fontWeight: "700",
            color: theme.colors.text,
        },
        role: {
            marginTop: 2,
            fontSize: 13.5,
            color: "#666",
        },
        meta: {
            fontSize: 12.5,
            color: "#8A8A8A",
        },

        // Badges
        badge: {
            borderRadius: 999,
            paddingHorizontal: 10,
            paddingVertical: 6,
            alignSelf: "flex-end",
        },
        badgeText: {
            fontSize: 12.5,
            fontWeight: "700",
            color: "#0B3B2E",
        },
        badgeGreen: { backgroundColor: theme.colors.active },
        badgeYellow: { backgroundColor: theme.colors.waiting },
        badgeRed: { backgroundColor: theme.colors.inactive },

        listContent: { paddingBottom: 24 },
    });
