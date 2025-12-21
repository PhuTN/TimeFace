import React, {useEffect, useRef, useState} from 'react';
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

type LatLng = {
  latitude: number;
  longitude: number;
};

export default function CompanyLocationConfigScreen({navigation}: any) {
  const [locationText, setLocationText] = useState('');
  const [radiusM, setRadiusM] = useState('100');

  // ✅ marker chỉ giữ lat/lng
  const [markerCoord, setMarkerCoord] = useState<LatLng | null>(null);

  const [showPicker, setShowPicker] = useState(false);
  const mapRef = useRef<MapView>(null);

  /* =============================
     LOAD CONFIG
  ==============================*/
  const loadConfig = async () => {
    const {status, res} = await apiHandle
      .callApi(CompanyEP.GetCheckinConfig)
      .asPromise();

    if (status.isError) return;

    const loc = res?.checkin_location;

    if (typeof loc?.lat === 'number' && typeof loc?.lng === 'number') {
      const coord = {
        latitude: loc.lat,
        longitude: loc.lng,
      };

      setMarkerCoord(coord);

      // ✅ ưu tiên address, không có thì fallback tọa độ
      console.log("LOG",loc)
      if (loc.address) {
        setLocationText(loc.address);
      } else {
        setLocationText(
          `Vị trí (${loc.lat.toFixed(5)}, ${loc.lng.toFixed(5)})`,
        );
      }
    }

    if (res?.checkin_radius != null) {
      setRadiusM(String(res.checkin_radius));
    }
  };

  useEffect(() => {
    loadConfig();
  }, []);

  /* =============================
     MOVE MAP WHEN MARKER CHANGES
  ==============================*/
  useEffect(() => {
    if (!markerCoord || !mapRef.current) return;

    mapRef.current.animateToRegion(
      {
        ...markerCoord,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      },
      500,
    );
  }, [markerCoord]);

  /* =============================
     CONFIRM FROM MODAL
  ==============================*/
  const confirmLocation = (picked: any) => {
    if (
      typeof picked?.latitude !== 'number' ||
      typeof picked?.longitude !== 'number'
    ) {
      Alert.alert('Lỗi', 'Tọa độ không hợp lệ');
      return;
    }

    const coord = {
      latitude: picked.latitude,
      longitude: picked.longitude,
    };

    setMarkerCoord(coord);

    // ✅ có address thì hiện address
    // ❌ không có thì hiện tọa độ
    console.log("pick",picked)
    if (picked.address && picked.address.trim()) {
      setLocationText(picked.address);
    } else {
      setLocationText(
        `Vị trí (${picked.latitude.toFixed(5)}, ${picked.longitude.toFixed(
          5,
        )})`,
      );
    }

    setShowPicker(false);
  };

  /* =============================
     SAVE
  ==============================*/
  const saveConfig = async () => {
    if (!markerCoord) {
      Alert.alert('Thiếu tọa độ', 'Vui lòng chọn vị trí');
      return;
    }

    const payload = {
      lat: markerCoord.latitude,
      lng: markerCoord.longitude,
      address: locationText, // ✅ luôn có text
      radius: Number(radiusM),
    };

    const {status} = await apiHandle
      .callApi(CompanyEP.UpdateCheckinConfig, payload)
      .asPromise();

    if (status.isError) {
      Alert.alert('Lỗi', 'Không thể lưu cấu hình');
      return;
    }

    Platform.OS === 'android'
      ? ToastAndroid.show('Cập nhật thành công!', ToastAndroid.SHORT)
      : Alert.alert('Thành công', 'Đã lưu');
  };

  return (
    <View style={{flex: 1}}>
      <HeaderBar title="Tọa độ công ty" onBack={() => navigation.goBack()} />

      {/* FORM */}
      <View style={styles.panel}>
        <Text style={styles.label}>Vị trí công ty</Text>

        <View style={styles.row}>
          <TextInput
            value={locationText}
            editable={false}
            multiline
            style={[
              styles.input,
              {flex: 1, height: 100, textAlignVertical: 'top'},
            ]}
          />

          <TouchableOpacity onPress={() => setShowPicker(true)}>
            <Icon name="map-marker-radius" size={30} color="#007AFF" />
          </TouchableOpacity>
        </View>

        <Text style={[styles.label, {marginTop: 12}]}>Bán kính (m)</Text>

        <TextInput
          value={radiusM}
          onChangeText={setRadiusM}
          keyboardType="numeric"
          style={styles.input}
        />

        <TouchableOpacity style={styles.saveBtn} onPress={saveConfig}>
          <Text style={styles.saveText}>Lưu cấu hình</Text>
        </TouchableOpacity>
      </View>

      {/* MAP */}
      <MapView
        ref={mapRef}
        provider="google"
        style={styles.map}
        initialRegion={{
          latitude: 10.7626,
          longitude: 106.6601,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}>
        {markerCoord && (
          <>
            <Marker coordinate={markerCoord} />
            <Circle
              center={markerCoord}
              radius={Number(radiusM)}
              strokeColor="rgba(0,122,255,0.8)"
              fillColor="rgba(0,122,255,0.2)"
              strokeWidth={2}
            />
          </>
        )}
      </MapView>

      <LocationPickerModal
        visible={showPicker}
        initialMarker={markerCoord}
        onClose={() => setShowPicker(false)}
        onConfirm={confirmLocation}
      />
    </View>
  );
}

/* =============================
   STYLES
==============================*/
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
    marginTop: 14,
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
