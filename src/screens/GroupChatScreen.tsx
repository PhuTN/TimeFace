import {useMemo, useRef, useState} from 'react';
import {ScrollView, StyleSheet, View} from 'react-native';

import ComposerBar from '../components/chatroom/ComposerBar';
import DateDivider from '../components/chatroom/DateDivider';
import GroupHeader from '../components/chatroom/GroupHeader';
import MessageBubble from '../components/chatroom/MessageBubble';
import {
  GROUP_ME_ID,
  groupMembers,
  groupMessagesSeed,
  groupMeta,
  type GroupMsg,
} from '../fake_data/group_chat';

type DateRow = {id: string; type: 'date'; label: string};
type RowItem = GroupMsg | DateRow;

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

export default function GroupChatScreen() {
  const [messages, setMessages] = useState<GroupMsg[]>(groupMessagesSeed);
  const [text, setText] = useState('');
  const scrollRef = useRef<ScrollView>(null);

  const membersById = useMemo(() => {
    const map: Record<string, (typeof groupMembers)[number]> = {};
    groupMembers.forEach(m => {
      map[m.id] = m;
    });
    return map;
  }, []);

  const dataWithDividers = useMemo(() => {
    const arr: RowItem[] = [];
    let last: Date | null = null;

    for (const msg of messages) {
      const cur = new Date(msg.at);
      if (!last || !isSameDay(cur, last)) {
        arr.push({
          id: `d_${msg.id}`,
          type: 'date',
          label: formatVi(cur),
        });
      }
      arr.push(msg);
      last = cur;
    }

    return arr;
  }, [messages]);

  function onSend() {
    const content = text.trim();
    if (!content) {
      return;
    }
    const now = new Date().toISOString();
    const newMsg: GroupMsg = {
      id: `gm${Date.now()}`,
      senderId: GROUP_ME_ID,
      type: 'text',
      text: content,
      at: now,
    };

    setMessages(prev => [...prev, newMsg]);
    setText('');
    requestAnimationFrame(() =>
      scrollRef.current?.scrollToEnd({animated: true}),
    );
  }

  const onlineCount = groupMeta.members.filter(m => m.online).length;
  const subtitle = `${groupMeta.members.length} thanh vien · ${onlineCount} online`;

  return (
    <View style={styles.safe}>
      <GroupHeader
        title={groupMeta.name}
        topic={groupMeta.topic}
        subtitle={subtitle}
        members={groupMembers}
      />

      <ScrollView
        ref={scrollRef}
        style={{flex: 1, backgroundColor: '#FFFFFF'}}
        contentContainerStyle={{paddingVertical: 12}}
        onContentSizeChange={() =>
          scrollRef.current?.scrollToEnd({animated: false})
        }
        showsVerticalScrollIndicator={false}>
        {dataWithDividers.map(item => {
          if (item.type === 'date') {
            return <DateDivider key={item.id} label={item.label} />;
          }
          const msg = item as GroupMsg;
          const sender = membersById[msg.senderId];
          return (
            <MessageBubble
              key={msg.id}
              fromMe={msg.senderId === GROUP_ME_ID}
              type={msg.type}
              text={msg.text}
              audioSec={msg.audioSec}
              avatar={sender?.avatar}
              label={sender?.name}
            />
          );
        })}
      </ScrollView>

      <ComposerBar value={text} onChange={setText} onSend={onSend} />
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: '#FFFFFF'},
});
