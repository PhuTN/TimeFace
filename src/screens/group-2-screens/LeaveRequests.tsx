import React, {useEffect, useState} from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  ActivityIndicator,
} from 'react-native';

import {useUIFactory} from '../../ui/factory/useUIFactory';
import Header2 from '../../components/common/Header2';
import FilterIcon from '../../assets/icons/filter_icon.svg';
import FilterChip from '../../components/common/FilterChip';
import ICRequest from '../../components/list_items/ICRequest';

import LeaveRequestDetailModal, {
  LeaveRequestDetail,
} from '../../components/modals/detail-modals/LeaveRequestDetailModal';

import LeaveRequestFilterModal, {
  LeaveRequestFilters,
} from '../../components/modals/filter-modals/LeaveRequestFilterModal';

import {User} from '../../api/endpoint/user';
import {apiHandle} from '../../api/apihandle';
import Toast from 'react-native-toast-message';

/* ===================== TYPES ===================== */
type ActiveFilter = {
  key: string;
  mainText: string;
  subText: string;
  value: any;
};

/* ===================== SCREEN ===================== */
export default function LeaveRequestScreen() {
  const {loading, theme, lang} = useUIFactory();
  const t = lang?.t;

  const [rawRequests, setRawRequests] = useState<LeaveRequestDetail[]>([]);
  const [displayed, setDisplayed] = useState<LeaveRequestDetail[]>([]);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [apiLoading, setApiLoading] = useState(false);

  const [showFilter, setShowFilter] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedRequest, setSelectedRequest] =
    useState<LeaveRequestDetail | null>(null);

  const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([]);

  /* ===================== CALC DAYS ===================== */
  const calcLeaveDays = (
    start: string,
    end: string,
    dayType: 'full' | 'half_morning' | 'half_afternoon',
  ) => {
    const s = new Date(start);
    const e = new Date(end);
    const diff =
      Math.floor((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    if (diff === 1) return dayType === 'full' ? 1 : 0.5;
    return diff;
  };

  /* ===================== LOAD DATA ===================== */
  const loadLeaves = async () => {
    setApiLoading(true);
    try {
      const {status, res} = await apiHandle
        .callApi(User.AdminGetAllLeave)
        .asPromise();

      if (status.isError) return;

      const raw = res?.data?.leave_requests ?? [];

      const mapped: LeaveRequestDetail[] = raw.map((item: any) => {
        const {user, leave} = item;

        return {
          avatarSource: user.avatar
            ? {uri: user.avatar}
            : {
                uri: 'https://cdn-icons-png.freepik.com/512/6858/6858504.png',
              },

          user_id: user.user_id,
          leave_id: leave.leave_id,
          type: leave.type,

          name: user.full_name,
          position: user.job_title || '',
          department: user.department?.name || '',

          evidenceImages: leave.evidence_images || [],

          status: leave.status,
          requestCode: user.employee_code || leave.leave_id,

          startDate: leave.start_date,
          endDate: leave.end_date,
          numberOfDays: calcLeaveDays(
            leave.start_date,
            leave.end_date,
            leave.day_type,
          ),

          reason: leave.reason,
          createdAt: leave.created_at
            ? new Date(leave.created_at).toLocaleDateString('vi-VN')
            : '',

          approver: leave.approved_by
            ? {
                name: leave.approved_by.full_name,
                date: leave.approved_at
                  ? new Date(leave.approved_at).toLocaleDateString('vi-VN')
                  : '',
              }
            : undefined,
        };
      });

      setRawRequests(mapped);

      if (isFirstLoad) {
        setDisplayed(mapped); // Show all requests without default filter
        setActiveFilters([]); // No default filters
        setIsFirstLoad(false);
      } else {
        setDisplayed(mapped);
      }
    } finally {
      setApiLoading(false);
    }
  };

  useEffect(() => {
    loadLeaves();
  }, []);

  /* ===================== REMOVE CHIP (FIX CHUẨN) ===================== */
  const handleRemoveChip = (key: string) => {
    const remaining = activeFilters.filter(f => f.key !== key);
    setActiveFilters(remaining);

    // ✅ KHÔNG CÒN CHIP → HIỂN THỊ TẤT CẢ
    if (remaining.length === 0) {
      setDisplayed(rawRequests);
      return;
    }

    let next = [...rawRequests];

    remaining.forEach(f => {
      switch (f.key) {
        case 'approvalStatus':
          next = next.filter(r => r.status === f.value);
          break;

        case 'employeeName':
          next = next.filter(r =>
            r.name.toLowerCase().includes(String(f.value).toLowerCase()),
          );
          break;

        case 'ticketCode':
          next = next.filter(r =>
            r.requestCode.toLowerCase().includes(String(f.value).toLowerCase()),
          );
          break;

        case 'positionName':
          next = next.filter(r =>
            r.position.toLowerCase().includes(String(f.value).toLowerCase()),
          );
          break;

        case 'department':
          next = next.filter(r => r.department === f.value);
          break;

        case 'createdDate':
          const createdFilterDate = (f.value as Date).toLocaleDateString(
            'vi-VN',
          );
          next = next.filter(r => r.createdAt === createdFilterDate);
          break;

        case 'startDate':
          const startFilterDate = (f.value as Date).toISOString().split('T')[0];
          next = next.filter(r => r.startDate === startFilterDate);
          break;

        case 'sortBy':
          // Apply sorting
          switch (f.value) {
            case 'name_asc':
              next.sort((a, b) => a.name.localeCompare(b.name));
              break;
            case 'name_desc':
              next.sort((a, b) => b.name.localeCompare(a.name));
              break;
            case 'date_asc':
              next.sort(
                (a, b) =>
                  new Date(a.startDate).getTime() -
                  new Date(b.startDate).getTime(),
              );
              break;
            case 'date_desc':
              next.sort(
                (a, b) =>
                  new Date(b.startDate).getTime() -
                  new Date(a.startDate).getTime(),
              );
              break;
            default:
              break;
          }
          break;
      }
    });

    setDisplayed(next);
  };

  /* ===================== APPLY FILTER ===================== */
  const applyFilter = (filters: LeaveRequestFilters) => {
    let next = [...rawRequests];
    const chips: ActiveFilter[] = [];

    if (filters.ticketCode) {
      next = next.filter(r =>
        r.requestCode.toLowerCase().includes(filters.ticketCode.toLowerCase()),
      );
      chips.push({
        key: 'ticketCode',
        mainText: t('id_form_label'),
        subText: filters.ticketCode,
        value: filters.ticketCode,
      });
    }

    if (filters.employeeName) {
      next = next.filter(r =>
        r.name.toLowerCase().includes(filters.employeeName.toLowerCase()),
      );
      chips.push({
        key: 'employeeName',
        mainText: t('employee_name_label'),
        subText: filters.employeeName,
        value: filters.employeeName,
      });
    }

    if (filters.positionName) {
      next = next.filter(r =>
        r.position.toLowerCase().includes(filters.positionName.toLowerCase()),
      );
      chips.push({
        key: 'positionName',
        mainText: t('position_name_label'),
        subText: filters.positionName,
        value: filters.positionName,
      });
    }

    if (filters.department && filters.department.value !== 'all') {
      next = next.filter(r => r.department === filters.department.label);
      chips.push({
        key: 'department',
        mainText: t('department_label'),
        subText: filters.department.label,
        value: filters.department.label,
      });
    }

    if (filters.approvalStatus && filters.approvalStatus.value !== 'all') {
      next = next.filter(r => r.status === filters.approvalStatus.value);
      chips.push({
        key: 'approvalStatus',
        mainText: t('approval_status_label'),
        subText: filters.approvalStatus.label,
        value: filters.approvalStatus.value,
      });
    }

    if (filters.createdDate) {
      const filterDate = filters.createdDate.toLocaleDateString('vi-VN');
      next = next.filter(r => r.createdAt === filterDate);
      chips.push({
        key: 'createdDate',
        mainText: t('created_date_label'),
        subText: filterDate,
        value: filters.createdDate,
      });
    }

    if (filters.startDate) {
      const filterDate = filters.startDate.toISOString().split('T')[0];
      next = next.filter(r => r.startDate === filterDate);
      chips.push({
        key: 'startDate',
        mainText: t('start_date_label'),
        subText: filters.startDate.toLocaleDateString('vi-VN'),
        value: filters.startDate,
      });
    }

    // Apply sorting after filtering
    if (filters.sortBy) {
      switch (filters.sortBy.value) {
        case 'name_asc':
          next.sort((a, b) => a.name.localeCompare(b.name));
          break;
        case 'name_desc':
          next.sort((a, b) => b.name.localeCompare(a.name));
          break;
        case 'date_asc':
          next.sort(
            (a, b) =>
              new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
          );
          break;
        case 'date_desc':
          next.sort(
            (a, b) =>
              new Date(b.startDate).getTime() - new Date(a.startDate).getTime(),
          );
          break;
        case 'default':
        default:
          // Keep original order
          break;
      }

      // Always show sortBy chip
      chips.push({
        key: 'sortBy',
        mainText: t('sort_by_label'),
        subText: filters.sortBy.label,
        value: filters.sortBy.value,
      });
    }

    setDisplayed(next);
    setActiveFilters(chips);
  };

  /* ===================== APPROVE / REJECT ===================== */
  const handleApprove = async () => {
    if (!selectedRequest) return;

    await apiHandle
      .callApi(
        User.AdminDecideLeave(
          selectedRequest.user_id!,
          selectedRequest.leave_id!,
        ),
        {status: 'approved'},
      )
      .asPromise();

    Toast.show({type: 'success', text1: t('approved')});
    setShowDetailModal(false);
    loadLeaves();
  };

  const handleReject = async () => {
    if (!selectedRequest) return;

    await apiHandle
      .callApi(
        User.AdminDecideLeave(
          selectedRequest.user_id!,
          selectedRequest.leave_id!,
        ),
        {status: 'rejected'},
      )
      .asPromise();

    Toast.show({type: 'success', text1: t('rejected')});
    setShowDetailModal(false);
    loadLeaves();
  };

  if (loading || !theme || !lang) return null;

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: theme.colors.background}}>
      <Header2 title={t('leaveRequestTitle')} theme={theme} />

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 20,
          paddingBottom: 24,
        }}
        showsVerticalScrollIndicator={false}>
        {/* HEADER */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: 12,
          }}>
          <Text style={{fontSize: 16, fontWeight: '600'}}>
            {t('leaveRequestTitle')}
          </Text>
          <FilterIcon
            width={22}
            height={22}
            onPress={() => setShowFilter(true)}
          />
        </View>

        {/* FILTER CHIPS */}
        {activeFilters.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{gap: 10, marginBottom: 12}}>
            {activeFilters.map(f => (
              <View key={f.key} style={{marginRight: 8}}>
                <FilterChip
                  mainText={f.mainText}
                  subText={f.subText}
                  theme={theme}
                  onRemove={() => handleRemoveChip(f.key)}
                />
              </View>
            ))}
          </ScrollView>
        )}

        {apiLoading && (
          <View style={{marginVertical: 16}}>
            <ActivityIndicator size="small" color={theme.colors.primary} />
          </View>
        )}

        {/* LIST */}
        <View style={{gap: 12}}>
          {displayed.map((r, i) => (
            <ICRequest
              key={i}
              avatarSource={r.avatarSource}
              name={r.name}
              position={r.position}
              status={r.status}
              leaveType={r.type}
              leaveDates={`${r.startDate} → ${r.endDate}`}
              onPress={() => {
                setSelectedRequest(r);
                setShowDetailModal(true);
              }}
            />
          ))}
        </View>
      </ScrollView>

      <LeaveRequestFilterModal
        visible={showFilter}
        onClose={() => setShowFilter(false)}
        onApplyFilters={applyFilter}
      />

      <LeaveRequestDetailModal
        visible={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        request={selectedRequest}
        theme={theme}
        lang={lang}
        isAdmin
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </SafeAreaView>
  );
}
