import React, {useEffect, useState} from 'react';
import {SafeAreaView, ScrollView, View, Text} from 'react-native';
import {useUIFactory} from '../../ui/factory/useUIFactory';

import HeaderBar from '../../components/common/HeaderBar';
import FilterIcon from '../../assets/icons/filter_icon.svg';
import FilterChip from '../../components/common/FilterChip';

import ComplaintRequest from '../../components/list_items/ComplaintRequest';
import ComplaintRequestDetailModal from '../../components/modals/detail-modals/ComplaintRequestDetailModal';
import CheckinComplaintFilterModal, {
  CheckinComplaintFilters,
} from '../../components/modals/filter-modals/CheckinComplaintFilterModal';

import {User} from '../../api/endpoint/User';
import {apiHandle} from '../../api/apihandle';
import Toast from 'react-native-toast-message';

/* ===== FILTER MẶC ĐỊNH ===== */
const DEFAULT_FILTERS: CheckinComplaintFilters = {
  employeeName: '',
  type: {label: 'Tất cả', value: 'all'},
  status: {label: 'Chờ duyệt', value: 'pending'},
};

export default function ComplaintRequestScreen() {
  const {loading, theme, lang} = useUIFactory();

  const [raw, setRaw] = useState<any[]>([]);
  const [displayed, setDisplayed] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);

  const [showFilter, setShowFilter] = useState(false);
  const [showDetail, setShowDetail] = useState(false);

  // ✅ KHÔNG để null nữa
  const [activeFilters, setActiveFilters] =
    useState<CheckinComplaintFilters>(DEFAULT_FILTERS);

  /* ================= LOAD ================= */
  const loadData = async () => {
    const {status, res} = await apiHandle
      .callApi(User.AdminGetAllCheckinComplaints)
      .asPromise();

    if (status.isError) return;

    const list = (res?.data?.checkin_complaints ?? []).map((item: any) => ({
      user_id: item.user.user_id,
      complaint_id: item.complaint.complaint_id,

      avatarSource: item.user.avatar
        ? {uri: item.user.avatar}
        : {uri: 'https://cdn-icons-png.freepik.com/512/6858/6858504.png'},

      name: item.user.full_name,
      department: item.user.department?.name ?? '—',

      action: item.complaint.action,
      date: item.complaint.date,
      time: item.complaint.time,

      reason: item.complaint.reason,
      status: item.complaint.status,

      evidenceImages: item.complaint.evidence_images,
    }));

    setRaw(list); // ❗ CHỈ SET RAW
  };

  /* ===== APPLY FILTER SAU KHI RAW CÓ DATA ===== */
  useEffect(() => {
    if (raw.length > 0) {
      applyFilter(activeFilters);
    }
  }, [raw]);

  useEffect(() => {
    loadData();
  }, []);

  /* ================= FILTER ================= */
  const applyFilter = (filters: CheckinComplaintFilters) => {
    let next = [...raw];

    if (filters.employeeName) {
      next = next.filter(i =>
        i.name.toLowerCase().includes(filters.employeeName.toLowerCase()),
      );
    }

    if (filters.type?.value !== 'all') {
      next = next.filter(i => i.action === filters.type.value);
    }

    if (filters.status?.value !== 'all') {
      next = next.filter(i => i.status === filters.status.value);
    }

    setDisplayed(next);
    setActiveFilters(filters);
  };

  /* ================= DECIDE ================= */
  const decide = async (status: 'approved' | 'rejected') => {
    if (!selected) return;

    await apiHandle
      .callApi(
        User.AdminDecideCheckinComplaint(
          selected.user_id,
          selected.complaint_id,
        ),
        {status},
      )
      .asPromise();

    Toast.show({type: 'success', text1: 'Đã xử lý'});
    setShowDetail(false);
    loadData();
  };

  if (loading || !theme || !lang) return null;

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: theme.colors.background}}>
      <HeaderBar title="Khiếu nại chấm công" isShowBackButton />

      <ScrollView contentContainerStyle={{padding: 16}}>
        {/* HEADER */}
        <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
          <Text style={{fontSize: 16, fontWeight: '600'}}>
            Danh sách khiếu nại
          </Text>
          <FilterIcon
            width={22}
            height={22}
            onPress={() => setShowFilter(true)}
          />
        </View>

        {/* FILTER CHIPS */}
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 10,
            marginTop: 12,
          }}>
          {activeFilters.status.value !== 'all' && (
            <FilterChip
              mainText="Trạng thái"
              subText="Chờ duyệt"
              theme={theme}
              onRemove={() =>
                applyFilter({
                  ...activeFilters,
                  status: {label: 'Tất cả', value: 'all'},
                })
              }
            />
          )}
        </View>

        {/* LIST */}
        <View style={{gap: 12, marginTop: 14}}>
          {displayed.map(i => (
            <ComplaintRequest
              key={i.complaint_id}
              {...i}
              onPress={() => {
                setSelected(i);
                setShowDetail(true);
              }}
            />
          ))}
        </View>
      </ScrollView>

      <CheckinComplaintFilterModal
        visible={showFilter}
        onClose={() => setShowFilter(false)}
        onApplyFilters={applyFilter}
      />

      <ComplaintRequestDetailModal
        visible={showDetail}
        onClose={() => setShowDetail(false)}
        request={selected}
        theme={theme}
        lang={lang}
        isAdmin
        onApprove={() => decide('approved')}
        onReject={() => decide('rejected')}
      />
    </SafeAreaView>
  );
}
