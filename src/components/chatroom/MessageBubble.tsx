import {Image, StyleSheet, Text, View} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

type Props = {
  fromMe?: boolean;
  type: 'text' | 'audio';
  text?: string;
  audioSec?: number;
  avatar?: string;
  label?: string;
};

export default function MessageBubble({
  fromMe,
  type,
  text,
  audioSec,
  avatar,
  label,
}: Props) {
  const isMe = !!fromMe;
  const showLabel = !!label && !isMe;

  if (type === 'audio') {
    return (
      <View style={[styles.row, isMe ? styles.right : styles.left]}>
        {!isMe && <Image source={{uri: avatar}} style={styles.avtSmall} />}
        <View style={styles.content}>
          {showLabel && <Text style={styles.label}>{label}</Text>}
          <View
            style={[
              styles.audioWrap,
              isMe ? styles.bubbleMe : styles.bubblePeer,
            ]}>
            <View style={styles.wave} />
            <View style={styles.playWrap}>
              <Icon name="play" size={18} color="#3BB6A1" />
            </View>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.row, isMe ? styles.right : styles.left]}>
      {!isMe && <Image source={{uri: avatar || "https://cdn-icons-png.flaticon.com/512/9131/9131529.png"}} style={styles.avtSmall} />}
      <View style={styles.content}>
        {showLabel && <Text style={styles.label}>{label}</Text>}
        <View
          style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubblePeer]}>
          <Text style={[styles.text, isMe && styles.textMe]}>{text}</Text>
        </View>
      </View>
    </View>
  );
}

const AV = 30;

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  left: {justifyContent: 'flex-start'},
  right: {justifyContent: 'flex-end'},

  avtSmall: {
    width: AV,
    height: AV,
    borderRadius: AV / 2,
    marginRight: 8,
  },

  content: {
    maxWidth: '78%',
  },

  bubble: {
    maxWidth: '100%',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
  },
  text: {
    fontSize: 14,
    color: '#40485C',
    lineHeight: 20,
  },
  textMe: {
    color: '#1A3D70',
  },

  bubblePeer: {
    backgroundColor: '#F1F2F6',
    borderTopLeftRadius: 4,
  },
  bubbleMe: {
    backgroundColor: '#CFE2FF',
    borderTopRightRadius: 4,
  },

  audioWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 16,
    paddingRight: 10,
    paddingVertical: 10,
    borderRadius: 18,
  },
  wave: {
    height: 20,
    flex: 1,
    borderRadius: 8,
    backgroundColor: '#3BB6A1',
    marginRight: 10,
    opacity: 0.9,
  },
  playWrap: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: '#8A92A6',
    marginBottom: 3,
    marginLeft: 2,
  },
});
