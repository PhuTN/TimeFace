import {
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
  members?: GroupMember[]; // 👈 optional
  onBack?: () => void;
};

export default function GroupHeader({
  title,
  members = [], // 👈 DEFAULT VALUE – QUAN TRỌNG NHẤT
  onBack,
}: Props) {
  const extraTop = Platform.OS === 'android' ? 8 : 2;

  const totalMembers = members.length;
  const onlineCount = members.filter(m => m?.online).length;

  return (
    <SafeAreaView edges={['top']} style={[styles.safe, {paddingTop: extraTop}]}>
      <View style={styles.row}>
        {/* 🔙 BACK */}
        <Pressable style={styles.backBtn} onPress={onBack}>
          <Icon name="chevron-back" size={22} color="#7C6AF2" />
        </Pressable>

        {/* 🧩 GROUP INFO */}
        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>

          <Text style={styles.subtitle} numberOfLines={1}>
            {totalMembers} thành viên •{' '}
            <Text style={styles.online}>{onlineCount} online</Text>
          </Text>
        </View>
      </View>

      <View style={styles.divider} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 6,
    elevation: 3,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingBottom: 10,
  },

  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EEE9FF',
    marginRight: 12,
  },

  info: {
    flex: 1,
    minWidth: 0,
  },

  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2B3654',
  },

  subtitle: {
    fontSize: 13.5,
    color: '#8C97B3',
    marginTop: 3,
  },

  online: {
    color: '#2ecc71',
    fontWeight: '600',
  },

  divider: {
    height: 1,
    backgroundColor: '#EEF2F8',
  },
});
