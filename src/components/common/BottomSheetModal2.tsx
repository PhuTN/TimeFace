import React from 'react';
import {
  Modal,
  TouchableWithoutFeedback,
  View,
  StyleSheet,
} from 'react-native';

type Props = {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  backdropOpacity?: number;
};

export default function BottomSheetModal({
  visible,
  onClose,
  children,
  backdropOpacity = 0.35,
}: Props) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      {/* BACKDROP */}
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={[styles.backdrop, {opacity: backdropOpacity}]} />
      </TouchableWithoutFeedback>

      {/* FULL SCREEN CONTENT */}
      <View style={styles.fullContainer}>
        {children}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
  },

  fullContainer: {
    flex: 1,
    backgroundColor: '#fff',   // modal nền trắng
  },
});
