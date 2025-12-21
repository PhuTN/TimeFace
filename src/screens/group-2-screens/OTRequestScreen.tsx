import React, {useEffect, useState} from 'react';
import {View, ScrollView, SafeAreaView, Text} from 'react-native';
import {useUIFactory} from '../../ui/factory/useUIFactory';

import HeaderBar from '../../components/common/HeaderBar';
import OTRequest from '../../components/list_items/OTRequest';
import OTRequestDetailModal, {
  OTRequestDetail,
} from '../../components/modals/detail-modals/OTRequestDetailModal';
import OTRequestFilterModal, {
  OTRequestFilters,
} from '../../components/modals/filter-modals/OTRequestFilterModal';

import FilterIcon from '../../assets/icons/filter_icon.svg';
import FilterChip from '../../components/common/FilterChip';

import {User} from '../../api/endpoint/User';
import {apiHandle} from '../../api/apihandle';
import Toast from 'react-native-toast-message';

/* ===================== UTILS ===================== */
const addHours = (start: string, hours: number) => {
  if (!start) return '--:--';
  const [h, m] = start.split(':').map(Number);
  const d = new Date();
  d.setHours(h);
  d.setMinutes(m + hours * 60);
  return `${String(d.getHours()).padStart(2, '0')}:${String(
    d.getMinutes(),
  ).padStart(2, '0')}`;
};

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

/** ⭐ FIX TIMEZONE – format YYYY-MM-DD theo local */
const formatDateLocal = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

export default function OTRequestScreen() {
  const {loading, theme, lang} = useUIFactory();
  const t = lang?.t;

  /* ===================== STATE ===================== */
  const [rawRequests, setRawRequests] = useState<OTRequestDetail[]>([]);
  const [displayed, setDisplayed] = useState<OTRequestDetail[]>([]);

  const [showFilter, setShowFilter] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedRequest, setSelectedRequest] =
    useState<OTRequestDetail | null>(null);

  const [criteria, setCriteria] = useState<OTRequestFilters>({
    ticketCode: '',
    employeeName: '',
    positionName: '',
    department: null,
    approvalStatus: {
      value: 'pending',
      label: t?.('pending') ?? 'Đang chờ',
    },
    createdDate: new Date(),
    otDate: new Date(),
    sortBy: null,
  });

  const [activeFilters, setActiveFilters] = useState<
    {key: string; mainText: string; subText: string}[]
  >([
    {
      key: 'approvalStatus',
      mainText: t?.('approval_status_label') ?? 'Trạng thái',
      subText: t?.('pending') ?? 'Đang chờ',
    },
  ]);

  /* ===================== LOAD DATA ===================== */
  const loadOT = async () => {
    const {status, res} = await apiHandle
      .callApi(User.AdminGetAllOvertime)
      .asPromise();

    if (status.isError) return;

    const raw = res?.data?.overtime_requests ?? [];

    const mapped: OTRequestDetail[] = raw.map((item: any) => {
      const {user, ot} = item;

      const startTime = ot.start_time ?? '--:--';
      const endTime =
        ot.start_time && ot.hours ? addHours(ot.start_time, ot.hours) : '--:--';

      return {
        avatarSource: user.avatar
          ? {uri: user.avatar}
          : {uri: 'https://cdn-icons-png.freepik.com/512/6858/6858504.png'},

        user_id: user.user_id,
        ot_id: ot.ot_id,

        name: user.full_name,
        position: user.job_title || '—',
        department: user.department?.name || '—',

        status: ot.status,
        code: user.employee_code || ot.ot_id,

        date: ot.date, // YYYY-MM-DD (backend)
        time: `${startTime} - ${endTime}`,
        hours: ot.hours,
        reason: ot.reason,

        createdAt: ot.created_at
          ? new Date(ot.created_at).toLocaleDateString('vi-VN')
          : '',

        images: ot.evidence_images ?? [],

        approver: ot.approved_by?.full_name
          ? {
              name: ot.approved_by.full_name,
              date: ot.approved_at
                ? new Date(ot.approved_at).toLocaleDateString('vi-VN')
                : '',
            }
          : undefined,
      };
    });

    setRawRequests(mapped);
    setDisplayed(mapped.filter(r => r.status === 'pending'));
  };

  useEffect(() => {
    loadOT();
  }, []);

  /* ===================== FILTER CORE ===================== */
  const filterData = (values: OTRequestFilters) => {
    let next = [...rawRequests];

    if (values.ticketCode) {
      next = next.filter(r =>
        r.code.toLowerCase().includes(values.ticketCode.toLowerCase()),
      );
    }

    if (values.employeeName) {
      next = next.filter(r =>
        r.name.toLowerCase().includes(values.employeeName.toLowerCase()),
      );
    }

    if (values.positionName) {
      next = next.filter(r =>
        r.position.toLowerCase().includes(values.positionName.toLowerCase()),
      );
    }

    if (values.department && values.department.value !== 'all') {
      next = next.filter(r => r.department === values.department.label);
    }

    if (values.approvalStatus && values.approvalStatus.value !== 'all') {
      next = next.filter(r => r.status === values.approvalStatus.value);
    }

    // ⭐ CREATED DATE
    if (!isSameDay(values.createdDate, new Date())) {
      const d = values.createdDate.toLocaleDateString('vi-VN');
      next = next.filter(r => r.createdAt === d);
    }

    // ⭐ OT DATE (FIX TIMEZONE)
    if (!isSameDay(values.otDate, new Date())) {
      const d = formatDateLocal(values.otDate);
      next = next.filter(r => r.date === d);
    }

    // ⭐ SORT
    if (values.sortBy?.value) {
      switch (values.sortBy.value) {
        case 'created_desc':
          next.sort(
            (a, b) =>
              new Date(b.createdAt).getTime() -
              new Date(a.createdAt).getTime(),
          );
          break;
        case 'created_asc':
          next.sort(
            (a, b) =>
              new Date(a.createdAt).getTime() -
              new Date(b.createdAt).getTime(),
          );
          break;
        case 'name_asc':
          next.sort((a, b) => a.name.localeCompare(b.name));
          break;
        case 'name_desc':
          next.sort((a, b) => b.name.localeCompare(a.name));
          break;
      }
    }

    return next;
  };

  /* ===================== APPLY FILTER ===================== */
  const applyFilter = (values: OTRequestFilters) => {
    setCriteria(values);
    setDisplayed(filterData(values));

    const chips: {key: string; mainText: string; subText: string}[] = [];

    if (values.ticketCode)
      chips.push({key: 'ticketCode', mainText: t('id_form_label'), subText: values.ticketCode});

    if (values.employeeName)
      chips.push({key: 'employeeName', mainText: t('employee_name_label'), subText: values.employeeName});

    if (values.positionName)
      chips.push({key: 'positionName', mainText: t('position_name_label'), subText: values.positionName});

    if (values.department && values.department.value !== 'all')
      chips.push({key: 'department', mainText: t('department_label'), subText: values.department.label});

    if (values.approvalStatus && values.approvalStatus.value !== 'all')
      chips.push({key: 'approvalStatus', mainText: t('approval_status_label'), subText: values.approvalStatus.label});

    if (!isSameDay(values.createdDate, new Date()))
      chips.push({key: 'createdDate', mainText: t('created_date_label'), subText: values.createdDate.toLocaleDateString('vi-VN')});

    if (!isSameDay(values.otDate, new Date()))
      chips.push({key: 'otDate', mainText: t('otDate'), subText: values.otDate.toLocaleDateString('vi-VN')});

    if (values.sortBy)
      chips.push({key: 'sortBy', mainText: t('sort_by_label'), subText: values.sortBy.label});

    setActiveFilters(chips);
  };

  const handleRemoveFilter = (key: string) => {
    const next = {...criteria} as any;

    if (key === 'createdDate' || key === 'otDate') next[key] = new Date();
    else if (key === 'sortBy') next.sortBy = null;
    else next[key] = null;

    setCriteria(next);
    setDisplayed(filterData(next));
    setActiveFilters(prev => prev.filter(c => c.key !== key));
  };

  /* ===================== APPROVE / REJECT ===================== */
  const handleApprove = async () => {
    if (!selectedRequest) return;

    const {status} = await apiHandle
      .callApi(
        User.AdminDecideOvertime(selectedRequest.user_id, selectedRequest.ot_id),
        {status: 'approved'},
      )
      .asPromise();

    if (!status.isError) Toast.show({type: 'success', text1: t('approved')});
    setShowDetailModal(false);
    loadOT();
  };

  const handleReject = async () => {
    if (!selectedRequest) return;

    const {status} = await apiHandle
      .callApi(
        User.AdminDecideOvertime(selectedRequest.user_id, selectedRequest.ot_id),
        {status: 'rejected'},
      )
      .asPromise();

    if (!status.isError) Toast.show({type: 'success', text1: t('rejected')});
    setShowDetailModal(false);
    loadOT();
  };

  if (loading || !theme || !lang) return null;

  /* ===================== UI ===================== */
  return (
    <SafeAreaView style={{flex: 1, backgroundColor: theme.colors.background}}>
      <HeaderBar title={t('otRequestTitle')} isShowBackButton />

      <ScrollView
        contentContainerStyle={{paddingHorizontal: 16, paddingTop: 20, paddingBottom: 24}}
        showsVerticalScrollIndicator={false}>
        <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12}}>
          <Text style={{fontSize: 16, fontWeight: '600', color: theme.colors.text}}>
            { 'Danh sách phiếu OT'}
          </Text>
          <FilterIcon width={22} height={22} onPress={() => setShowFilter(true)} />
        </View>

        {activeFilters.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{gap: 10, marginBottom: 12}}>
            {activeFilters.map(f => (
              <FilterChip key={f.key} mainText={f.mainText} subText={f.subText} theme={theme} onRemove={() => handleRemoveFilter(f.key)} />
            ))}
          </ScrollView>
        )}

        <View style={{gap: 12}}>
          {displayed.map((r, i) => (
            <OTRequest key={i} {...r} onPress={() => { setSelectedRequest(r); setShowDetailModal(true); }} />
          ))}
        </View>
      </ScrollView>

      <OTRequestFilterModal
        visible={showFilter}
        onClose={() => setShowFilter(false)}
        onApplyFilters={applyFilter}
      />

      <OTRequestDetailModal
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
