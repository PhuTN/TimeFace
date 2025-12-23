import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  TextInput,
  FlatList,
  TouchableOpacity,
  Modal,
  Text,
  StyleSheet,
  PermissionsAndroid,
  Platform,
  Keyboard,
} from 'react-native';

import MapView, {
  Marker,
  PROVIDER_GOOGLE,
  LatLng,
} from 'react-native-maps';

import Geolocation from '@react-native-community/geolocation';
import {apiHandle} from '../../api/apihandle';
import {MapEP} from '../../api/endpoint/Map';

export default function LocationPickerModal({
  visible,
  initialMarker,
  onClose,
  onConfirm,
}) {
  const mapRef = useRef<MapView>(null);
  const inputRef = useRef<TextInput>(null); // ✅ THÊM

  const [mapReady, setMapReady] = useState(false);

  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);

  const [marker, setMarker] = useState<LatLng>({
    latitude: initialMarker?.latitude ?? 10.76262,
    longitude: initialMarker?.longitude ?? 106.66017,
  });

  const [pickedAddress, setPickedAddress] = useState<string | null>(null);

  /* =============================
     OPEN MODAL → RESET
  ==============================*/
  useEffect(() => {
    if (!visible) return;

    const coord = initialMarker ?? {
      latitude: 10.76262,
      longitude: 106.66017,
    };

    setMarker(coord);
    setPickedAddress(null);
    setQuery('');
    setSuggestions([]);
    setMapReady(false);
  }, [visible, initialMarker]);

  /* =============================
     MOVE MAP WHEN READY
  ==============================*/
  useEffect(() => {
    if (!mapReady) return;

    requestAnimationFrame(() => {
      mapRef.current?.animateToRegion(
        {
          latitude: marker.latitude,
          longitude: marker.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        300,
      );
    });
  }, [mapReady]);

  /* =============================
     SEARCH
  ==============================*/
  const searchLocation = async (text: string) => {
    setQuery(text);

    if (!text.trim()) {
      setSuggestions([]);
      return;
    }

    const {status, res} = await apiHandle
      .callApi(MapEP.Search, {q: text})
      .asPromise();

    if (!status.isError) {
      setSuggestions(res?.data?.predictions ?? []);
    }
  };

  /* =============================
     CHOOSE PLACE (FIX Ở ĐÂY)
  ==============================*/
  const choosePlace = async (place_id: string) => {
    const {res} = await apiHandle
      .callApi(MapEP.Detail, {place_id})
      .asPromise();

    if (!res?.data) return;

    const coord = {
      latitude: Number(res.data.lat),
      longitude: Number(res.data.lng),
    };

    setMarker(coord);
    setPickedAddress(res.data.address ?? null);
    setQuery(res.data.address ?? '');
    setSuggestions([]);

    // ✅ FIX: focus lại search
    requestAnimationFrame(() => {
      inputRef.current?.focus();
    });

    requestAnimationFrame(() => {
      mapRef.current?.animateToRegion(
        {
          ...coord,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        300,
      );
    });
  };

  /* =============================
     CLICK MAP
  ==============================*/
  const handleMapPress = (e: any) => {
    console.log("EE",e)
     Keyboard.dismiss();          // ✅ QUAN TRỌNG
  inputRef.current?.blur();   // ✅ QUAN TRỌNG
    const coord = e.nativeEvent.coordinate;

    setMarker(coord);
    setPickedAddress(null);

    requestAnimationFrame(() => {
      mapRef.current?.animateToRegion(
        {
          ...coord,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        200,
      );
    });
  };

  /* =============================
     CURRENT LOCATION
  ==============================*/
  const getCurrentLocation = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      );
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) return;
    }

    Geolocation.getCurrentPosition(
      pos => {
        const coord = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        };

        setMarker(coord);
        setPickedAddress(null);

        requestAnimationFrame(() => {
          mapRef.current?.animateToRegion(
            {
              ...coord,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            },
            300,
          );
        });
      },
      err => console.log('❌ GPS error:', err),
      {enableHighAccuracy: false, timeout: 30000},
    );
  };

  /* =============================
     CONFIRM
  ==============================*/
  const handleConfirm = () => {
    onConfirm({
      latitude: marker.latitude,
      longitude: marker.longitude,
      address: pickedAddress,
    });
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.box}>
          <Text style={styles.title}>Chọn vị trí công ty</Text>

          {/* SEARCH */}
          <View style={{position: 'relative', marginBottom: 6}}>
            <TextInput
              ref={inputRef} // ✅ GẮN REF
              placeholder="Nhập để tìm kiếm…"
              value={query}
              onChangeText={searchLocation}
              style={styles.search}
            />

            {query.length > 0 && (
              <TouchableOpacity
                onPress={() => {
                  setQuery('');
                  setSuggestions([]);
                  setPickedAddress(null);
                }}
                style={styles.clearBtn}>
                <Text style={{fontSize: 16, color: '#999'}}>✕</Text>
              </TouchableOpacity>
            )}

            {suggestions.length > 0 && (
              <FlatList
              
                style={styles.suggestBox}
                data={suggestions}
                keyExtractor={(i: any) => i.place_id}
                renderItem={({item}: any) => (
                  <TouchableOpacity
                    style={styles.suggestItem}
                    onPress={() => choosePlace(item.place_id)}>
                    <Text>{item.description}</Text>
                  </TouchableOpacity>
                )}
              />
            )}
          </View>

          {/* MAP */}
          <View onLayout={() => !mapReady && setMapReady(true)}>
            {mapReady && (
              <MapView
                ref={mapRef}
                provider={PROVIDER_GOOGLE}
                style={styles.map}
                initialRegion={{
                  latitude: marker.latitude,
                  longitude: marker.longitude,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                }}
                onPress={handleMapPress}>
                <Marker coordinate={marker} draggable />
              </MapView>
            )}

            <TouchableOpacity
              style={styles.myLocationBtn}
              onPress={getCurrentLocation}>
              <Text style={{color: '#fff', fontWeight: '600'}}>
                Vị trí của tôi
              </Text>
            </TouchableOpacity>
          </View>

          {/* BUTTONS */}
          <View style={styles.row}>
            <TouchableOpacity style={styles.btnCancel} onPress={onClose}>
              <Text style={styles.btnText}>Hủy</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.btnOk} onPress={handleConfirm}>
              <Text style={styles.btnText}>Xác nhận</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

/* =============================
   STYLES
==============================*/
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    padding: 12,
  },
  box: {
    backgroundColor: '#fff',
    borderRadius: 14,
    overflow: 'hidden',
  },
  title: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    paddingVertical: 10,
  },
  search: {
    backgroundColor: '#f8f8f8',
    padding: 10,
    paddingRight: 36,
    marginHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  clearBtn: {
    position: 'absolute',
    right: 22,
    top: 12,
  },
  suggestBox: {
    position: 'absolute',
    top: 50,
    left: 12,
    right: 12,
    backgroundColor: '#fff',
    borderRadius: 10,
    maxHeight: 200,
    borderWidth: 1,
    borderColor: '#eee',
    zIndex: 200,
    elevation: 6,
  },
  suggestItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  map: {
    height: 380,
    marginTop: 10,
  },
  myLocationBtn: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    elevation: 5,
  },
  row: {
    flexDirection: 'row',
  },
  btnCancel: {
    flex: 1,
    padding: 14,
    backgroundColor: '#999',
    alignItems: 'center',
  },
  btnOk: {
    flex: 1,
    padding: 14,
    backgroundColor: '#007AFF',
    alignItems: 'center',
  },
  btnText: {
    color: '#fff',
    fontWeight: '600',
  },
});