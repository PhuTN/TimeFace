import React, { useMemo, useState } from "react";
import {
    SafeAreaView,
    View,
    Text,
    StyleSheet,
    FlatList,
    ListRenderItem,
    TouchableOpacity,
    Image,
    ScrollView,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useUIFactory } from "../ui/factory/useUIFactory";
import HeaderBar from "../components/common/HeaderBar.tsx";
import Footer from "../components/common/Footer";
import GradientButton from "../components/common/GradientButton";
import FilterChip from "../components/common/FilterChip.tsx";
import EmployeeAttendanceFilterModal, {
    AttendanceFilterValues,
} from "../components/common/EmployeeAttendanceFilterModal";
import FilterIcon from "../assets/icons/filter_icon.svg";
import CalendarIcon from "../assets/icons/calendar_icon.svg";
import ClockIcon from "../assets/icons/clock_icon.svg";
import { RootStackParamList } from "../navigation/AppNavigator";

type AttendanceEntry = {
    id: string;
    date: string;
    totalHours: string;
    checkIn: string;
    checkOut: string;
};

type Props = NativeStackScreenProps<RootStackParamList, "EmployeeAttendance">;

const MOCK_HISTORY: AttendanceEntry[] = [
    {
        id: "2025-01-03",
        date: "03/01/2025",
        totalHours: "08:00:00",
        checkIn: "09:00 AM",
        checkOut: "05:00 PM",
    },
    {
        id: "2025-01-02",
        date: "02/01/2025",
        totalHours: "08:00:00",
        checkIn: "09:00 AM",
        checkOut: "05:00 PM",
    },
    {
        id: "2025-01-01",
        date: "01/01/2025",
        totalHours: "08:00:00",
        checkIn: "09:00 AM",
        checkOut: "05:00 PM",
    },
];

const EmployeeAttendanceScreen = ({ route, navigation }: Props) => {
    const { loading, theme, lang } = useUIFactory();
    const [activeTab, setActiveTab] = useState<number>(2);
    const [showFilter, setShowFilter] = useState(false);
    const [filters, setFilters] = useState<AttendanceFilterValues>({
        startDate: "",
        endDate: "",
    });
    // Giả lập IP mạng công ty và IP người dùng hiện tại (test nhanh)
    const COMPANY_IP = "192.168.1.100";
    const [currentIP, setCurrentIP] = useState("192.168.1.100"); // bạn có thể đổi để test
    const [isOutsideArea, setIsOutsideArea] = useState(false);

    const activeChips = useMemo(() => {
        const chips: { key: keyof AttendanceFilterValues; mainText: string; subText: string }[] =
            [];
        if (filters.startDate.trim()) {
            chips.push({
                key: "startDate",
                mainText: lang?.t("filter_start_date") ?? "Ngày bắt đầu",
                subText: filters.startDate.trim(),
            });
        }
        if (filters.endDate.trim()) {
            chips.push({
                key: "endDate",
                mainText: lang?.t("filter_end_date") ?? "Ngày kết thúc",
                subText: filters.endDate.trim(),
            });
        }
        return chips;
    }, [filters, lang]);

    const parseDDMMYYYY = (value?: string) => {
        if (!value) return null;
        const [day, month, year] = value.split(/[/-]/).map(Number);
        if (!day || !month || !year) return null;
        const d = new Date(year, month - 1, day);
        return Number.isNaN(d.getTime()) ? null : d;
    };

    const filteredHistory = useMemo(() => {
        const start = parseDDMMYYYY(filters.startDate);
        const end = parseDDMMYYYY(filters.endDate);

        // Chuẩn hoá end để bao trọn ngày cuối (23:59:59)
        const endInclusive = end ? new Date(end.getFullYear(), end.getMonth(), end.getDate(), 23, 59, 59, 999) : null;

        // Lọc theo khoảng ngày (dựa trên item.date: "dd/MM/yyyy")
        const result = MOCK_HISTORY.filter(item => {
            const d = parseDDMMYYYY(item.date);
            if (!d) return true;                 // nếu không parse được thì cho qua
            if (start && d < start) return false;
            if (endInclusive && d > endInclusive) return false;
            return true;
        });

        // (không bắt buộc) Sắp xếp giảm dần theo ngày
        result.sort((a, b) => {
            const da = parseDDMMYYYY(a.date)?.getTime() ?? 0;
            const db = parseDDMMYYYY(b.date)?.getTime() ?? 0;
            return db - da;
        });

        return result;
    }, [filters]);

    if (loading || !theme || !lang) return null;
    const styles = makeStyles(theme);

    const renderItem: ListRenderItem<AttendanceEntry> = ({ item }) => (
        <View style={[styles.historyCard, { backgroundColor: theme.colors.background }]}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <View style={styles.historyIconBox}>
                    <CalendarIcon width={20} height={20} />
                </View>
                <Text style={[styles.historyDate, { color: theme.colors.text }]}>{item.date}</Text>
            </View>

            <View style={styles.historyRow}>
                <View style={{ flex: 1 }}>
                    <Text style={styles.historyLabel}>{lang?.t("attendance_total_hours")}</Text>
                    <Text style={[styles.historyValue, { color: theme.colors.text }]}>{`${item.totalHours} ${lang?.t("attendance_hours_suffix") ?? "Giờ"
                        }`}</Text>
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={styles.historyLabel}>
                        {lang?.t("attendance_check_in_out")}
                    </Text>
                    <Text style={[styles.historyValue, { color: theme.colors.text }]}>
                        {`${item.checkIn} — ${item.checkOut}`}
                    </Text>
                </View>
            </View>
        </View>
    );

    /** Kiểm tra xem user có đang trong mạng công ty không */
    const handleIsOutsideArea = () => {
        const outside = currentIP !== COMPANY_IP;
        setIsOutsideArea(outside);
        return outside;
    };

    const handleCheckIn = () => {
        if (handleIsOutsideArea()) {
            // Nếu khác IP -> chỉ đổi text, không chạy logic Check-in
            console.log("⚠️ Ngoài khu vực công ty, không thể Check-in");
            return;
        }

        // TODO: Tích hợp API check-in
        navigation.navigate("EmployeeFaceDetection");
    };

    const handleCheckOut = () => {
        // TODO: Tích hợp API check-out
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
            <HeaderBar
                title={lang.t("attendance_title")}
                onBack={() => navigation?.goBack?.()}
            />
            <ScrollView>
                <View style={styles.screen}>
                    <View style={styles.summaryBox}>
                        <Text style={[styles.summaryLabel, { color: theme.colors.mutedText }]}>
                            {lang.t("attendance_summary_title")}
                        </Text>

                        <View style={styles.summaryStatsRow}>
                            <View style={styles.summaryStat}>
                                <View style={{ flexDirection: "row" }}>
                                    <ClockIcon height={18} width={18} />
                                    <Text style={[styles.summaryStatLabel, { color: theme.colors.primary, marginLeft: 5 }]}>
                                        {lang.t("attendance_today")}
                                    </Text>
                                </View>
                                <Text style={[styles.summaryStatValue, { color: theme.colors.text }]}>
                                    00:00 <Text style={styles.gradientText}>{lang.t("attendance_hours")}</Text>
                                </Text>
                            </View>
                            <View style={{ width: 10 }} />
                            <View style={styles.summaryStat}>
                                <View style={{ flexDirection: "row" }}>
                                    <ClockIcon height={18} width={18} />
                                    <Text style={[styles.summaryStatLabel, { color: theme.colors.primary, marginLeft: 5 }]}>
                                        {lang.t("attendance_this_month")}
                                    </Text>
                                </View>
                                <Text style={[styles.summaryStatValue, { color: theme.colors.text }]}>
                                    00:00 <Text style={{ fontSize: 13 }}>{lang.t("attendance_hours")}</Text>
                                </Text>
                            </View>
                        </View>
                        <GradientButton
                            text={
                                isOutsideArea
                                    ? lang.t("attendance_outside_area") // 🔹 text khi ngoài khu vực
                                    : lang.t("attendance_check_in")
                            }
                            colors={["#002AFF", "#002AFF"]}
                            borderRadius={16}
                            onPress={handleCheckIn}
                            style={styles.mainAction}
                        />
                    </View>

                    <View style={styles.filterHeader}>
                        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                            {lang.t("attendance_list")}
                        </Text>
                        <TouchableOpacity style={styles.filterIconButton} onPress={() => setShowFilter(true)}>
                            <FilterIcon width={22} height={22} />
                        </TouchableOpacity>
                    </View>

                    {activeChips.length > 0 && (
                        <View style={styles.chipsRow}>
                            {activeChips.map((chip) => (
                                <FilterChip
                                    key={chip.key}
                                    mainText={chip.mainText}
                                    subText={chip.subText}
                                    theme={theme}
                                    onRemove={() => {
                                        setFilters((prev) => ({
                                            ...prev,
                                            [chip.key]: "",
                                        }));
                                    }}
                                />
                            ))}
                        </View>
                    )}

                    <FlatList
                        data={filteredHistory}
                        keyExtractor={(item) => item.id}
                        renderItem={renderItem}
                        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
                        scrollEnabled={false}
                        style={{ marginTop: 12 }}
                    />
                </View>
            </ScrollView>

            <EmployeeAttendanceFilterModal
                visible={showFilter}
                current={filters}
                onClose={() => setShowFilter(false)}
                onApply={(values) => setFilters(values)}
            />

            <Footer
                activeIndex={activeTab}
                onPress={(index) => setActiveTab(index)}
            />
        </SafeAreaView>
    );
}

const makeStyles = (theme: any) =>
    StyleSheet.create({
        screen: {
            flex: 1,
            paddingHorizontal: 20,
            paddingTop: 20,
            paddingBottom: 100,
        },
        card: {
            backgroundColor: theme.colors.background,
            borderRadius: 24,
            padding: 20,
            shadowColor: "#00000033",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.08,
            shadowRadius: 12,
            elevation: 3,
        },
        cardHeader: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 16,
        },
        cardTitle: {
            fontSize: 20,
            fontWeight: "700",
        },
        avatar: {
            width: 40,
            height: 40,
            borderRadius: 999,
        },
        summaryBox: {
            borderRadius: 16,
            borderWidth: 1,
            borderColor: theme.colors.contrastBackground,
            backgroundColor: theme.colors.background,
            padding: 16,
            gap: 14,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.2,
            shadowRadius: 2,
            elevation: 2,
        },
        summaryLabel: {
            fontSize: 13,
            lineHeight: 18,
        },
        summaryStatsRow: {
            flexDirection: "row",
        },
        summaryStat: {
            flex: 1,
            padding: 12,
            borderRadius: 12,
            backgroundColor: theme.colors.background,
            borderWidth: 1,
            borderColor: "#E5ECFF",
            gap: 6,
        },
        summaryStatLabel: {
            fontSize: 13,
            fontWeight: "700",
        },
        summaryStatValue: {
            fontSize: 18,
            fontWeight: "700",
        },
        gradientText: {
            fontSize: 13,
            fontWeight: "600",
        },
        mainAction: {
            marginTop: 18,
            borderRadius: 16,
        },
        filterHeader: {
            marginTop: 26,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
        },
        sectionTitle: {
            fontSize: 16,
            fontWeight: "700",
        },
        filterIconButton: {
            width: 34,
            height: 34,
            alignItems: "center",
            justifyContent: "center",
        },
        chipsRow: {
            flexDirection: "row",
            flexWrap: "wrap",
            gap: 8,
            marginTop: 16,
        },
        historyCard: {
            padding: 16,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: theme.colors.contrastBackground,
            gap: 12,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.2,
            shadowRadius: 2,
            elevation: 2,
        },
        historyIconBox: {
            width: 30,
            height: 30,
            alignItems: "center",
            justifyContent: "center",
        },
        historyDate: {
            fontSize: 15,
            fontWeight: "700",
        },
        historyRow: {
            flexDirection: "row",
            gap: 12,
        },
        historyLabel: {
            fontSize: 12.5,
            color: "#6B7AA1",
            marginBottom: 4,
        },
        historyValue: {
            fontSize: 14.5,
            fontWeight: "600",
        },
        secondaryAction: {
            borderRadius: 16,
        },
    });

export default EmployeeAttendanceScreen;