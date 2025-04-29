import React from 'react';
import { View, Pressable, StyleSheet, Alert, Image } from 'react-native';
import { Tabs, useSegments, useRouter } from 'expo-router';
import { signOut } from 'firebase/auth';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { MaterialIcons } from '@expo/vector-icons';
import { auth } from '@/firebaseConfig';
import Camera from '@/components/CameraButton.jsx';

export default function TabLayout() {
  const segments = useSegments();
  const lastSegment = segments[segments.length - 1];
  const showFab = lastSegment !== 'cameraTab';
  const router = useRouter();

  const handleSignOut = () => {
    signOut(auth)
      .then(() => {
        Alert.alert('Signed out successfully!');
        router.dismiss(1);
      })
      .catch((error) => {
        Alert.alert('Sign-out failed', error.message);
      });
  };

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: '#2563eb',
          tabBarInactiveTintColor: '#94a3b8',
          tabBarStyle: {
            backgroundColor: '#f1f5f9',
            borderTopWidth: 0,
            elevation: 5,
            height: 60,
          },
          headerTitle: ()=>(
            <View/>
          ),
          headerLeft: () => (
            <Image
              source={require('@/assets/images/logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          ),
          headerRight: () => (
            <Pressable onPress={handleSignOut} style={styles.logoutButton}>
              <MaterialIcons name="logout" size={24} color="#ef4444" />
            </Pressable>
          ),
          headerTitleAlign: 'left',
          headerStyle: {
            backgroundColor: '#ffffff',
            elevation: 2,
            shadowOpacity: 0.1,
          },
        }}
      >
        <Tabs.Screen
          name="(upload)"
          options={{
            title: 'Upload Image',
            href: null,
          }}
        />
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color }) => (
              <FontAwesome size={26} name="home" color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="map"
          options={{
            title: 'Map',
            tabBarIcon: ({ color }) => (
              <FontAwesome6 size={26} name="map" color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color }) => (
              <FontAwesome5 name="user-circle" size={24} color={color} />
            ),
          }}
        />
      </Tabs>

      {showFab && (
        <View style={styles.fabContainer}>
          <Camera />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  fabContainer: {
    position: 'absolute',
    bottom: 25,
    right: 25,
  },
  logoutButton: {
    paddingRight: 20,
  },
  logoContainer: {
    paddingLeft: 5, // ✅ Pushes image slightly away from screen edge
    alignItems: 'flex-start', // ✅ Align image to left
    justifyContent: 'center',
  },
  logo: {
    width: 100, // 🔼 Increased from 120 or 100 to 140
    height: 100, // 🔼 Increased from 32 or 40 to 50
  },
});


