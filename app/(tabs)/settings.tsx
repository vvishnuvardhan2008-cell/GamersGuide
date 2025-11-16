import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  TextInput,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { auth } from '../../config/firebase';
import { signOut, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';




export default function SettingsScreen() {
  const router = useRouter();
  const user = auth.currentUser;
  const [activeTab, setActiveTab] = useState('profile');
  const [avatarUri, setAvatarUri] = useState<string | null>(null);

  // Profile state
  const [username, setUsername] = useState('Player 1');
  const [selectedPlatforms, setSelectedPlatforms] = useState(['PlayStation', 'PC']);
  const [selectedGenres, setSelectedGenres] = useState(['Racing', 'Adventure', 'Story']);

  // Security state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // ⭐ PUT useFocusEffect RIGHT HERE - After all useState ⭐
  useFocusEffect(
  useCallback(() => {
    const loadData = async () => {
      // Load platforms
      const savedPlatforms = await AsyncStorage.getItem('favoritePlatforms');
      if (savedPlatforms) {
        setSelectedPlatforms(JSON.parse(savedPlatforms));
      }
      
      // Load genres
      const savedGenres = await AsyncStorage.getItem('favoriteGenres');
      if (savedGenres) {
        setSelectedGenres(JSON.parse(savedGenres));
      }
      
      // Load avatar
      const uri = await AsyncStorage.getItem('userAvatar');
      setAvatarUri(uri);
      
      // Load saved username
      const savedUsername = await AsyncStorage.getItem('userName');
      if (savedUsername) {
        setUsername(savedUsername);
      } else {
        // Set default from email
        const user = auth.currentUser;
        if (user?.email) {
          const emailName = user.email.split('@')[0];
          setUsername(emailName.charAt(0).toUpperCase() + emailName.slice(1));
        }
      }
    };
    
    loadData();
  }, [])
);


  const saveUsername = async () => {
    try {
      await AsyncStorage.setItem('userName', username);
      Alert.alert('Success', 'Username updated!');
    } catch (error) {
      console.log('Error saving username:', error);
    }
  };

  const platforms = ['PlayStation', 'PC', 'Xbox', 'Nintendo', 'Mobile', 'Wii'];
  const genres = ['Racing', 'Adventure', 'Story', 'RPG', 'Simulation', 'Strategy', 'MMO'];

  const togglePlatform = async (platform: string) => {
  const newPlatforms = selectedPlatforms.includes(platform)
    ? selectedPlatforms.filter(p => p !== platform) : [...selectedPlatforms, platform];
  setSelectedPlatforms(newPlatforms);
  await AsyncStorage.setItem('favoritePlatforms', JSON.stringify(newPlatforms));
  };


  const toggleGenre = async (genre: string) => {
  const newGenres = selectedGenres.includes(genre)
    ? selectedGenres.filter(g => g !== genre) : [...selectedGenres, genre];
  setSelectedGenres(newGenres);
  await AsyncStorage.setItem('favoriteGenres', JSON.stringify(newGenres));
  };


  const handleUpdateSecurity = async () => {
  if (!currentPassword || !newPassword) {
    Alert.alert('Error', 'Please fill in both password fields');
    return;
  }

  if (newPassword.length < 6) {
    Alert.alert('Error', 'New password must be at least 6 characters');
    return;
  }

  const currentUser = auth.currentUser;
  if (!currentUser || !currentUser.email) {
    Alert.alert('Error', 'No user logged in');
    return;
  }

  try {
    // Step 1: Re-authenticate user with current password
    const credential = EmailAuthProvider.credential(
      currentUser.email,
      currentPassword
    );
    
    await reauthenticateWithCredential(currentUser, credential);
    console.log('Re-authentication successful');

    // Step 2: Update to new password
    await updatePassword(currentUser, newPassword);
    console.log('Password updated successfully');

    Alert.alert(
      'Success',
      'Password updated successfully!',
      [{ text: 'OK' }]
    );

    // Clear the input fields
    setCurrentPassword('');
    setNewPassword('');

  } catch (error: any) {
    console.error('Password update error:', error.code);

    let errorMessage = 'Failed to update password';

    switch (error.code) {
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        errorMessage = 'Current password is incorrect';
        break;
      case 'auth/weak-password':
        errorMessage = 'New password is too weak';
        break;
      case 'auth/requires-recent-login':
        errorMessage = 'Please log out and log back in, then try again';
        break;
      case 'auth/network-request-failed':
        errorMessage = 'Network error. Check your connection';
        break;
      default:
        errorMessage = error.message || 'Failed to update password';
    }

    Alert.alert('Error', errorMessage);
  }
};


  const handleLogout = async () => {
  try {
    await signOut(auth);
    // Give it a moment, then force navigate
    setTimeout(() => {
      router.replace('/login');
    }, 100);
  } catch (error) {
    console.error('Error:', error);
    Alert.alert('Error', 'Failed to log out');
  }
};


  const handleDeleteAccount = async () => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      Alert.alert('Error', 'No user logged in');
      return;
    }

    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await currentUser.delete();
              console.log('Account deleted successfully');
              
              // Redirect to sign up page
              setTimeout(() => {
                router.replace('/');
              }, 100);
              
            } catch (error: any) {
              console.error('Delete error:', error.code);
              
              if (error.code === 'auth/requires-recent-login') {
                Alert.alert(
                  'Re-authentication Required',
                  'For security reasons, please log out and log back in, then try deleting your account again.'
                );
              } else {
                Alert.alert('Error', 'Failed to delete account. Please try again.');
              }
            }
          }
        }
      ]
    );
  } catch (error) {
    Alert.alert('Error', 'Something went wrong');
    console.error('Error:', error);
  }
};

const pickImage = async () => {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  
  if (status !== 'granted') {
    Alert.alert('Permission Denied', 'We need camera roll permissions to upload a profile picture');
    return;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.5,
  });

  if (!result.canceled && result.assets[0]) {
    const uri = result.assets[0].uri;
    setAvatarUri(uri);
    
    // ⭐ SAVE TO ASYNC STORAGE ⭐
    await AsyncStorage.setItem('userAvatar', uri);
    
    Alert.alert('Success', 'Profile picture updated!');
  }
};


const removeAvatar = async () => {
  setAvatarUri(null);
  
  // ⭐ REMOVE FROM ASYNC STORAGE ⭐
  await AsyncStorage.removeItem('userAvatar');
  
  Alert.alert('Success', 'Profile picture removed');
};




  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.menuButton}>
          <Ionicons name="menu" size={28} color="#000" />
        </TouchableOpacity>
        <Text style={styles.logo}>GamersGuide</Text>
        <TouchableOpacity style={styles.profileIcon}>
          {avatarUri ? (
            <Image 
              source={{ uri: avatarUri }} 
              style={{ width: 40, height: 40, borderRadius: 20 }}
              key={avatarUri}
            />
          ) : (
            <Ionicons name="person-circle" size={40} color="#333" />
          )}
        </TouchableOpacity>

      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Tab Switcher */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'profile' && styles.activeTab]}
            onPress={() => setActiveTab('profile')}
          >
            <Text style={[styles.tabText, activeTab === 'profile' && styles.activeTabText]}>
              Personalize your Profile
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'security' && styles.activeTab]}
            onPress={() => setActiveTab('security')}
          >
            <Text style={[styles.tabText, activeTab === 'security' && styles.activeTabText]}>
              My Security
            </Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'profile' ? (
          <View style={styles.content}>
            {/* Avatar Section */}
            <Text style={styles.sectionTitle}>Avatar</Text>
            <View style={styles.avatarSection}>
             <View style={styles.avatarCircle}>
              {avatarUri ? (
               <Image 
               source={{ uri: avatarUri }} 
               style={styles.avatarImage}
               />
             ) : (
               <Ionicons name="person" size={50} color="#666" />
             )}
             </View>
             <View style={styles.avatarButtons}>
              <TouchableOpacity onPress={pickImage}>
               <Text style={styles.addAvatarText}>
                {avatarUri ? 'Change Avatar' : 'Add an Avatar'}
               </Text>
              </TouchableOpacity>
              {avatarUri && (
                <TouchableOpacity onPress={removeAvatar}>
                 <Text style={styles.removeAvatarText}>Remove Avatar</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>


            {/* Username Section */}
           <Text style={styles.sectionTitle}>Username</Text>
           <View style={styles.inputContainer}>
             <TextInput
               style={styles.input}
               value={username}
               onChangeText={setUsername}
             />
             <TouchableOpacity onPress={saveUsername}>
               <Text style={styles.editText}>[save]</Text>
             </TouchableOpacity>
           </View>

            {/* Email Section */}
            <Text style={styles.sectionTitle}>Email</Text>
            <View style={styles.inputContainer}>
              <Text style={styles.emailText}>{user?.email}</Text>
            </View>

            {/* Favorite Platforms */}
            <Text style={styles.sectionTitle}>Favorite Platforms</Text>
            <View style={styles.chipsContainer}>
              {platforms.map((platform) => (
                <TouchableOpacity
                  key={platform}
                  style={[
                    styles.chip,
                    selectedPlatforms.includes(platform) && styles.selectedChip
                  ]}
                  onPress={() => togglePlatform(platform)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      selectedPlatforms.includes(platform) && styles.selectedChipText
                    ]}
                  >
                    {platform}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Favorite Genres */}
            <Text style={styles.sectionTitle}>Favorite Genres</Text>
            <View style={styles.chipsContainer}>
              {genres.map((genre) => (
                <TouchableOpacity
                  key={genre}
                  style={[
                    styles.chip,
                    selectedGenres.includes(genre) && styles.selectedChip
                  ]}
                  onPress={() => toggleGenre(genre)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      selectedGenres.includes(genre) && styles.selectedChipText
                    ]}
                  >
                    {genre}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Report a Problem */}
            <TouchableOpacity style={styles.reportButton}>
              <Text style={styles.reportText}>Report a problem</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.content}>
            {/* Change Password Section */}
            <Text style={styles.sectionTitle}>Change Password</Text>
            <TextInput
              style={styles.passwordInput}
              placeholder="Current Password"
              placeholderTextColor="#999"
              value={currentPassword}
              onChangeText={setCurrentPassword}
              secureTextEntry
            />
            <TextInput
              style={styles.passwordInput}
              placeholder="New Password"
              placeholderTextColor="#999"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
            />

            {/* Linked Accounts Section */}
            <Text style={styles.sectionTitle}>Linked Accounts</Text>
            
            <View style={styles.linkedAccountItem}>
              <View style={styles.accountLeft}>
                <View style={[styles.accountIcon]}>
                  <Ionicons name="logo-google" size={24} color="#000000" />
                </View>
                <Text style={styles.accountName}>Google</Text>
              </View>
              <TouchableOpacity>
                <Text style={styles.unlinkText}>[unlink]</Text>
              </TouchableOpacity>
            </View>


            {/* Link an Account Button */}
            <TouchableOpacity style={styles.linkAccountButton}>
              <Text style={styles.linkAccountText}>Link an account</Text>
            </TouchableOpacity>

            {/* Update Security Button */}
            <TouchableOpacity style={styles.updateSecurityButton} onPress={handleUpdateSecurity}>
              <Text style={styles.updateSecurityText}>Update Security</Text>
            </TouchableOpacity>

            {/* Report a Problem */}
            <TouchableOpacity style={styles.reportButton}>
              <Text style={styles.reportText}>Report a problem</Text>
            </TouchableOpacity>

            {/* Log Out and Delete Account */}
            <View style={styles.dangerZone}>
              <TouchableOpacity onPress={handleLogout}>
                <Text style={styles.logoutText}>Log Out</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
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
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'
  },
  menuButton: {
    width: 40
  },
  logo: {
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontStyle: 'italic',
    fontSize: 24,
    fontWeight: 'bold'
  },
  profileIcon: {
    width: 40,
    alignItems: 'flex-end'
  },
  scrollView: {
    flex: 1
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 10
  },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    backgroundColor: '#f0f0f0'
  },
  activeTab: {
    backgroundColor: '#000'
  },
  tabText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500'
  },
  activeTabText: {
    color: '#fff'
  },
  content: {
    padding: 20
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 25,
    marginBottom: 15
  },
  avatarSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden'
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40
  },
  avatarButtons: {
    gap: 8
  },
  addAvatarText: {
    color: '#6366f1',
    fontSize: 16,
    fontWeight: '500'
  },
  removeAvatarText: {
    color: '#ff3b30',
    fontSize: 14,
    fontWeight: '500'
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0'
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#000'
  },
  emailText: {
    flex: 1,
    fontSize: 16,
    color: '#000'
  },
  editText: {
    color: '#6366f1',
    fontSize: 14,
    fontWeight: '500'
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10
  },
  chip: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#e0e0e0'
  },
  selectedChip: {
    backgroundColor: '#000',
    borderColor: '#000'
  },
  chipText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500'
  },
  selectedChipText: {
    color: '#fff'
  },
  passwordInput: {
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 15,
    fontSize: 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0'
  },
  linkedAccountItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 15,
    marginBottom: 12
  },
  accountLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15
  },
  accountIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center'
  },
  accountName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000'
  },
  unlinkText: {
    color: '#6366f1',
    fontSize: 14,
    fontWeight: '500'
  },
  linkAccountButton: {
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    padding: 18,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 15
  },
  linkAccountText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000'
  },
  updateSecurityButton: {
    backgroundColor: '#000',
    borderRadius: 10,
    padding: 18,
    alignItems: 'center',
    marginBottom: 20
  },
  updateSecurityText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  },
  reportButton: {
    marginTop: 20,
    marginBottom: 20,
    alignItems: 'center'
  },
  reportText: {
    color: '#6366f1',
    fontSize: 14,
    fontWeight: '500'
  },
  dangerZone: {
    marginTop: 30,
    alignItems: 'center',
    gap: 15
  },
  logoutText: {
    color: '#6366f1',
    fontSize: 16,
    fontWeight: '600'
  },
  deleteAccountText: {
    color: '#6366f1',
    fontSize: 16,
    fontWeight: '600'
  }
});

