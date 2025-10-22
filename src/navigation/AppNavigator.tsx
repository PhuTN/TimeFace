import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import HomeScreen from '../screens/HomeScreen';
import FaceDetectionScreen from '../screens/FaceDetectionScreen';
import CommonScreen2 from '../screens/CommonScreen2';
import ICRequestScreen from '../screens/group-2-screens/ICRequestScreen';
import LeaveRequestScreen from '../screens/group-2-screens/LeaveRequests';
import OTRequestScreen from '../screens/group-2-screens/OTRequestScreen';
import TimesheetScreen from '../screens/group-2-screens/TimesheetScreen';
import MonthTimesheetScreen from '../screens/group-4-screens/MonthTimesheetScreen';
import DailyRecordScreen from '../screens/group-4-screens/DailyRecordScreen';
import NotificationScreen from '../screens/group-4-screens/NotificationScreen';
import OTRecordScreen from '../screens/group-4-screens/OTRecordScreen';
import LeaveRecordScreen from '../screens/group-4-screens/LeaveRecordScreen';

export type RootStackParamList = {
  Home: undefined;
  Chat: undefined;
  ChatDetail: undefined;
  Profile: undefined;
  Ranking: undefined;
  RankingMatch: undefined;
  Setting: undefined;
  Facene: undefined;
  CommonScreen2: undefined;
  ICRequestScreen: undefined;
  LeaveRequestScreen: undefined;
  OTRequestScreen: undefined;
  TimesheetScreen: undefined;
  MonthTimesheetScreen: undefined;
  DailyRecordScreen: undefined;
  NotificationScreen: undefined;
  OTRecordScreen: undefined;
  LeaveRecordScreen: undefined;
};
const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="CommonScreen2"
        screenOptions={{headerShown: false}}>
        <Stack.Screen name="CommonScreen2" component={CommonScreen2} />
        <Stack.Screen name="ICRequestScreen" component={ICRequestScreen} />
        <Stack.Screen name="LeaveRequestScreen" component={LeaveRequestScreen} />
        <Stack.Screen name="OTRequestScreen" component={OTRequestScreen} />
        <Stack.Screen name="TimesheetScreen" component={TimesheetScreen} />
        <Stack.Screen name="MonthTimesheetScreen" component={MonthTimesheetScreen} />
        <Stack.Screen name="DailyRecordScreen" component={DailyRecordScreen} />
        <Stack.Screen name="NotificationScreen" component={NotificationScreen} />
        <Stack.Screen name="OTRecordScreen" component={OTRecordScreen} />
        <Stack.Screen name="LeaveRecordScreen" component={LeaveRecordScreen} />
        <Stack.Screen name="Facene" component={FaceDetectionScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
