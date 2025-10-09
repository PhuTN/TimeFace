import React from 'react';
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

const CommonScreen2: React.FC = () => {
  const {loading, lang, theme} = useUIFactory();

  if (loading || !theme || !lang) {
    return (
      <View>
        <Text>Loading...</Text>
      </View>
    );
  }

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

        <View style={{paddingHorizontal: 16}}>
          <FilterChip
            mainText="Example Filter"
            subText="Sub text here"
            onRemove={() => console.log('Remove')}
            theme={theme}
          />
          <Chip text="Example Chip" />
          <OTRequest
            avatarSource={require('../assets/images/delete.png')} // placeholder
            name="John Doe"
            position="Developer"
            status="pending"
            code="D001"
            date="15/05/2025"
            time="17h - 19h"
            createdAt="12/05/2025"
          />
          <OTRequest
            avatarSource={require('../assets/images/delete.png')} // placeholder
            name="John Doe"
            position="Developer"
            status="rejected"
            code="D001"
            date="15/05/2025"
            time="17h - 19h"
            createdAt="12/05/2025"
          />
          <OTRequest
            avatarSource={require('../assets/images/delete.png')} // placeholder
            name="John Doe"
            position="Developer"
            status="approved"
            code="D001"
            date="15/05/2025"
            time="17h - 19h"
            createdAt="12/05/2025"
          />
          <Attendance
            avatarSource={require('../assets/images/delete.png')} // placeholder
            name="Jane Smith"
            position="Designer"
            isLate={true}
            lateMinutes={120}
            latePercentage={25}
            onCall={() => console.log('Call Jane')}
            onMessage={() => console.log('Message Jane')}
            onMail={() => console.log('Mail Jane')}
          />
          <Attendance
            avatarSource={require('../assets/images/delete.png')} // placeholder
            name="Bob Johnson"
            position="Manager"
            isLate={false}
            leaveReason="Bị cảm sốt"
            onCall={() => console.log('Call Bob')}
            onMessage={() => console.log('Message Bob')}
            onMail={() => console.log('Mail Bob')}
          />
          <EmployeeListItem
            avatarSource={require('../assets/images/delete.png')}
            name="John Doe"
            position="Developer"
            isSelected={true}
            onToggleSelect={() => console.log('Toggle John')}
          />
          <EmployeeListItem
            avatarSource={require('../assets/images/delete.png')}
            name="Jane Smith"
            position="Designer"
            isSelected={false}
            onToggleSelect={() => console.log('Toggle Jane')}
          />
          <EmployeeListItem
            avatarSource={require('../assets/images/delete.png')}
            name="Bob Johnson"
            position="Manager"
            isSelected={true}
            onToggleSelect={() => console.log('Toggle Bob')}
          />
          <DepartmentEmployee
            avatarSource={require('../assets/images/delete.png')}
            name="Alice Cooper"
            position="HR Specialist"
          />
          <DepartmentEmployee
            avatarSource={require('../assets/images/delete.png')}
            name="Charlie Brown"
            position="Accountant"
          />
          <DepartmentEmployee
            avatarSource={require('../assets/images/delete.png')}
            name="Diana Prince"
            position="Team Lead"
          />
          <ChangeInfoRequest
            avatarSource={require('../assets/images/delete.png')}
            name="John Doe"
            position="Developer"
            status="pending"
            date="12/05/2025"
          />
          <ChangeInfoRequest
            avatarSource={require('../assets/images/delete.png')}
            name="Jane Smith"
            position="Designer"
            status="approved"
            date="15/05/2025"
          />
          <ChangeInfoRequest
            avatarSource={require('../assets/images/delete.png')}
            name="Bob Johnson"
            position="Manager"
            status="rejected"
            date="10/05/2025"
          />
          <FeatureItem text="Overtime" color="#FFAF2A" />
          <FeatureItem text="Nghỉ phép" color="#0890FE" />
          <FeatureItem text="Lịch làm việc" color="#E91B1B" />
          <FeatureItem text="Bảng công cá nhân" color="#3629B7" />
        </View>
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default CommonScreen2;
