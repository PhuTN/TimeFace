import React, {useEffect, useRef, useState} from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Modal,
  TouchableWithoutFeedback,
  View,
  StyleSheet,
  Platform,
} from 'react-native';

type Props = {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  maxHeightRatio?: number; // 0..1
  backdropOpacity?: number; // 0..1
};

const SCREEN_H = Dimensions.get('window').height;

export default function BottomSheetModal({
  visible,
  onClose,
  children,
  maxHeightRatio = 0.85,
  backdropOpacity = 0.35,
}: Props) {
  const translateY = useRef(new Animated.Value(SCREEN_H)).current;
  const backdrop = useRef(new Animated.Value(0)).current;
  const [contentHeight, setContentHeight] = useState<number | null>(null);

  const maxH = SCREEN_H * maxHeightRatio;

  // mở/đóng
  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(backdrop, {
          toValue: 1,
          duration: 200,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 260,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(backdrop, {
          toValue: 0,
          duration: 180,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: SCREEN_H,
          duration: 240,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, backdrop, translateY]);

  const bgOpacity = backdrop.interpolate({
    inputRange: [0, 1],
    outputRange: [0, backdropOpacity],
  });

  return (
    <Modal
      visible={visible}
      transparent
      statusBarTranslucent
      animationType="none" // ta tự animate
      onRequestClose={onClose}>
      {/* Backdrop */}
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View style={[styles.backdrop, {opacity: bgOpacity}]} />
      </TouchableWithoutFeedback>

      {/* Sheet */}
      <Animated.View
        style={[
          styles.sheetContainer,
          {
            transform: [{translateY}],
          },
        ]}
        pointerEvents="box-none">
        <View
          style={[
            styles.sheet,
            {
              maxHeight: maxH,
              // bóng + bo tròn đẹp hơn trên Android
              elevation: 12,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
            },
          ]}
          onLayout={e => {
            const h = e.nativeEvent.layout.height;
            // nếu nội dung nhỏ, đảm bảo vẫn chạy từ dưới lên đúng khoảng
            if (contentHeight === null) {setContentHeight(h);}
          }}>
          {/* thanh kéo */}
          {/* <View style={styles.grabberWrap}>
            <View style={styles.grabber} />
          </View> */}
          {children}
        </View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
  },
  sheetContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
  },
  sheet: {
    paddingBottom: Platform.select({ios: 24, android: 16}),
  },
  //   grabberWrap: {
  //     alignItems: "center",
  //     paddingTop: 8,
  //     paddingBottom: 4,
  //   },
  //   grabber: {
  //     width: 42,
  //     height: 5,
  //     borderRadius: 999,
  //     backgroundColor: "#d0d0d0",
  //   },
});
