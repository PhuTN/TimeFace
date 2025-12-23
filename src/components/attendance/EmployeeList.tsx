import {
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Linking,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useNavigation } from '@react-navigation/native';

export type Employee =
  | {
      id: number | string;
      name: string;
      role: string;
      avatar: {uri: string} | number;
      lateCount: number;
      latePercent: number;
      notePrefix?: string;
      phone?: string;
      email?: string;
    }
  | {
      id: number | string;
      name: string;
      role: string;
      avatar: {uri: string} | number;
      status: string;
      phone?: string;
      email?: string;
    };

type Props = {employees: Employee[]; title?: string};

export default function EmployeeList({employees, title}: Props) {
  const navigation = useNavigation<any>();

  const callPhone = (phone?: string) => {
    if (!phone) return;
    Linking.openURL(`tel:${phone}`);
  };

  const sendMail = (email?: string) => {
    if (!email) return;
    Linking.openURL(`mailto:${email}`);
  };

  const goToChat = (emp: any) => {
    navigation.navigate('ChatRoom', {
      userId: emp.id,
      name: emp.name,
    });
  };

  return (
    <View style={styles.wrapper}>
      {/* Header pill */}
      <View style={styles.headerPill}>
        <Text style={styles.title}>
          {(title ?? 'Danh sách nhân viên').toUpperCase()}
        </Text>

        <TouchableOpacity activeOpacity={0.7} style={styles.titleIcon}>
          <Feather name="eye" size={16} color="#6B7EFF" />
        </TouchableOpacity>
      </View>

      {/* Search box */}
      <View style={styles.searchRow}>
        <TextInput
          placeholder="Search"
          placeholderTextColor="#7E8A9A"
          style={styles.searchInput}
        />
        <TouchableOpacity style={styles.closeBtn}>
          <Feather name="x" size={14} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* List */}
      {employees.map((emp: any) => (
        <View key={emp.id} style={styles.card}>
          {/* ---- TOP AREA ---- */}
          <View style={styles.topArea}>
            <Image
              source={
                emp.avatar
                  ? typeof emp.avatar === 'string'
                    ? {uri: emp.avatar}
                    : emp.avatar
                  : {
                      uri: 'https://cdn-icons-png.flaticon.com/512/6858/6858504.png',
                    }
              }
              style={styles.avatar}
            />

            <View style={{flex: 1}}>
              <Text style={styles.name}>{emp.name}</Text>
              <Text style={styles.role}>{emp.role}</Text>
            </View>

            {/* ACTIONS */}
            <View style={styles.actions}>
              {/* 📞 CALL */}
              <TouchableOpacity
                style={[
                  styles.actionBtn,
                  !emp.phone && styles.actionDisabled,
                ]}
                disabled={!emp.phone}
                onPress={() => callPhone(emp.phone)}
              >
                <Feather
                  name="phone"
                  size={14}
                  color={emp.phone ? '#1A1A1A' : '#9CA3AF'}
                />
              </TouchableOpacity>

              {/* 💬 CHAT → NAVIGATE */}
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => goToChat(emp)}
              >
                <Feather name="message-square" size={14} color="#1A1A1A" />
              </TouchableOpacity>

              {/* ✉️ MAIL */}
              <TouchableOpacity
                style={[
                  styles.actionBtn,
                  !emp.email && styles.actionDisabled,
                ]}
                disabled={!emp.email}
                onPress={() => sendMail(emp.email)}
              >
                <Feather
                  name="mail"
                  size={14}
                  color={emp.email ? '#1A1A1A' : '#9CA3AF'}
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.midDivider} />

          {/* ---- BOTTOM NOTE ---- */}
          <View style={styles.bottomArea}>
            {'lateCount' in emp ? (
              <Text style={styles.stats}>
                {(emp.notePrefix ?? 'Số phút đi trễ:') + ' '}
                <Text style={styles.hl}>{emp.lateCount}</Text>. Chiếm{' '}
                <Text style={styles.hl}>{emp.latePercent}%</Text> thời gian ca làm
                việc
              </Text>
            ) : (
              (() => {
                const s: string = emp.status;
                const [p1, p2] = s.split(':');
                return (
                  <Text style={styles.leave}>
                    {p1}
                    {p2 ? (
                      <Text>
                        : <Text style={styles.hl}>{p2.trim()}</Text>
                      </Text>
                    ) : null}
                  </Text>
                );
              })()
            )}
          </View>
        </View>
      ))}
    </View>
  );
}

/* ====== styles ====== */
const BORDER = '#D7E2EA';
const BG_WRAPPER = '#EAF3FF';

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: BG_WRAPPER,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 16,
  },

  headerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: BORDER,
    marginBottom: 8,
  },
  title: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1A1A1A',
    letterSpacing: 0.3,
  },

  titleIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DDEBFA',
    borderRadius: 10,
    paddingLeft: 12,
    paddingRight: 6,
    height: 40,
    borderWidth: 1,
    borderColor: '#CFE0F5',
    marginBottom: 10,
  },
  searchInput: {flex: 1, fontSize: 13, color: '#1A1A1A'},
  closeBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#1A1A1A',
    alignItems: 'center',
    justifyContent: 'center',
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 18,
    overflow: 'hidden',
    marginBottom: 12,
  },

  topArea: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 12,
  },

  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 10,
  },

  name: {fontSize: 16, fontWeight: '700', color: '#1A1A1A'},
  role: {fontSize: 13, color: '#6B7280', marginTop: 2},

  actions: {flexDirection: 'row', gap: 6, marginLeft: 8},
  actionBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: BORDER,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionDisabled: {
    backgroundColor: '#F3F4F6',
    borderColor: '#E5E7EB',
  },

  midDivider: {height: 1, backgroundColor: '#E5E7EB'},

  bottomArea: {paddingHorizontal: 12, paddingVertical: 10},
  stats: {fontSize: 14, color: '#6B7280', lineHeight: 20},
  leave: {fontSize: 15, color: '#6B7280', lineHeight: 22, fontWeight: '600'},
  hl: {color: '#E11D48', fontWeight: '700'},
});
