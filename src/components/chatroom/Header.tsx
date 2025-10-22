import {Image, Platform, StyleSheet, Text, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';

export default function Header({
  name,
  role,
  avatar,
  online,
}: {
  name: string;
  role: string;
  avatar: string;
  online?: boolean;
}) {
  const extraTop = Platform.OS === 'android' ? 8 : 2;

  return (
    <SafeAreaView edges={['top']} style={[styles.safe, {paddingTop: extraTop}]}>
      <View style={styles.row}>
        <Icon name="chevron-back" size={26} color="#6F7FA1" />
        <Image source={{uri: avatar}} style={styles.avatar} />
        <View style={styles.titleWrap}>
          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              alignItems: 'baseline',
            }}>
            <Text numberOfLines={1} style={styles.name}>
              {name}
            </Text>
            <Text numberOfLines={1} style={styles.role}>
              {' '}
              ({role})
            </Text>
          </View>
          <View
            style={{flexDirection: 'row', alignItems: 'center', marginTop: 4}}>
            {online && <View style={styles.dot} />}
            <Text style={styles.active}>
              {online ? 'Đang hoạt động' : 'Ngoại tuyến'}
            </Text>
          </View>
        </View>
        <View style={{width: 26}} />
      </View>
      <View style={styles.divider} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {backgroundColor: '#fff'},
  row: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  avatar: {width: 44, height: 44, borderRadius: 22, marginHorizontal: 10},
  titleWrap: {flex: 1, minWidth: 0},
  name: {fontSize: 20, fontWeight: '800', color: '#2B3654'},
  role: {fontSize: 14.5, color: '#8C97B3', fontWeight: '700'},
  active: {fontSize: 13.5, color: '#8C97B3'},
  dot: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: '#35C48D',
    marginRight: 6,
  },
  divider: {height: 1, backgroundColor: '#EEF2F8'},
});
