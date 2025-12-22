import React, {useEffect, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {useUIFactory} from '../../ui/factory/useUIFactory';
import FilterBar from '../../components/common/FilterBar';
import StatusToggleButtons, {
  StatusType,
} from '../../components/common/StatusToggleButtons';
import {useFilterSystem, FilterChipData} from '../../hooks/useFilterSystem';
import LeaveRecord from '../../components/list_items/employe-list-items/LeaveRecord';
import LeaveRequestAddModal from '../../components/modals/add-modals/LeaveRequestAddModal';
import LeaveRequestDetailModal from '../../components/modals/detail-modals/LeaveRequestDetailModal';
import DateRangeFilterModal, {
  DateRangeFilters,
} from '../../components/modals/filter-modals/DateRangeFilterModal';

import Toast from 'react-native-toast-message';
import {apiHandle} from '../../api/apihandle';
import {CompanyEP} from '../../api/endpoint/Company';
import {User} from '../../api/endpoint/user';
import HeaderBar from '../../components/common/HeaderBar';

/* ===================== TYPES ===================== */
type LeaveItem = {
  leave_id: string;
  start_date: string;
  end_date: string;
  day_type: 'full' | 'half_morning' | 'half_afternoon';
  type: 'annual' | 'sick' | 'unpaid';
  status: StatusType;
  created_at: string;
  approved_at?: string;
  reason?: string;
  evidence_images?: string[];
  approved_by?: {
    full_name?: string;
    avatar?: string;
  };
};

/* ===================== SCREEN ===================== */
const LeaveRecordScreen: React.FC = () => {
  const {loading, theme, lang} = useUIFactory();

  const [selectedStatus, setSelectedStatus] = useState<StatusType>('pending');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);

  const [records, setRecords] = useState<LeaveItem[]>([]);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const {activeFilters, removeFilter, setActiveFilters} = useFilterSystem();
  const [fetching, setFetching] = useState(false);

  /* ===== USER ===== */
  const [currentUser, setCurrentUser] = useState<any>(null);

  /* ===== DETAIL ===== */
  const [selectedLeave, setSelectedLeave] = useState<LeaveItem | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  /* ===== COMPANY CONFIG ===== */
  const [annualTotal, setAnnualTotal] = useState(0);
  const [allowHalfDay, setAllowHalfDay] = useState(false);

  /* ===== USER STATS ===== */
  const [paidLeaveUsed, setPaidLeaveUsed] = useState(0);
  const [totalLeaveUsed, setTotalLeaveUsed] = useState(0);
  const [annualLeaveUsed, setAnnualLeaveUsed] = useState(0);

  /* ===================== LOAD DATA ===================== */
  const loadData = async () => {
    setFetching(true);
    try {
      const res = await apiHandle.callApi(CompanyEP.GetMyCompany).asPromise();
      const company = res?.res?.company;
      const user = res?.res?.user;

      setCurrentUser(user);

      const leavePolicy = company?.attendance_config?.leave_policy;

      setAnnualTotal(Number(leavePolicy?.annual_leave_days) || 0);
      setAllowHalfDay(Boolean(leavePolicy?.allow_half_day));

      setPaidLeaveUsed(Number(user?.paid_leave_used) || 0);
      setTotalLeaveUsed(Number(user?.total_leave_used) || 0);
      setAnnualLeaveUsed(Number(user?.annual_leave_used) || 0);

      const list: LeaveItem[] =
        user?.leave_requests?.map((l: any, index: number) => ({
          leave_id: l._id || `${l.created_at}_${index}`,
          start_date: l.start_date,
          end_date: l.end_date,
          day_type: l.day_type,
          type: l.type,
          status: l.status,
          created_at: l.created_at,
          approved_at: l.approved_at,
          approved_by: l.approved_by,
          reason: l.reason,
          evidence_images: l.evidence_images,
        })) ?? [];

      setRecords(list);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  /* ===================== FILTER ===================== */
  const filteredRecords = useMemo(() => {
    let filtered = records.filter(r => r.status === selectedStatus);

    if (startDate || endDate) {
      filtered = filtered.filter(r => {
        const recordDate = new Date(r.start_date);
        const start = startDate
          ? new Date(startDate.setHours(0, 0, 0, 0))
          : null;
        const end = endDate
          ? new Date(endDate.setHours(23, 59, 59, 999))
          : null;

        if (start && end) {
          return recordDate >= start && recordDate <= end;
        } else if (start) {
          return recordDate >= start;
        } else if (end) {
          return recordDate <= end;
        }
        return true;
      });
    }

    return filtered;
  }, [records, selectedStatus, startDate, endDate]);

  /* ===================== SUMMARY ===================== */
  const remainingLeave = Math.max(annualTotal - annualLeaveUsed, 0);

  /* ===================== CALC DAYS ===================== */
  const calcLeaveDays = (
    start: string,
    end: string,
    dayType: 'full' | 'half_morning' | 'half_afternoon',
  ) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffDays =
      Math.floor((endDate.getTime() - startDate.getTime()) / 86400000) + 1;

    if (diffDays === 1) {
      return dayType === 'full' ? 1 : 0.5;
    }
    return diffDays;
  };

  /* ===================== ADD ===================== */
  const handleAddLeaveRequest = async (data: any) => {
    const leaveDays = calcLeaveDays(
      data.startDate.toISOString(),
      data.endDate.toISOString(),
      data.dayType,
    );

    if (data.type === 'annual') {
      const remainingAnnual = annualTotal - annualLeaveUsed;
      if (leaveDays > remainingAnnual) {
        Toast.show({
          type: 'error',
          text1: 'Không đủ phép năm',
          text2: `Bạn chỉ còn ${remainingAnnual} ngày`,
        });
        return;
      }
    }

    const overlap = records.some(
      r =>
        r.status === 'approved' &&
        data.startDate <= new Date(r.end_date) &&
        data.endDate >= new Date(r.start_date),
    );

    if (overlap) {
      Toast.show({
        type: 'error',
        text1: 'Trùng ngày nghỉ',
        text2: 'Ngày nghỉ bị trùng với đơn đã duyệt',
      });
      return;
    }

    await apiHandle
      .callApi(User.CreateLeave, {
        type: data.type,
        start_date: data.startDate.toISOString().slice(0, 10),
        end_date: data.endDate.toISOString().slice(0, 10),
        day_type: data.dayType,
        reason: data.reason,
        evidence_images: data.images,
      })
      .asPromise();

    Toast.show({type: 'success', text1: 'Gửi đơn thành công'});
    setShowAddModal(false);
    loadData();
  };

  if (loading || !theme || !lang) return null;

  /* ===================== UI ===================== */
  return (
    <SafeAreaView style={{flex: 1, backgroundColor: theme.colors.background}}>
      <HeaderBar title={lang.t('leaveRecordTitle')} isShowBackButton />

      <ScrollView
        style={{marginVertical: 16}}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* ===== SUMMARY ===== */}
        <View
          style={[
            styles.summaryContainer,
            {borderColor: theme.colors.borderLight},
          ]}>
          <View style={styles.headerRow}>
            <View>
              <Text style={[styles.headerTitle, {color: theme.colors.text}]}>
                {lang.t('leaveSummary')}
              </Text>
              <Text style={{color: theme.colors.mutedText}}>
                {new Date().getFullYear()}
              </Text>
            </View>

            <TouchableOpacity
              style={[
                styles.createButton,
                {backgroundColor: theme.colors.addButton},
              ]}
              onPress={() => setShowAddModal(true)}>
              <Text style={styles.createButtonText}>
                {lang.t('createLeaveRequest')}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.statsColumn}>
            <View style={styles.statBox}>
              <Text>Số ngày nghỉ có lương</Text>
              <Text style={styles.statValue}>{paidLeaveUsed}</Text>
            </View>
            <View style={styles.statBox}>
              <Text>Tổng số ngày đã nghỉ</Text>
              <Text style={styles.statValue}>{totalLeaveUsed}</Text>
            </View>
            <View style={styles.statBox}>
              <Text>Số ngày nghỉ còn lại</Text>
              <Text style={styles.statValue}>{remainingLeave}</Text>
            </View>
          </View>
        </View>

        <StatusToggleButtons
          selectedStatus={selectedStatus}
          onStatusChange={setSelectedStatus}
        />

        {/* DATE FILTER */}
        <FilterBar
          title={lang.t('filterByDate') || 'Lọc theo ngày'}
          onFilterPress={() => setShowFilterModal(true)}
          activeFilters={activeFilters}
          onRemoveFilter={id => {
            removeFilter(id);
            setStartDate(null);
            setEndDate(null);
          }}
          theme={theme}
        />

        {fetching ? (
          <ActivityIndicator color={theme.colors.primary} />
        ) : (
          filteredRecords.map(item => (
            <LeaveRecord
              key={item.leave_id}
              date={new Date(item.start_date)}
              leaveDates={`${item.start_date} → ${item.end_date}`}
              numberOfDays={String(
                calcLeaveDays(item.start_date, item.end_date, item.day_type),
              )}
              leaveType={item.type}
              status={item.status}
              approvalDate={
                item.approved_at
                  ? new Date(item.approved_at).toLocaleDateString('vi-VN')
                  : undefined
              }
              approverName={item.approved_by?.full_name}
              approverAvatar={item.approved_by?.avatar}
              onPress={() => {
                setSelectedLeave(item);
                setShowDetailModal(true);
              }}
            />
          ))
        )}
      </ScrollView>

      {/* ===== ADD ===== */}
      <LeaveRequestAddModal
        visible={showAddModal}
        allowHalfDay={allowHalfDay}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddLeaveRequest}
      />

      {/* ===== DETAIL ===== */}
      {selectedLeave && currentUser && (
        <LeaveRequestDetailModal
          visible={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          request={{
            /* IDs */
            leave_id: selectedLeave.leave_id,
            user_id: currentUser._id,

            /* User info */
            avatarSource: currentUser.avatar
              ? {uri: currentUser.avatar}
              : {uri: 'https://cdn-icons-png.freepik.com/512/6858/6858504.png'},

            name: currentUser.full_name,
            position: currentUser.job_title || '',
            department: currentUser.department_id?.name || '',

            /* Meta */
            requestCode: currentUser.employee_code || selectedLeave.leave_id,
            createdAt: new Date(selectedLeave.created_at).toLocaleDateString(
              'vi-VN',
            ),

            /* Leave */
            type: selectedLeave.type,
            status: selectedLeave.status,
            startDate: selectedLeave.start_date,
            endDate: selectedLeave.end_date,
            numberOfDays: calcLeaveDays(
              selectedLeave.start_date,
              selectedLeave.end_date,
              selectedLeave.day_type,
            ),
            reason: selectedLeave.reason || '',
            evidenceImages: selectedLeave.evidence_images || [],

            /* Approver */
            approver: selectedLeave.approved_by
              ? {
                  name: selectedLeave.approved_by.full_name || '',
                  date: selectedLeave.approved_at
                    ? new Date(selectedLeave.approved_at).toLocaleDateString(
                        'vi-VN',
                      )
                    : '',
                }
              : undefined,
          }}
          theme={theme}
          lang={lang}
        />
      )}

      <DateRangeFilterModal
        visible={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        onApplyFilters={(filters: DateRangeFilters) => {
          const chips = [];

          if (filters.startDate) {
            setStartDate(filters.startDate);
          }
          if (filters.endDate) {
            setEndDate(filters.endDate);
          }

          if (filters.startDate && filters.endDate) {
            chips.push({
              id: 'dateRange',
              label: lang.t('dateRange') || 'Kho\u1ea3ng th\u1eddi gian',
              subLabel: `${filters.startDate.toLocaleDateString(
                'vi-VN',
              )} - ${filters.endDate.toLocaleDateString('vi-VN')}`,
              value: 'range',
            });
          } else if (filters.startDate) {
            chips.push({
              id: 'startDate',
              label: lang.t('fromDate') || 'T\u1eeb ng\u00e0y',
              subLabel: filters.startDate.toLocaleDateString('vi-VN'),
              value: filters.startDate.toISOString(),
            });
          } else if (filters.endDate) {
            chips.push({
              id: 'endDate',
              label: lang.t('toDate') || '\u0110\u1ebfn ng\u00e0y',
              subLabel: filters.endDate.toLocaleDateString('vi-VN'),
              value: filters.endDate.toISOString(),
            });
          }

          setActiveFilters(chips);
        }}
      />
    </SafeAreaView>
  );
};

/* ===================== STYLES ===================== */
const styles = StyleSheet.create({
  scrollContent: {padding: 16, gap: 12},
  summaryContainer: {borderRadius: 12, borderWidth: 1, padding: 16},
  headerRow: {flexDirection: 'row', justifyContent: 'space-between'},
  headerTitle: {fontSize: 16, fontWeight: '700'},
  createButton: {padding: 10, borderRadius: 8},
  createButtonText: {color: '#fff', fontWeight: '600'},
  statsColumn: {gap: 12},
  statBox: {padding: 12, borderRadius: 12, borderWidth: 1},
  statValue: {fontSize: 20, fontWeight: '600'},
});

export default LeaveRecordScreen;
