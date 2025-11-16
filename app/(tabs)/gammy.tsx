import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useCallback } from 'react';
import { useRoute } from '@react-navigation/native';
import { useEffect } from 'react';

const GEMINI_API_KEY = 'AIzaSyDmCbvogZuUG0L_AHTaiLxRjCHhGuDa15s';

export default function GammyScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [userName, setUserName] = useState('Player 1');
  const [question, setQuestion] = useState('');
  const [gameTitle, setGameTitle] = useState('');
  const [category, setCategory] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [showResponse, setShowResponse] = useState(false);
  const [feedbackGiven, setFeedbackGiven] = useState<'helpful' | 'not-helpful' | null>(null);
  
  const CANNED_QUESTIONS = [
    "How do I beat the final boss?",
    "What's the best weapon to use?",
    "How do I unlock the secret level?",
    "What are the best character builds?",
    "How do I farm XP quickly?",
    "Tips for winning multiplayer matches?",
  ];

  useFocusEffect(
    useCallback(() => {
      const loadUserData = async () => {
        const uri = await AsyncStorage.getItem('userAvatar');
        const savedUsername = await AsyncStorage.getItem('userName');
        
        setAvatarUri(uri);
        if (savedUsername) {
          setUserName(savedUsername);
        }
      };
      loadUserData();
    }, [])
  );

  // ⭐ FIXED: Handle incoming question from Home and generate response with NEW question
  useEffect(() => {
    const params = route.params as { questionFromHome?: string } | undefined;
    if (params?.questionFromHome) {
      const newQuestion = params.questionFromHome;
      
      // Set the states
      setQuestion(newQuestion);
      setGameTitle('General Gaming');
      setCategory('Strategy');
      
      // Generate response immediately with the NEW question
      const generateResponse = async () => {
        setLoading(true);
        setShowResponse(false);
        setFeedbackGiven(null);

        try {
          const apiResponse = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                contents: [{
                  parts: [{
                    text: `You are Gammy, a professional gaming strategy assistant. Provide a helpful answer to this question about General Gaming (Strategy): "${newQuestion}"
Give practical gameplay tips and strategies. IMPORTANT: Your response must be EXACTLY 150 words or less. Be concise but informative.`
                  }]
                }]
              })
            }
          );

          const data = await apiResponse.json();
          
          if (data.error) {
            Alert.alert('Error', data.error.message);
            return;
          }

          if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
            setResponse(data.candidates[0].content.parts[0].text);
            setShowResponse(true);
          } else {
            Alert.alert('No Response', 'Try again');
          }
        } catch (error: any) {
          Alert.alert('Error', error.message);
        } finally {
          setLoading(false);
        }
      };

      generateResponse();
      
      // Clear params
      (navigation as any).setParams({ questionFromHome: undefined });
    }
  }, [route.params]);

  const askGammy = async () => {
    if (!question.trim() || !gameTitle.trim() || !category.trim()) {
      Alert.alert('Missing Info', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    setShowResponse(false);
    setFeedbackGiven(null);

    try {
      const apiResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `You are Gammy, a professional gaming strategy assistant. Provide a helpful answer to this question about ${gameTitle} (${category}): "${question}"
                       Give practical gameplay tips and strategies. IMPORTANT: Your response must be EXACTLY 200 words or less. Be concise but informative. Never be very casual. `
              }]
            }]
          })
        }
      );

      const data = await apiResponse.json();
      
      if (data.error) {
        Alert.alert('Error', data.error.message);
        return;
      }

      if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
        setResponse(data.candidates[0].content.parts[0].text);
        setShowResponse(true);
      } else {
        Alert.alert('No Response', 'Try again');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const requestAlternative = () => {
    askGammy();
  };

  const handleFeedback = (isHelpful: boolean) => {
    setFeedbackGiven(isHelpful ? 'helpful' : 'not-helpful');
    
    Alert.alert(
      'Thank you!',
      isHelpful 
        ? 'Glad Gammy could help! 🎮' 
        : 'Thanks for the feedback. We\'ll work on better responses!'
    );
  };

  return (
    <View style={styles.container}>
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

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={styles.title}>Ask Gammy</Text>

          <Text style={styles.label}>Question</Text>
          <TextInput
            style={styles.input}
            placeholder="How do I beat the final boss in Star Wars?"
            placeholderTextColor="#999"
            value={question}
            onChangeText={setQuestion}
            multiline
          />

          {/* Canned Questions List */}
          <Text style={styles.cannedQuestionsTitle}>Quick Questions</Text>
          <View style={styles.cannedQuestionsContainer}>
            {CANNED_QUESTIONS.map((cannedQ, index) => (
              <TouchableOpacity
                key={index}
                style={styles.cannedQuestionButton}
                onPress={() => setQuestion(cannedQ)}
              >
                <Text style={styles.cannedQuestionText}>{cannedQ}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Title of the game</Text>
          <TextInput
            style={styles.input}
            placeholder="Star Wars"
            placeholderTextColor="#999"
            value={gameTitle}
            onChangeText={setGameTitle}
          />
          
          <Text style={styles.label}>Category</Text>
          <TextInput
            style={styles.input}
            placeholder="Action"
            placeholderTextColor="#999"
            value={category}
            onChangeText={setCategory}
          />

          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#000" />
              <Text style={styles.loadingText}>Gammy is thinking...</Text>
            </View>
          )}

          {showResponse && response && (
            <>
              <Text style={styles.responseTitle}>AI-generated strategy</Text>
              <View style={styles.responseBox}>
                <Text style={styles.responseText}>{response}</Text>
              </View>

              <View style={styles.feedbackContainer}>
                <Text style={styles.feedbackText}>Was this helpful?</Text>
                <View style={styles.feedbackButtons}>
                  <TouchableOpacity 
                    onPress={() => handleFeedback(true)}
                    style={feedbackGiven === 'helpful' && styles.selectedFeedback}
                  >
                    <Ionicons 
                      name={feedbackGiven === 'helpful' ? "thumbs-up" : "thumbs-up-outline"} 
                      size={24} 
                      color={feedbackGiven === 'helpful' ? "#4ade80" : "#000"} 
                    />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    onPress={() => handleFeedback(false)}
                    style={feedbackGiven === 'not-helpful' && styles.selectedFeedback}
                  >
                    <Ionicons 
                      name={feedbackGiven === 'not-helpful' ? "thumbs-down" : "thumbs-down-outline"} 
                      size={24} 
                      color={feedbackGiven === 'not-helpful' ? "#ef4444" : "#000"} 
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity 
                style={styles.alternativeButton}
                onPress={requestAlternative}
              >
                <Text style={styles.alternativeText}>
                  Request an alternative strategy
                </Text>
              </TouchableOpacity>
            </>
          )}

          {!loading && !showResponse && (
            <TouchableOpacity 
              style={styles.askButton}
              onPress={askGammy}
            >
              <Text style={styles.askButtonText}>Ask Gammy</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logo: {
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontStyle: 'italic',
    fontSize: 24,
    fontWeight: 'bold',
  },
  profileContainer: {
    width: 40,
    height: 40,
  },
  avatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
  },
  reportText: {
    fontSize: 12,
    color: '#6366f1',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  label: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop: 15,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    minHeight: 50,
  },
  askButton: {
    backgroundColor: '#000',
    borderRadius: 10,
    padding: 18,
    alignItems: 'center',
    marginTop: 25,
  },
  askButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  responseTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 30,
    marginBottom: 15,
  },
  responseBox: {
    backgroundColor: '#000',
    borderRadius: 15,
    padding: 20,
  },
  responseText: {
    color: '#fff',
    fontSize: 16,
    lineHeight: 24,
  },
  feedbackContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
  },
  feedbackText: {
    fontSize: 16,
    fontWeight: '500',
  },
  feedbackButtons: {
    flexDirection: 'row',
    gap: 15,
  },
  selectedFeedback: {
    opacity: 0.6,
  },
  alternativeButton: {
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    padding: 18,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  alternativeText: {
    color: '#6366f1',
    fontSize: 16,
    fontWeight: '600',
  },
  cannedQuestionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 10,
    marginBottom: 8,
    color: '#666',
  },
  cannedQuestionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 15,
  },
  cannedQuestionButton: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  cannedQuestionText: {
    fontSize: 14,
    color: '#333',
  },
});
