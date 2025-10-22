<<<<<<< HEAD
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
=======
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
>>>>>>> main

// import FaceDetectionScreen from '../screens/FaceDetectionScreen';
import AuthScreen from '../screens/AuthScreen';
import ChatListScreen from '../screens/ChatListScreen';
import ChatRoomScreen from '../screens/ChatRoomScreen';
import HomeScreen from '../screens/HomeScreen';
//import ThemeLanguageTester from '../components/test_ui/ThemeLanguageTester';
//import FaceDetectionScreen from '../screens/FaceDetectionScreen';
import DepartmentManagementScreen from '../screens/DepartmentManagementScreen';
import EmployeeManagementScreen from '../screens/EmployeeManagementScreen';
import DepartmentDetailScreen from '../screens/DepartmentDetailScreen';
import CommonScreen2 from '../screens/CommonScreen2';
import ManagementScreen from '../screens/ManagementScreen';
import ReportScreen from '../screens/ReportScreen';

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
  Facene: undefined;
  CommonScreen2: undefined;
  Management: undefined;
  Report: undefined;
  Auth: undefined;
  ChatList: undefined;
  ChatRoom: undefined;
};
const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Home" component={HomeScreen} />
        {/* <Stack.Screen name="Facene" component={FaceDetectionScreen} /> */}
        <Stack.Screen name="CommonScreen2" component={CommonScreen2} />
        <Stack.Screen name="DepartmentManagement" component={DepartmentManagementScreen} />
        <Stack.Screen name="DepartmentDetail" component={DepartmentDetailScreen} />
        <Stack.Screen name="EmployeeManagement" component={EmployeeManagementScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Management" component={ManagementScreen} />
        <Stack.Screen name="Report" component={ReportScreen} />
        <Stack.Screen name="Auth" component={AuthScreen} />
        <Stack.Screen name="ChatList" component={ChatListScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
