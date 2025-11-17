import React, {useState} from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
} from 'react-native';
import {useUIFactory} from '../../ui/factory/useUIFactory';
import Header2 from '../../components/common/Header2';
import StatusToggleButtons, {
  StatusType,
} from '../../components/common/StatusToggleButtons';
import OTRecord from '../../components/list_items/employe-list-items/OTRecord';
import OTRecordAddModal from '../../components/modals/add-modals/OTRecordAddModal';

// Fake data for demonstration
const fakeOTRecords = [
  {
    id: '1',
    date: new Date('2025-10-15'),
    startTime: '08:00 PM',
    otHours: '02:00',
    status: 'approved' as const,
    approvalDate: '16-10-2025',
    approverName: 'Nguyễn Văn A',
    approverAvatar: 'https://i.pravatar.cc/150?img=1',
  },
  {
    id: '2',
    date: new Date('2025-10-16'),
    startTime: '06:00 PM',
    otHours: '03:00',
    status: 'pending' as const,
  },
  {
    id: '3',
    date: new Date('2025-10-17'),
    startTime: '07:00 PM',
    otHours: '01:30',
    status: 'rejected' as const,
    approvalDate: '18-10-2025',
    approverName: 'Trần Thị B',
    approverAvatar: 'https://i.pravatar.cc/150?img=2',
  },
  {
    id: '4',
    date: new Date('2025-10-18'),
    startTime: '08:30 PM',
    otHours: '02:30',
    status: 'approved' as const,
    approvalDate: '19-10-2025',
    approverName: 'Lê Văn C',
    approverAvatar: 'https://i.pravatar.cc/150?img=3',
  },
  {
    id: '5',
    date: new Date('2025-10-19'),
    startTime: '09:00 PM',
    otHours: '01:00',
    status: 'pending' as const,
  },
  {
    id: '6',
    date: new Date('2025-10-20'),
    startTime: '07:30 PM',
    otHours: '02:00',
    status: 'approved' as const,
    approvalDate: '21-10-2025',
    approverName: 'Phạm Thị D',
    approverAvatar: 'https://i.pravatar.cc/150?img=4',
  },
  {
    id: '7',
    date: new Date('2025-10-21'),
    startTime: '06:30 PM',
    otHours: '01:30',
    status: 'approved' as const,
    approvalDate: '22-10-2025',
    approverName: 'Đặng Văn E',
    approverAvatar: 'https://i.pravatar.cc/150?img=5',
  },
];

const OTRecordScreen: React.FC = () => {
  const {loading, theme, lang} = useUIFactory();
  const [selectedStatus, setSelectedStatus] = useState<StatusType>('pending');
  const [showAddModal, setShowAddModal] = useState(false);

  if (loading || !theme || !lang) {
    return null;
  }

  // Filter records based on selected status
  const filteredRecords = fakeOTRecords.filter(
    record => record.status === selectedStatus,
  );

  const handleCreateOTRequest = () => {
    setShowAddModal(true);
  };

  const handleAddOTRecord = (data: {
    date: Date;
    startTime: Date;
    hours: string;
    reason: string;
  }) => {
    // TODO: Add logic to save the new OT record
    console.log('New OT Record:', data);
  };

  return (
    <SafeAreaView
      style={{flex: 1, backgroundColor: theme.colors.lightGrayBackground}}>
      <Header2 title={lang.t('otRecordTitle')} theme={theme} />

      {/* Scrollable Content */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* OT Summary */}
        <View
          style={[
            styles.summaryContainer,
            {
              backgroundColor: theme.colors.background,
              borderColor: theme.colors.borderLight,
              shadowColor: theme.colors.text,
            },
          ]}>
          {/* Header Row */}
          <View style={styles.headerRow}>
            <Text style={[styles.headerTitle, {color: theme.colors.text}]}>
              {lang.t('overtimeHours')}
            </Text>
            <TouchableOpacity
              style={[
                styles.createButton,
                {backgroundColor: theme.colors.addButton},
              ]}
              onPress={handleCreateOTRequest}
              activeOpacity={0.8}>
              <Text style={styles.createButtonText}>
                {lang.t('createOvertimeRequest')}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Statistics Row */}
          <View style={styles.statsRow}>
            {/* This Month */}
            <View
              style={[
                styles.statBox,
                {
                  backgroundColor: theme.colors.lightGrayBackground,
                  borderColor: theme.colors.borderLight,
                },
              ]}>
              <Text style={[styles.statLabel, {color: theme.colors.mutedText}]}>
                {lang.t('thisMonth')}
              </Text>
              <Text style={[styles.statValue, {color: theme.colors.text}]}>
                12
              </Text>
            </View>

            {/* This Year */}
            <View
              style={[
                styles.statBox,
                {
                  backgroundColor: theme.colors.lightGrayBackground,
                  borderColor: theme.colors.borderLight,
                },
              ]}>
              <Text style={[styles.statLabel, {color: theme.colors.mutedText}]}>
                {lang.t('thisYear')}
              </Text>
              <Text style={[styles.statValue, {color: theme.colors.text}]}>
                145
              </Text>
            </View>
          </View>
        </View>

        {/* Status Toggle Buttons */}
        <View style={styles.toggleContainer}>
          <StatusToggleButtons
            selectedStatus={selectedStatus}
            onStatusChange={setSelectedStatus}
          />
        </View>

        {/* OT Records List */}
        {filteredRecords.map(record => (
          <OTRecord
            key={record.id}
            date={record.date}
            startTime={record.startTime}
            otHours={record.otHours}
            status={record.status}
            approvalDate={record.approvalDate}
            approverName={record.approverName}
            approverAvatar={record.approverAvatar}
          />
        ))}
      </ScrollView>

      {/* Add OT Record Modal */}
      <OTRecordAddModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddOTRecord}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
    gap: 16,
  },
  summaryContainer: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  createButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statBox: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
  },
  statLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
  },
  toggleContainer: {
    paddingVertical: 0,
  },
});

export default OTRecordScreen;
