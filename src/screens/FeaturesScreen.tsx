import React from 'react';
import {View, SafeAreaView, ScrollView} from 'react-native';
import Header from '../components/common/Header';
import FeatureItem from '../components/list_items/FeatureItem';
import {useUIFactory} from '../ui/factory/useUIFactory';

const features = [
  {
    text: 'personal_timesheet',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18"/></svg>`,
    color: '#3629B7',
    onPress: () => console.log('Navigate to personal_timesheet'),
  },
  {
    text: 'overtime_feature',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-clock-arrow-up-icon lucide-clock-arrow-up"><path d="M12 6v6l1.56.78"/><path d="M13.227 21.925a10 10 0 1 1 8.767-9.588"/><path d="m14 18 4-4 4 4"/><path d="M18 22v-8"/></svg>`,
    color: '#FFAF2A',
    onPress: () => console.log('Navigate to overtime_feature'),
  },
  {
    text: 'leave_request_feature',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 4h3a2 2 0 0 1 2 2v14"/><path d="M2 20h3"/><path d="M13 20h9"/><path d="M10 12v.01"/><path d="M13 4.562v16.157a1 1 0 0 1-1.242.97L5 20V5.562a2 2 0 0 1 1.515-1.94l4.243-1.33A2 2 0 0 1 13 4.562Z"/></svg>`,
    color: '#0890FE',
    onPress: () => console.log('Navigate to leave_request_feature'),
  },
  {
    text: 'work_schedule',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>`,
    color: '#E91B1B',
    onPress: () => console.log('Navigate to work_schedule'),
  },
];

export default function FeaturesScreen({navigation}: any) {
  const { theme, lang } = useUIFactory();
  if (!theme || !lang) return null;
    
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView>
        <Header
          title="Features"
          showBack={true}
          onBackPress={() => navigation.goBack()}
        />
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20}}>
          <View
            style={{
              backgroundColor: theme.colors.lightGrayBackground,
              borderRadius: 20,
              minHeight: 500,
              marginTop: -120,
              padding: 20,
              elevation: 2,
              shadowColor: '#000',
              shadowOpacity: 0.05,
              shadowRadius: 5,
              shadowOffset: {width: 0, height: 2},
            }}>
            <View
              style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
              }}>
              {features.map((item, index) => (
                <FeatureItem
                  key={index}
                  text={lang.t(item.text as any)}
                  icon={item.icon}
                  color={item.color}
                  onPress={item.onPress}
                />
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
