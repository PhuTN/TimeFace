import {View, ScrollView, SafeAreaView, Text, Switch} from 'react-native';
import {useState} from 'react';
import {useUIFactory} from '../../ui/factory/useUIFactory';
import {useFilterSystem} from '../../hooks/useFilterSystem';
import FilterBar from '../../components/common/FilterBar';
import ICRequestFilterModal, {
  ICRequestFilters,
} from '../../components/modals/filter-modals/ICRequestFilterModal';
import ChangeInfoRequest from '../../components/list_items/ICRequest';
import Header2 from '../../components/common/Header2';
import ICRequestDetailModal, {
  ICRequestDetail,
} from '../../components/modals/detail-modals/ICRequestDetailModal';

export default function ICRequestScreen() {
  const {loading, theme, lang} = useUIFactory();
  const {
    activeFilters,
    isModalVisible,
    openModal,
    closeModal,
    applyFilters,
    removeFilter,
  } = useFilterSystem<ICRequestFilters>();

  const [selectedRequest, setSelectedRequest] =
    useState<ICRequestDetail | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  console.log('ICRequestsScreen - isModalVisible:', isModalVisible);

  if (loading || !theme || !lang) {
    return null;
  }

  // Mock data - replace with actual data
  const mockRequests: ICRequestDetail[] = [
    {
      id: '1',
      avatarSource: require('../../assets/images/examples/avatar1.png'),
      name: 'Nguyễn Văn A',
      position: 'Developer',
      status: 'approved' as const,
      date: '12/10/2024',
      department: 'IT Department',
      requestCode: 'IC-001',
      changedFields: [
        {
          label: 'Số điện thoại',
          oldValue: '0123456789',
          newValue: '0987654321',
        },
        {
          label: 'Email',
          oldValue: 'old@email.com',
          newValue: 'new@email.com',
        },
      ],
      approver: {
        name: 'Trần Văn B',
        date: '13/10/2024',
      },
    },
    {
      id: '2',
      avatarSource: require('../../assets/images/examples/avatar2.png'),
      name: 'Trần Thị B',
      position: 'Designer',
      status: 'pending' as const,
      date: '15/10/2024',
      department: 'Design Department',
      requestCode: 'IC-002',
      changedFields: [
        {
          label: 'Địa chỉ',
          oldValue: '123 Đường ABC',
          newValue: '456 Đường XYZ',
        },
      ],
    },
    {
      id: '3',
      avatarSource: require('../../assets/images/examples/avatar3.png'),
      name: 'Lê Văn C',
      position: 'Manager',
      status: 'rejected' as const,
      date: '18/10/2024',
      department: 'Management',
      requestCode: 'IC-003',
      changedFields: [
        {
          label: 'Chức vụ',
          oldValue: 'Team Leader',
          newValue: 'Manager',
        },
      ],
    },
  ];

  const handleApplyFilters = (filters: ICRequestFilters) => {
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

    if (filters.changeDate) {
      const dateStr = filters.changeDate.toLocaleDateString('vi-VN');
      formattedFilters.push({
        id: 'changeDate',
        label: lang.t('created_date_label'),
        subLabel: dateStr,
        value: 'changeDate',
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

  const handleRequestPress = (request: ICRequestDetail) => {
    setSelectedRequest(request);
    setShowDetailModal(true);
  };

  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
    setSelectedRequest(null);
  };

  const handleApprove = (requestId: string) => {
    // TODO: Implement approve logic
    console.log('Approve request:', requestId);
  };

  const handleReject = (requestId: string) => {
    // TODO: Implement reject logic
    console.log('Reject request:', requestId);
  };

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: theme.colors.background}}>
      <Header2 title={lang.t('icRequestTitle')} theme={theme} />

      <ScrollView
        contentContainerStyle={{
          padding: 16,
          gap: 12,
        }}
        showsVerticalScrollIndicator={false}>
        <FilterBar
          title={lang.t('recentChangeDate')}
          onFilterPress={openModal}
          theme={theme}
          activeFilters={activeFilters}
          onRemoveFilter={removeFilter}
        />

        {/* Request List */}
        <View style={{gap: 12, marginTop: 8}}>
          {mockRequests.map(request => (
            <ChangeInfoRequest
              key={request.id}
              avatarSource={request.avatarSource}
              name={request.name}
              position={request.position}
              status={request.status}
              date={request.date}
              onPress={() => handleRequestPress(request)}
            />
          ))}
        </View>
      </ScrollView>

      <ICRequestFilterModal
        visible={isModalVisible}
        onClose={closeModal}
        onApplyFilters={handleApplyFilters}
      />

      <ICRequestDetailModal
        visible={showDetailModal}
        onClose={handleCloseDetailModal}
        request={selectedRequest}
        theme={theme}
        lang={lang}
        onApprove={handleApprove}
        onReject={handleReject}
        isAdmin={true}
      />
    </SafeAreaView>
  );
}
