import React, { useState, useEffect } from 'react';
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
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../config/firebase';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
//import * as Google from 'expo-auth-session/providers/google';
//import * as WebBrowser from 'expo-web-browser';
//import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';


//WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
 /* const [request, response, promptAsync] = Google.useAuthRequest({webClientId: '299007910534-gkkaahlqk38or2idc94wlotid2b1t6.apps.googleusercontent.com',});
  
  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      const credential = GoogleAuthProvider.credential(id_token);
      signInWithCredential(auth, credential)
        .then(() => {
          router.replace('/(tabs)');
        })
        .catch((error) => {
          Alert.alert('Error', error.message);
        });
    }
  }, [response]);*/

  const handleGoogleSignIn = () => {
  Alert.alert(
    'Coming Soon', 
    'Google Sign-In will be available in the published version. Please use email/password for now.'
  );
};


  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    setLoading(true);
    try {
      console.log('Attempting login...');
      const userCredential = await signInWithEmailAndPassword(
        auth, 
        email.toLowerCase().trim(), 
        password
      );
      
      console.log('Login successful:', userCredential.user.email);
      
      Alert.alert('Success', 'Login successful!');
      
      setTimeout(() => {
        router.replace('/(tabs)');
      }, 100);
      
    } catch (error) {
      console.error('Login error:', error.code, error.message);
      
      let errorMessage = 'Invalid email or password';
      
      switch (error.code) {
        case 'auth/invalid-credential':
        case 'auth/wrong-password':
        case 'auth/user-not-found':
          errorMessage = 'Invalid email or password';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Network error. Please check your connection';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many attempts. Try again later';
          break;
        default:
          errorMessage = error.message;
      }
      
      Alert.alert('Login Failed', errorMessage);
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
          
          <Text style={styles.title}>Welcome back, Gamer!</Text>
          <Text style={styles.subtitle}>Enter your credentials to Log In</Text>

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

          <TextInput
            style={styles.input}
            placeholder="password"
            placeholderTextColor="#999"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
            editable={!loading}
            onSubmitEditing={handleLogin}
          />

          <TouchableOpacity
            style={[styles.continueButton, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.continueButtonText}>Continue</Text>
            )}
          </TouchableOpacity>

          <Text style={styles.orText}>or</Text>

           <TouchableOpacity style={styles.socialButton} onPress={handleGoogleSignIn}>
            <Ionicons name="logo-google" size={24} color="#000000" />
            <Text style={styles.socialButtonText}>Continue with Google</Text>
           </TouchableOpacity>


          <TouchableOpacity style={styles.socialButton}>
           <Ionicons name="logo-playstation" size={24} color="#003791" />
           <Text style={styles.socialButtonText}>Continue with PlayStation</Text>
          </TouchableOpacity>


          <TouchableOpacity style={styles.socialButton}>
           <Ionicons name="logo-xbox" size={24} color="#107C10" />
           <Text style={styles.socialButtonText}>Continue with Xbox</Text>
          </TouchableOpacity>


          <View style={styles.footer}>
            <TouchableOpacity onPress={() => router.push('/forgot-password')} disabled={loading}>
              <Text style={styles.linkText}>Forgot Password?</Text>
            </TouchableOpacity>
            <Text style={styles.footerText}> | New here? </Text>
            <TouchableOpacity onPress={() => router.push('/')} disabled={loading}>
              <Text style={styles.linkText}>Sign Up</Text>
            </TouchableOpacity>
          </View>

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
    marginBottom: 30
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    marginBottom: 15
  },
  continueButton: {
    backgroundColor: '#000',
    borderRadius: 10,
    padding: 18,
    alignItems: 'center',
    marginBottom: 20
  },
  buttonDisabled: {
    opacity: 0.7
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  },
  orText: {
    textAlign: 'center',
    color: '#999',
    marginVertical: 15
  },
  socialButton: {
    flexDirection: 'row',      
    alignItems: 'center',      
    justifyContent: 'center',   
    gap: 12,                    
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 10,
    marginBottom: 12,
},

  socialButtonText: {
    fontSize: 16,
    fontWeight: '500'
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 30,
    marginBottom: 10,
    flexWrap: 'wrap'
  },
  footerText: {
    color: '#666'
  },
  linkText: {
    color: '#6366f1',
    fontWeight: '600'
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
