import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

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

// ⭐ TIMESHEET (NEW)


// ⭐ OT
import OTRecordScreen from '../screens/group-4-screens/OTRecordScreen';
import OTRequestScreen from '../screens/group-2-screens/OTRequestScreen';

// ⭐ LEAVE
import LeaveRequestsScreen from '../screens/group-2-screens/LeaveRequests';
import LeaveRecordScreen from '../screens/group-4-screens/LeaveRecordScreen';

// ⭐ COMPLAINT
import ComplaintRequestScreen from '../screens/group-2-screens/ComplaintRequestScreen';

// Face ID
import FaceIdCaptureScreen from '../screens/FaceIdCaptureScreen';

// Subscription
import SubscriptionPlansScreen from '../screens/SubscriptionPlansScreen';
import SubscriptionBlockedScreen from '../screens/SubscriptionBlockedScreen';

// Features
import FeaturesScreen from '../screens/FeaturesScreen';

// ⭐ WORK SCHEDULE
import EmployeeWorkScheduleScreen from '../screens/EmployeeWorkScheduleScreen';

// ⭐ COMPANY RULES
import CompanyRulesScreen from '../screens/CompanyRulesScreen';
import CompanyScreen from '../screens/CompanyScreen';

import { navigationRef } from './NavigationService';
import CompanyLocationConfigScreen from '../screens/CompanyLocationConfigScreen';

// Attendance
import AttendanceConfigScreen from '../screens/AttendanceConfigScreen';

// View only
import PersonalInformationViewScreen from '../screens/PersonalInformationViewScreen';

// Account
import AccountSettingsScreen from '../screens/AccountSettingsScreen';
import MonthTimesheetScreen from '../screens/group-4-screens/MonthTimesheetScreen';
import TimesheetScreen from '../screens/group-2-screens/TimesheetScreen';
import DailyRecordScreen from '../screens/group-4-screens/DailyRecordScreen';

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  ResetPassword: { email?: string } | undefined;

  Home: undefined;
  Settings: undefined;

  DepartmentManagement: undefined;
  DepartmentDetail: { departmentDetail: any } | undefined;
  EmployeeManagement: { mode?: 'timesheet' } | undefined;
  EmployeeAttendance: undefined;
  EmployeeFaceDetection: undefined;

  CommonScreen2: undefined;
  Management: undefined;
  Report: undefined;
  Auth: undefined;
  ChatList: undefined;
  ChatRoom: undefined;
  GroupChat: undefined;

  JobInformation: undefined;
  PersonalInformation: { faces: any } | undefined;
  PersonalInformationFaceDetection: undefined;
  PersonalInformationView: undefined;

  SubscriptionPlans: undefined;
  SubscriptionBlocked: undefined;

  Features: undefined;

  CompanyLocationConfig: undefined;
  AttendanceConfig: undefined;

  FaceIdCapture: undefined;

  AccountSettings: undefined;

  // ⭐ TIMESHEET (NEW)
  Timesheet: undefined;
  MonthTimesheet: {
    employeeId?: string;
    employeeName?: string;
  };
  DailyRecord: {
    employeeId?: string;
    month: number;
    year: number;
    employeeName?: string;
  };

  // ⭐ OT
  OTRecord: undefined;
  OTRequest: undefined;

  // ⭐ LEAVE
  LeaveRecord: undefined;
  LeaveRequests: undefined;

  // ⭐ COMPLAINT
  ComplaintRequests: { mode?: 'user' | 'admin' } | undefined;

  // ⭐ WORK SCHEDULE
  EmployeeWorkSchedule: undefined;

  // ⭐ COMPANY RULES
  CompanyRules: undefined;
  Company: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = ({
  initialRouteName,
}: {
  initialRouteName: keyof RootStackParamList;
}) => {
  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator
        initialRouteName={initialRouteName}
        screenOptions={{ headerShown: false }}
      >
        {/* AUTH */}
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
        <Stack.Screen
          name="SubscriptionPlans"
          component={SubscriptionPlansScreen}
        />

        {/* ===== FOOTER SCREENS (NO ANIMATION) ===== */}
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ animation: 'none' }}
        />
        <Stack.Screen
          name="ChatList"
          component={ChatListScreen}
          options={{ animation: 'none' }}
        />
        <Stack.Screen
          name="EmployeeAttendance"
          component={EmployeeAttendanceScreen}
          options={{ animation: 'none' }}
        />
        <Stack.Screen
          name="Management"
          component={ManagementScreen}
          options={{ animation: 'none' }}
        />
        <Stack.Screen
          name="Report"
          component={ReportScreen}
          options={{ animation: 'none' }}
        />
        <Stack.Screen
          name="Settings"
          component={SettingsScreen}
          options={{ animation: 'none' }}
        />
        <Stack.Screen
          name="Features"
          component={FeaturesScreen}
          options={{ animation: 'none' }}
        />

        {/* ===== PUSH / DETAIL SCREENS ===== */}
        <Stack.Screen
          name="Timesheet"
          component={TimesheetScreen}
          options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="MonthTimesheet"
          component={MonthTimesheetScreen}
          options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="DailyRecord"
          component={DailyRecordScreen}
          options={{ animation: 'slide_from_right' }}
        />

        <Stack.Screen
          name="EmployeeWorkSchedule"
          component={EmployeeWorkScheduleScreen}
          options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="CompanyRules"
          component={CompanyRulesScreen}
          options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="Company"
          component={CompanyScreen}
          options={{ animation: 'slide_from_right' }}
        />

        {/* OT */}
        <Stack.Screen name="OTRecord" component={OTRecordScreen} />
        <Stack.Screen name="OTRequest" component={OTRequestScreen} />

        {/* LEAVE */}
        <Stack.Screen name="LeaveRecord" component={LeaveRecordScreen} />
        <Stack.Screen name="LeaveRequests" component={LeaveRequestsScreen} />

        {/* COMPLAINT */}
        <Stack.Screen
          name="ComplaintRequests"
          component={ComplaintRequestScreen}
        />

        {/* ACCOUNT */}
        <Stack.Screen
          name="AccountSettings"
          component={AccountSettingsScreen}
        />

        {/* CONFIG */}
        <Stack.Screen
          name="CompanyLocationConfig"
          component={CompanyLocationConfigScreen}
        />
        <Stack.Screen
          name="AttendanceConfig"
          component={AttendanceConfigScreen}
        />

        {/* MANAGEMENT */}
        <Stack.Screen
          name="DepartmentManagement"
          component={DepartmentManagementScreen}
        />
        <Stack.Screen
          name="DepartmentDetail"
          component={DepartmentDetailScreen}
        />
        <Stack.Screen
          name="EmployeeManagement"
          component={EmployeeManagementScreen}
        />
        <Stack.Screen
          name="EmployeeFaceDetection"
          component={EmployeeFaceDetectionScreen}
        />

        {/* FACE ID */}
        <Stack.Screen name="FaceIdCapture" component={FaceIdCaptureScreen} />

        {/* CHAT */}
        <Stack.Screen name="ChatRoom" component={ChatRoomScreen} />
        <Stack.Screen name="GroupChat" component={GroupChatScreen} />

        {/* OTHER */}
        <Stack.Screen name="Auth" component={AuthScreen} />
        <Stack.Screen name="CommonScreen2" component={CommonScreen2} />

        {/* PERSONAL */}
        <Stack.Screen
          name="JobInformation"
          component={JobInformationScreen}
        />
        <Stack.Screen
          name="PersonalInformation"
          component={PersonalInformationScreen}
        />
        <Stack.Screen
          name="PersonalInformationFaceDetection"
          component={PersonalInformationFaceDetectionScreen}
        />
        <Stack.Screen
          name="PersonalInformationView"
          component={PersonalInformationViewScreen}
        />

        <Stack.Screen
          name="SubscriptionBlocked"
          component={SubscriptionBlockedScreen}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
