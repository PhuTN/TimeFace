import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  Image,
  TouchableOpacity,
  Modal,
  Text,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
  Keyboard,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import * as ImagePicker from 'react-native-image-picker';
import RNFS from 'react-native-fs';
import Toast from 'react-native-toast-message';

import ComposerBar from '../components/chatroom/ComposerBar';
import DateDivider from '../components/chatroom/DateDivider';
import GroupHeader from '../components/chatroom/GroupHeader';
import MessageBubble from '../components/chatroom/MessageBubble';

import {uploadSingle} from '../api/uploadApi';
import {apiHandle} from '../api/apihandle';
import {User} from '../api/endpoint/User';
import {socketService} from '../../services/socketService';
import {authStorage} from '../services/authStorage';

const INPUT_HEIGHT = 56;

/* ======================= UTILS ======================= */
function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function formatVi(d: Date) {
  return d.toLocaleDateString('vi-VN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/* ======================= SCREEN ======================= */
export default function GroupChatScreen({route, navigation}: any) {
  const {groupId, title} = route.params;

  const [department, setDepartment] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [meId, setMeId] = useState<string | null>(null);

  const [text, setText] = useState('');
  const [uploading, setUploading] = useState(false);

  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  const scrollRef = useRef<ScrollView>(null);

  /* ======================= CURRENT USER ======================= */
  useEffect(() => {
    authStorage.load().then(auth => {
      setMeId(auth?.user?._id || null);
    });
  }, []);

  /* ======================= MEMBER MAP ======================= */
  const memberMap = useMemo(() => {
    const map: any = {};
    members.forEach(m => (map[m.id] = m));
    return map;
  }, [members]);

  /* ======================= SCROLL HELPER ======================= */
  const scrollToBottom = useCallback((animated = true) => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollToEnd({animated});
    });
  }, []);

  /* ======================= LOAD GROUP CHAT ======================= */
  const loadGroupChat = useCallback(async () => {
    try {
      const {status, res} = await apiHandle
        .callApi(User.GetGroupChatDetail(groupId))
        .asPromise();

      if (!status.isError && res?.success) {
        setDepartment(res.data.department);
        setMembers(res.data.members || []);
        setMessages(res.data.group?.messages || []);
        scrollToBottom(false);
      }
    } catch (e) {
      console.log('❌ loadGroupChat error:', e);
    }
  }, [groupId, scrollToBottom]);

  /* ======================= MARK SEEN ======================= */
  const markSeen = useCallback(async () => {
    if (!meId || messages.length === 0) return;
    try {
      await apiHandle.callApi(User.SeenMessage, {
        type: 'group',
        id: groupId,
      }).asPromise();
    } catch {}
  }, [groupId, meId, messages.length]);

  useEffect(() => {
    markSeen();
  }, [markSeen]);

  /* ======================= KEYBOARD ======================= */
  useEffect(() => {
    const sub = Keyboard.addListener('keyboardDidShow', () =>
      scrollToBottom(true),
    );
    return () => sub.remove();
  }, [scrollToBottom]);

  /* ======================= SEND MESSAGE ======================= */
  const sendMessage = useCallback(
    async (payload: {text?: string; image_urls?: string[]}) => {
      try {
        await apiHandle.callApi(User.SendMessage, {
          type: 'group',
          id: groupId,
          ...payload,
        }).asPromise();

        setText('');
        scrollToBottom(true);
      } catch {
        Toast.show({type: 'error', text1: 'Không gửi được tin nhắn'});
      }
    },
    [groupId, scrollToBottom],
  );

  const onSend = async () => {
    const content = text.trim();
    if (!content) return;
    await sendMessage({text: content});
  };

  /* ======================= PICK IMAGE ======================= */
  const pickImages = () => {
    ImagePicker.launchImageLibrary(
      {mediaType: 'photo', selectionLimit: 5},
      async res => {
        if (res.didCancel || !res.assets) return;
        setUploading(true);

        try {
          const urls: string[] = [];
          for (const a of res.assets) {
            if (!a.uri) continue;
            const up = await uploadSingle(a.uri, 'group-chat');
            urls.push(up?.url || a.uri);
          }
          if (urls.length) {
            await sendMessage({image_urls: urls});
          }
        } finally {
          setUploading(false);
        }
      },
    );
  };

  /* ======================= DOWNLOAD IMAGE ======================= */
  const downloadImage = async () => {
    if (!previewImage) return;

    try {
      setDownloading(true);
      const fileName = `group_${Date.now()}.jpg`;
      const path =
        Platform.OS === 'android'
          ? `${RNFS.DownloadDirectoryPath}/${fileName}`
          : `${RNFS.DocumentDirectoryPath}/${fileName}`;

      const r = await RNFS.downloadFile({
        fromUrl: previewImage,
        toFile: path,
      }).promise;

      if (r.statusCode === 200) {
        Toast.show({type: 'success', text1: 'Đã tải ảnh'});
      }
    } catch {
      Toast.show({type: 'error', text1: 'Tải ảnh thất bại'});
    } finally {
      setDownloading(false);
    }
  };

  /* ======================= FOCUS + SOCKET ======================= */
  useFocusEffect(
    useCallback(() => {
      loadGroupChat();
    }, [loadGroupChat]),
  );

  useEffect(() => {
    const socket = socketService.getSocket();
    if (!socket) return;

    const onPing = (payload: any) => {
      if (
        payload?.type === 'group_chat_update' &&
        payload?.departmentId === groupId
      ) {
        loadGroupChat();
      }
    };

    socket.on('pinguser', onPing);
    return () => socket.off('pinguser', onPing);
  }, [groupId, loadGroupChat]);

  /* ======================= DATE DIVIDER ======================= */
  const dataWithDividers = useMemo(() => {
    const arr: any[] = [];
    let last: Date | null = null;

    for (const m of messages) {
      const cur = new Date(m.created_at);
      if (!last || !isSameDay(cur, last)) {
        arr.push({id: `d_${m._id}`, type: 'date', label: formatVi(cur)});
      }
      arr.push(m);
      last = cur;
    }
    return arr;
  }, [messages]);

  /* ======================= RENDER ======================= */
  return (
    <KeyboardAvoidingView
      style={styles.safe}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
      <View style={{flex: 1}}>
        <GroupHeader
          title={department?.name || title}
          members={members}
          onBack={() => navigation.goBack()}
        />

        <ScrollView
          ref={scrollRef}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            paddingTop: 12,
            paddingBottom:  12,
          }}>
          {dataWithDividers.map(item => {
            if (item.type === 'date') {
              return <DateDivider key={item.id} label={item.label} />;
            }

            const fromMe = item.sender_id === meId;

            if (item.image_urls?.length) {
              return item.image_urls.map((uri: string, i: number) => (
                <TouchableOpacity
                  key={`${item._id}_${i}`}
                  style={[
                    styles.imgWrap,
                    fromMe ? styles.right : styles.left,
                  ]}
                  onPress={() => setPreviewImage(uri)}>
                  <Image source={{uri}} style={styles.imageMsg} />
                </TouchableOpacity>
              ));
            }

            return (
              <MessageBubble
                key={item._id}
                fromMe={fromMe}
                text={item.text}
                avatar={!fromMe ? memberMap[item.sender_id]?.avatar : undefined}
                label={!fromMe ? memberMap[item.sender_id]?.name : undefined}
              />
            );
          })}
        </ScrollView>

        <ComposerBar
          value={text}
          onChange={setText}
          onSend={onSend}
          onPickImage={pickImages}
          uploading={uploading}
        />
      </View>

      {/* PREVIEW */}
      <Modal visible={!!previewImage} transparent>
        <View style={styles.previewContainer}>
          <Image source={{uri: previewImage || ''}} style={styles.previewImage} />

          {downloading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <TouchableOpacity style={styles.actionBtn} onPress={downloadImage}>
              <Text style={styles.actionText}>⬇️ Tải ảnh</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.actionBtn, {backgroundColor: '#ff4444'}]}
            onPress={() => setPreviewImage(null)}>
            <Text style={styles.actionText}>✕ Đóng</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      <Toast />
    </KeyboardAvoidingView>
  );
}

/* ======================= STYLES ======================= */
const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: '#FFFFFF'},
  imgWrap: {flexDirection: 'row', paddingHorizontal: 12, marginBottom: 10},
  left: {justifyContent: 'flex-start'},
  right: {justifyContent: 'flex-end'},
  imageMsg: {width: 180, height: 180, borderRadius: 14},
  previewContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewImage: {width: '100%', height: '70%'},
  actionBtn: {
    marginTop: 14,
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 14,
  },
  actionText: {color: '#fff', fontWeight: '600'},
});