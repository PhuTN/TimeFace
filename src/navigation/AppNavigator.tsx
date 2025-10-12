import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import FaceDetectionScreen from '../screens/FaceDetectionScreen';
import HomeScreen from '../screens/HomeScreen';
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
  Facene: undefined;
  CommonScreen2: undefined;
  Management: undefined;
  Report: undefined;
};
const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Report"
        screenOptions={{headerShown: false}}>
        <Stack.Screen name="Facene" component={FaceDetectionScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Management" component={ManagementScreen} />
        <Stack.Screen name="Report" component={ReportScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
