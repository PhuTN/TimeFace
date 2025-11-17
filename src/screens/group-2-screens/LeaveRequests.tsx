import {View, ScrollView, SafeAreaView, Text, Switch} from 'react-native';
import {useUIFactory} from '../../ui/factory/useUIFactory';
import {useFilterSystem} from '../../hooks/useFilterSystem';
import {useState} from 'react';
import FilterBar from '../../components/common/FilterBar';
import LeaveRequestFilterModal, {
  LeaveRequestFilters,
} from '../../components/modals/filter-modals/LeaveRequestFilterModal';
import ICRequest from '../../components/list_items/ICRequest';
import Header2 from '../../components/common/Header2';
import LeaveRequestDetailModal, {
  LeaveRequestDetail,
} from '../../components/modals/detail-modals/LeaveRequestDetailModal';

export default function LeaveRequestScreen() {
  const {loading, theme, lang} = useUIFactory();
  const {
    activeFilters,
    isModalVisible,
    openModal,
    closeModal,
    applyFilters,
    removeFilter,
  } = useFilterSystem<LeaveRequestFilters>();

  const [selectedRequest, setSelectedRequest] =
    useState<LeaveRequestDetail | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  console.log('LeaveRequestScreen - isModalVisible:', isModalVisible);

  if (loading || !theme || !lang) {
    return null;
  }

  // Enhanced mock data with full details
  const mockRequests: LeaveRequestDetail[] = [
    {
      avatarSource: require('../../assets/images/examples/avatar1.png'),
      name: 'Nguyễn Văn A',
      position: 'Developer',
      department: 'Phòng IT',
      status: 'approved',
      requestCode: 'LR-2025-001',
      startDate: '12/10/2024',
      endDate: '14/10/2024',
      numberOfDays: 3,
      reason: 'Xin nghỉ phép để tham gia đám cưới người thân tại tỉnh.',
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
      requestCode: 'LR-2025-002',
      startDate: '15/10/2024',
      endDate: '17/10/2024',
      numberOfDays: 3,
      reason: 'Xin nghỉ phép để đi du lịch cùng gia đình.',
      createdAt: '12/10/2024',
    },
    {
      avatarSource: require('../../assets/images/examples/avatar3.png'),
      name: 'Lê Văn C',
      position: 'Manager',
      department: 'Phòng Quản Lý',
      status: 'rejected',
      requestCode: 'LR-2025-003',
      startDate: '18/10/2024',
      endDate: '20/10/2024',
      numberOfDays: 3,
      reason: 'Xin nghỉ phép vì lý do cá nhân.',
      createdAt: '15/10/2024',
    },
  ];

  const handleRequestPress = (request: LeaveRequestDetail) => {
    setSelectedRequest(request);
    setShowDetailModal(true);
  };

  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
    setSelectedRequest(null);
  };

  const handleApprove = () => {
    console.log('Approving leave request:', selectedRequest?.requestCode);
    // TODO: Add API call to approve request
  };

  const handleReject = () => {
    console.log('Rejecting leave request:', selectedRequest?.requestCode);
    // TODO: Add API call to reject request
  };

  const handleApplyFilters = (filters: LeaveRequestFilters) => {
    // Format filters into FilterChipData
    const formattedFilters = [];

    if (filters.employeeName) {
      formattedFilters.push({
        id: 'employeeName',
        label: lang.t('employee_name_label'),
        subLabel: filters.employeeName,
        value: 'employeeName',
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

    if (filters.ticketCode) {
      formattedFilters.push({
        id: 'ticketCode',
        label: lang.t('id_form_label'),
        subLabel: filters.ticketCode,
        value: 'ticketCode',
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

    if (filters.startDate) {
      const dateStr = filters.startDate.toLocaleDateString('vi-VN');
      formattedFilters.push({
        id: 'startDate',
        label: lang.t('start_date_label'),
        subLabel: dateStr,
        value: 'startDate',
      });
    }

    if (filters.endDate) {
      const dateStr = filters.endDate.toLocaleDateString('vi-VN');
      formattedFilters.push({
        id: 'endDate',
        label: lang.t('end_date_label'),
        subLabel: dateStr,
        value: 'endDate',
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
      style={{flex: 1, backgroundColor: theme.colors.lightGrayBackground}}>
      <Header2 title={lang.t('leaveRequestTitle')} theme={theme} />

      <ScrollView
        contentContainerStyle={{
          padding: 16,
          paddingBottom: 24,
          gap: 16,
        }}
        showsVerticalScrollIndicator={false}>
        <FilterBar
          title={lang.t('recentCreatedDate')}
          onFilterPress={openModal}
          theme={theme}
          activeFilters={activeFilters}
          onRemoveFilter={removeFilter}
        />

        {/* Request List */}
        <View style={{gap: 12}}>
          {mockRequests.map((request, index) => (
            <ICRequest
              key={index}
              avatarSource={request.avatarSource}
              name={request.name}
              position={request.position}
              status={request.status}
              date={request.createdAt}
              onPress={() => handleRequestPress(request)}
            />
          ))}
        </View>
      </ScrollView>

      <LeaveRequestFilterModal
        visible={isModalVisible}
        onClose={closeModal}
        onApplyFilters={handleApplyFilters}
      />

      <LeaveRequestDetailModal
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
