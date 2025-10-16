import React, { memo, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ListRenderItem, Pressable, FlatList } from "react-native";
import { useUIFactory } from "../ui/factory/useUIFactory";
import BottomSheetModal from "../components/common/BottomSheetModal";
import FilterIcon from "../assets/icons/filter_icon.svg"
import Header from "../components/common/Header";
import Footer from "../components/common/Footer";
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { Department, DEPARTMENTS } from "../fake_data/Dien/fake_data";
import DepartmentFilter from "../components/common/DepartmentFilter";
import { DepartmentFilterValues } from "../components/common/DepartmentFilter";
import AddButton from "../components/common/AddButton";
import AddDepartmentModal from "../components/common/AddDepartmentModal";

type Props = NativeStackScreenProps<RootStackParamList, 'DepartmentManagement'>;

const DepartmentManagementScreen = ({ route, navigation }: Props) => {
  const { loading, theme, lang } = useUIFactory();
  const [activeTab, setActiveTab] = useState<number>(2);
  const [showFilter, setShowFilter] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [displayed, setDisplayed] = useState<Department[]>(() =>
    [...DEPARTMENTS].sort(
      (a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)
    )
  );
  const [criteria, setCriteria] = useState<DepartmentFilterValues>({
    departmentName: "",
    headName: "",
    sortBy: "created_desc",
  });

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

  const formatDate = React.useMemo(
    () => (lang?.code === "en" ? formatENDate : formatVNDate),
    [lang?.code]
  );

  const StatusBadge = memo(({ active }: { active: boolean }) => {
    return (
      <View style={[styles.badge, active ? styles.badgeActive : styles.badgeInactive]}>
        <Text style={[styles.badgeText]}>
          {active ? lang?.t("active") : lang?.t("inactive")}
        </Text>
      </View>
    );
  });

  const DepartmentCard = memo(
    ({ item, onPress }: { item: Department; onPress?: () => void }) => {
      return (
        <Pressable onPress={onPress} style={({ pressed }) => [
          styles.card,
          pressed && { opacity: 0.9 }
        ]}>
          <View style={styles.cardHeader}>
            <Text style={styles.title} numberOfLines={1}>
              {item.name}
            </Text>
            <StatusBadge active={item.active} />
          </View>

          <Text style={styles.subtitle} numberOfLines={2}>
            {lang?.t("head_of_dept") + ': ' + item.head}
          </Text>

          <View style={{ height: 6 }} />

          {/* <Text style={styles.meta}>
            {lang?.t("date_created") + ': ' + formatDate(item.createdAt)}
          </Text> */}
        </Pressable>
      );
    }
  );

  const renderItem: ListRenderItem<Department> = ({ item }) => {
    return (
      <DepartmentCard
        item={item}
        onPress={() => {
          navigation.navigate("DepartmentDetail", { departmentDetail: item });
        }}
      />
    );
  };

  if (loading || !theme || !lang) return null;

  const styles = makeStyles(theme);
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Header
        title={lang.t('department_management')}
        showBack={true}
        onBackPress={() => {
          navigation.goBack()
        }}
      />

      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        {/* Hàng tiêu đề + nút filter */}
        <View style={styles.addEmployee}>
          <View style={styles.addEmployee}>
            <AddButton
              title={lang.t("add_department")}
              icon={require("../assets/icons/department_icon.png")}
              onPress={() => setShowAdd(true)}
            />
          </View>
        </View>

        <View style={styles.rowHeader}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            {lang.t("list_department")}
          </Text>

          <TouchableOpacity
            style={styles.filterBtn}
            onPress={() => setShowFilter(true)}
            accessibilityRole="button"
            accessibilityLabel="Open filter"
          >
            <FilterIcon width={22} height={22} />
          </TouchableOpacity>
        </View>

        {/* Danh sách phòng ban */}
        <View style={styles.container}>
          <FlatList
            data={displayed}
            keyExtractor={(d) => d.id}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
            showsVerticalScrollIndicator={false}
          />
        </View>

        {/* Modal bộ lọc */}
        <DepartmentFilter
          visible={showFilter}
          current={criteria}
          onClose={() => setShowFilter(false)}
          onApply={(values) => {
            setCriteria(values);

            // Lọc + Sắp xếp CHỈ khi nhấn Áp dụng hoặc Xóa lọc (gọi từ modal)
            const dname = values.departmentName.trim().toLowerCase();
            const hname = values.headName.trim().toLowerCase();

            let next = DEPARTMENTS.filter(d =>
              (!dname || d.name.toLowerCase().includes(dname)) &&
              (!hname || d.head.toLowerCase().includes(hname))
            );

            // sort theo values.sortBy
            next = next.sort((a, b) => {
              switch (values.sortBy) {
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
            });

            setDisplayed(next);
          }}
        />

        <AddDepartmentModal
          visible={showAdd}
          onClose={() => setShowAdd(false)}
          onSubmit={(p) => {
            const newEmp: Department = {
              id: String(Date.now()),
              name: p.name,
              head: p.head,
              headEmployeeId: p.headId,
              active: true,
              createdAt: new Date().toISOString(),
            };
            setDisplayed(prev => [newEmp, ...prev]);
          }}
        />
      </View>

      <Footer
        activeIndex={activeTab}
        onPress={i => {
          setActiveTab(i);
          // nếu cần điều hướng, gọi navigation ở đây
        }}
      />
    </SafeAreaView>
  );
}

const makeStyles = (theme: any) =>
  StyleSheet.create({
    addEmployee: {
      alignSelf: "flex-end",
      paddingBottom: 8,
    },
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
    cardTitle: {
      fontSize: 16,
      fontWeight: "700",
      marginBottom: 6,
    },
    cardSubtitle: {
      fontSize: 13,
      fontWeight: "500",
    },
    rowInputs: {
      flexDirection: "row",
      gap: 12,
      flexWrap: "wrap",
      marginBottom: 8,
    },
    actions: {
      marginTop: 18,
      flexDirection: "row",
      justifyContent: "space-between",
      gap: 12,
    },
    container: {
      flex: 1,
      backgroundColor: theme,
      paddingHorizontal: 12,
      paddingTop: 12,
    },
    listContent: {
      paddingBottom: 24,
    },
    card: {
      backgroundColor: theme.colors.background,
      borderRadius: 16,
      borderColor: theme.colors.contrastBackground,
      borderWidth: 1,
      padding: 16,

    },
    cardHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 6,
    },
    title: {
      fontSize: 20,
      fontWeight: "700",
      color: "#222",
      maxWidth: "70%",
    },
    subtitle: {
      fontSize: 16,
      color: "#555",
    },
    meta: {
      fontSize: 13,
      color: "#8A8A8A",
    },
    badge: {
      borderRadius: 999,
      paddingHorizontal: 12,
      paddingVertical: 6,
    },
    badgeActive: {
      backgroundColor: theme.colors.active
    },
    badgeInactive: {
      backgroundColor: theme.colors.inactive
    },
    badgeText: {
      fontSize: 14,
      fontWeight: "700",
      color: "#0B3B2E", // chữ đậm trên nền xanh; vẫn dễ đọc trên xám
    },
  });

export default DepartmentManagementScreen;