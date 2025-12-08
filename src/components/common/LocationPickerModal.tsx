import React, { useState } from "react";
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
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import Geolocation from "@react-native-community/geolocation"; // ⭐ cần cài lib này
import { apiHandle } from "../../api/apihandle";
import { MapEP } from "../../api/endpoint/Map";

export default function LocationPickerModal({
  visible,
  initialMarker,
  onClose,
  onConfirm,
}) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  const [marker, setMarker] = useState(
    initialMarker ?? {
      latitude: 10.76262,
      longitude: 106.66017,
    }
  );

  const [region, setRegion] = useState({
    latitude: marker.latitude,
    longitude: marker.longitude,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });

  // 🔍 SEARCH
  const searchLocation = async (text) => {
    setQuery(text);
    if (!text.trim()) return setSuggestions([]);

    const { status, res } = await apiHandle
      .callApi(MapEP.Search, { q: text })
      .asPromise();

    if (!status.isError) {
      setSuggestions(res?.data?.predictions ?? []);
    }
  };

  // 📍 CHỌN GỢI Ý
  const choosePlace = async (place_id) => {
    const { status, res } = await apiHandle
      .callApi(MapEP.Detail, { place_id })
      .asPromise();

    if (!status.isError && res?.data) {
      const { lat, lng, address } = res.data;

      const m = { latitude: lat, longitude: lng, address };
      setMarker(m);
      setRegion({ ...region, latitude: lat, longitude: lng });

      setQuery(address);
      setSuggestions([]);
    }
  };

  // 🖱 CLICK MAP
  const handleMapPress = (e) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    setMarker({ latitude, longitude, address: null });
  };

  // 📌 LẤY VỊ TRÍ HIỆN TẠI
  const getCurrentLocation = async () => {
    try {
      if (Platform.OS === "android") {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) return;
      }

      Geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;

          const m = { latitude, longitude, address: null };

          setMarker(m);
          setRegion({
            ...region,
            latitude,
            longitude,
          });
        },
        (err) => console.log("Location error:", err),
        { enableHighAccuracy: true, timeout: 15000 }
      );
    } catch (error) {
      console.log("Location error:", error);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.box}>
          <Text style={styles.title}>Chọn vị trí công ty</Text>

          {/* Search + Suggest */}
          <View style={{ position: "relative", marginBottom: 6 }}>
            <TextInput
              placeholder="Nhập để tìm kiếm…"
              value={query}
              onChangeText={searchLocation}
              style={styles.search}
            />

            {suggestions.length > 0 && (
              <FlatList
                style={styles.suggestBox}
                data={suggestions}
                keyExtractor={(i) => i.place_id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.suggestItem}
                    onPress={() => choosePlace(item.place_id)}
                  >
                    <Text>{item.description}</Text>
                  </TouchableOpacity>
                )}
              />
            )}
          </View>

          {/* MAP */}
          <View>
            <MapView style={styles.map} region={region} onPress={handleMapPress}>
              {marker && (
                <Marker
                  draggable
                  coordinate={marker}
                  onDragEnd={(e) => {
                    const { latitude, longitude } = e.nativeEvent.coordinate;
                    setMarker({ ...marker, latitude, longitude });
                  }}
                />
              )}
            </MapView>

            {/* ⭐ BUTTON LẤY VỊ TRÍ HIỆN TẠI */}
            <TouchableOpacity style={styles.myLocationBtn} onPress={getCurrentLocation}>
              <Text style={{ color: "#fff", fontWeight: "600" }}>Vị trí của tôi</Text>
            </TouchableOpacity>
          </View>

          {/* BUTTONS */}
          <View style={styles.row}>
            <TouchableOpacity style={styles.btnCancel} onPress={onClose}>
              <Text style={styles.btnText}>Hủy</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.btnOk}
              onPress={() => onConfirm(marker)}
            >
              <Text style={styles.btnText}>Xác nhận</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    padding: 12,
  },
  box: {
    backgroundColor: "#fff",
    borderRadius: 14,
    overflow: "hidden",
  },
  title: {
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
    paddingVertical: 10,
  },
  search: {
    backgroundColor: "#f8f8f8",
    padding: 10,
    marginHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
  },

  suggestBox: {
    position: "absolute",
    top: 50,
    left: 12,
    right: 12,
    backgroundColor: "#fff",
    borderRadius: 10,
    maxHeight: 200,
    borderWidth: 1,
    borderColor: "#eee",
    zIndex: 200,
    elevation: 6,
  },

  suggestItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },

  map: {
    height: 380,
    marginTop: 10,
  },

  /* ⭐ Button lấy vị trí hiện tại */
  myLocationBtn: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "#007AFF",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    elevation: 5,
  },

  row: {
    flexDirection: "row",
  },
  btnCancel: {
    flex: 1,
    padding: 14,
    backgroundColor: "#999",
    alignItems: "center",
  },
  btnOk: {
    flex: 1,
    padding: 14,
    backgroundColor: "#007AFF",
    alignItems: "center",
  },
  btnText: {
    color: "#fff",
    fontWeight: "600",
  },
});
