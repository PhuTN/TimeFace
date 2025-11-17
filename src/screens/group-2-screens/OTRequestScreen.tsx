import {View, ScrollView, SafeAreaView, Text, Switch} from 'react-native';
import {useState} from 'react';
import {useUIFactory} from '../../ui/factory/useUIFactory';
import {useFilterSystem} from '../../hooks/useFilterSystem';
import FilterBar from '../../components/common/FilterBar';
import OTRequestFilterModal, {
  OTRequestFilters,
} from '../../components/modals/filter-modals/OTRequestFilterModal';
import OTRequest from '../../components/list_items/OTRequest';
import Header2 from '../../components/common/Header2';
import OTRequestDetailModal, {
  OTRequestDetail,
} from '../../components/modals/detail-modals/OTRequestDetailModal';

export default function OTRequestScreen() {
  const {loading, theme, lang} = useUIFactory();
  const {
    activeFilters,
    isModalVisible,
    openModal,
    closeModal,
    applyFilters,
    removeFilter,
  } = useFilterSystem<OTRequestFilters>();

  const [selectedRequest, setSelectedRequest] =
    useState<OTRequestDetail | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  console.log('OTRequestScreen - isModalVisible:', isModalVisible);

  if (loading || !theme || !lang) {
    return null;
  }

  // Enhanced mock data with full details
  const mockRequests: OTRequestDetail[] = [
    {
      avatarSource: require('../../assets/images/examples/avatar1.png'),
      name: 'Nguyễn Văn A',
      position: 'Developer',
      department: 'Phòng IT',
      status: 'approved',
      code: 'OT-001',
      date: '12/10/2024',
      time: '18:00 - 20:00',
      hours: 2,
      reason:
        'Làm thêm giờ để hoàn thành dự án trước deadline. Cần deploy hệ thống production.',
      createdAt: '10/10/2024',
      approver: {
        name: 'Lê Văn D',
        date: '11/10/2024',
      },
    },
    {
      avatarSource: require('../../assets/images/examples/avatar2.png'),
      name: 'Trần Thị B',
      position: 'Designer',
      department: 'Phòng Thiết Kế',
      status: 'pending',
      code: 'OT-002',
      date: '15/10/2024',
      time: '19:00 - 21:00',
      hours: 2,
      reason: 'Hoàn thiện design cho campaign mới của khách hàng.',
      createdAt: '13/10/2024',
    },
    {
      avatarSource: require('../../assets/images/examples/avatar3.png'),
      name: 'Lê Văn C',
      position: 'Manager',
      department: 'Phòng Quản Lý',
      status: 'rejected',
      code: 'OT-003',
      date: '18/10/2024',
      time: '17:00 - 19:00',
      hours: 2,
      reason: 'Họp với đối tác nước ngoài.',
      createdAt: '16/10/2024',
    },
  ];

  const handleRequestPress = (request: OTRequestDetail) => {
    setSelectedRequest(request);
    setShowDetailModal(true);
  };

  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
    setSelectedRequest(null);
  };

  const handleApprove = () => {
    console.log('Approving OT request:', selectedRequest?.code);
    // TODO: Add API call to approve request
  };

  const handleReject = () => {
    console.log('Rejecting OT request:', selectedRequest?.code);
    // TODO: Add API call to reject request
  };

  const handleApplyFilters = (filters: OTRequestFilters) => {
    // Format filters into FilterChipData
    const formattedFilters = [];

    if (filters.ticketCode) {
      formattedFilters.push({
        id: 'ticketCode',
        label: lang.t('id_form_label'),
        subLabel: filters.ticketCode,
        value: 'ticketCode',
      });
    }

    if (filters.employeeName) {
      formattedFilters.push({
        id: 'employeeName',
        label: lang.t('employee_name_label'),
        subLabel: filters.employeeName,
        value: 'employeeName',
      });
    }

    if (filters.positionName) {
      formattedFilters.push({
        id: 'positionName',
        label: lang.t('position_name_label'),
        subLabel: filters.positionName,
        value: 'positionName',
      });
    }

    if (filters.department && filters.department.value !== 'all') {
      formattedFilters.push({
        id: 'department',
        label: lang.t('department_label'),
        subLabel: filters.department.label,
        value: 'department',
      });
    }

    if (filters.approvalStatus && filters.approvalStatus.value !== 'all') {
      formattedFilters.push({
        id: 'approvalStatus',
        label: lang.t('approval_status_label'),
        subLabel: filters.approvalStatus.label,
        value: 'approvalStatus',
      });
    }

    if (filters.createdDate) {
      const dateStr = filters.createdDate.toLocaleDateString('vi-VN');
      formattedFilters.push({
        id: 'createdDate',
        label: lang.t('created_date_label'),
        subLabel: dateStr,
        value: 'createdDate',
      });
    }

    if (filters.otDate) {
      const dateStr = filters.otDate.toLocaleDateString('vi-VN');
      formattedFilters.push({
        id: 'otDate',
        label: lang.t('otDate'),
        subLabel: dateStr,
        value: 'otDate',
      });
    }

    if (filters.sortBy && filters.sortBy.value !== 'default') {
      formattedFilters.push({
        id: 'sortBy',
        label: lang.t('sort_by_label'),
        subLabel: filters.sortBy.label,
        value: 'sortBy',
      });
    }

    applyFilters(filters, formattedFilters);
  };

  const isDark = theme.name === 'dark';
  const isEnglish = lang.code === 'en';

  return (
    <SafeAreaView
      style={{flex: 1, backgroundColor: theme.colors.background}}>
      <Header2 title={lang.t('otRequestTitle')} theme={theme} />

      <ScrollView
        contentContainerStyle={{
          padding: 16,
          gap: 12,
        }}
        showsVerticalScrollIndicator={false}>
        <FilterBar
          title={lang.t('recentOTDate')}
          onFilterPress={openModal}
          theme={theme}
          activeFilters={activeFilters}
          onRemoveFilter={removeFilter}
        />

        {/* Request List */}
        <View style={{gap: 12, marginTop: 8}}>
          {mockRequests.map((request, index) => (
            <OTRequest
              key={index}
              avatarSource={request.avatarSource}
              name={request.name}
              position={request.position}
              status={request.status}
              code={request.code}
              date={request.date}
              time={request.time}
              createdAt={request.createdAt}
              onPress={() => handleRequestPress(request)}
            />
          ))}
        </View>
      </ScrollView>

      <OTRequestFilterModal
        visible={isModalVisible}
        onClose={closeModal}
        onApplyFilters={handleApplyFilters}
      />

      <OTRequestDetailModal
        visible={showDetailModal}
        onClose={handleCloseDetailModal}
        request={selectedRequest}
        theme={theme}
        lang={lang}
        isAdmin={true}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </SafeAreaView>
  );
}
