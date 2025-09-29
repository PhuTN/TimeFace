import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from '../screens/HomeScreen';
import ChatScreen from '../screens/ChatScreen';
import ChatDetailScreen from '../screens/ChatDetailScreen';
import ProfileScreen from '../screens/ProfileScreen';
import RankingScreen from '../screens/RankingScreen';
import RankingMatchScreen from '../screens/RankingMatchScreen';
import SettingScreen from '../screens/SettingScreen';
import ThemeLanguageTester from '../components/test_ui/ThemeLanguageTester';
import FaceDetectionScreen from '../screens/FaceDetectionScreen';

export type RootStackParamList = {
  Home: undefined;
  Chat: undefined;
  ChatDetail: undefined;
  Profile: undefined;
  Ranking: undefined;
  RankingMatch: undefined;
  Setting: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Facene" screenOptions={{ headerShown: false }}>
       <Stack.Screen name="Facene" component={FaceDetectionScreen} />

      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
