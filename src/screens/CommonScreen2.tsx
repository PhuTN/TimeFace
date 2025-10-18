import React, {useState} from 'react';
import {View, Text, Button, StyleSheet, ScrollView} from 'react-native';
import {useUIFactory} from '../ui/factory/useUIFactory';
import OTRequest from '../components/list_items/OTRequest';
import Attendance from '../components/list_items/Attendance';
import {setUIState} from '../ui/factory/selector';
import FeatureItem from '../components/list_items/FeatureItem';
import EmployeeListItem from '../components/list_items/EmployeeItem';
import Timesheet from '../components/list_items/Timesheet';
import ChangeInfoRequest from '../components/list_items/ChangeInfoRequest';
import OTRequestFilterModal, {
  OTRequestFilters,
} from '../components/modals/filter-modals/OTRequestFilterModal';
import EmployeeFilterModal, {
  EmployeeFilters,
} from '../components/modals/filter-modals/EmployeeFilterModal';
import ICRequestFilterModal, {
  ICRequestFilters,
} from '../components/modals/filter-modals/ICRequestFilterModal';
import LeaveRequestFilterModal, {
  LeaveRequestFilters,
} from '../components/modals/filter-modals/LeaveRequestFilterModal';
import BottomSheetModal from '../components/common/BottomSheetModal';
import CommonScreen3 from './CommonScreen3';
import FilterBar from '../components/common/FilterBar';
import FilterChip from '../components/common/FilterChip';

const CommonScreen2: React.FC = () => {
  const {loading, lang, theme} = useUIFactory();
  const [showOTFilterModal, setShowOTFilterModal] = useState(false);
  const [showEmployeeFilterModal, setShowEmployeeFilterModal] = useState(false);
  const [showICRequestFilterModal, setShowICRequestFilterModal] =
    useState(false);
  const [showLeaveRequestFilterModal, setShowLeaveRequestFilterModal] =
    useState(false);
  const [showCommon3, setShowCommon3] = useState(false);

  // State for filter chips
  const [filters, setFilters] = useState([
    {id: '1', mainText: 'Marketing', subText: 'Department'},
    {id: '2', mainText: 'Manager', subText: 'Position'},
    {id: '3', mainText: 'Approved', subText: 'Status'},
  ]);

  if (loading || !theme || !lang) {
    return (
      <View>
        <Text>Loading...</Text>
      </View>
    );
  }

  const handleApplyOTFilters = (filters: OTRequestFilters) => {
    console.log('OT Filters applied:', filters);
    // TODO: Apply filters to your data/API call
  };

  const handleApplyEmployeeFilters = (filters: EmployeeFilters) => {
    console.log('Employee Filters applied:', filters);
    // TODO: Apply filters to your data/API call
  };

  const handleApplyICRequestFilters = (filters: ICRequestFilters) => {
    console.log('IC Request Filters applied:', filters);
    // TODO: Apply filters to your data/API call
  };

  const handleApplyLeaveRequestFilters = (filters: LeaveRequestFilters) => {
    console.log('Leave Request Filters applied:', filters);
    // TODO: Apply filters to your data/API call
  };

  const removeFilter = (id: string) => {
    setFilters(prev => prev.filter(filter => filter.id !== id));
  };

  return (
    <>
      <ScrollView style={styles.container}>
        {/* Đổi theme */}
        <View style={{height: 40}} />
        <Button
          title={lang.t('theme.dark')}
          onPress={() => setUIState({theme: 'dark'})}
        />
        <Button
          title={lang.t('theme.light')}
          onPress={() => setUIState({theme: 'light'})}
        />

        <View style={{height: theme.spacing(2)}} />

        {/* Đổi ngôn ngữ */}
        <Button title="Tiếng Việt" onPress={() => setUIState({lang: 'vi'})} />
        <Button title="English" onPress={() => setUIState({lang: 'en'})} />

        <View style={{height: theme.spacing(2)}} />

        {/* Filter Modal Buttons */}
        <Button
          title="OT Request Filter"
          onPress={() => setShowOTFilterModal(true)}
        />
        <Button
          title="Employee Filter"
          onPress={() => setShowEmployeeFilterModal(true)}
        />
        <Button
          title="Info Change Request Filter"
          onPress={() => setShowICRequestFilterModal(true)}
        />
        <Button
          title="Leave Request Filter"
          onPress={() => setShowLeaveRequestFilterModal(true)}
        />
        <Button
          title="CommonScreen3 (Leave Request Filter)"
          onPress={() => setShowCommon3(true)}
        />

        <View style={{height: theme.spacing(2)}} />

        {/* FilterBar Example */}
        <View style={{paddingHorizontal: 16, gap: 16}}>
          <Text
            style={{
              fontSize: 18,
              fontWeight: 'bold',
              color: theme.colors.text,
            }}>
            FilterBar Example:
          </Text>

          <FilterBar
            title="Employee List"
            onFilterPress={() => setShowEmployeeFilterModal(true)}
            theme={theme}>
            {filters.map(filter => (
              <FilterChip
                key={filter.id}
                mainText={filter.mainText}
                subText={filter.subText}
                onRemove={() => removeFilter(filter.id)}
                theme={theme}
              />
            ))}
          </FilterBar>
        </View>

        <View style={{height: theme.spacing(2)}} />

        {/* List Item Examples */}
        <View style={{paddingHorizontal: 16, gap: 12}}>
          <Text
            style={{
              fontSize: 18,
              fontWeight: 'bold',
              color: theme.colors.text,
            }}>
            List Item Examples:
          </Text>

          <Attendance
            avatarSource={require('../assets/images/delete.png')}
            name="Jane Smith"
            position="Designer"
            isLate={true}
            lateMinutes={45}
            latePercentage={15}
            onCall={() => console.log('Call Jane')}
            onMessage={() => console.log('Message Jane')}
            onMail={() => console.log('Mail Jane')}
          />

          <ChangeInfoRequest
            avatarSource={require('../assets/images/delete.png')}
            name="John Doe"
            position="Developer"
            status="pending"
            date="12/05/2025"
          />

          <Timesheet
            avatarSource={require('../assets/images/delete.png')}
            name="Alice Cooper"
            position="HR Specialist"
          />

          <EmployeeListItem
            avatarSource={require('../assets/images/delete.png')}
            name="Bob Johnson"
            position="Manager"
            isSelected={true}
            onToggleSelect={() => console.log('Toggle Bob')}
          />

          <FeatureItem text="Overtime" color="#FFAF2A" />

          <OTRequest
            avatarSource={require('../assets/images/delete.png')}
            name="Charlie Brown"
            position="Developer"
            status="approved"
            code="OT001"
            date="15/05/2025"
            time="17h - 19h"
            createdAt="12/05/2025"
          />
        </View>

        <View style={{height: 40}} />
      </ScrollView>

      {/* Filter Modals */}
      <OTRequestFilterModal
        visible={showOTFilterModal}
        onClose={() => setShowOTFilterModal(false)}
        onApplyFilters={handleApplyOTFilters}
      />
      <EmployeeFilterModal
        visible={showEmployeeFilterModal}
        onClose={() => setShowEmployeeFilterModal(false)}
        onApplyFilters={handleApplyEmployeeFilters}
      />
      <ICRequestFilterModal
        visible={showICRequestFilterModal}
        onClose={() => setShowICRequestFilterModal(false)}
        onApplyFilters={handleApplyICRequestFilters}
      />
      <LeaveRequestFilterModal
        visible={showLeaveRequestFilterModal}
        onClose={() => setShowLeaveRequestFilterModal(false)}
        onApplyFilters={handleApplyLeaveRequestFilters}
      />

      {/* CommonScreen3 Modal */}
      <BottomSheetModal
        visible={showCommon3}
        onClose={() => setShowCommon3(false)}
        maxHeightRatio={0.9}>
        <CommonScreen3 />
      </BottomSheetModal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default CommonScreen2;
