import {useMemo, useState} from 'react';
import {FlatList, StatusBar, StyleSheet, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';

import ActiveStories from '../components/chat/ActiveStories';
import ConversationItem from '../components/chat/ConversationItem';
import HeaderBar from '../components/chat/HeaderBar';
import SearchBar from '../components/chat/SearchBar';
import {activeIds, conversationsAll, users} from '../fake_data/chat';

export default function ChatListScreen() {
  const [q, setQ] = useState('');

  const activeUsers = useMemo(
    () => users.filter(u => activeIds.includes(u.id)),
    [],
  );

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return conversationsAll;
    return conversationsAll.filter(c => c.title.toLowerCase().includes(s));
  }, [q]);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />

      {/* PHẦN CỐ ĐỊNH */}
      <HeaderBar />
      <SearchBar value={q} onChange={setQ} />
      <View style={styles.storiesWrap}>
        <ActiveStories data={activeUsers} />
      </View>

      {/* CHỈ PHẦN NÀY SCROLL */}
      <FlatList
        style={styles.list}
        data={filtered}
        keyExtractor={it => it.id}
        renderItem={({item}) => <ConversationItem item={item} />}
        ItemSeparatorComponent={() => <View style={styles.sep} />}
        contentContainerStyle={{paddingBottom: 24}}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: '#FFFFFF'},
  storiesWrap: {height: 100, marginBottom: 8},
  list: {flex: 1},
  sep: {height: 1, backgroundColor: '#F0F3F9', marginLeft: 86},
});
