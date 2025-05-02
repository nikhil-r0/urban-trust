import React, { useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  TextInput,
  Button,
  ActivityIndicator,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useIsFocused } from "@react-navigation/native";
import { auth } from "@/firebaseConfig";
import Slider from "@react-native-community/slider";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import * as FileSystem from "expo-file-system";
import RNPickerSelect from "react-native-picker-select";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://192.168.29.225:5001";

export default function CameraTab() {
  const [facing, setFacing] = useState("back");
  const [zoom, setZoom] = useState(0);
  const [photoUri, setPhotoUri] = useState(null);
  const [showCamera, setShowCamera] = useState(true);
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef(null);
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(null);
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const isFocused = useIsFocused();
  const userId = auth.currentUser?.uid;

  const toggleCamera = () => {
    setFacing((prev) => (prev === "back" ? "front" : "back"));
  };

  const handleZoomChange = (value: React.SetStateAction<number>) => setZoom(value);

  const getLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      alert("Location permission denied");
      return;
    }
    const { coords } = await Location.getCurrentPositionAsync();
    if (coords) {
      setLatitude(coords.latitude);
      setLongitude(coords.longitude);
    }
  };

  const takePicture = async () => {
    if (!cameraRef.current) return;
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 1 });
      if (photo.uri) {
        setPhotoUri(photo.uri);
        setShowCamera(false);
        await analyzePhoto(photo.uri);
        await getLocation();
      }
    } catch (e) {
      console.error("Error taking picture:", e);
      alert("Could not capture photo. Try again.");
    }
  };

  const analyzePhoto = async (uri: string) => {
    if (!uri) return;
    setIsLoading(true);
    try {
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      const res = await fetch(`${BASE_URL}/describe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64 }),
      });
      if (!res.ok) throw new Error(res.statusText);
      const data = await res.json();
      if (data.isIssue) {
        setCategory(data.category);
        setDescription(data.description);
        alert("Issue detected!");
      } else {
        alert("No issue detected.");
        resetCamera();
      }
    } catch (e) {
      console.error(e);
      alert("Analysis failed. Please try again.");
      resetCamera();
    } finally {
      setIsLoading(false);
    }
  };

  const submitReport = async () => {
    if (!photoUri || latitude == null || longitude == null || !description) {
      alert("Please capture, analyze, and fill all fields.");
      return;
    }
    setIsLoading(true);
    try {
      const base64 = await FileSystem.readAsStringAsync(photoUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      const res = await fetch(`${BASE_URL}/report-issue`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          latitude,
          longitude,
          category: category || "general",
          description,
          image: base64,
        }),
      });
      if (!res.ok) throw new Error(res.statusText);
      const result = await res.json();
      if (result.success) {
        alert("Report submitted successfully!");
        resetCamera();
      } else {
        alert(result.message || "Submission failed.");
      }
    } catch (e) {
      console.error(e);
      alert("Submission error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const resetCamera = () => {
    setPhotoUri(null);
    setDescription("");
    setCategory(null);
    setShowCamera(true);
  };

  if (!permission) return <View />;
  if (!permission.granted)
    return (
      <View style={styles.container}>
        <Text>Camera permission is required.</Text>
        <Button title="Grant" onPress={requestPermission} />
      </View>
    );
  if (isLoading)
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text>Processing...</Text>
      </View>
    );

  return (
    <View style={styles.container}>
      {showCamera && isFocused ? (
        <CameraView ref={cameraRef} style={styles.camera} facing={facing} zoom={zoom}>
          <View style={styles.controls}>
            <TouchableOpacity onPress={toggleCamera} style={styles.button}>
              <Text>Flip</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={takePicture} style={styles.button}>
              <Text>Capture</Text>
            </TouchableOpacity>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={1}
              value={zoom}
              onValueChange={handleZoomChange}
            />
          </View>
        </CameraView>
      ) : (
        <ScrollView contentContainerStyle={styles.previewContainer}>
          <Image
            source={{ uri: photoUri }}
            style={styles.image}
            accessibilityLabel="Captured photo"
          />
          <TouchableOpacity onPress={resetCamera} style={styles.close}>
            <Ionicons name="close" size={30} />
          </TouchableOpacity>
          <RNPickerSelect
            onValueChange={setCategory}
            value={category}
            placeholder={{ label: "Select category...", value: null }}
            items={[
              { label: "Pothole", value: "pothole" },
              { label: "Garbage", value: "garbage" },
              { label: "Streetlight", value: "streetlight" },
            ]}
            style={pickerStyles}
          />
          <TextInput
            style={styles.input}
            placeholder="Description"
            value={description}
            onChangeText={setDescription}
            multiline
          />
          <Button title="Submit" onPress={submitReport} />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center" },
  camera: { flex: 1 },
  controls: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  button: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 8,
  },
  slider: { flex: 1, marginHorizontal: 10 },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  previewContainer: {
    flexGrow: 1,
    alignItems: "center",
    padding: 20,
  },
  image: { width: 250, height: 250, borderRadius: 8 },
  close: { position: "absolute", top: 20, right: 20 },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "gray",
    borderRadius: 8,
    padding: 10,
    marginVertical: 10,
  },
});

const pickerStyles = StyleSheet.create({
  inputIOS: { fontSize: 16, padding: 12, borderWidth: 1, borderColor: "gray", borderRadius: 8, marginVertical: 10 },
  inputAndroid: { fontSize: 16, padding: 8, borderWidth: 1, borderColor: "gray", borderRadius: 8, marginVertical: 10 },
});
