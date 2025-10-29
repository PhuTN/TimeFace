import {useMemo, useRef, useState} from 'react';
import {ScrollView, StyleSheet, View} from 'react-native';
import ComposerBar from '../components/chatroom/ComposerBar';
import DateDivider from '../components/chatroom/DateDivider';
import Header from '../components/chatroom/Header';
import MessageBubble from '../components/chatroom/MessageBubble';
import {Msg, messagesSeed, peer} from '../fake_data/chat_room';

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

export default function ChatRoomScreen() {
  const [messages, setMessages] = useState<Msg[]>(messagesSeed);
  const [text, setText] = useState('');
  const scrollRef = useRef<ScrollView>(null);

  const dataWithDividers = useMemo(() => {
    const arr: Array<
      Msg | {id: string; type: 'date'; label: string; at: string}
    > = [];
    let last: Date | null = null;
    for (const m of messages) {
      const cur = new Date(m.at);
      if (!last || !isSameDay(cur, last)) {
        arr.push({
          id: `d_${m.id}`,
          type: 'date',
          label: formatVi(cur),
          at: m.at,
        });
      }
      arr.push(m);
      last = cur;
    }
    return arr;
  }, [messages]);

  function onSend() {
    const content = text.trim();
    if (!content) return;
    const now = new Date().toISOString();
    const newMsg: Msg = {
      id: `m${Date.now()}`,
      type: 'text',
      fromMe: true,
      text: content,
      at: now,
    };
    setMessages(prev => [...prev, newMsg]);
    setText('');
    // cuộn xuống cuối
    requestAnimationFrame(() =>
      scrollRef.current?.scrollToEnd({animated: true}),
    );
  }

  return (
    <View style={styles.safe}>
      <Header
        name={peer.name}
        role={peer.role}
        avatar={peer.avatar}
        online={peer.online}
      />

      <ScrollView
        ref={scrollRef}
        style={{flex: 1, backgroundColor: '#FFFFFF'}}
        contentContainerStyle={{paddingVertical: 12}}
        onContentSizeChange={() =>
          scrollRef.current?.scrollToEnd({animated: false})
        }
        showsVerticalScrollIndicator={false}>
        {dataWithDividers.map(item =>
          (item as any).type === 'date' ? (
            <DateDivider key={item.id} label={(item as any).label} />
          ) : (
            <MessageBubble
              key={item.id}
              fromMe={(item as Msg).fromMe}
              type={(item as Msg).type}
              text={(item as Msg).text}
              audioSec={(item as Msg).audioSec}
              avatar={peer.avatar}
            />
          ),
        )}
      </ScrollView>

      <ComposerBar
        value={text}
        onChange={setText}
        onSend={onSend}
        onEmoji={() => setText(t => t + '😊')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: '#FFFFFF'},
});
