import React, { useEffect, useMemo, useRef, useState } from 'react';
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

import MapView, { Marker, Circle, PROVIDER_GOOGLE } from 'react-native-maps';
import HeaderBar from '../components/common/HeaderBar';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LocationPickerModal from '../components/common/LocationPickerModal';

import { apiHandle } from '../api/apihandle';
import { CompanyEP } from '../api/endpoint/Company';

type LatLng = {
  latitude: number;
  longitude: number;
};

export default function CompanyLocationConfigScreen({ navigation }: any) {
  const [locationText, setLocationText] = useState('');
  const [radiusM, setRadiusM] = useState('100');

  const [markerCoord, setMarkerCoord] = useState<LatLng | null>(null);
  const [showPicker, setShowPicker] = useState(false);

  const mapRef = useRef<MapView>(null);
  const [mapReady, setMapReady] = useState(false);

  // ✅ Normalize coord + radius để tránh NaN + ép object "fresh"
  const safeCoord = useMemo(() => {
    if (!markerCoord) return null;
    const lat = Number(markerCoord.latitude);
    const lng = Number(markerCoord.longitude);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
    return { latitude: lat, longitude: lng };
  }, [markerCoord]);

  const safeRadius = useMemo(() => {
    const r = Number(radiusM);
    return Math.max(1, Number.isFinite(r) ? r : 100);
  }, [radiusM]);

  /* =============================
     LOAD CONFIG
  ==============================*/
  const loadConfig = async () => {
    try {
      const { status, res } = await apiHandle
        .callApi(CompanyEP.GetCheckinConfig)
        .asPromise();

      if (status.isError) return;

      // res có thể là object trực tiếp hoặc bọc trong data
      const data: any = (res as any)?.data ?? res;

      const loc =
        data?.checkin_location ??
        data?.data?.checkin_location ??
        data?.result?.checkin_location;

      const radius =
        data?.checkin_radius ??
        data?.data?.checkin_radius ??
        data?.result?.checkin_radius;

      const lat = Number(loc?.lat);
      const lng = Number(loc?.lng);

      console.log('[GetCheckinConfig] loc:', loc, 'radius:', radius);

      if (Number.isFinite(lat) && Number.isFinite(lng)) {
        const coord = { latitude: lat, longitude: lng };
        setMarkerCoord(coord);

        if (loc?.address && String(loc.address).trim()) {
          setLocationText(String(loc.address));
        } else {
          setLocationText(`Vị trí (${lat.toFixed(5)}, ${lng.toFixed(5)})`);
        }
      } else {
        console.warn('❌ Invalid lat/lng from API:', loc?.lat, loc?.lng);
      }

      if (radius != null) setRadiusM(String(radius));
    } catch (e) {
      console.error('Error loading config:', e);
    }
  };

  useEffect(() => {
    loadConfig();
  }, []);

  /* =============================
     MOVE MAP WHEN COORD CHANGES
  ==============================*/
  useEffect(() => {
    if (!safeCoord || !mapRef.current || !mapReady) return;

    const move = () => {
      mapRef.current?.animateToRegion(
        {
          latitude: safeCoord.latitude,
          longitude: safeCoord.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        400,
      );
    };

    // gọi 2 nhịp để chắc chắn ăn layout + render xong children
    requestAnimationFrame(move);
    const t = setTimeout(move, 300);
    return () => clearTimeout(t);
  }, [safeCoord, mapReady]);

  /* =============================
     CONFIRM FROM MODAL
  ==============================*/
  const confirmLocation = (picked: any) => {
    const lat = Number(picked?.latitude);
    const lng = Number(picked?.longitude);

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      Alert.alert('Lỗi', 'Tọa độ không hợp lệ');
      return;
    }

    const coord = { latitude: lat, longitude: lng };
    setMarkerCoord(coord);

    if (picked?.address && String(picked.address).trim()) {
      setLocationText(String(picked.address));
    } else {
      setLocationText(`Vị trí (${lat.toFixed(5)}, ${lng.toFixed(5)})`);
    }

    setShowPicker(false);
  };

  /* =============================
     SAVE
  ==============================*/
  const saveConfig = async () => {
    if (!safeCoord) {
      Alert.alert('Thiếu tọa độ', 'Vui lòng chọn vị trí');
      return;
    }

    const payload = {
      lat: safeCoord.latitude,
      lng: safeCoord.longitude,
      address: locationText,
      radius: safeRadius,
    };

    const { status } = await apiHandle
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

  // ✅ Force remount map khi có tọa độ để tránh Android "nuốt marker"
  const mapKey = safeCoord
    ? `map-${safeCoord.latitude}-${safeCoord.longitude}`
    : 'map-default';

  console.log('RENDER safeCoord=', safeCoord, 'safeRadius=', safeRadius);

  return (
    <View style={{ flex: 1 }}>
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
              { flex: 1, height: 100, textAlignVertical: 'top' },
            ]}
            placeholder="Chưa chọn vị trí"
          />

          <TouchableOpacity onPress={() => setShowPicker(true)}>
            <Icon name="map-marker-radius" size={30} color="#007AFF" />
          </TouchableOpacity>
        </View>

        <Text style={[styles.label, { marginTop: 12 }]}>Bán kính (m)</Text>

        <TextInput
          value={radiusM}
          onChangeText={setRadiusM}
          keyboardType="numeric"
          style={styles.input}
          placeholder="Bán kính"
        />

        <TouchableOpacity style={styles.saveBtn} onPress={saveConfig}>
          <Text style={styles.saveText}>Lưu cấu hình</Text>
        </TouchableOpacity>
      </View>

      {/* MAP */}
      <MapView
        key={mapKey}
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        onMapReady={() => setMapReady(true)}
        onLayout={() => {
          if (!mapReady) setMapReady(true);
        }}
        initialRegion={{
          latitude: safeCoord?.latitude ?? 10.7626,
          longitude: safeCoord?.longitude ?? 106.6601,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      >
        {safeCoord && (
          <>
            <Marker
              key={`mk-${safeCoord.latitude}-${safeCoord.longitude}`}
              coordinate={{ ...safeCoord }} // ✅ object mới
              title="Vị trí công ty"
              description={locationText}
              tracksViewChanges={false}
              zIndex={999}
            />

            <Circle
              key={`cr-${safeCoord.latitude}-${safeCoord.longitude}-${safeRadius}`}
              center={{ ...safeCoord }} // ✅ object mới
              radius={safeRadius}
              strokeColor="rgba(0,122,255,0.8)"
              fillColor="rgba(0,122,255,0.2)"
              strokeWidth={2}
              zIndex={1}
            />
          </>
        )}
      </MapView>

      <LocationPickerModal
        visible={showPicker}
        initialMarker={safeCoord}
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
    // Nếu Android bị layering kỳ, thử comment dòng dưới:
    // elevation: 4,
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
