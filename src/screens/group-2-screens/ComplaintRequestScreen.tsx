import {useEffect, useMemo, useState} from 'react';
import {SafeAreaView, ScrollView, Text, View, TouchableOpacity} from 'react-native';
import {useUIFactory} from '../../ui/factory/useUIFactory';

import HeaderBar from '../../components/common/HeaderBar';

import ComplaintRequest from '../../components/list_items/ComplaintRequest';
import ComplaintRequestDetailModal from '../../components/modals/detail-modals/ComplaintRequestDetailModal';
import {CheckinComplaintFilters} from '../../components/modals/filter-modals/CheckinComplaintFilterModal';

import {apiHandle} from '../../api/apihandle';
import {User} from '../../api/endpoint/user';
import {authStorage} from '../../services/authStorage';
import Toast from 'react-native-toast-message';

/* ===== FILTER MẶC ĐỊNH (base) ===== */
const BASE_FILTERS: CheckinComplaintFilters = {
  employeeName: '',
  department: {value: 'all', label: 'Tất cả'},
  status: {label: 'Tất cả', value: 'all'},
  type: {label: 'Tất cả', value: 'all'},
  createdDate: new Date(),
  sortBy: {label: 'Mới nhất', value: 'newest'},
};

export default function ComplaintRequestScreen({route}: any) {
  const {loading, theme, lang} = useUIFactory();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const stored = await authStorage.load();
        const role = stored?.user?.role ?? 'user';
        setIsAdmin(role === 'admin');
      } catch {
        setIsAdmin(false);
      }
    })();
  }, []);

  const forcedMode = route?.params?.mode;
  const isUserMode =
    forcedMode === 'user' ? true : forcedMode === 'admin' ? false : isAdmin === false;

  const defaultFilters: CheckinComplaintFilters = useMemo(() => {
    return {...BASE_FILTERS};
  }, [isUserMode]);

  const [raw, setRaw] = useState<any[]>([]);
  const [displayed, setDisplayed] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);

  const [showDetail, setShowDetail] = useState(false);

  const [activeFilters, setActiveFilters] =
    useState<CheckinComplaintFilters | null>(null);

  const statusOptions = [
    {value: 'all', label: 'Tất cả'},
    {value: 'pending', label: 'Đang chờ'},
    {value: 'approved', label: 'Đã duyệt'},
    {value: 'rejected', label: 'Từ chối'},
  ];

  const typeOptions = [
    {value: 'all', label: 'Tất cả'},
    {value: 'check_in', label: 'Check-in'},
    {value: 'check_out', label: 'Check-out'},
  ];

  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  useEffect(() => {
    if (isAdmin !== null) {
      setActiveFilters(defaultFilters);
      setStatusFilter(defaultFilters.status?.value || 'all');
      setTypeFilter(defaultFilters.type?.value || 'all');
    }
  }, [defaultFilters, isAdmin]);

  /* ================= LOAD ================= */
  const loadData = async () => {
    try {
      const endpoint = isUserMode
        ? User.GetMyCheckinComplaints
        : User.AdminGetAllCheckinComplaints;

      const {status, res} = await apiHandle.callApi(endpoint).asPromise();

      const rawList =
        res?.data?.checkin_complaints ??
        res?.data?.complaints ??
        res?.data?.requests ??
        res?.checkin_complaints ??
        res?.complaints ??
        res?.requests ??
        res?.data ??
        [];

      const safeList = Array.isArray(rawList) ? rawList : [];

      const list = safeList.map((item: any) => {
        const complaint = item.complaint ?? item;
        const user = item.user ?? complaint.user ?? {};
        const approver = complaint.approver ?? {};

        const avatar =
          user.avatar ??
          complaint.avatar ??
          'https://cdn-icons-png.freepik.com/512/6858/6858504.png';

        return {
          user_id: user.user_id || user._id || complaint.user_id || '',
          complaint_id:
            complaint.complaint_id ||
            complaint._id ||
            complaint.id ||
            complaint.request_id ||
            '',

          avatarSource: {uri: avatar},

          // nếu không có tên thì để rỗng, không fallback "Bạn"
          name: user.full_name || '',
          department: user.department?.name ?? '',

          action: complaint.action ?? complaint.type ?? 'check_in',
          date:
            complaint.date ||
            (complaint.createdAt
              ? complaint.createdAt.slice(0, 10)
              : complaint.created_date) ||
            '',
          time: complaint.time ?? complaint.actual_time ?? '--:--',

          reason: complaint.reason ?? complaint.note ?? '',
          status: complaint.status ?? 'pending',

          evidenceImages: complaint.evidence_images ?? complaint.images ?? [],
          approver: complaint.approver,
          approverName:
            approver?.full_name ||
            approver?.name ||
            approver?.display_name ||
            complaint.approver_name ||
            complaint.approver_full_name ||
            '',
        };
      });

      list.sort((a, b) => +new Date(b.date) - +new Date(a.date));

      setRaw(list); // ❗ CHỈ SET RAW
      if (isUserMode) {
        setDisplayed(list);
        setActiveFilters(defaultFilters);
      }
    } catch (e: any) {
      console.log('ComplaintRequest load error', e?.message || e);
    }
  };

  /* ===== APPLY FILTER SAU KHI RAW CÓ DATA ===== */
  useEffect(() => {
    if (raw.length > 0 && activeFilters) {
      applyFilter(activeFilters);
    }
  }, [raw, activeFilters]);

  useEffect(() => {
    loadData();
  }, [isUserMode]);

  /* ================= FILTER ================= */
  const applyFilter = (filters: CheckinComplaintFilters) => {
    if (!filters) return;

    let next = [...raw];

    if (filters.employeeName) {
      next = next.filter(i =>
        i.name.toLowerCase().includes(filters.employeeName.toLowerCase()),
      );
    }

    const typeValue = typeFilter || filters?.type?.value || 'all';
    const statusValue = statusFilter || filters?.status?.value || 'all';

    if (typeValue !== 'all') {
      next = next.filter(i => i.action === typeValue);
    }

    if (statusValue !== 'all') {
      next = next.filter(i => i.status === statusValue);
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

  if (loading || !theme || !lang || isAdmin === null || !activeFilters)
    return null;

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: theme.colors.background}}>
      <HeaderBar title="Khiếu nại chấm công" isShowBackButton />

      <ScrollView contentContainerStyle={{padding: 16}}>
        {/* HEADER */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 8,
          }}>
          <Text style={{fontSize: 16, fontWeight: '700', color: '#1F2937'}}>
            Danh sách khiếu nại
          </Text>
        </View>

        {/* QUICK FILTERS */}
        <View
          style={{
            marginTop: 20,
            padding: 14,
            borderRadius: 14,
            backgroundColor: '#F7F9FC',
            borderWidth: 1,
            borderColor: '#E5E7EB',
            gap: 10,
          }}>
          <Text style={{fontSize: 14, fontWeight: '700', color: '#1F2937'}}>
            Bộ lọc nhanh
          </Text>

          <Text style={{fontSize: 13, color: '#6B7280', marginBottom: 6}}>
            Trạng thái
          </Text>
          <View style={{flexDirection: 'row', flexWrap: 'wrap', gap: 8}}>
            {statusOptions.map(opt => (
              <TouchableOpacity
                key={opt.value}
                onPress={() => {
                  setStatusFilter(opt.value);
                  applyFilter({
                    ...(activeFilters || defaultFilters),
                    status: {value: opt.value, label: opt.label},
                  });
                }}
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  borderRadius: 999,
                  borderWidth: 1,
                  borderColor:
                    statusFilter === opt.value ? '#2563EB' : '#E5E7EB',
                  backgroundColor:
                    statusFilter === opt.value ? '#EFF6FF' : '#FFFFFF',
                }}>
                <Text
                  style={{
                    color: statusFilter === opt.value ? '#1D4ED8' : '#374151',
                    fontWeight: '600',
                  }}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text
            style={{
              fontSize: 13,
              color: '#6B7280',
              marginTop: 12,
              marginBottom: 6,
            }}>
            Loại
          </Text>
          <View style={{flexDirection: 'row', flexWrap: 'wrap', gap: 8}}>
            {typeOptions.map(opt => (
              <TouchableOpacity
                key={opt.value}
                onPress={() => {
                  setTypeFilter(opt.value);
                  applyFilter({
                    ...(activeFilters || defaultFilters),
                    type: {value: opt.value, label: opt.label},
                  });
                }}
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  borderRadius: 999,
                  borderWidth: 1,
                  borderColor:
                    typeFilter === opt.value ? '#2563EB' : '#E5E7EB',
                  backgroundColor:
                    typeFilter === opt.value ? '#EFF6FF' : '#FFFFFF',
                }}>
                <Text
                  style={{
                    color: typeFilter === opt.value ? '#1D4ED8' : '#374151',
                    fontWeight: '600',
                  }}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* LIST */}
        <View style={{gap: 12, marginTop: 18}}>
          {displayed.map(i => (
            <ComplaintRequest
              key={i.complaint_id}
              {...i}
              showAvatar={!isUserMode}
              showTime={isUserMode}
              onPress={() => {
                setSelected(i);
                setShowDetail(true);
              }}
            />
          ))}
        </View>
      </ScrollView>

      <ComplaintRequestDetailModal
        visible={showDetail}
        onClose={() => setShowDetail(false)}
        request={selected}
        theme={theme}
        lang={lang}
        isAdmin={!isUserMode}
        onApprove={!isUserMode ? () => decide('approved') : undefined}
        onReject={!isUserMode ? () => decide('rejected') : undefined}
      />
    </SafeAreaView>
  );
}
