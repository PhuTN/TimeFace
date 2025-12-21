import React, {useEffect, useState} from 'react';
import {View, StyleSheet, ScrollView, Platform} from 'react-native';
import {useUIFactory} from '../../../ui/factory/useUIFactory';

import LabeledDate from '../../common/LabeledDate';
import LabeledSelect from '../../common/LabeledSelect';
import LabeledTextInput from '../../common/LabeledTextInput';
import ButtonFilter from '../../common/ButtonFilter';
import BottomSheetModal from '../../common/BottomSheetModal';

import type {Option} from '../../../types/common';
import {apiHandle} from '../../../api/apihandle';
import {DepartmentEP} from '../../../api/endpoint/Department';
import {
  makeApprovalOptions,
  makeSortingOptions,
} from '../../../fake_data/Dien/fake_data';

/* ===================== TYPES ===================== */
type LeaveRequestFilterModalProps = {
  visible: boolean;
  onClose: () => void;
  onApplyFilters?: (filters: LeaveRequestFilters) => void;
};

export type LeaveRequestFilters = {
  ticketCode: string;
  employeeName: string;
  positionName: string;
  department: Option | null;
  approvalStatus: Option | null;
  createdDate: Date;
  startDate: Date;
  sortBy: Option | null;
};

/* ===================== COMPONENT ===================== */
export default function LeaveRequestFilterModal({
  visible,
  onClose,
  onApplyFilters,
}: LeaveRequestFilterModalProps) {
  const {loading, theme, lang} = useUIFactory();

  /* ---------- OPTIONS ---------- */
  const [approvals, setApprovals] = useState<Option[]>([]);
  const [sortings, setSortings] = useState<Option[]>([]);
  const [departments, setDepartments] = useState<Option[]>([
    {value: 'all', label: '—'},
  ]);

  /* ---------- VALUES ---------- */
  const [approvalStatus, setApprovalStatus] = useState<Option | null>(null);
  const [department, setDepartment] = useState<Option | null>(null);
  const [sortBy, setSortBy] = useState<Option | null>(null);

  const [ticketCode, setTicketCode] = useState('');
  const [employeeName, setEmployeeName] = useState('');
  const [positionName, setPositionName] = useState('');

  const [createdDate, setCreatedDate] = useState<Date>(new Date());
  const [startDate, setStartDate] = useState<Date>(new Date());

  /* ===================== LOAD STATIC OPTIONS ===================== */
  useEffect(() => {
    if (!lang) return;
    setApprovals(makeApprovalOptions(lang));
    setSortings(makeSortingOptions(lang));
  }, [lang]);

  /* ===================== LOAD DEPARTMENTS ===================== */
  useEffect(() => {
    const loadDepartments = async () => {
      try {
        const {status, res} = await apiHandle
          .callApi(DepartmentEP.GetAll)
          .asPromise();

        if (!status.isError && res?.data) {
          const list: Option[] = res.data.map((d: any) => ({
            value: d._id,
            label: d.name,
          }));

          setDepartments([{value: 'all', label: '—'}, ...list]);
        }
      } catch (e) {
        console.log('[LOAD DEPARTMENTS ERROR]', e);
      }
    };

    loadDepartments();
  }, []);

  /* ===================== DEFAULT SELECT ===================== */
  useEffect(() => {
    if (approvals.length && !approvalStatus)
      setApprovalStatus(approvals[0]);
  }, [approvals, approvalStatus]);

  useEffect(() => {
    if (departments.length && !department)
      setDepartment(departments[0]);
  }, [departments, department]);

  useEffect(() => {
    if (sortings.length && !sortBy)
      setSortBy(sortings[0]);
  }, [sortings, sortBy]);

  /* ===================== GUARD ===================== */
  if (
    loading ||
    !theme ||
    !lang ||
    !approvalStatus ||
    !department ||
    !sortBy
  ) {
    return null;
  }

  const S = themedStyles(theme);

  /* ===================== HANDLERS ===================== */
  const handleClearFilters = () => {
    setTicketCode('');
    setEmployeeName('');
    setPositionName('');
    setApprovalStatus(approvals[0]);
    setDepartment(departments[0]);
    setSortBy(sortings[0]);

    const d = new Date();
    setCreatedDate(d);
    setStartDate(d);
  };

  const handleApplyFilters = () => {
    const filters: LeaveRequestFilters = {
      ticketCode,
      employeeName,
      positionName,
      department,
      approvalStatus,
      createdDate,
      startDate,
      sortBy,
    };

    onApplyFilters?.(filters);
    onClose();
  };

  /* ===================== UI ===================== */
  return (
    <BottomSheetModal visible={visible} onClose={onClose} maxHeightRatio={0.92}>
      <View
        style={[
          S.container,
          {
            backgroundColor: theme.colors.background,
            borderColor: theme.colors.contrastBackground,
            borderWidth: 1,
          },
        ]}>
        <ScrollView
          contentContainerStyle={S.content}
          showsVerticalScrollIndicator={false}>
          <View style={S.card}>
            {/* ROW 1 */}
            <Row>
              <View style={{flex: 1}}>
                <LabeledTextInput
                  label={lang.t('id_form_label')}
                  value={ticketCode}
                  onChangeText={setTicketCode}
                  placeholder={lang.t('id_form_placeholder')}
                  theme={theme}
                />
              </View>
              <View style={{flex: 1}} />
            </Row>

            {/* ROW 2 */}
            <Row>
              <LabeledTextInput
                label={lang.t('employee_name_label')}
                value={employeeName}
                onChangeText={setEmployeeName}
                placeholder={lang.t('employee_placeholder')}
                theme={theme}
              />
              <LabeledTextInput
                label={lang.t('position_name_label')}
                value={positionName}
                onChangeText={setPositionName}
                placeholder={lang.t('position_placeholder')}
                theme={theme}
              />
            </Row>

            {/* ROW 3 */}
            <Row>
              <LabeledSelect
                label={lang.t('department_label')}
                selected={department}
                options={departments}
                onSelect={setDepartment}
                theme={theme}
              />
              <LabeledSelect
                label={lang.t('approval_status_label')}
                selected={approvalStatus}
                options={approvals}
                onSelect={setApprovalStatus}
                theme={theme}
              />
            </Row>

            {/* ROW 4 */}
            <Row>
              <LabeledDate
                label={lang.t('created_date_label')}
                date={createdDate}
                onChange={setCreatedDate}
                theme={theme}
              />
              <LabeledDate
                label={lang.t('start_date_label')}
                date={startDate}
                onChange={setStartDate}
                theme={theme}
              />
            </Row>

            {/* ROW 5 */}
            <Row>
              <LabeledSelect
                label={lang.t('sort_by_label')}
                selected={sortBy}
                options={sortings}
                onSelect={setSortBy}
                theme={theme}
              />
            </Row>

            {/* ACTIONS */}
            <View style={S.actions}>
              <ButtonFilter
                text={lang.t('clear_filters')}
                textColor="#000"
                backgroundColor="#E3F4FF"
                onPress={handleClearFilters}
              />
              <ButtonFilter
                text={lang.t('apply_filters')}
                textColor="#FFF"
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

/* ===================== HELPERS ===================== */
function Row({children}: {children: React.ReactNode}) {
  return (
    <View
      style={{
        gap: 12,
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 8,
      }}>
      {children}
    </View>
  );
}

const themedStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      overflow: 'hidden',
    },
    content: {
      padding: theme.spacing(2),
      paddingBottom: Platform.select({ios: 28, android: 20}),
    },
    card: {
      backgroundColor: theme.colors.background,
    },
    actions: {
      marginTop: 16,
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 12,
    },
  });
