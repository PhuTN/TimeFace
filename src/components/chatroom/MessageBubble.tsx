import {Image, StyleSheet, Text, View} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

type Props = {
  fromMe?: boolean;
  type: 'text' | 'audio';
  text?: string;
  audioSec?: number;
  avatar?: string;
};

export default function MessageBubble({
  fromMe,
  type,
  text,
  audioSec,
  avatar,
}: Props) {
  const isMe = !!fromMe;
  void audioSec;

  if (type === 'audio') {
    return (
      <View style={[styles.row, isMe ? styles.right : styles.left]}>
        {!isMe && <Image source={{uri: avatar}} style={styles.avtSmall} />}
        <View
          style={[
            styles.audioWrap,
            isMe ? styles.bubbleMe : styles.bubblePeer,
          ]}>
          <View style={styles.wave} />
          <View style={styles.playWrap}>
            <Icon name="play" size={20} color="#2E7CF6" />
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.row, isMe ? styles.right : styles.left]}>
      {!isMe && <Image source={{uri: avatar}} style={styles.avtSmall} />}
      <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubblePeer]}>
        <Text style={[styles.text, isMe && {color: '#21436D'}]}>{text}</Text>
      </View>
    </View>
  );
}

const AV = 34;
const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  left: {justifyContent: 'flex-start'},
  right: {justifyContent: 'flex-end'},
  avtSmall: {width: AV, height: AV, borderRadius: AV / 2, marginRight: 10},
  bubble: {
    maxWidth: '78%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
  },
  text: {fontSize: 16, color: '#454F66'},
  bubblePeer: {backgroundColor: '#EDEEF2'},
  bubbleMe: {backgroundColor: '#C9DAFF'},
  audioWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: '78%',
    paddingLeft: 18,
    paddingRight: 12,
    paddingVertical: 14,
    borderRadius: 20,
  },
  wave: {
    height: 24,
    flex: 1,
    borderRadius: 8,
    backgroundColor: '#9BC1FF',
    marginRight: 12,
  },
  playWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },
});
