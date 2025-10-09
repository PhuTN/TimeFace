import React, { useEffect, useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { useUIFactory } from "../ui/factory/useUIFactory";
import { makeApprovalOptions, makeDepartmentOptions, makeSortingOptions } from "../fake_data/Dien/fake_data";
import LabeledDate from "../components/common/LabeledDate";
import LabeledSelect from "../components/common/LabeledSelect";
import LabeledTextInput from "../components/common/LabeledTextInput";
import ButtonFilter from "../components/common/ButtonFilter";
import type { Option } from "../types/common";

export default function CommonScreen3() {
  const { loading, theme, lang } = useUIFactory();

  const [approvals, setApprovals] = useState<Option[]>([]);
  const [departments, setDepartments] = useState<Option[]>([]);
  const [sortings, setSortings] = useState<Option[]>([]);

  const [approval, setApproval] = useState<Option | null>(null);
  const [department, setDepartment] = useState<Option | null>(null);
  const [sortBy, setSortBy] = useState<Option | null>(null);

  const [employee, setEmployee] = useState("");
  const [title, setTitle] = useState("");
  const [ticketCode, setTicketCode] = useState("");

  const [createdAt, setCreatedAt] = useState<Date>(new Date());
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());

  useEffect(() => {
    if (!lang) return;
    setApprovals(makeApprovalOptions(lang));
    setDepartments(makeDepartmentOptions(lang));
    setSortings(makeSortingOptions(lang));
  }, [lang]);

  useEffect(() => {
    if (approvals.length && !approval) setApproval(approvals[0]);
  }, [approvals, approval]);

  useEffect(() => {
    if (departments.length && !department) setDepartment(departments[4] ?? departments[0]);
  }, [departments, department]);

  useEffect(() => {
    if (sortings.length && !sortBy) setSortBy(sortings[0]);
  }, [sortings, sortBy]);

  if (loading || !theme || !lang || !approval || !department || !sortBy) {
    return <View style={{ height: 1 }} />; // tránh giật layout khi modal mở
  }

  const S = themedStyles(theme);

  return (
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
        }]}>
      <ScrollView
        contentContainerStyle={{ padding: theme.spacing(2), paddingBottom: theme.spacing(3) }}
        // Modal đã giới hạn maxHeight, nên ScrollView chỉ cuộn nếu vượt quá
        showsVerticalScrollIndicator={false}
      >
        <View style={S.card}>
          {/* Row 1 */}
          <Row>
            <LabeledTextInput
              label={lang.t("employee_name_label")}
              value={employee}
              onChangeText={setEmployee}
              placeholder={lang.t("employee_placeholder")}
              theme={theme}
            />
            <LabeledTextInput
              label={lang.t("position_name_label")}
              value={title}
              onChangeText={setTitle}
              placeholder={lang.t("position_placeholder")}
              theme={theme}
            />
          </Row>

          {/* Row 2 */}
          <Row>
            <LabeledSelect
              label={lang.t("approval_status_label")}
              selected={approval}
              options={approvals}
              onSelect={setApproval}
              theme={theme}
            />
            <LabeledTextInput
              label={lang.t("id_form_label")}
              value={ticketCode}
              onChangeText={setTicketCode}
              placeholder={lang.t("id_form_placeholder")}
              theme={theme}
            />
          </Row>

          {/* Row 3 */}
          <Row>
            <LabeledDate
              label={lang.t("created_date_label")}
              date={createdAt}
              onChange={setCreatedAt}
              theme={theme}
            />
            <LabeledSelect
              label={lang.t("department_label")}
              selected={department}
              options={departments}
              onSelect={setDepartment}
              theme={theme}
            />
          </Row>

          {/* Row 4 */}
          <Row>
            <LabeledDate
              label={lang.t("start_date_label")}
              date={startDate}
              onChange={setStartDate}
              theme={theme}
            />
            <LabeledDate
              label={lang.t("end_date_label")}
              date={endDate}
              onChange={setEndDate}
              theme={theme}
            />
          </Row>

          {/* Row 5 */}
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
              textColor="black"
              backgroundColor="#E3F4FF"
              onPress={() => {
                setEmployee("");
                setTitle("");
                setTicketCode("");
                setApproval(approvals[0]);
                setDepartment(departments[0]);
                setSortBy(sortings[0]);
                const d = new Date();
                setCreatedAt(d); setStartDate(d); setEndDate(d);
              }}
            />
            <ButtonFilter
              text={lang.t("apply_filters")}
              textColor="white"
              backgroundColor="#6A96EE"
              onPress={() => {
                console.log({
                  employee, title, ticketCode,
                  approval: approval.value,
                  department: department.value,
                  sortBy: sortBy.value,
                  createdAt, startDate, endDate,
                });
              }}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return <View style={{ gap: 12, flexDirection: "row", flexWrap: "wrap", marginBottom: 8 }}>{children}</View>;
}

const themedStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      // KHÔNG flex:1 để modal tự giãn theo nội dung
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      overflow: "hidden",
    },
    card: {
      // KHÔNG flex:1 để chiều cao theo nội dung
      backgroundColor: theme.colors.background,
    },
    actions: {
      marginTop: 16,
      flexDirection: "row",
      justifyContent: "space-between",
      gap: 12,
    },
  });
