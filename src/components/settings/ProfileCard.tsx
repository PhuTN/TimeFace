import {Image, StyleSheet, Text, View} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

type Props = {
  name: string;
  subtitle: string;
  avatarUri: string;
  verified?: boolean;
};

export default function ProfileCard({
  name,
  subtitle,
  avatarUri,
  verified,
}: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.avatarWrap}>
        <Image source={{uri: avatarUri}} style={styles.avatar} />
      </View>
      <View style={{alignItems: 'center'}}>
        <View style={styles.nameRow}>
          <Text style={styles.name}>{name}</Text>
          {verified ? (
            <View style={styles.badge}>
              <Ionicons name="checkmark-circle" size={14} color={PURPLE} />
            </View>
          ) : null}
        </View>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
    </View>
  );
}

const PURPLE = '#7C6AF2';
const BG = '#F2EAFE';

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  avatarWrap: {
    width: 120,
    height: 120,
    borderRadius: 24,
    backgroundColor: BG,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    overflow: 'hidden',
  },
  avatar: {width: '100%', height: '100%'},
  nameRow: {flexDirection: 'row', alignItems: 'center', gap: 6},
  name: {fontSize: 20, fontWeight: '700', color: '#111827'},
  badge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 6,
    overflow: 'hidden',
  },
  subtitle: {marginTop: 4, color: '#6B7EFF'},
});

