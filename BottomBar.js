import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, StyleSheet, Platform, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from '@react-native-community/blur';
import { FontAwesome } from '@expo/vector-icons';
import { useRoute } from '@react-navigation/native';

// Import your screens
import ReelsScreen from './ReelsScreen';
import MemesScreen from './MemesScreen';
import UploadScreen from './UploadScreen';
import ProfileScreen from './ProfileScreen';
import SearchScreen from './SearchScreen';

const Tab = createBottomTabNavigator();
const { height } = Dimensions.get('window');

// Helper function to detect if device has software navigation buttons
const hasSoftwareNavigation = () => {
  return Platform.OS === 'android' && Dimensions.get('window').height < Dimensions.get('screen').height;
};

// Custom tab button component with animation
const TabButton = ({ children, onPress, accessibilityLabel }) => {
  const animation = new Animated.Value(0);
  
  const handlePress = () => {
    Animated.sequence([
      Animated.timing(animation, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(animation, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
    
    onPress();
  };

  const scale = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.9],
  });

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.7}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
    >
      <Animated.View style={{ transform: [{ scale }] }}>
        {children}
      </Animated.View>
    </TouchableOpacity>
  );
};

const BottomBar = () => {
  const route = useRoute();
  const { userId, email, username } = route.params || {};
  const insets = useSafeAreaInsets();
  
  // Calculate bottom padding based on device type and navigation
  const getBottomPadding = () => {
    if (Platform.OS === 'ios') {
      return Math.max(insets.bottom, 5); // Reduced from 10 to 5
    } else {
      if (hasSoftwareNavigation()) {
        return 5; // Reduced from 10 to 5
      } else {
        return Math.max(insets.bottom, 10); // Reduced from 15 to 10
      }
    }
  };
  
  const bottomPadding = getBottomPadding();
  const tabBarHeight = 50 + bottomPadding; // Reduced from 60 to 50

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          ...styles.tabBarStyle,
          height: tabBarHeight,
          paddingBottom: bottomPadding,
        },
        tabBarShowLabel: false,
        tabBarHideOnKeyboard: true,
        tabBarBackground: () => (
          <View style={[StyleSheet.absoluteFill, { backgroundColor: 'black' }]} />
        ),
      }}
    >
      {/* Tab screens */}
      <Tab.Screen 
        name="Reels"   
        component={ReelsScreen} 
        initialParams={{ userId }} 
        options={{ 
          tabBarIcon: ({ focused }) => (
            <View style={styles.tabIconContainer}>
              <FontAwesome 
                name={focused ? "video-camera" : "video-camera"} 
                color={focused ? "#FFFFFF" : "#A0A0A0"} 
                size={24} // Reduced from 28 to 24
              />
            </View>
          ),
          tabBarButton: (props) => (
            <TabButton {...props} accessibilityLabel="Reels tab" />
          ),
        }}
      />
      <Tab.Screen 
        name="Memes" 
        component={MemesScreen} 
        options={{ 
          tabBarIcon: ({ focused }) => (
            <View style={styles.tabIconContainer}>
              <FontAwesome 
                name={focused ? "image" : "image"} 
                color={focused ? "#FFFFFF" : "#A0A0A0"} 
                size={22} // Reduced from 26 to 22
              />
            </View>
          ),
          tabBarButton: (props) => (
            <TabButton {...props} accessibilityLabel="Memes tab" />
          ),
        }}
      />
     <Tab.Screen 
  name="Search" 
  component={SearchScreen} 
  options={{ 
    tabBarIcon: ({ focused }) => (
      <View style={styles.tabIconContainer}>
        <FontAwesome 
          name="search" 
          color={focused ? "#FFFFFF" : "#A0A0A0"} 
          size={22}
        />
      </View>
    ),
    tabBarButton: (props) => (
      <TabButton {...props} accessibilityLabel="Search tab" />
    ),
  }}
/>
      <Tab.Screen 
        name="Upload" 
        component={UploadScreen} 
        initialParams={{ userId, username }}  
        options={{ 
          tabBarIcon: ({ focused }) => (
            <View style={styles.uploadButtonWrapper}>
              <View style={[
                styles.uploadButton,
                focused && { backgroundColor: '#404040' }
              ]}>
                <FontAwesome 
                  name="plus" 
                  color={focused ? "#FFFFFF" : "#FFFFFF"} 
                  size={20} // Reduced from 22 to 20
                />
              </View>
            </View>
          ),
          tabBarButton: (props) => (
            <TabButton {...props} accessibilityLabel="Upload content" />
          ),
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        initialParams={{ userId, username }}
        options={{ 
          tabBarIcon: ({ focused }) => (
            <View style={styles.tabIconContainer}>
              <FontAwesome 
                name={focused ? "user" : "user-o"} 
                color={focused ? "#FFFFFF" : "#A0A0A0"} 
                size={22} // Reduced from 26 to 22
              />
            </View>
          ),
          tabBarButton: (props) => (
            <TabButton {...props} accessibilityLabel="Profile tab" />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBarStyle: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 0.5,
    borderTopColor: '#333333',
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: -5 },
    backgroundColor: 'black',
  },
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    width: '100%',
    left: 20,
    
    top: Platform.select({
      ios: 10, // Reduced from 14 to 10
      android: 15, // Reduced from 20 to 15
    }),
  },
  uploadButtonWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    width: '100%',
  },
  uploadButton: {
    backgroundColor: '#262626',
    width: 30, // Reduced from 32 to 30
    height: 30, // Reduced from 32 to 30
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    left: 30,
    top: Platform.select({
      ios: 10, // Reduced from 14 to 10
      android: 15, // Reduced from 20 to 15
    }),
  },
});

export default BottomBar;