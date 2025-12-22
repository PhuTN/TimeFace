import {useFocusEffect} from '@react-navigation/native';
import {useCallback, useEffect, useState} from 'react';
import {
  FlatList,
  Image,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import {socketService} from '../../services/socketService';
import {apiHandle} from '../api/apihandle';
import {User} from '../api/endpoint/user';
import SearchBar from '../components/chat/SearchBar';
import HeaderBar from '../components/common/HeaderBar';
import {authStorage} from '../services/authStorage';

const GROUP_AVATAR = 'https://cdn-icons-png.flaticon.com/512/6387/6387947.png';

export default function ChatListScreen({navigation}: any) {
  const [q, setQ] = useState('');
  const [chatList, setChatList] = useState<any[]>([]);
  const [companyUsers, setCompanyUsers] = useState<any[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const insets = useSafeAreaInsets();

  /* =====================
     LOAD CURRENT USER
  ===================== */
  useEffect(() => {
    (async () => {
      const session = await authStorage.load();
      setCurrentUserId(session?.user?._id?.toString() || null);
    })();
  }, []);

  /* =====================
     LOAD CHAT LIST
  ===================== */
  const loadChats = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const {status, res} = await apiHandle
        .callApi(User.GetChatList)
        .asPromise();
      if (!status.isError && res?.success) {
        const sorted = (res.data || []).sort((a: any, b: any) => {
          const ta = a.last_time ? new Date(a.last_time).getTime() : 0;
          const tb = b.last_time ? new Date(b.last_time).getTime() : 0;
          return tb - ta; // ⭐ mới nhất lên đầu
        });

        setChatList(sorted);
      }
    } catch (e) {
      console.log('Load chat error:', e);
      Toast.show({type: 'error', text1: 'Không tải được danh sách chat'});
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

  /* =====================
     LOAD COMPANY USERS
  ===================== */
  const loadCompanyUsers = useCallback(async () => {
    try {
      const {status, res} = await apiHandle
        .callApi(User.GetByCompany)
        .asPromise();
      if (!status.isError && res?.success) {
        setCompanyUsers(res.data?.users || []);
      }
    } catch {
      setCompanyUsers([]);
    }
  }, []);

  /* =====================
     SOCKET: PING USER
  ===================== */
  useFocusEffect(
    useCallback(() => {
      console.log('👀 ChatList focus → reload');

      loadChats();
      loadCompanyUsers();

      const socket = socketService.getSocket();
      if (!socket) return;

      const reloadUI = (payload?: any) => {
        console.log('📡 pinguser → reload ChatList', payload);
        loadChats(false);
      };

      socket.on('pinguser', reloadUI);

      return () => {
        socket.off('pinguser', reloadUI);
      };
    }, [loadChats, loadCompanyUsers]),
  );

  /* =====================
     SEARCH
  ===================== */
  const onSearchChange = useCallback(
    (text: string) => {
      setQ(text);
      const query = text.trim().toLowerCase();
      if (!query) return setSearchResults([]);

      const filtered = companyUsers
        .filter(u => u._id !== currentUserId)
        .filter(
          u =>
            (u.full_name || '').toLowerCase().includes(query) ||
            (u.employee_code || '').toLowerCase().includes(query),
        )
        .map(u => ({
          id: u._id,
          type: 'user',
          name: u.full_name,
          avatar: u.avatar,
          job_title: u.job_title,
          employee_code: u.employee_code,
          online: !!u.online,
          last_message: '',
          last_time: null,
          unread_count: 0,
        }));

      setSearchResults(filtered);
    },
    [companyUsers, currentUserId],
  );

  const data = q.trim() ? searchResults : chatList;

  /* =====================
     RENDER ITEM
  ===================== */
  const renderItem = ({item}: any) => {
    const isGroup = item.type === 'group';
    const hasUnread = (item.unread_count || 0) > 0;

    const title = isGroup ? item.title : item.name;

    const avatar = isGroup
      ? GROUP_AVATAR
      : item.avatar ||
        'https://cdn-icons-png.flaticon.com/512/9131/9131529.png';

    const lastTime = item.last_time
      ? new Date(item.last_time).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        })
      : '';

    const subText = isGroup
      ? `${item.department_code} · ${item.online_members}/${item.total_members}`
      : `${item.job_title || ''} · ${item.employee_code || ''}`;

    const handlePress = () => {
      if (isGroup) {
        navigation.navigate('GroupChat', {
          groupId: item.department_id,
          title: item.title,
        });
      } else {
        navigation.navigate('ChatRoom', {
          userId: item.id,
          name: item.name,
        });
      }
    };

    return (
      <TouchableOpacity
        style={[
          styles.itemRow,
          isGroup ? styles.groupCard : styles.userCard,
          hasUnread && styles.unreadRow,
        ]}
        activeOpacity={0.9}
        onPress={handlePress}>
        <View style={styles.avatarWrap}>
          <Image source={{uri: avatar}} style={styles.avatar} />
          {!isGroup && (
            <View
              style={[
                styles.statusDot,
                {backgroundColor: item.online ? '#34C759' : '#C7C7CC'},
              ]}
            />
          )}
        </View>

        <View style={{flex: 1, marginLeft: 12}}>
          <View style={styles.rowTop}>
            <Text
              style={[styles.name, hasUnread && styles.unreadName]}
              numberOfLines={2}>
              {title}
            </Text>
            <Text style={styles.time}>{lastTime}</Text>
          </View>

          <Text style={styles.codeText} numberOfLines={1}>
            {subText}
          </Text>

          {!!item.last_message && (
            <Text
              style={[styles.lastMsg, hasUnread && styles.unreadLastMsg]}
              numberOfLines={1}>
              {isGroup ? '👥 ' : ''}
              {item.last_message}
            </Text>
          )}
        </View>

        {hasUnread && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadText}>
              {item.unread_count > 9 ? '9+' : item.unread_count}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />
      <HeaderBar title="Nhắn tin" topInset={insets.top} isShowBackButton />

      <View style={{marginTop: 25, paddingHorizontal: 16}}>
        <SearchBar
          value={q}
          onChange={onSearchChange}
          placeholder="Tìm kiếm nhân viên hoặc nhóm..."
        />
      </View>

      <FlatList
        style={{marginTop: 12}}
        data={data}
        keyExtractor={it => it.id}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadChats} />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{paddingBottom: 40}}
      />
    </SafeAreaView>
  );
}

/* =====================
   STYLES
===================== */
const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: '#EEF1F5'},

  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 10,
    marginHorizontal: 10,
    marginVertical: 5,
    elevation: 2,
    backgroundColor: '#fff',
  },

  unreadRow: {
    backgroundColor: '#EAF2FF',
  },

  userCard: {},

  groupCard: {
    backgroundColor: '#F4F8FF',
    borderLeftWidth: 3,
    borderLeftColor: '#0A7AFF',
  },

  avatarWrap: {position: 'relative'},
  avatar: {width: 54, height: 54, borderRadius: 27},

  statusDot: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 11,
    height: 11,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#fff',
  },

  rowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  name: {fontSize: 14, fontWeight: '600', color: '#1C1C1E'},
  unreadName: {fontWeight: '700'},

  codeText: {fontSize: 12, color: '#777', marginTop: 2},

  time: {fontSize: 11, color: '#A1A1A1'},

  lastMsg: {fontSize: 12.5, color: '#4A4A4A', marginTop: 4},
  unreadLastMsg: {fontWeight: '600', color: '#000'},

  unreadBadge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FF3B30',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    marginLeft: 8,
  },

  unreadText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
});
