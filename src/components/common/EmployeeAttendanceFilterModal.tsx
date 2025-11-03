import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
} from "react-native";
import BottomSheetModal from "./BottomSheetModal";
import LabeledDate from "./LabeledDate";
import { useUIFactory } from "../../ui/factory/useUIFactory";
import GradientButton from "./GradientButton";

export type AttendanceFilterValues = {
  startDate: string;
  endDate: string;
};

type Props = {
  visible: boolean;
  onClose: () => void;
  onApply: (values: AttendanceFilterValues) => void;
  current?: Partial<AttendanceFilterValues>;
};

const DEFAULT_VALUES: AttendanceFilterValues = {
  startDate: "",
  endDate: "",
};

const parseDateString = (value?: string) => {
  if (!value) return null;
  const [day, month, year] = value.split(/[/-]/);
  const dayNum = Number(day);
  const monthNum = Number(month);
  const yearNum = Number(year);
  if (!dayNum || !monthNum || !yearNum) return null;
  const date = new Date(yearNum, monthNum - 1, dayNum);
  return Number.isNaN(date.getTime()) ? null : date;
};

const formatDateString = (date: Date | null) => {
  if (!date) return "";
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const GRADIENT = ["#BCD9FF", "#488EEB"];

const EmployeeAttendanceFilterModal: React.FC<Props> = ({
  visible,
  onClose,
  onApply,
  current,
}) => {
  const { loading, theme, lang } = useUIFactory();

  const [startDate, setStartDate] = React.useState<Date | null>(
    parseDateString(current?.startDate)
  );
  const [endDate, setEndDate] = React.useState<Date | null>(
    parseDateString(current?.endDate)
  );

  React.useEffect(() => {
    if (visible) {
      setStartDate(parseDateString(current?.startDate));
      setEndDate(parseDateString(current?.endDate));
    }
  }, [visible, current?.startDate, current?.endDate]);

  if (loading || !theme || !lang) return null;
  const styles = makeStyles(theme);

  const applyAndClose = () => {
    onApply({
      startDate: formatDateString(startDate),
      endDate: formatDateString(endDate),
    });
    onClose();
  };

  const resetAndClose = () => {
    setStartDate(null);
    setEndDate(null);
    onApply(DEFAULT_VALUES);
    onClose();
  };

  return (
    <BottomSheetModal visible={visible} onClose={onClose} maxHeightRatio={0.8}>
      <ScrollView
        contentContainerStyle={styles.sheetContent}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={[styles.title, { color: theme.colors.text }]}>
          {lang.t("filter_attendance_title") ?? "Bộ lọc chấm công"}
        </Text>

        <View style={styles.fieldGroup}>
          <LabeledDate
            label={lang.t("filter_start_date") ?? "Ngày bắt đầu"}
            placeholder={lang.t("selectDate") ?? "Select date"}
            date={startDate}
            onChange={setStartDate}
            theme={theme}
          />
          <LabeledDate
            label={lang.t("filter_end_date") ?? "Ngày kết thúc"}
            placeholder={lang.t("selectDate") ?? "Select date"}
            date={endDate}
            onChange={setEndDate}
            theme={theme}
          />
        </View>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.clearButton} onPress={resetAndClose}>
            <Text style={styles.clearText}>{lang.t("clear_filters")}</Text>
          </TouchableOpacity>
          <GradientButton
            text={lang.t("apply_filters")}
            onPress={applyAndClose}
            colors={GRADIENT}
            borderRadius={12}
            style={styles.applyButton}
          />
        </View>

        <View style={styles.grabber} />
      </ScrollView>
    </BottomSheetModal>
  );
};

export default EmployeeAttendanceFilterModal;

const makeStyles = (theme: any) =>
  StyleSheet.create({
    sheetContent: {
      paddingTop: 20,
      paddingBottom: Platform.select({ ios: 28, android: 20 }),
      paddingHorizontal: 20,
      backgroundColor: theme.colors.card ?? "#FFFFFF",
      borderTopLeftRadius: 18,
      borderTopRightRadius: 18,
      gap: 18,
    },
    title: {
      fontSize: 18,
      fontWeight: "700",
      textAlign: "center",
    },
    fieldGroup: {
      gap: 16,
    },
    actions: {
      flexDirection: "row",
      gap: 12,
      alignItems: "center",
    },
    clearButton: {
      flex: 1,
      height: 48,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: "#B0C5F6",
      alignItems: "center",
      justifyContent: "center",
    },
    clearText: {
      color: "#3F5DCC",
      fontWeight: "600",
      fontSize: 16,
    },
    applyButton: {
      flex: 1,
      marginTop: 0,
    },
    grabber: {
      alignSelf: "center",
      width: 52,
      height: 6,
      borderRadius: 999,
      backgroundColor: "#DCE4FF",
      marginTop: 12,
    },
  });
