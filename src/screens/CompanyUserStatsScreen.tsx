import {useEffect, useState} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import HeaderBar from '../components/common/HeaderBar';
import { CompanyEP } from '../api/endpoint/Company';
import { apiHandle } from '../api/apihandle';

const CompanyUserStatsScreen = ({route, navigation}: any) => {
  const {companyId} = route.params;
  const [stats, setStats] = useState<any>();

  useEffect(() => {
    apiHandle
      .callApi(CompanyEP.GetUserStats(companyId))
      .asPromise()
      .then(r => !r.status.isError && setStats(r.res));
  }, []);

  if (!stats) return null;

  return (
    <View style={styles.container}>
      <HeaderBar title="Thống kê nhân sự" onBack={() => navigation.goBack()} />

      <View style={styles.box}>
        <Text>Tổng user: {stats.total}</Text>
        <Text>Đang hoạt động: {stats.active}</Text>
        <Text>Đã nghỉ: {stats.inactive}</Text>
      </View>
    </View>
  );
};

export default CompanyUserStatsScreen;

const styles = StyleSheet.create({
  container: {flex: 1, padding: 16},
  box: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
  },
});
