import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Platform,
  Dimensions,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { auth } from '../../config/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');
const GAME_CARD_SIZE = (width - 60) / 3;

// Import local images
const ghostImage = require('../../assets/games/goi.png');
const rivalsImage = require('../../assets/games/rivals.jpg');
const oneImage = require('../../assets/games/onepiece.jpg');
const gta5Image = require('../../assets/games/gta5.png');
const swImage = require('../../assets/games/starwars.png');
const owImage = require('../../assets/games/ow.jpg');

const recentlyViewedGames = [
  { id: 1, title: 'Ghost of Yotei', image: ghostImage },
  { id: 2, title: 'Marvel Rivals', image: rivalsImage },
  { id: 3, title: 'One Piece Round The Land', image: oneImage },
  { id: 4, title: 'GTA V', image: gta5Image },
  { id: 5, title: 'Overwatch 2', image: owImage },
  { id: 6, title: 'Star Wars Jedi Survivor', image: swImage }
];

const recommendations = [
  { id: 1, text: 'How to defeat Bode Akuna?' },
  { id: 2, text: 'Best controller settings for Marvel Rivals.' },
  { id: 3, text: 'Explain all the endings in Black Myth Wukong.' }
];

export default function HomeScreen() {
  const navigation = useNavigation();
  const [userName, setUserName] = useState('Player 1');
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [questionInput, setQuestionInput] = useState('');

  // Load user data
  useFocusEffect(
    useCallback(() => {
      const loadUserData = async () => {
        const savedUsername = await AsyncStorage.getItem('userName');
        if (savedUsername) {
          setUserName(savedUsername);
        } else {
          const user = auth.currentUser;
          if (user) {
            const emailName = user.email?.split('@')[0] || 'Player 1';
            setUserName(emailName.charAt(0).toUpperCase() + emailName.slice(1));
          }
        }
      };
      loadUserData();
    }, [])
  );

  // Load avatar
  useFocusEffect(
    useCallback(() => {
      const refreshAvatar = async () => {
        const uri = await AsyncStorage.getItem('userAvatar');
        setAvatarUri(uri);
      };
      refreshAvatar();
    }, [])
  );

  const handleAskGammy = () => {
  if (!questionInput.trim()) {
    Alert.alert('Please enter a question');
    return;
  }
  
  // @ts-ignore - Navigate to Gammy with params
  navigation.navigate('gammy', { 
    questionFromHome: questionInput.trim() 
  });

};


  return (
  <View style={styles.container}>
    {/* Header with Profile */}
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <Text style={styles.logo}>GamersGuide</Text>
      </View>
      <View style={styles.headerRight}>
        <TouchableOpacity style={styles.profileContainer}>
          {avatarUri ? (
            <Image 
              source={{ uri: avatarUri }} 
              style={styles.avatarImage}
            />
          ) : (
            <Ionicons name="person-circle" size={40} color="#333" />
          )}
        </TouchableOpacity>
        <View>
          <Text style={styles.userName}>{userName}</Text>
          <TouchableOpacity>
            <Text style={styles.reportText}>Report a problem</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>Welcome, {userName}!</Text>
          <Text style={styles.welcomeSubtitle}>
            What gaming challenge can I help with?
          </Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Ask a question about any game..."
            placeholderTextColor="#999"
            value={questionInput}
            onChangeText={setQuestionInput}
          />
          <TouchableOpacity 
            style={styles.searchButton}
            onPress={handleAskGammy}
          >
            <Ionicons name="play" size={24} color="#000" />
          </TouchableOpacity>
        </View>

        {/* Recently Viewed Games */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recently viewed games</Text>
          <View style={styles.gamesGrid}>
            {recentlyViewedGames.map((game) => (
              <TouchableOpacity 
                key={game.id} 
                style={styles.gameCard}
                activeOpacity={0.7}
              >
                <Image 
                  source={game.image}
                  style={styles.gameImage}
                  resizeMode="cover"
                />
                <Text style={styles.gameTitle} numberOfLines={2}>
                  {game.title}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Recommended for You */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recommended for you</Text>
        {recommendations.map((item) => (
          <TouchableOpacity 
            key={item.id}
            style={styles.recommendationItem}
            activeOpacity={0.7}
            onPress={() => {
              // @ts-ignore - Navigate to Gammy with clicked recommendation
              navigation.navigate('gammy', {
                questionFromHome: item.text
              });
            }}
          >
            <Text style={styles.recommendationText}>
              {'> '}{item.text}
            </Text>
          </TouchableOpacity>
        ))}
       </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  header: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingHorizontal: 20,
  paddingTop: Platform.OS === 'ios' ? 60 : 40,
  paddingBottom: 15,
  backgroundColor: '#fff',
  },
  headerLeft: {
    flex: 1,
  },

  userName: {
    fontSize: 16,
    fontWeight: '600',
  },

  profileContainer: {
    width: 40,
    height: 40,
  },

  reportText: {
    fontSize: 12,
    color: '#6366f1',
  },

  logo: {
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontStyle: 'italic',
    fontSize: 24,
    fontWeight: 'bold'
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap:12,
  },
  profileButton: {
    marginLeft: 15
  },
  avatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0'
  },
  scrollView: {
    flex: 1
  },
  welcomeSection: {
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 20
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#666'
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 30,
    backgroundColor: '#f5f5f5',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 4
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 12,
    color: '#000'
  },
  searchButton: {
    padding: 8
  },
  section: {
    marginBottom: 30
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    paddingHorizontal: 20
  },
  gamesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 15
  },
  gameCard: {
    width: GAME_CARD_SIZE,
    marginHorizontal: 5,
    marginBottom: 15,
    alignItems: 'center'
  },
  gameImage: {
    width: GAME_CARD_SIZE,
    height: GAME_CARD_SIZE,
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    marginBottom: 8,
    overflow: 'hidden'
  },
  gameTitle: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    color: '#333',
    width: '100%'
  },
  recommendationItem: {
    paddingHorizontal: 20,
    paddingVertical: 8
  },
  recommendationText: {
    fontSize: 15,
    color: '#333',
    textDecorationLine: 'underline'
  },
  bottomSpacing: {
    height: 20
  }
});
