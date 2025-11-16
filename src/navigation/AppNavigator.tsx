import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// import FaceDetectionScreen from '../screens/FaceDetectionScreen';
import AuthScreen from '../screens/AuthScreen';
import ChatListScreen from '../screens/ChatListScreen';
import ChatRoomScreen from '../screens/ChatRoomScreen';
import GroupChatScreen from '../screens/GroupChatScreen';
import HomeScreen from '../screens/HomeScreen';
//import ThemeLanguageTester from '../components/test_ui/ThemeLanguageTester';
//import FaceDetectionScreen from '../screens/FaceDetectionScreen';
import DepartmentManagementScreen from '../screens/DepartmentManagementScreen';
import EmployeeManagementScreen from '../screens/EmployeeManagementScreen';
import EmployeeAttendanceScreen from '../screens/EmployeeAttendanceScreen';
import DepartmentDetailScreen from '../screens/DepartmentDetailScreen';
import CommonScreen2 from '../screens/CommonScreen2';
import ManagementScreen from '../screens/ManagementScreen';
//import NotificationSenderScreen from '../screens/NotificationSenderScreen';
import ReportScreen from '../screens/ReportScreen';
import SettingsScreen from '../screens/SettingsScreen';
import JobInformationScreen from '../screens/JobInformationScreen';
import PersonalInformationScreen from '../screens/PersonalInformationScreen';
import EmployeeFaceDetectionScreen from '../screens/EmployeeFaceDetectionScreen';
import PersonalInformationFaceDetectionScreen from '../screens/PersonalInformationFaceDetectionScreen';

export type RootStackParamList = {
  Home: undefined;
  Chat: undefined;
  ChatDetail: undefined;
  Profile: undefined;
  Ranking: undefined;
  RankingMatch: undefined;
  Setting: undefined;
  DepartmentManagement: undefined;
  DepartmentDetail: { departmentDetail: any } | undefined;
  EmployeeManagement: undefined;
  EmployeeAttendance: undefined;
  EmployeeFaceDetection: undefined;
  Facene: undefined;
  CommonScreen2: undefined;
  Management: undefined;
  Report: undefined;
  Auth: undefined;
  ChatList: undefined;
  ChatRoom: undefined;
  Settings: undefined;
  JobInformation: undefined;
  PersonalInformation: { faces: any } | undefined;
  PersonalInformationFaceDetection: undefined
  GroupChat: undefined;
  NotificationSender: undefined;
};
const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home" screenOptions={{headerShown: false}}>
        <Stack.Screen name="Home" component={HomeScreen} />
        {/* <Stack.Screen name="Facene" component={FaceDetectionScreen} /> */}
        <Stack.Screen name="CommonScreen2" component={CommonScreen2} />
        <Stack.Screen name="DepartmentManagement" component={DepartmentManagementScreen} />
        <Stack.Screen name="DepartmentDetail" component={DepartmentDetailScreen} />
        <Stack.Screen name="EmployeeManagement" component={EmployeeManagementScreen} />
        <Stack.Screen name="EmployeeAttendance" component={EmployeeAttendanceScreen} />
        <Stack.Screen name="EmployeeFaceDetection" component={EmployeeFaceDetectionScreen} />
        <Stack.Screen name="Management" component={ManagementScreen} />
        <Stack.Screen name="Report" component={ReportScreen} />
        <Stack.Screen name="Auth" component={AuthScreen} />
        <Stack.Screen name="ChatList" component={ChatListScreen} />
        <Stack.Screen name="ChatRoom" component={ChatRoomScreen} />
        <Stack.Screen name="GroupChat" component={GroupChatScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="JobInformation" component={JobInformationScreen} />
        <Stack.Screen name="PersonalInformation" component={PersonalInformationScreen} />
        <Stack.Screen name="PersonalInformationFaceDetection" component={PersonalInformationFaceDetectionScreen} />
        {/* <Stack.Screen name="NotificationSender" component={NotificationSenderScreen} /> */}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
