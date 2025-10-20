import {Image, StyleSheet, Text, View} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {Conversation, users} from '../../fake_data/chat';

function formatDay(dateISO: string) {
  const d = new Date(dateISO);
  const monthNames = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  const dd = d.getDate().toString().padStart(2, '0');
  return `${dd} ${monthNames[d.getMonth()]}`;
}

export default function ConversationItem({item}: {item: Conversation}) {
  const peerId = item.members.find(id => id !== 'u1') || item.members[0];
  const peer = users.find(u => u.id === peerId) || users[0];

  return (
    <View style={styles.row}>
      <Image source={{uri: peer.avatar}} style={styles.avatar} />
      <View style={{flex: 1}}>
        <View style={styles.topLine}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Text style={styles.name}>{item.title}</Text>
            {item.verified && (
              <Icon
                name="checkmark-circle"
                size={16}
                color="#37C3A8"
                style={{marginLeft: 6}}
              />
            )}
          </View>
          <Text style={styles.time}>{formatDay(item.updatedAt)}</Text>
        </View>
        <Text numberOfLines={1} style={styles.preview}>
          {item.lastText}
        </Text>
      </View>
    </View>
  );
}

const AV = 60;
const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  avatar: {width: AV, height: AV, borderRadius: AV / 2, marginRight: 12},
  topLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  name: {fontSize: 16.5, fontWeight: '700', color: '#2A3553'},
  time: {fontSize: 13, color: '#9AA6C0'},
  preview: {marginTop: 4, fontSize: 14, color: '#6E7A95'},
});
