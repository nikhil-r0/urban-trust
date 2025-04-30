import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Text,
  Pressable,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/firebaseConfig';
import { Ionicons } from '@expo/vector-icons';
import { FlashList } from '@shopify/flash-list';
import Base64ImageDisplay from '@/components/Base64ImageDisplay';
import translations from '@/constants/translations';

interface Item {
  id: string;
  title: string;
  description: string;
  description_kannada?: string;
  latitude: number;
  longitude: number;
  status: string;
  category: string;
  category_kannada?: string;
  image: string;
}

const HomePage = () => {
  const [language, setLanguage] = useState<'en' | 'kn'>('en');
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  const t = translations[language] || translations['en'];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'issues'));
      const fetchedItems: Item[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        fetchedItems.push({
          id: doc.id,
          title: data.title,
          description: data.description,
          description_kannada: data.description_kannada || '',
          latitude: data.latitude,
          longitude: data.longitude,
          status: data.status,
          category: data.category || 'Other',
          category_kannada: data.category_kannada || 'ಇತರೆ',
          image: data.image || '',
        });
      });
      setItems(fetchedItems);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === 'en' ? 'kn' : 'en'));
  };

  const renderItem = ({ item }: { item: Item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.title}>
          {language === 'kn' ? item.category_kannada : capitalizeFirstLetter(item.category)}
        </Text>
        <Ionicons
          name={item.status === 'resolved' ? 'checkmark-circle' : 'close-circle'}
          size={24}
          color={item.status === 'resolved' ? '#22c55e' : '#ef4444'}
        />
      </View>

      {item.image && <Base64ImageDisplay base64={item.image} />}

      <Text style={styles.description}>
        {language === 'kn' ? item.description_kannada : item.description}
      </Text>

      <View style={styles.location}>
        <Text style={styles.locationText}>📍 {t.latitude}: {item.latitude.toFixed(4)}</Text>
        <Text style={styles.locationText}>📍 {t.longitude}: {item.longitude.toFixed(4)}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t.welcomeTitle}</Text>
        <Text style={styles.headerSubtitle}>{t.welcomeSubtitle}</Text>
        <Pressable onPress={toggleLanguage} style={styles.languageToggle}>
          <Ionicons name="language-outline" size={20} color="#2563eb" />
          <Text style={styles.languageToggleText}>
            {language === 'en' ? 'Switch to ಕನ್ನಡ' : 'Switch to English'}
          </Text>
        </Pressable>
      </View>

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
        </View>
      ) : items.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="cloud-offline-outline" size={80} color="#94a3b8" />
          <Text style={styles.emptyTitle}>{t.noDataTitle}</Text>
          <Text style={styles.emptySubtitle}>{t.noDataSubtitle}</Text>
        </View>
      ) : (
        <FlashList
          data={items}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          estimatedItemSize={250}
          refreshing={loading}
          onRefresh={fetchData}
          contentContainerStyle={{ paddingBottom: 20 }}
          extraData={language}
        />
      )}
    </SafeAreaView>
  );
};

function capitalizeFirstLetter(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    paddingHorizontal: 16,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0f172a',
  },
  headerSubtitle: {
    fontSize: 15,
    color: '#334155',
    marginTop: 4,
  },
  languageToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  languageToggleText: {
    color: '#2563eb',
    fontSize: 15,
    marginLeft: 6,
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
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
  },
  description: {
    fontSize: 16,
    color: '#334155',
    marginTop: 8,
  },
  location: {
    marginTop: 8,
  },
  locationText: {
    fontSize: 15,
    color: '#64748b',
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
});

export default HomePage;
