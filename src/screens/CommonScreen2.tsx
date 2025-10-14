import React, {useState} from 'react';
import {View, Text, Button, StyleSheet, ScrollView} from 'react-native';
import {useUIFactory} from '../ui/factory/useUIFactory';
import FilterChip from '../components/other-group-2-stuff/FilterChip';
import Chip from '../components/common/Chip';
import OTRequest from '../components/list_items/OTRequest';
import Attendance from '../components/list_items/Attendance';
import {setUIState} from '../ui/factory/selector';
import FeatureItem from '../components/list_items/FeatureItem';
import EmployeeListItem from '../components/list_items/EmployeeItem';
import DepartmentEmployee from '../components/list_items/DepartmentEmployee';
import ChangeInfoRequest from '../components/list_items/ChangeInfoRequest';
import OTRequestFilterModal, {OTRequestFilters} from '../components/modals/OTRequestFilterModal';
import EmployeeFilterModal, {EmployeeFilters} from '../components/modals/EmployeeFilterModal';
import ICRequestFilterModal, {ICRequestFilters} from '../components/modals/ICRequestFilterModal';
import LeaveRequestFilterModal, {LeaveRequestFilters} from '../components/modals/LeaveRequestFilterModal';
import BottomSheetModal from '../components/common/BottomSheetModal';
import CommonScreen3 from './CommonScreen3';

const CommonScreen2: React.FC = () => {
  const {loading, lang, theme} = useUIFactory();
  const [showOTFilterModal, setShowOTFilterModal] = useState(false);
  const [showEmployeeFilterModal, setShowEmployeeFilterModal] = useState(false);
  const [showICRequestFilterModal, setShowICRequestFilterModal] = useState(false);
  const [showLeaveRequestFilterModal, setShowLeaveRequestFilterModal] = useState(false);
  const [showCommon3, setShowCommon3] = useState(false);

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
      <BottomSheetModal visible={showCommon3} onClose={() => setShowCommon3(false)} maxHeightRatio={0.9}>
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
