import {
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';

import type {GroupMember} from '../../fake_data/group_chat';

type Props = {
  title: string;
  subtitle?: string;
  topic?: string;
  members: GroupMember[];
};

const MAX_VISIBLE = 3;

export default function GroupHeader({title, subtitle, topic, members}: Props) {
  const extraTop = Platform.OS === 'android' ? 8 : 2;
  const visible = members.slice(0, MAX_VISIBLE);
  const remaining = members.length - visible.length;

  return (
    <SafeAreaView edges={['top']} style={[styles.safe, {paddingTop: extraTop}]}>
      <View style={styles.row}>
        <Pressable style={styles.backBtn}>
          <Icon name="chevron-back" size={20} color="#7C6AF2" />
        </Pressable>

        <View style={styles.info}>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          {topic ? (
            <View style={styles.topicChip}>
              <Text style={styles.topicText}>{topic}</Text>
            </View>
          ) : null}

          <View style={styles.avatarRow}>
            {visible.map((member, index) => (
              <Image
                key={member.id}
                source={{uri: member.avatar}}
                style={[
                  styles.avatar,
                  index !== 0 && {marginLeft: -12},
                  {zIndex: visible.length - index},
                ]}
              />
            ))}
            {remaining > 0 && (
              <View style={styles.more}>
                <Text style={styles.moreText}>+{remaining}</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.actions}>
          <Pressable style={styles.iconBtn}>
            <Icon name="call" size={18} color="#7C6AF2" />
          </Pressable>
          <Pressable style={[styles.iconBtn, {marginLeft: 8}]}>
            <Icon name="videocam" size={18} color="#7C6AF2" />
          </Pressable>
        </View>
      </View>
      <View style={styles.divider} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {backgroundColor: '#fff'},
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingBottom: 8,
  },
  backBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EEE9FF',
    marginRight: 12,
  },
  info: {flex: 1, minWidth: 0},
  title: {fontSize: 19, fontWeight: '800', color: '#2B3654'},
  subtitle: {fontSize: 13.5, color: '#8C97B3', marginTop: 2},
  topicChip: {
    alignSelf: 'flex-start',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: '#F2F4FB',
    marginTop: 6,
  },
  topicText: {fontSize: 12, color: '#4E5A78', fontWeight: '600'},
  avatarRow: {flexDirection: 'row', alignItems: 'center', marginTop: 10},
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#fff',
  },
  more: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#ECE9FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -10,
  },
  moreText: {fontSize: 13, fontWeight: '700', color: '#6657D1'},
  actions: {flexDirection: 'row', alignItems: 'center'},
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E4E4F1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {height: 1, backgroundColor: '#EEF2F8'},
});
