import React, {useEffect, useState} from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  Alert,
  Platform,
  ToastAndroid,
} from 'react-native';

import MapView, {Marker, Circle} from 'react-native-maps';
import HeaderBar from '../components/common/HeaderBar';

import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LocationPickerModal from '../components/common/LocationPickerModal';

import {apiHandle} from '../api/apihandle';
import {CompanyEP} from '../api/endpoint/Company';

export default function CompanyLocationConfigScreen({navigation}) {
  const [locationText, setLocationText] = useState('');
  const [radiusM, setRadiusM] = useState('100'); // default 100m
  const [marker, setMarker] = useState(null);
  const [showPicker, setShowPicker] = useState(false);

  const region = marker
    ? {
        latitude: marker.latitude,
        longitude: marker.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }
    : {
        latitude: 10.7626,
        longitude: 106.6601,
        latitudeDelta: 0.03,
        longitudeDelta: 0.03,
      };

  /* -------------------------------------------------
     ⭐ LOAD CONFIG TỪ BACKEND
  ---------------------------------------------------*/
  const loadConfig = async () => {
    const {status, res} = await apiHandle
      .callApi(CompanyEP.GetCheckinConfig)
      .asPromise();

    if (status.isError) return;

    const data = res;

    if (data?.checkin_location) {
      const loc = data.checkin_location;

      setMarker({
        latitude: loc.lat,
        longitude: loc.lng,
        address: loc.address ?? '',
      });

      setLocationText(loc.address ?? '');
    }

    if (data?.checkin_radius != null) {
      setRadiusM(String(data.checkin_radius));
    }
  };

  useEffect(() => {
    loadConfig();
  }, []);

  /* -------------------------------------------------
     ⭐ CONFIRM LOCATION FROM MODAL
  ---------------------------------------------------*/
  const confirmLocation = picked => {
    const finalAddress =
      picked.address ??
      `Vị trí (${picked.latitude.toFixed(5)}, ${picked.longitude.toFixed(5)})`;

    setMarker({
      ...picked,
      address: finalAddress,
    });

    setLocationText(finalAddress);
    setShowPicker(false);
  };

  /* -------------------------------------------------
     ⭐ SAVE CONFIG VỀ BACKEND
  ---------------------------------------------------*/
  const saveConfig = async () => {
    if (!marker) {
      return Alert.alert('Thiếu tọa độ', 'Vui lòng chọn vị trí trên bản đồ');
    }

    const payload = {
      lat: marker.latitude,
      lng: marker.longitude,
      address: marker.address || '',
      radius: Number(radiusM),
    };

    const {status} = await apiHandle
      .callApi(CompanyEP.UpdateCheckinConfig, payload)
      .asPromise();

    if (status.isError) {
      return Alert.alert('Lỗi', 'Không thể lưu cấu hình');
    }

    // ⭐ Toast thông báo thành công
    if (Platform.OS === 'android') {
      ToastAndroid.show('Cập nhật thành công!', ToastAndroid.SHORT);
    } else {
      Alert.alert('Thành công', 'Đã cập nhật cấu hình check-in');
    }
  };

  return (
    <View style={{flex: 1}}>
      <HeaderBar title="Tọa độ công ty" onBack={() => navigation.goBack()} />

      <View style={styles.panel}>
        <Text style={styles.label}>Vị trí công ty</Text>

        <View style={styles.row}>
          <TextInput
            placeholder="Chưa chọn vị trí"
            value={locationText}
            editable={false}
            multiline={true}
            numberOfLines={5}
            style={[
              styles.input,
              {flex: 1, textAlignVertical: 'top', height: 120},
            ]}
          />

          <TouchableOpacity onPress={() => setShowPicker(true)}>
            <Icon name="map-marker-radius" size={30} color="#007AFF" />
          </TouchableOpacity>
        </View>

        <Text style={[styles.label, {marginTop: 14}]}>Bán kính (m)</Text>

        <TextInput
          value={radiusM}
          onChangeText={setRadiusM}
          keyboardType="numeric"
          placeholder="VD: 100"
          style={styles.input}
        />

        <TouchableOpacity style={styles.saveBtn} onPress={saveConfig}>
          <Text style={styles.saveText}>Lưu cấu hình</Text>
        </TouchableOpacity>
      </View>

      {marker && (
        <MapView style={styles.map} region={region}>
          <Marker coordinate={marker} />

          <Circle
            center={marker}
            radius={Number(radiusM)}
            strokeColor="rgba(0,122,255,0.8)"
            fillColor="rgba(0,122,255,0.2)"
            strokeWidth={2}
          />
        </MapView>
      )}

      <LocationPickerModal
        visible={showPicker}
        initialMarker={marker}
        onClose={() => setShowPicker(false)}
        onConfirm={confirmLocation}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    padding: 16,
    backgroundColor: '#fff',
    elevation: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  input: {
    backgroundColor: '#f4f5f6',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  saveBtn: {
    backgroundColor: '#007AFF',
    marginTop: 16,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  map: {
    flex: 1,
    marginTop: 10,
  },
});
