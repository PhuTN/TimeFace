import React, { useEffect, useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { useUIFactory } from "../../ui/factory/useUIFactory";
import { makeDepartmentOptions, makeSortingOptions } from "../../fake_data/Dien/fake_data";
import LabeledSelect from "../common/LabeledSelect";
import LabeledTextInput from "../common/LabeledTextInput";
import ButtonFilter from "../common/ButtonFilter";
import BottomSheetModal from "../common/BottomSheetModal";
import type { Option } from "../../types/common";

type EmployeeFilterModalProps = {
  visible: boolean;
  onClose: () => void;
  onApplyFilters?: (filters: EmployeeFilters) => void;
};

export type EmployeeFilters = {
  employeeName: string;
  department: Option | null;
  positionName: string;
  sortBy: Option | null;
};

export default function EmployeeFilterModal({
  visible,
  onClose,
  onApplyFilters,
}: EmployeeFilterModalProps) {
  const { loading, theme, lang } = useUIFactory();

  const [departments, setDepartments] = useState<Option[]>([]);
  const [sortings, setSortings] = useState<Option[]>([]);

  const [department, setDepartment] = useState<Option | null>(null);
  const [sortBy, setSortBy] = useState<Option | null>(null);

  const [employeeName, setEmployeeName] = useState("");
  const [positionName, setPositionName] = useState("");

  useEffect(() => {
    if (!lang) return;
    setDepartments(makeDepartmentOptions(lang));
    setSortings(makeSortingOptions(lang));
  }, [lang]);

  useEffect(() => {
    if (departments.length && !department) setDepartment(departments[0]);
  }, [departments, department]);

  useEffect(() => {
    if (sortings.length && !sortBy) setSortBy(sortings[0]);
  }, [sortings, sortBy]);

  if (loading || !theme || !lang || !department || !sortBy) {
    return null;
  }

  const S = themedStyles(theme);

  const handleClearFilters = () => {
    setEmployeeName("");
    setPositionName("");
    setDepartment(departments[0]);
    setSortBy(sortings[0]);
  };

  const handleApplyFilters = () => {
    const filters: EmployeeFilters = {
      employeeName,
      department,
      positionName,
      sortBy,
    };

    console.log("Applied Employee filters:", filters);
    onApplyFilters?.(filters);
    onClose();
  };

  return (
    <BottomSheetModal visible={visible} onClose={onClose} maxHeightRatio={0.9}>
      <View
        style={[
          S.container,
          {
            backgroundColor: theme.colors.background,
            borderTopColor: theme.colors.contrastBackground,
            borderTopWidth: 1,
            borderLeftColor: theme.colors.contrastBackground,
            borderLeftWidth: 1,
            borderRightColor: theme.colors.contrastBackground,
            borderRightWidth: 1,
          },
        ]}
      >
        <ScrollView
          contentContainerStyle={{
            padding: theme.spacing(2),
            paddingBottom: theme.spacing(3),
          }}
          showsVerticalScrollIndicator={false}
        >
          <View style={S.card}>
            {/* Row 1: Tên nhân viên (half width) */}
            <Row>
              <View style={{flex: 1}}>
                <LabeledTextInput
                  label={lang.t("employee_name_label")}
                  value={employeeName}
                  onChangeText={setEmployeeName}
                  placeholder={lang.t("employee_placeholder")}
                  theme={theme}
                />
              </View>
              <View style={{flex: 1}} />
            </Row>

            {/* Row 2: Phòng ban, Tên chức vụ */}
            <Row>
              <LabeledSelect
                label={lang.t("department_label")}
                selected={department}
                options={departments}
                onSelect={setDepartment}
                theme={theme}
              />
              <LabeledTextInput
                label={lang.t("position_name_label")}
                value={positionName}
                onChangeText={setPositionName}
                placeholder={lang.t("position_placeholder")}
                theme={theme}
              />
            </Row>

            {/* Row 3: Sắp xếp bởi (full width) */}
            <Row>
              <LabeledSelect
                label={lang.t("sort_by_label")}
                selected={sortBy}
                options={sortings}
                onSelect={setSortBy}
                theme={theme}
              />
            </Row>

            {/* Actions */}
            <View style={S.actions}>
              <ButtonFilter
                text={lang.t("clear_filters")}
                textColor="#000000"
                backgroundColor="#E3F4FF"
                onPress={handleClearFilters}
              />
              <ButtonFilter
                text={lang.t("apply_filters")}
                textColor="#FFFFFF"
                backgroundColor="#6A96EE"
                onPress={handleApplyFilters}
              />
            </View>
          </View>
        </ScrollView>
      </View>
    </BottomSheetModal>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return (
    <View
      style={{
        gap: 12,
        flexDirection: "row",
        flexWrap: "wrap",
        marginBottom: 8,
      }}
    >
      {children}
    </View>
  );
}

const themedStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      overflow: "hidden",
    },
    card: {
      backgroundColor: theme.colors.background,
    },
    actions: {
      marginTop: 16,
      flexDirection: "row",
      justifyContent: "space-between",
      gap: 12,
    },
  });
