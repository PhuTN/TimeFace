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
import LeaveRecord from '../../components/list_items/employe-list-items/LeaveRecord';
import LeaveRequestAddModal from '../../components/modals/add-modals/LeaveRequestAddModal';

// Fake data for demonstration
const fakeLeaveRecords = [
  {
    id: '1',
    date: new Date('2025-10-10'),
    leaveDates: '15/10 - 17/10',
    numberOfDays: '3',
    status: 'approved' as const,
    approvalDate: '11-10-2025',
    approverName: 'Nguyễn Văn A',
    approverAvatar: 'https://i.pravatar.cc/150?img=1',
  },
  {
    id: '2',
    date: new Date('2025-10-12'),
    leaveDates: '20/10 - 22/10',
    numberOfDays: '3',
    status: 'pending' as const,
  },
  {
    id: '3',
    date: new Date('2025-10-14'),
    leaveDates: '25/10 - 26/10',
    numberOfDays: '2',
    status: 'rejected' as const,
    approvalDate: '15-10-2025',
    approverName: 'Trần Thị B',
    approverAvatar: 'https://i.pravatar.cc/150?img=2',
  },
  {
    id: '4',
    date: new Date('2025-10-16'),
    leaveDates: '28/10 - 30/10',
    numberOfDays: '3',
    status: 'approved' as const,
    approvalDate: '17-10-2025',
    approverName: 'Lê Văn C',
    approverAvatar: 'https://i.pravatar.cc/150?img=3',
  },
  {
    id: '5',
    date: new Date('2025-10-18'),
    leaveDates: '01/11 - 01/11',
    numberOfDays: '1',
    status: 'pending' as const,
  },
  {
    id: '6',
    date: new Date('2025-10-19'),
    leaveDates: '05/11 - 07/11',
    numberOfDays: '3',
    status: 'approved' as const,
    approvalDate: '20-10-2025',
    approverName: 'Phạm Thị D',
    approverAvatar: 'https://i.pravatar.cc/150?img=4',
  },
];

// Mock data for leave summary
const mockLeaveSummary = {
  daysTaken: 2,
  remainingLeaveDays: 5,
  paidLeaveDays: 5,
};

const LeaveRecordScreen: React.FC = () => {
  const {loading, theme, lang} = useUIFactory();
  const [selectedStatus, setSelectedStatus] = useState<StatusType>('pending');
  const [showAddModal, setShowAddModal] = useState(false);

  if (loading || !theme || !lang) {
    return null;
  }

  // Filter records based on selected status
  const filteredRecords = fakeLeaveRecords.filter(
    record => record.status === selectedStatus,
  );

  const handleCreateLeaveRequest = () => {
    setShowAddModal(true);
  };

  const handleAddLeaveRequest = (data: {
    startDate: Date;
    endDate: Date;
    reason: string;
    attachedFile?: string;
  }) => {
    // TODO: Add logic to save the new leave request
    console.log('New Leave Request:', data);
  };

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: theme.colors.background}}>
      <Header2 title={lang.t('leaveRecordTitle')} theme={theme} />

      {/* Scrollable Content */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* Leave Summary */}
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
            <View>
              <Text style={[styles.headerTitle, {color: theme.colors.text}]}>
                {lang.t('leaveSummary')}
              </Text>
              <Text
                style={[
                  styles.headerSubtitle,
                  {color: theme.colors.mutedText},
                ]}>
                {lang.t('year2025')}
              </Text>
            </View>
            <TouchableOpacity
              style={[
                styles.createButton,
                {backgroundColor: theme.colors.addButton},
              ]}
              onPress={handleCreateLeaveRequest}
              activeOpacity={0.8}>
              <Text style={styles.createButtonText}>
                {lang.t('createLeaveRequest')}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Statistics - Stacked vertically */}
          <View style={styles.statsColumn}>
            {/* Days Taken */}
            <View
              style={[
                styles.statBox,
                {
                  backgroundColor: theme.colors.lightGrayBackground,
                  borderColor: theme.colors.borderLight,
                },
              ]}>
              <Text style={[styles.statLabel, {color: theme.colors.mutedText}]}>
                {lang.t('daysTaken')}
              </Text>
              <Text style={[styles.statValue, {color: theme.colors.text}]}>
                {mockLeaveSummary.daysTaken}
              </Text>
            </View>

            {/* Remaining Leave Days */}
            <View
              style={[
                styles.statBox,
                {
                  backgroundColor: theme.colors.lightGrayBackground,
                  borderColor: theme.colors.borderLight,
                },
              ]}>
              <Text style={[styles.statLabel, {color: theme.colors.mutedText}]}>
                {lang.t('remainingLeaveDays')}
              </Text>
              <Text style={[styles.statValue, {color: theme.colors.text}]}>
                {mockLeaveSummary.remainingLeaveDays}
              </Text>
            </View>

            {/* Paid Leave Days */}
            <View
              style={[
                styles.statBox,
                {
                  backgroundColor: theme.colors.lightGrayBackground,
                  borderColor: theme.colors.borderLight,
                },
              ]}>
              <Text style={[styles.statLabel, {color: theme.colors.mutedText}]}>
                {lang.t('paidLeaveDays')}
              </Text>
              <Text style={[styles.statValue, {color: theme.colors.text}]}>
                {mockLeaveSummary.paidLeaveDays}
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

        {/* Leave Records List */}
        {filteredRecords.map(record => (
          <LeaveRecord
            key={record.id}
            date={record.date}
            leaveDates={record.leaveDates}
            numberOfDays={record.numberOfDays}
            status={record.status}
            approvalDate={record.approvalDate}
            approverName={record.approverName}
            approverAvatar={record.approverAvatar}
          />
        ))}
      </ScrollView>

      {/* Add Leave Request Modal */}
      <LeaveRequestAddModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddLeaveRequest}
      />
    </SafeAreaView>
  );
};

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
    padding: 16,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  headerSubtitle: {
    fontSize: 14,
    fontWeight: '400',
    marginTop: 4,
  },
  createButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  statsColumn: {
    gap: 12,
  },
  statBox: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 4,
  },
  statLabel: {
    fontSize: 14,
    fontWeight: '400',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '600',
  },
  toggleContainer: {
    paddingVertical: 0,
  },
});

export default LeaveRecordScreen;
