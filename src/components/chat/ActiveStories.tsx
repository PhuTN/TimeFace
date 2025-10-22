import {FlatList, Image, StyleSheet, Text, View} from 'react-native';
import {User} from '../../fake_data/chat';

export default function ActiveStories({data}: {data: User[]}) {
  return (
    <FlatList
      horizontal
      data={data}
      showsHorizontalScrollIndicator={false}
      keyExtractor={it => it.id}
      contentContainerStyle={{paddingHorizontal: 12}}
      renderItem={({item}) => (
        <View style={styles.item}>
          <View style={[styles.ring, item.online && styles.ringOn]}>
            <Image source={{uri: item.avatar}} style={styles.avatar} />
          </View>
          <Text numberOfLines={1} style={styles.name}>
            {item.name.split(' ')[0]}
          </Text>
        </View>
      )}
    />
  );
}

const SIZE = 58;
const styles = StyleSheet.create({
  item: {width: 74, alignItems: 'center', marginRight: 12},
  ring: {
    width: SIZE + 8,
    height: SIZE + 8,
    borderRadius: (SIZE + 8) / 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#E5ECFF',
  },
  ringOn: {borderColor: '#37C3A8'},
  avatar: {width: SIZE, height: SIZE, borderRadius: SIZE / 2},
  name: {marginTop: 6, fontSize: 13.5, color: '#44506B'},
});
