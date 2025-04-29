import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, Text, ScrollView } from 'react-native';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/firebaseConfig';
import { useNavigation } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { FlashList } from '@shopify/flash-list';
import Base64ImageDisplay from '@/components/Base64ImageDisplay';

interface Item {
  id: string;
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  status: string;
  category: string;
  image: string;
}

const HomePage = () => {
  const navigation = useNavigation();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'issues'));
      const fetchedItems: Item[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        fetchedItems.push({
          id: doc.id,
          title: data.title,
          description: data.description,
          latitude: data.latitude,
          longitude: data.longitude,
          status: data.status,
          category: data.text_category || 'Other',
          image: data.image_embedding || '',
        });
      });
      setItems(fetchedItems);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const renderItem = ({ item }: { item: Item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.title}>{capitalizeFirstLetter(item.category)}</Text>
        <Ionicons
          name={item.status === 'resolved' ? 'checkmark-circle' : 'close-circle'}
          size={24}
          color={item.status === 'resolved' ? '#22c55e' : '#ef4444'}
        />
      </View>

      {item.image ? <Base64ImageDisplay base64={item.image} /> : null}

      <Text style={styles.description}>{item.description}</Text>
      <View style={styles.location}>
        <Text style={styles.locationText}>📍 Lat: {item.latitude.toFixed(4)}</Text>
        <Text style={styles.locationText}>📍 Long: {item.longitude.toFixed(4)}</Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {items.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="cloud-offline-outline" size={80} color="#94a3b8" />
          <Text style={styles.emptyTitle}>No Data Found</Text>
          <Text style={styles.emptySubtitle}>Please check back later.</Text>
        </View>
      ) : (
        <>
          <FlashList
            data={items}
            renderItem={renderItem}
            estimatedItemSize={250}
            refreshing={loading}
            onRefresh={fetchData}
            contentContainerStyle={{ paddingBottom: 20 }}
            ListHeaderComponent={
              <View style={styles.welcomeBox}>
                <Text style={styles.welcomeTitle}>Welcome to Urban Trust🏙️ Your City, Your Voice</Text>
                <Text style={styles.welcomeSubtitle}>
                  Urban Trust empowers citizens to report and track civic issues like potholes, garbage, or water leaks—all from one easy-to-use app. Using AI and blockchain, we ensure every report is categorized, mapped to the right BBMP ward, and logged transparently. View issues around you, monitor resolution progress, and help your community prioritize what matters most.
                  Your report can drive real change—let’s build a smarter, cleaner, and more accountable city together.
                </Text>
              </View>
            }
          />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    backgroundColor: '#f8fafc',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1e293b',
  },
  description: {
    fontSize: 16,
    color: '#334155',
    marginBottom: 10,
  },
  location: {
    flexDirection: 'column',
    marginTop: 8,
  },
  locationText: {
    fontSize: 15,
    color: '#64748b',
    marginBottom: 2,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#334155',
    marginTop: 20,
  },
  emptySubtitle: {
    fontSize: 15,
    color: '#94a3b8',
    marginTop: 6,
  },
  welcomeBox: {
    backgroundColor: '#e0f2fe',
    padding: 16,
    borderRadius: 12,
    marginVertical: 12,
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 4,
  },
  welcomeSubtitle: {
    fontSize: 15,
    color: '#334155',
  },
});

function capitalizeFirstLetter(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export default HomePage;
