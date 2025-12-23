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

export default function ComplaintRequestScreen() {
  const {loading, theme, lang} = useUIFactory();
  const t = lang?.t;

  const [raw, setRaw] = useState<any[]>([]);
  const [displayed, setDisplayed] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);

  const [showFilter, setShowFilter] = useState(false);
  const [showDetail, setShowDetail] = useState(false);

  const [criteria, setCriteria] = useState<CheckinComplaintFilters>({
    employeeName: '',
    department: null,
    type: null,
    status: null,
    createdDate: null,
    sortBy: null,
  });

  const [activeFilters, setActiveFilters] = useState<
    {key: string; mainText: string; subText: string}[]
  >([]);

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

    setRaw(list);
    setDisplayed(list);
  };

  useEffect(() => {
    loadData();
  }, []);

  /* ===================== FILTER CORE ===================== */
  const filterData = (values: CheckinComplaintFilters) => {
    let next = [...raw];

    if (values.employeeName) {
      next = next.filter(i =>
        i.name.toLowerCase().includes(values.employeeName.toLowerCase()),
      );
    }

    if (values.department && values.department.value !== 'all') {
      next = next.filter(i => i.department === values.department!.label);
    }

    if (values.type && values.type.value !== 'all') {
      next = next.filter(i => i.action === values.type!.value);
    }

    if (values.status && values.status.value !== 'all') {
      next = next.filter(i => i.status === values.status!.value);
    }

    if (values.createdDate) {
      const filterDate = values.createdDate.toLocaleDateString('vi-VN');
      next = next.filter(i => {
        const itemDate = new Date(i.date).toLocaleDateString('vi-VN');
        return itemDate === filterDate;
      });
    }

    // Apply sorting
    if (values.sortBy?.value) {
      next.sort((a, b) => {
        const aTime = new Date(a.date).getTime();
        const bTime = new Date(b.date).getTime();
        return values.sortBy!.value === 'newest' ? bTime - aTime : aTime - bTime;
      });
    }

    return next;
  };

  /* ===================== APPLY FILTER ===================== */
  const applyFilter = (values: CheckinComplaintFilters) => {
    setCriteria(values);
    setDisplayed(filterData(values));

    const chips: {key: string; mainText: string; subText: string}[] = [];

    if (values.employeeName)
      chips.push({
        key: 'employeeName',
        mainText: 'Tên nhân viên',
        subText: values.employeeName,
      });

    if (values.department && values.department.value !== 'all')
      chips.push({
        key: 'department',
        mainText: 'Phòng ban',
        subText: values.department.label,
      });

    if (values.type && values.type.value !== 'all')
      chips.push({
        key: 'type',
        mainText: 'Loại',
        subText: values.type.label,
      });

    if (values.status && values.status.value !== 'all')
      chips.push({
        key: 'status',
        mainText: 'Trạng thái',
        subText: values.status.label,
      });

    if (values.createdDate)
      chips.push({
        key: 'createdDate',
        mainText: 'Ngày tạo',
        subText: values.createdDate.toLocaleDateString('vi-VN'),
      });

    if (values.sortBy)
      chips.push({
        key: 'sortBy',
        mainText: 'Sắp xếp',
        subText: values.sortBy.label,
      });

    setActiveFilters(chips);
  };

  const handleRemoveFilter = (key: string) => {
    const next = {...criteria} as any;

    if (key === 'createdDate') next[key] = null;
    else if (key === 'sortBy') next.sortBy = null;
    else next[key] = null;

    setCriteria(next);
    setDisplayed(filterData(next));
    setActiveFilters(prev => prev.filter(c => c.key !== key));
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
        {activeFilters.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{marginTop: 12}}
            contentContainerStyle={{gap: 8}}>
            {activeFilters.map(f => (
              <FilterChip
                key={f.key}
                mainText={f.mainText}
                subText={f.subText}
                theme={theme}
                onRemove={() => handleRemoveFilter(f.key)}
              />
            ))}
          </ScrollView>
        )}

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