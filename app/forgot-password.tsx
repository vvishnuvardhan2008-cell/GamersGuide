import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../config/firebase';
import { useRouter } from 'expo-router';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendResetLink = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email.toLowerCase().trim());
      
      Alert.alert(
        'Email Sent',
        'Password reset link has been sent to your email.',
        [{ text: 'OK', onPress: () => router.push('/login') }]
      );
    } catch (error) {
      let errorMessage = 'An error occurred';
      
      switch (error.code) {
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address';
          break;
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email';
          break;
        default:
          errorMessage = error.message;
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <Text style={styles.logo}>GamersGuide</Text>
          
          <Text style={styles.title}>Forgot Password?</Text>
          <Text style={styles.subtitle}>
            Enter your email and we'll send you a reset link.
          </Text>

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="email@domain.com"
            placeholderTextColor="#999"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            editable={!loading}
          />

          <TouchableOpacity
            style={[styles.sendButton, loading && styles.buttonDisabled]}
            onPress={handleSendResetLink}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.sendButtonText}>Send reset link</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.push('/login')}
          >
            <Text style={styles.backButtonText}>Back to Login Page</Text>
          </TouchableOpacity>

          <View style={styles.spacer} />

          <TouchableOpacity onPress={() => Alert.alert('Report', 'Report functionality')}>
            <Text style={styles.reportText}>Report a problem</Text>
          </TouchableOpacity>

          <Text style={styles.termsText}>
            By clicking continue, you agree to our{' '}
            <Text style={styles.termsLink}>Terms of Service</Text>
            {' '}and{' '}
            <Text style={styles.termsLink}>Privacy Policy</Text>
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  // ... same base styles, add these specific ones
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  scrollContent: {
    flexGrow: 1
  },
  content: {
    flex: 1,
    paddingHorizontal: 30,
    paddingTop: Platform.OS === 'ios' ? 80 : 60,
    paddingBottom: 40
  },
  logo: {
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontStyle: 'italic',
    fontSize: 36,
    textAlign: 'center',
    marginBottom: 40
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 40
  },
  label: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    marginBottom: 20
  },
  sendButton: {
    backgroundColor: '#000',
    borderRadius: 10,
    padding: 18,
    alignItems: 'center',
    marginBottom: 20
  },
  buttonDisabled: {
    opacity: 0.7
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  },
  backButton: {
    marginTop: 10,
    marginBottom: 20
  },
  backButtonText: {
    color: '#6366f1',
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '500'
  },
  spacer: {
    flex: 1
  },
  reportText: {
    color: '#6366f1',
    textAlign: 'center',
    marginBottom: 20
  },
  termsText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 18
  },
  termsLink: {
    color: '#000',
    fontWeight: '500'
  }
});
