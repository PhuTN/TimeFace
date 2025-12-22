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

import HeaderBar from '../../components/common/HeaderBar';
import FilterBar from '../../components/common/FilterBar';
import StatusToggleButtons, {
  StatusType,
} from '../../components/common/StatusToggleButtons';
import {useFilterSystem, FilterChipData} from '../../hooks/useFilterSystem';
import OTRecord from '../../components/list_items/employe-list-items/OTRecord';
import OTRecordAddModal from '../../components/modals/add-modals/OTRecordAddModal';
import {useUIFactory} from '../../ui/factory/useUIFactory';

import OTRequestDetailModal, {
  OTRequestDetail,
} from '../../components/modals/detail-modals/OTRequestDetailModal';
import DateRangeFilterModal, {
  DateRangeFilters,
} from '../../components/modals/filter-modals/DateRangeFilterModal';

import {User} from '../../api/endpoint/user';
import {apiHandle} from '../../api/apihandle';

/* ===================== TYPES ===================== */
type OvertimeItem = {
  /* ===== USER ===== */
  user_id: string;
  full_name: string;
  employee_code?: string;
  avatar?: string | null;
  job_title?: string | null;
  department_name?: string | null;

  /* ===== OT ===== */
  ot_id: string;
  date: string; // YYYY-MM-DD
  start_time?: string;
  hours: number;
  reason: string;
  evidence_images: string[];

  status: StatusType;
  admin_note?: string;

  created_at: string;
  approved_at?: string | null;

  approver_name?: string | null;
  approver_avatar?: string | null;
};

/* ===================== SCREEN ===================== */
const OTRecordScreen: React.FC = () => {
  const {loading, theme, lang} = useUIFactory();

  const [selectedStatus, setSelectedStatus] = useState<StatusType>('pending');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);

  const [records, setRecords] = useState<OvertimeItem[]>([]);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const {activeFilters, removeFilter, setActiveFilters} = useFilterSystem();
  const [fetching, setFetching] = useState(false);

  /* ===== DETAIL MODAL ===== */
  const [showDetail, setShowDetail] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState<OTRequestDetail | null>(
    null,
  );
  const formatHoursToHHMM = (hours: number) => {
    const totalMinutes = Math.round(hours * 60);
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;

    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  };

  /* ===================== LOAD API ===================== */
  const loadMyOvertime = async () => {
    setFetching(true);

    const {status, res} = await apiHandle
      .callApi(User.GetMyOvertime)
      .asPromise();

    if (!status.isError) {
      const mapped: OvertimeItem[] =
        res?.data?.overtime_requests?.map((item: any) => {
          const {user, ot} = item;

          return {
            /* ===== USER ===== */
            user_id: user.user_id,
            full_name: user.full_name,
            employee_code: user.employee_code,
            avatar: user.avatar,
            job_title: user.job_title,
            department_name: user.department?.name ?? null,

            /* ===== OT ===== */
            ot_id: ot.ot_id,
            date: ot.date,
            start_time: ot.start_time,
            hours: ot.hours,
            reason: ot.reason,
            evidence_images: ot.evidence_images ?? [],

            status: ot.status,
            admin_note: ot.admin_note,

            created_at: ot.created_at,
            approved_at: ot.approved_at,

            approver_name: ot.approved_by?.full_name ?? null,
            approver_avatar: ot.approved_by?.avatar ?? null,
          };
        }) ?? [];

      setRecords(mapped);
    }

    setFetching(false);
  };

  useEffect(() => {
    loadMyOvertime();
  }, []);

  /* ===================== CREATE OT ===================== */
  const formatTime = (d: Date) => {
    const h = String(d.getHours()).padStart(2, '0');
    const m = String(d.getMinutes()).padStart(2, '0');
    return `${h}:${m}`;
  };

  const handleAddOTRecord = async (data: {
    date: Date;
    startTime: Date;
    hours: string;
    reason: string;
    images: string[];
  }) => {
    const payload = {
      date: data.date.toISOString().slice(0, 10),
      start_time: formatTime(data.startTime),
      hours: Number(data.hours),
      reason: data.reason,
      evidence_images: data.images,
    };

    const {status} = await apiHandle
      .callApi(User.CreateOvertime, payload)
      .asPromise();

    if (!status.isError) {
      setShowAddModal(false);
      loadMyOvertime();
    }
  };

  /* ===================== FILTER ===================== */
  const filteredRecords = useMemo(() => {
    let filtered = records.filter(r => r.status === selectedStatus);

    if (startDate || endDate) {
      filtered = filtered.filter(r => {
        const recordDate = new Date(r.date);
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

  /* ===================== STATS ===================== */
  const totalThisMonth = useMemo(() => {
    const now = new Date();
    return records
      .filter(r => {
        const d = new Date(r.date);
        return (
          r.status === 'approved' &&
          d.getMonth() === now.getMonth() &&
          d.getFullYear() === now.getFullYear()
        );
      })
      .reduce((sum, r) => sum + r.hours, 0);
  }, [records]);

  const totalThisYear = useMemo(() => {
    const year = new Date().getFullYear();
    return records
      .filter(
        r => r.status === 'approved' && new Date(r.date).getFullYear() === year,
      )
      .reduce((sum, r) => sum + r.hours, 0);
  }, [records]);

  /* ===================== OPEN DETAIL ===================== */
  const openDetail = (item: OvertimeItem) => {
    const detail: OTRequestDetail = {
      avatarSource: item.avatar ? {uri: item.avatar} : undefined,

      name: item.full_name,
      position: item.job_title ?? '—',
      department: item.department_name ?? '—',

      status: item.status,
      code: item.employee_code ?? '',

      date: item.date,
      time: item.start_time ?? '—',
      hours: item.hours,
      reason: item.reason,

      createdAt: item.created_at
        ? new Date(item.created_at).toLocaleDateString('vi-VN')
        : '',

      images: item.evidence_images,

      approver:
        item.status !== 'pending'
          ? {
              name: item.approver_name ?? 'Admin',
              date: item.approved_at
                ? new Date(item.approved_at).toLocaleDateString('vi-VN')
                : '',
            }
          : undefined,
    };

    setSelectedDetail(detail);
    setShowDetail(true);
  };

  if (loading || !theme || !lang) return null;

  /* ===================== UI ===================== */
  return (
    <SafeAreaView style={{flex: 1, backgroundColor: theme.colors.background}}>
      <HeaderBar title={lang.t('otRecordTitle')} isShowBackButton />

      <ScrollView
        style={{marginVertical: 16}}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* SUMMARY */}
        <View
          style={[
            styles.summaryContainer,
            {borderColor: theme.colors.borderLight},
          ]}>
          <View style={styles.headerRow}>
            <Text style={[styles.headerTitle, {color: theme.colors.text}]}>
              {lang.t('overtimeHours')}
            </Text>

            <TouchableOpacity
              style={[
                styles.createButton,
                {backgroundColor: theme.colors.addButton},
              ]}
              onPress={() => setShowAddModal(true)}>
              <Text style={styles.createButtonText}>
                {lang.t('createOvertimeRequest')}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>{lang.t('thisMonth')}</Text>
              <Text style={styles.statValue}>
                {formatHoursToHHMM(totalThisMonth)}
              </Text>
            </View>

            <View style={styles.statBox}>
              <Text style={styles.statLabel}>{lang.t('thisYear')}</Text>
              <Text style={styles.statValue}>
                {formatHoursToHHMM(totalThisYear)}
              </Text>
            </View>
          </View>
        </View>

        {/* STATUS */}
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

        {/* LIST */}
        {fetching ? (
          <ActivityIndicator color={theme.colors.primary} />
        ) : (
          filteredRecords.map(item => (
            <TouchableOpacity
              key={item.ot_id}
              activeOpacity={0.85}
              onPress={() => openDetail(item)}>
              <OTRecord
                date={new Date(item.date)}
                startTime={item.start_time ?? '—'}
                otHours={item.hours.toFixed(2)}
                status={item.status}
                approvalDate={
                  item.status !== 'pending'
                    ? new Date(item.created_at).toLocaleDateString()
                    : undefined
                }
                approverName={
                  item.status !== 'pending'
                    ? item.approver_name ?? 'Admin'
                    : undefined
                }
                approverAvatar={item.approver_avatar ?? undefined}
              />
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* ADD MODAL */}
      <OTRecordAddModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddOTRecord}
      />

      {/* DETAIL MODAL */}
      <OTRequestDetailModal
        visible={showDetail}
        onClose={() => setShowDetail(false)}
        request={selectedDetail}
        theme={theme}
        lang={lang}
        isAdmin={false}
      />

      {/* DATE FILTER MODAL */}
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
              label: lang.t('dateRange') || 'Khoảng thời gian',
              subLabel: `${filters.startDate.toLocaleDateString(
                'vi-VN',
              )} - ${filters.endDate.toLocaleDateString('vi-VN')}`,
              value: 'range',
            });
          } else if (filters.startDate) {
            chips.push({
              id: 'startDate',
              label: lang.t('fromDate') || 'Từ ngày',
              subLabel: filters.startDate.toLocaleDateString('vi-VN'),
              value: filters.startDate.toISOString(),
            });
          } else if (filters.endDate) {
            chips.push({
              id: 'endDate',
              label: lang.t('toDate') || 'Đến ngày',
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
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    gap: 12,
  },
  summaryContainer: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  createButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statBox: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  statLabel: {
    fontSize: 14,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '600',
  },
});

export default OTRecordScreen;
