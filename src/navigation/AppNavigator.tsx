import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import HomeScreen from '../screens/HomeScreen';
import ThemeLanguageTester from '../components/test_ui/ThemeLanguageTester';
import FaceDetectionScreen from '../screens/FaceDetectionScreen';
import CommonScreen2 from '../screens/CommonScreen2';
import ICRequestsScreen from '../screens/group-2-screens/ICRequests';

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
  ICRequests: undefined;
};
const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="ICRequests"
        screenOptions={{headerShown: false}}>
        <Stack.Screen name="CommonScreen2" component={CommonScreen2} />
        <Stack.Screen name="ICRequests" component={ICRequestsScreen} />
        <Stack.Screen name="Facene" component={FaceDetectionScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
