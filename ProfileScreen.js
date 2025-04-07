import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, SafeAreaView, ScrollView, Alert, StatusBar, Dimensions, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';

const { width, height } = Dimensions.get('window');

const ProfileScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const userId = route.params?.userId || '';
  const username = route.params?.username || '';
  const [bio, setBio] = useState('');
  const [name, setName] = useState('');
  const [profilePic, setProfilePic] = useState(null);
  const [socialLinks, setSocialLinks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [registeredAt, setRegisteredAt] = useState(null);
  const [accountAgeDays, setAccountAgeDays] = useState(null);
  const [streakCount, setStreakCount] = useState(0);
  const [isStatusModalVisible, setIsStatusModalVisible] = useState(false);
 
  useFocusEffect(
    React.useCallback(() => {
      fetchProfileData();
      fetchStreakCount();
    }, [route.params?.refreshProfile])
  );

  useEffect(() => {
    fetchProfileData();
    fetchStreakCount();
  }, []);

  const fetchProfileData = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`http://192.168.25.183:4000/profileget`, {
        params: { userId: userId }
      });
      
      if (response.data) {
        if (response.data.name) setName(response.data.name);
        if (response.data.bio) setBio(response.data.bio);
        if (response.data.profilePic) setProfilePic(response.data.profilePic);
        
        if (response.data.socialLinks) {
          setSocialLinks(response.data.socialLinks);
        }

        if (response.data.registeredAt) {
          setRegisteredAt(response.data.registeredAt);
          
          if (response.data.accountAgeDays !== undefined) {
            setAccountAgeDays(response.data.accountAgeDays);
          } else {
            const registrationDate = new Date(response.data.registeredAt);
            const currentDate = new Date();
            const differenceInTime = currentDate.getTime() - registrationDate.getTime();
            const differenceInDays = Math.floor(differenceInTime / (1000 * 3600 * 24));
            
            setAccountAgeDays(differenceInDays);
          }
        }
      }
      
    } catch (error) {
      console.log('No profile data found for this user yet.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStreakCount = async () => {
    try {
      const response = await axios.get(`http://192.168.25.183:4000/get-streak-count`, {
        params: { profileUserId: userId }
      });
      
      if (response.data.success) {
        setStreakCount(response.data.streakCount);
      }
    } catch (error) {
      console.log('Error fetching streak count:', error);
    }
  };

  const navigateToSettings = () => {
    navigation.navigate('Settings', {
      userId: userId,
      username: username,
      initialName: name,
      initialBio: bio,
      initialProfilePic: profilePic,
      initialSocialLinks: socialLinks
    });
  };

  const navigateToFeed = () => {
    navigation.navigate('Feed',{
      userId: userId,
    });
  };

  const getIconName = (platform) => {
    const platform_lower = platform.toLowerCase();
    if (platform_lower.includes('youtube')) return 'logo-youtube';
    if (platform_lower.includes('twitter') || platform_lower.includes('x')) return 'logo-twitter';
    if (platform_lower.includes('instagram')) return 'logo-instagram';
    if (platform_lower.includes('facebook')) return 'logo-facebook';
    if (platform_lower.includes('linkedin')) return 'logo-linkedin';
    if (platform_lower.includes('github')) return 'logo-github';
    if (platform_lower.includes('tiktok')) return 'logo-tiktok';
    return 'link-outline';
  };

  const getIconColor = (platform) => {
    const platform_lower = platform.toLowerCase();
    if (platform_lower.includes('youtube')) return '#FF0000';
    if (platform_lower.includes('twitter') || platform_lower.includes('x')) return '#1DA1F2';
    if (platform_lower.includes('instagram')) return '#E1306C';
    if (platform_lower.includes('facebook')) return '#4267B2';
    if (platform_lower.includes('linkedin')) return '#0077B5';
    if (platform_lower.includes('github')) return '#6e5494';
    if (platform_lower.includes('tiktok')) return '#69C9D0';
    return '#FFFFFF';
  };

  // Status handling functions
  const handleStatusButton = () => {
    setIsStatusModalVisible(true);
  };

  const closeStatusModal = () => {
    setIsStatusModalVisible(false);
  };

  const pickImage = async () => {
    try {
      // First, ask for permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'We need camera roll permissions to upload images');
        return;
      }
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });
  
      if (!result.canceled) {
        uploadStatus(result.assets[0].uri, 'image');
        closeStatusModal();
      }
    } catch (error) {
      console.error('ImagePicker error:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };
  
  const pickVideo = async () => {
    try {
      // First, ask for permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'We need camera roll permissions to upload videos');
        return;
      }
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 1,
      });
  
      if (!result.canceled) {
        uploadStatus(result.assets[0].uri, 'video');
        closeStatusModal();
      }
    } catch (error) {
      console.error('VideoPicker error:', error);
      Alert.alert('Error', 'Failed to pick video');
    }
  };

  const uploadStatus = async (uri, type) => {
    try {
      const formData = new FormData();
      
      // Get file extension
      const uriParts = uri.split('.');
      const fileExtension = uriParts[uriParts.length - 1];
      
      // Create file name
      const fileName = `status-${Date.now()}.${fileExtension}`;
      
      // Append file to form data
      formData.append('file', {
        uri,
        name: fileName,
        type: type === 'image' ? `image/${fileExtension}` : `video/${fileExtension}`,
      });
      
      // Add necessary data
      formData.append('userId', userId);
      formData.append('statusType', type);
      
      // Show uploading indicator
      Alert.alert('Uploading', 'Your status is being uploaded...');
      
      // Send to server
      const response = await axios.post('http://192.168.25.183:4000/upload-status', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      if (response.data.success) {
        Alert.alert('Success', 'Your status has been uploaded!');
      } else {
        Alert.alert('Error', response.data.message || 'Failed to upload status');
      }
    } catch (error) {
      console.error('Status upload error:', error);
      Alert.alert('Error', 'Failed to upload status');
    }
  };
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#1C1C1E" />
      
      {/* Fixed Wellkin Header */}
      <View style={styles.wellkinHeader}>
        <Text style={styles.wellkinTitle}>Wellkin</Text>
        <View style={styles.headerLeftIcon}>
          <TouchableOpacity onPress={navigateToFeed}>
            <Ionicons name="images-outline" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.headerRightIcon}>
          <TouchableOpacity onPress={navigateToSettings}>
            <Ionicons name="settings-outline" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Status Add Button */}
      <TouchableOpacity 
        style={styles.statusButton}
        onPress={handleStatusButton}
      >
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Scrollable Content (including profile image) */}
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Image */}
        <View style={styles.profileImageContainer}>
          {profilePic ? (
            <Image 
              source={{ uri: profilePic }} 
              style={styles.profileImage} 
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.profileImage, styles.placeholderImage]}>
              <Ionicons name="person" size={80} color="#FFFFFF" />
            </View>
          )}
        </View>
        
        {/* User Info */}
        <View style={styles.userInfoContainer}>
          {name ? (
            <Text style={styles.name}>{name}</Text>
          ) : (
            <Text style={styles.noInfoText}>Add your name</Text>
          )}
          <Text style={styles.username}>@{username}</Text>
          
          {/* Streak Count Display */}
          <View style={styles.streakContainer}>
            <Ionicons name="flame" size={16} color="#FF9500" />
            <Text style={styles.streakText}>
              {streakCount} {streakCount === 1 ? 'Prime' : 'Primes'}
            </Text>
          </View>
          
          {accountAgeDays !== null && (
            <View style={styles.accountAgeContainer}>
              <Ionicons name="time-outline" size={16} color="#FFFFFF" />
              <Text style={styles.accountAgeText}>
                {accountAgeDays} {accountAgeDays === 1 ? 'day' : 'days'} with us
              </Text>
            </View>
          )}
        </View>
      
      {/* Bio section */}
      <View style={styles.bioContainer}>
        {bio ? (
          <Text style={styles.bio}>{bio}</Text>
        ) : (
          <Text style={styles.noInfoText}>Add a bio to tell people about yourself</Text>
        )}
      </View>
      
      {/* Edit Profile Button */}
      <TouchableOpacity onPress={navigateToSettings} style={styles.editProfileButton}>
        <Text style={styles.editProfileText}>Edit Profile</Text>
      </TouchableOpacity>
      
      {/* Social Links Section */}
      <View style={styles.sectionHeader}>
        <Ionicons name="link-outline" size={22} color="#FFFFFF" />
        <Text style={styles.sectionTitle}>Social Links</Text>
      </View>
      
      {socialLinks && socialLinks.length > 0 ? (
        <View style={styles.socialLinksContainer}>
          {socialLinks.map((link, index) => (
            <TouchableOpacity 
              key={index} 
              style={styles.socialLink}
              onPress={() => {
                Alert.alert("Opening Link", `Opening ${link.url}`);
              }}
            >
              <Ionicons name={getIconName(link.platform)} size={20} color={getIconColor(link.platform)} />
              <Text style={styles.socialLinkText}>{link.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      ) : (
        <TouchableOpacity 
          style={styles.addSocialButton}
          onPress={navigateToSettings}
        >
          <Ionicons name="add-circle-outline" size={18} color="#FFFFFF" />
          <Text style={styles.addSocialText}>Add social links</Text>
        </TouchableOpacity>
      )}
      
      <View style={styles.footerSpace} />
    </ScrollView>

    {/* Status Upload Modal */}
    <Modal
      animationType="slide"
      transparent={true}
      visible={isStatusModalVisible}
      onRequestClose={closeStatusModal}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Add Status</Text>
          <Text style={styles.modalSubtitle}>
            Share a photo or video that will disappear after 24 hours
          </Text>
          
          <TouchableOpacity 
            style={styles.modalButton}
            onPress={pickImage}
          >
            <Ionicons name="image-outline" size={24} color="#FFFFFF" style={styles.modalButtonIcon} />
            <Text style={styles.modalButtonText}>Upload Image</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.modalButton}
            onPress={pickVideo}
          >
            <Ionicons name="videocam-outline" size={24} color="#FFFFFF" style={styles.modalButtonIcon} />
            <Text style={styles.modalButtonText}>Upload Video</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.modalButton, styles.cancelButton]}
            onPress={closeStatusModal}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#1C1C1E',
  },
  wellkinHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#1C1C1E',
    zIndex: 100, // Ensure header stays above everything
  },
  headerLeftIcon: {
    width: 50,  
    alignItems: 'flex-start',
    left: 100,
  },
  headerRightIcon: {
    width: 50,  
    alignItems: 'flex-end',
  },
  wellkinTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  // Status Button Styles
  statusButton: {
    position: 'absolute',
    right: 20,
    bottom: 100,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FF9500',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    zIndex: 999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#1C1C1E',
    marginTop: 60, // Make space for the fixed header
  },
  scrollViewContent: {
    paddingBottom: 20,
  },
  profileImageContainer: {
    width: '100%',
    height: height * 0.5,
    marginBottom: 20,
  },
  profileImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderImage: {
    backgroundColor: '#2C2C2E',
  },
  userInfoContainer: {
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  username: {
    fontSize: 16,
    color: '#8E8E93',
    marginBottom: 10,
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2C2C2E',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginTop: 6,
  },
  streakText: {
    fontSize: 14,
    color: '#FF9500',
    marginLeft: 6,
    fontWeight: '500',
  },
  accountAgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2C2C2E',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginTop: 6,
  },
  accountAgeText: {
    fontSize: 14,
    color: '#FFFFFF',
    marginLeft: 6,
    fontWeight: '500',
  },
  bioContainer: {
    width: '100%',
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  bio: {
    fontSize: 15,
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 22,
  },
  noInfoText: {
    fontSize: 15,
    color: '#8E8E93',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  editProfileButton: {
    backgroundColor: '#2C2C2E',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 28,
    marginBottom: 28,
  },
  editProfileText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
    textAlign: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
    letterSpacing: 0.5,
  },
  socialLinksContainer: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    marginBottom: 28,
    justifyContent: 'center',
  },
  socialLink: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2C2C2E',
    margin: 6,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 24,
  },
  socialLinkText: {
    fontSize: 14,
    color: '#FFFFFF',
    marginLeft: 8,
    fontWeight: '500',
  },
  addSocialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2C2C2E',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 24,
    marginBottom: 28,
  },
  addSocialText: {
    fontSize: 14,
    color: '#FFFFFF',
    marginLeft: 8,
    fontWeight: '500',
  },
  footerSpace: {
    height: 20,
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#2C2C2E',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 22,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 24,
    textAlign: 'center',
  },
  modalButton: {
    flexDirection: 'row',
    backgroundColor: '#3A3A3C',
    width: '100%',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  modalButtonIcon: {
    marginRight: 12,
  },
  modalButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  cancelButton: {
    backgroundColor: '#FF3B30',
    marginTop: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    width: '100%',
  },
});

export default ProfileScreen;