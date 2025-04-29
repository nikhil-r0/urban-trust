import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Animated, ActivityIndicator, TouchableOpacity, RefreshControl, ScrollView } from 'react-native';
import { WebView } from 'react-native-webview';
import { Picker } from '@react-native-picker/picker';

const CATEGORIES = {
  pothole: "pothole",
  garbage: "garbage",
  streetlight: "streetlight",
  graffiti: "graffiti",
  flooding: "flooding",
  sidewalk_damage: "sidewalk damage",
};

export default function MapScreen() {
  const [selectedCategory, setSelectedCategory] = useState('garbage');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current; // animation for WebView

  const startFadeIn = () => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const handleCategoryChange = (category: React.SetStateAction<string>) => {
    setSelectedCategory(category);
    setLoading(true);
    setError(false);
    fadeAnim.setValue(0); // reset animation
  };

  const handleReload = () => {
    setLoading(true);
    setError(false);
    fadeAnim.setValue(0);
  };

  const onRefresh = () => {
    setRefreshing(true);
    handleReload();
    setTimeout(() => setRefreshing(false), 1000);
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#f2f2f2' }}>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={selectedCategory}
          style={styles.picker}
          onValueChange={handleCategoryChange}
          mode="dropdown"
        >
          {Object.keys(CATEGORIES).map((key) => (
            <Picker.Item key={key} label={CATEGORIES[key]} value={key} />
          ))}
        </Picker>
      </View>

      <View style={{ flex: 1 }}>
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007bff" />
            <Text style={styles.loadingText}>Loading your map...</Text>
          </View>
        )}

        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Failed to load map.</Text>
            <TouchableOpacity style={styles.retryButton} onPress={handleReload}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
            <ScrollView
              contentContainerStyle={{ flex: 1 }}
            >
              <WebView
                source={{ uri: `http://192.168.10.199:5001/map/${selectedCategory}` }}
                style={{ flex: 1 }}
                onLoadEnd={() => {
                  setLoading(false);
                  startFadeIn();
                }}
                onError={() => {
                  setError(true);
                  setLoading(false);
                }}
              />
            </ScrollView>
          </Animated.View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  pickerContainer: {
    backgroundColor: 'white',
    elevation: 4,
    margin: 10,
    borderRadius: 10,
    overflow: 'hidden',
  },
  picker: {
    height: 'auto',
    width: '100%',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    zIndex: 10,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#555',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    color: 'red',
    marginBottom: 10,
  },
  retryButton: {
    padding: 10,
    backgroundColor: '#007bff',
    borderRadius: 8,
  },
  retryText: {
    color: 'white',
    fontSize: 16,
  },
});
