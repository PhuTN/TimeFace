import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

// Core
import AuthScreen from '../screens/AuthScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import ResetPasswordScreen from '../screens/ResetPasswordScreen';

// Main features
import HomeScreen from '../screens/HomeScreen';
import ChatListScreen from '../screens/ChatListScreen';
import ChatRoomScreen from '../screens/ChatRoomScreen';
import GroupChatScreen from '../screens/GroupChatScreen';
import DepartmentManagementScreen from '../screens/DepartmentManagementScreen';
import EmployeeManagementScreen from '../screens/EmployeeManagementScreen';
import EmployeeAttendanceScreen from '../screens/EmployeeAttendanceScreen';
import DepartmentDetailScreen from '../screens/DepartmentDetailScreen';
import CommonScreen2 from '../screens/CommonScreen2';
import ManagementScreen from '../screens/ManagementScreen';
import ReportScreen from '../screens/ReportScreen';
import SettingsScreen from '../screens/SettingsScreen';
import JobInformationScreen from '../screens/JobInformationScreen';
import PersonalInformationScreen from '../screens/PersonalInformationScreen';
import EmployeeFaceDetectionScreen from '../screens/EmployeeFaceDetectionScreen';
import PersonalInformationFaceDetectionScreen from '../screens/PersonalInformationFaceDetectionScreen';

import SubscriptionPlansScreen from '../screens/SubscriptionPlansScreen';
import SubscriptionBlockedScreen from '../screens/SubscriptionBlockedScreen';

import {navigationRef} from './NavigationService';

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  ResetPassword: {email?: string} | undefined;

  Home: undefined;
  Settings: undefined;
  NotificationSender: undefined;

  Chat: undefined;
  ChatDetail: undefined;
  Profile: undefined;
  Ranking: undefined;
  RankingMatch: undefined;
  Setting: undefined;
  DepartmentManagement: undefined;
  DepartmentDetail: {departmentDetail: any} | undefined;
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
  JobInformation: undefined;
  PersonalInformation: {faces: any} | undefined;
  PersonalInformationFaceDetection: undefined;
  GroupChat: undefined;
  SubscriptionPlans: undefined;
  SubscriptionBlocked: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

type AppNavigatorProps = {
  initialRouteName: keyof RootStackParamList;
};

const AppNavigator = ({initialRouteName}: AppNavigatorProps) => {
  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator
        initialRouteName={initialRouteName}
        screenOptions={{headerShown: false}}
      >

        {/* AUTH */}
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
        <Stack.Screen name="SubscriptionPlans" component={SubscriptionPlansScreen} />

        {/* MAIN */}

        {/* ⭐ Home – KHÔNG animation */}
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ animation: 'none' }}
        />

        {/* ⭐ NotificationSender – KHÔNG animation */}
        {/* <Stack.Screen
          name="NotificationSender"
          component={NotificationSenderScreen}
          options={{ animation: 'none' }}
        /> */}

        {/* ⭐ Settings – KHÔNG animation */}
        <Stack.Screen
          name="Settings"
          component={SettingsScreen}
          options={{ animation: 'none' }}
        />

        {/* CÁC MÀN KHÁC GIỮ NGUYÊN */}
        <Stack.Screen name="CommonScreen2" component={CommonScreen2} />
        <Stack.Screen name="DepartmentManagement" component={DepartmentManagementScreen} />
        <Stack.Screen name="DepartmentDetail" component={DepartmentDetailScreen} />
        <Stack.Screen name="EmployeeManagement" component={EmployeeManagementScreen} />
        <Stack.Screen name="EmployeeAttendance" component={EmployeeAttendanceScreen} />
        <Stack.Screen name="EmployeeFaceDetection" component={EmployeeFaceDetectionScreen} />
        <Stack.Screen
          name="SubscriptionBlocked"
          component={SubscriptionBlockedScreen}
          options={{title: 'Thông báo'}}
        />
        <Stack.Screen name="Management" component={ManagementScreen} />
        <Stack.Screen name="Report" component={ReportScreen} />
        <Stack.Screen name="Auth" component={AuthScreen} />
        <Stack.Screen name="ChatList" component={ChatListScreen} />
        <Stack.Screen name="ChatRoom" component={ChatRoomScreen} />
        <Stack.Screen name="GroupChat" component={GroupChatScreen} />
        <Stack.Screen name="JobInformation" component={JobInformationScreen} />
        <Stack.Screen name="PersonalInformation" component={PersonalInformationScreen} />
        <Stack.Screen
          name="PersonalInformationFaceDetection"
          component={PersonalInformationFaceDetectionScreen}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
