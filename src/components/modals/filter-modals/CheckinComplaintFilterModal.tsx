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

/* ===================== TYPES ===================== */
type Props = {
  visible: boolean;
  onClose: () => void;
  onApplyFilters?: (filters: CheckinComplaintFilters) => void;
};

export type CheckinComplaintFilters = {
  employeeName: string;
  department: Option | null;
  status: Option | null;
  type: Option | null; // check_in | check_out
  createdDate: Date;
  sortBy: Option | null;
};

/* ===================== COMPONENT ===================== */
export default function CheckinComplaintFilterModal({
  visible,
  onClose,
  onApplyFilters,
}: Props) {
  const {loading, theme, lang} = useUIFactory();

  /* ---------- OPTIONS ---------- */
  const [departments, setDepartments] = useState<Option[]>([
    {value: 'all', label: '—'},
  ]);

  const statusOptions: Option[] = [
    {value: 'all', label: lang?.t('all') ?? 'Tất cả'},
    {value: 'pending', label: lang?.t('pending') ?? 'Chờ duyệt'},
    {value: 'approved', label: lang?.t('approved') ?? 'Đã duyệt'},
    {value: 'rejected', label: lang?.t('rejected') ?? 'Từ chối'},
  ];

  const typeOptions: Option[] = [
    {value: 'all', label: lang?.t('all') ?? 'Tất cả'},
    {value: 'check_in', label: 'Check-in'},
    {value: 'check_out', label: 'Check-out'},
  ];

  const sortOptions: Option[] = [
    {value: 'newest', label: lang?.t('newest') ?? 'Mới nhất'},
    {value: 'oldest', label: lang?.t('oldest') ?? 'Cũ nhất'},
  ];

  /* ---------- VALUES ---------- */
  const [employeeName, setEmployeeName] = useState('');
  const [department, setDepartment] = useState<Option | null>(null);
  const [status, setStatus] = useState<Option | null>(null);
  const [type, setType] = useState<Option | null>(null);
  const [sortBy, setSortBy] = useState<Option | null>(null);
  const [createdDate, setCreatedDate] = useState<Date>(new Date());

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
    if (!department && departments.length) setDepartment(departments[0]);
    if (!status) setStatus(statusOptions[0]);
    if (!type) setType(typeOptions[0]);
    if (!sortBy) setSortBy(sortOptions[0]);
  }, [departments, status, type, sortBy]);

  /* ===================== GUARD ===================== */
  if (
    loading ||
    !theme ||
    !lang ||
    !department ||
    !status ||
    !type ||
    !sortBy
  ) {
    return null;
  }

  const S = themedStyles(theme);

  /* ===================== HANDLERS ===================== */
  const handleClear = () => {
    setEmployeeName('');
    setDepartment(departments[0]);
    setStatus(statusOptions[0]);
    setType(typeOptions[0]);
    setSortBy(sortOptions[0]);
    setCreatedDate(new Date());
  };

  const handleApply = () => {
    onApplyFilters?.({
      employeeName,
      department,
      status,
      type,
      createdDate,
      sortBy,
    });
    onClose();
  };

  /* ===================== UI ===================== */
  return (
    <BottomSheetModal visible={visible} onClose={onClose} maxHeightRatio={0.9}>
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
              <LabeledTextInput
                label={lang.t('employee_name_label') ?? 'Tên nhân viên'}
                value={employeeName}
                onChangeText={setEmployeeName}
                placeholder={lang.t('employee_placeholder') ?? 'Nhập tên'}
                theme={theme}
              />
            </Row>

            {/* ROW 2 */}
            <Row>
              <LabeledSelect
                label={lang.t('department_label') ?? 'Phòng ban'}
                selected={department}
                options={departments}
                onSelect={setDepartment}
                theme={theme}
              />
              <LabeledSelect
                label={lang.t('status') ?? 'Trạng thái'}
                selected={status}
                options={statusOptions}
                onSelect={setStatus}
                theme={theme}
              />
            </Row>

            {/* ROW 3 */}
            <Row>
              <LabeledSelect
                label="Loại khiếu nại"
                selected={type}
                options={typeOptions}
                onSelect={setType}
                theme={theme}
              />
              <LabeledDate
                label={lang.t('created_date_label') ?? 'Ngày gửi'}
                date={createdDate}
                onChange={setCreatedDate}
                theme={theme}
              />
            </Row>

            {/* ROW 4 */}
            <Row>
              <LabeledSelect
                label={lang.t('sort_by_label') ?? 'Sắp xếp'}
                selected={sortBy}
                options={sortOptions}
                onSelect={setSortBy}
                theme={theme}
              />
            </Row>

            {/* ACTIONS */}
            <View style={S.actions}>
              <ButtonFilter
                text={lang.t('clear_filters') ?? 'Xóa lọc'}
                textColor="#000"
                backgroundColor="#E3F4FF"
                onPress={handleClear}
              />
              <ButtonFilter
                text={lang.t('apply_filters') ?? 'Áp dụng'}
                textColor="#FFF"
                backgroundColor="#6A96EE"
                onPress={handleApply}
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
