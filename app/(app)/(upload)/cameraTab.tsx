import React, { useState, useRef, useCallback } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, TextInput, Button } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useIsFocused } from "@react-navigation/native";
import { auth } from "@/firebaseConfig";
import Slider from "@react-native-community/slider";
import { Ionicons } from "@expo/vector-icons";  // For the "X" icon
import * as Location from "expo-location";
import * as FileSystem from 'expo-file-system'; // ADD THIS IMPORT
import { ActivityIndicator } from "react-native";


export default function CameraTab() {
  const [facing, setFacing] = useState<"back" | "front">("back");
  const [zoom, setZoom] = useState(0);
  const [capturedPhotoUri, setCapturedPhotoUri] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(true); // State to toggle between camera and preview
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const [description, setDescription] = useState('');
  const isFocused = useIsFocused();
  const [errorMsg,setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [longitude,setLongitude] = useState("");
  const [latitude,setLatitude] = useState("");
  const userId = auth.currentUser?.uid;

  const getUserLocation =async () => {
      let {status} =await Location.requestForegroundPermissionsAsync();

      if(status !=="granted"){
          setErrorMsg("Permission to Location was not granted");
          return;
      }

      let {coords}=await Location.getCurrentPositionAsync();

      if(coords){
          const {latitude, longitude} = coords;
          console.log("lat and long is",latitude, longitude);
          setLatitude(latitude);
          setLongitude(longitude);
          let response =await Location.reverseGeocodeAsync({
              latitude,
              longitude
          })

          console.log('USER LOCATION IS',response);
      }
  };

  // Function to toggle between front and back camera
  const toggleCameraFacing = useCallback(() => {
    setFacing((current) => (current === "back" ? "front" : "back"));
  }, []);

  // Function to handle zoom change
  const handleZoomChange = useCallback((value: number) => {
    setZoom(value);
  }, []);

  // Function to take a picture
  const takePicture = useCallback(async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 1,
        base64: false,
        exif: false,
      });
      if (photo) {
        setCapturedPhotoUri(photo.uri);
        setShowCamera(false);
        await getUserLocation();  // Hide camera after capturing the photo
      }
    }
  }, []);


  const handleSubmit = async () => {
    if (!capturedPhotoUri || !latitude || !longitude || !description) {
      console.log("Missing fields!");
      return;
    }
  
    try {
      setIsLoading(true); // ⬅️ Add this to show loading
  
      const base64Image = await FileSystem.readAsStringAsync(capturedPhotoUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
  
      const payload = {
        user_id: userId,
        latitude,
        longitude,
        category: "general",
        description,
        image: base64Image,
      };
  
      const response = await fetch('http://192.168.10.199:5001/report-issue', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
  
      const result = await response.json();
      console.log('Server response:', result);
  
      if (result.success) {
        alert('Issue reported successfully!');
        setCapturedPhotoUri(null);
        setShowCamera(true);
        setDescription('');
      } else {
        alert(result.message);
      }
  
    } catch (error) {
      console.error("Error submitting issue:", error);
      alert('An error occurred. Please try again.');
    } finally {
      setIsLoading(false); // ⬅️ Hide loading once done
    }
  };  


  // Function to close the photo
  const closePreview = useCallback(() => {
    setCapturedPhotoUri(null);
    setShowCamera(true);  // Show the camera again
  }, []);

  // If permission is not granted, request permission
  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>
          We need your permission to show the camera
        </Text>
        <TouchableOpacity onPress={requestPermission} style={styles.button}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Submitting your report...</Text>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      {/* Show Camera or Preview based on the showCamera state */}
      {showCamera && isFocused ? (
        <CameraView
          ref={cameraRef}
          style={styles.camera}
          facing={facing}
          zoom={zoom}
        >
          <View style={styles.controlsContainer}>
            <View style={styles.row}>
              <TouchableOpacity style={styles.captureButton} onPress={toggleCameraFacing}>
                <Text style={styles.captureButtonText}>Flip</Text>
              </TouchableOpacity>
  
              <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
                <Text style={styles.captureButtonText}>Capture</Text>
              </TouchableOpacity>
            </View>
  
            <View style={styles.row}>
              <Text style={styles.text}>Zoom: {zoom.toFixed(1)}x</Text>
              <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={50}
                value={zoom}
                onValueChange={handleZoomChange}
              />
            </View>
          </View>
        </CameraView>
      ) : (
        // Display the captured photo with an option to retake
        <ScrollView>
          <View style={styles.previewContainer}>
          <Text style={styles.title}> Report Issue</Text>
            <Image source={{ uri: capturedPhotoUri}} style={styles.previewImage} />
            <Text style={styles.text}>This is your photo!</Text>
            {/* Close (X) button to retake the photo */}
            <TouchableOpacity onPress={closePreview} style={styles.closeButton}>
              <Ionicons name="close" size={30} color="#000" />
            </TouchableOpacity>
            <View style={styles.row}>
              <TouchableOpacity style={styles.button} onPress={takePicture}>
              </TouchableOpacity>
            </View>
            <View style={styles.container}>
                  <TextInput
                    style={styles.input}
                    placeholder="Description"
                    value={description}
                    onChangeText={setDescription}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                  <Button 
                    title="Submit" 
                    onPress={handleSubmit}
                  />
                  </View>
          </View>
        </ScrollView>
      )}
    </View>
  );
  
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    color: 'gray',
    marginBottom: 20,
  },
  input: {
    height: 50,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 10,
    backgroundColor: 'white',
  },
  toggleText: {
    marginTop: 15,
    fontSize: 16,
    color: 'blue',
    textAlign: 'center',
  },
  camera: {
    flex: 1,
  },
  controlsContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    marginBottom: 20,
  },
  text: {
    color: "#000",
    fontSize: 16,
  },
  slider: {
    flex: 1,
    marginLeft: 10,
  },
  captureButton: {
    backgroundColor: "#fff",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 30,
  },
  captureButtonText: {
    color: "#000",
    fontSize: 18,
    fontWeight: "bold",
  },
  previewContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
  },
  previewImage: {
    width: 200,
    height: 200,
    marginBottom: 20,
  },
  closeButton: {
    position: "absolute",
    top: 20,
    right: 20,
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 20,
  },  
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
  },
  loadingText: {
    marginTop: 20,
    fontSize: 18,
    color: '#555',
    fontWeight: '600',
  },
  
});
