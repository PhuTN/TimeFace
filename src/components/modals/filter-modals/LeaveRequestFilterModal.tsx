import React, {useEffect, useState} from 'react';
import {View, StyleSheet, ScrollView} from 'react-native';
import {useUIFactory} from '../../../ui/factory/useUIFactory';
import {
  makeApprovalOptions,
  makeDepartmentOptions,
  makeSortingOptions,
} from '../../../fake_data/Dien/fake_data';
import LabeledDate from '../../common/LabeledDate';
import LabeledSelect from '../../common/LabeledSelect';
import LabeledTextInput from '../../common/LabeledTextInput';
import ButtonFilter from '../../common/ButtonFilter';
import BottomSheetModal from '../../common/BottomSheetModal';
import type {Option} from '../../../types/common';

type LeaveRequestFilterModalProps = {
  visible: boolean;
  onClose: () => void;
  onApplyFilters?: (filters: LeaveRequestFilters) => void;
};

export type LeaveRequestFilters = {
  employeeName: string;
  positionName: string;
  approvalStatus: Option | null;
  ticketCode: string;
  createdDate: Date;
  department: Option | null;
  startDate: Date;
  endDate: Date;
  sortBy: Option | null;
};

export default function LeaveRequestFilterModal({
  visible,
  onClose,
  onApplyFilters,
}: LeaveRequestFilterModalProps) {
  const {loading, theme, lang} = useUIFactory();

  const [approvals, setApprovals] = useState<Option[]>([]);
  const [departments, setDepartments] = useState<Option[]>([]);
  const [sortings, setSortings] = useState<Option[]>([]);

  const [approvalStatus, setApprovalStatus] = useState<Option | null>(null);
  const [department, setDepartment] = useState<Option | null>(null);
  const [sortBy, setSortBy] = useState<Option | null>(null);

  const [employeeName, setEmployeeName] = useState('');
  const [positionName, setPositionName] = useState('');
  const [ticketCode, setTicketCode] = useState('');

  const [createdDate, setCreatedDate] = useState<Date>(new Date());
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());

  useEffect(() => {
    if (!lang) return;
    setApprovals(makeApprovalOptions(lang));
    setDepartments(makeDepartmentOptions(lang));
    setSortings(makeSortingOptions(lang));
  }, [lang]);

  useEffect(() => {
    if (approvals.length && !approvalStatus) setApprovalStatus(approvals[0]);
  }, [approvals, approvalStatus]);

  useEffect(() => {
    if (departments.length && !department) setDepartment(departments[0]);
  }, [departments, department]);

  useEffect(() => {
    if (sortings.length && !sortBy) setSortBy(sortings[0]);
  }, [sortings, sortBy]);

  if (loading || !theme || !lang || !approvalStatus || !department || !sortBy) {
    return null;
  }

  const S = themedStyles(theme);

  const handleClearFilters = () => {
    setEmployeeName('');
    setPositionName('');
    setTicketCode('');
    setApprovalStatus(approvals[0]);
    setDepartment(departments[0]);
    setSortBy(sortings[0]);
    const d = new Date();
    setCreatedDate(d);
    setStartDate(d);
    setEndDate(d);
  };

  const handleApplyFilters = () => {
    const filters: LeaveRequestFilters = {
      employeeName,
      positionName,
      approvalStatus,
      ticketCode,
      createdDate,
      department,
      startDate,
      endDate,
      sortBy,
    };

    console.log('Applied Leave Request filters:', filters);
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
        ]}>
        {' '}
        <ScrollView
          contentContainerStyle={{
            padding: theme.spacing(2),
            paddingBottom: theme.spacing(3),
          }}
          showsVerticalScrollIndicator={false}>
          <View style={S.card}>
            {/* Row 1: Tên nhân viên, Tên chức vụ */}
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

            {/* Row 2: Trạng thái duyệt, Mã phiếu */}
            <Row>
              <LabeledSelect
                label={lang.t('approval_status_label')}
                selected={approvalStatus}
                options={approvals}
                onSelect={setApprovalStatus}
                theme={theme}
              />
              <LabeledTextInput
                label={lang.t('id_form_label')}
                value={ticketCode}
                onChangeText={setTicketCode}
                placeholder={lang.t('id_form_placeholder')}
                theme={theme}
              />
            </Row>

            {/* Row 3: Ngày tạo phiếu, Phòng ban */}
            <Row>
              <LabeledDate
                label={lang.t('created_date_label')}
                date={createdDate}
                onChange={setCreatedDate}
                theme={theme}
              />
              <LabeledSelect
                label={lang.t('department_label')}
                selected={department}
                options={departments}
                onSelect={setDepartment}
                theme={theme}
              />
            </Row>

            {/* Row 4: Ngày bắt đầu nghỉ, Ngày kết thúc nghỉ */}
            <Row>
              <LabeledDate
                label={lang.t('start_date_label')}
                date={startDate}
                onChange={setStartDate}
                theme={theme}
              />
              <LabeledDate
                label={lang.t('end_date_label')}
                date={endDate}
                onChange={setEndDate}
                theme={theme}
              />
            </Row>

            {/* Row 5: Sắp xếp bởi */}
            <Row>
              <LabeledSelect
                label={lang.t('sort_by_label')}
                selected={sortBy}
                options={sortings}
                onSelect={setSortBy}
                theme={theme}
              />
            </Row>

            {/* Actions */}
            <View style={S.actions}>
              <ButtonFilter
                text={lang.t('clear_filters')}
                textColor="#000000"
                backgroundColor="#E3F4FF"
                onPress={handleClearFilters}
              />
              <ButtonFilter
                text={lang.t('apply_filters')}
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
