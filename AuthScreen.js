import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Modal,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  StatusBar,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
  Animated,
} from "react-native";
import { TextInput } from "react-native-paper";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Custom Alert Component with dark theme
const CustomAlert = ({ visible, title, message, onDismiss }) => {
  const [animation] = useState(new Animated.Value(0));
  
  useEffect(() => {
    if (visible) {
      Animated.spring(animation, {
        toValue: 1,
        useNativeDriver: true,
        friction: 8,
        tension: 40,
      }).start();
    } else {
      animation.setValue(0);
    }
  }, [visible]);
  
  const translateY = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [300, 0],
  });
  
  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.modalOverlay}>
        <Animated.View 
          style={[
            styles.alertContainer,
            { transform: [{ translateY }] }
          ]}
        >
          <Text style={styles.alertTitle}>{title}</Text>
          <Text style={styles.alertMessage}>{message}</Text>
          <TouchableOpacity 
            style={styles.alertButton} 
            onPress={onDismiss}
          >
            <Text style={styles.alertButtonText}>OK</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};

const AuthScreen = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSignup, setIsSignup] = useState(false);
  const [loading, setLoading] = useState(true);
  const [passwordVisible, setPasswordVisible] = useState(false);
  
  // Alert state
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  
  const showAlert = (title, message) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertVisible(true);
  };

  useEffect(() => {
    const checkStoredLogin = async () => {
      try {
        const userData = await AsyncStorage.getItem("userData");
        if (userData) {
          const { userId, username } = JSON.parse(userData);
          navigation.replace("Homes", { userId, username });
        }
      } catch (error) {
        console.error("Failed to load user data:", error);
      } finally {
        setLoading(false);
      }
    };
    checkStoredLogin();
  }, []);

  const storeUserData = async (data) => {
    try {
      await AsyncStorage.setItem("userData", JSON.stringify(data));
    } catch (error) {
      console.error("Failed to save user data:", error);
    }
  };

  const handleSignIn = async () => {
    if (!email || !password) {
      showAlert("Error", "Please enter email and password.");
      return;
    }
    try {
      const response = await axios.post("http://192.168.25.183:4000/signin", {
        identifier: email,
        password,
      });
      const { userId, username, token } = response.data;

      await storeUserData({ userId, username, token });

      showAlert("Success", response.data.message);
      setTimeout(() => {
        setAlertVisible(false);
        navigation.replace("Homes", { userId, username });
      }, 1500);
    } catch (error) {
      showAlert("Error", error.response?.data.message || "Something went wrong");
    }
  };

  const handleRegister = async () => {
    if (!email || !password) {
      showAlert("Error", "All fields are required.");
      return;
    }
    if (password !== confirmPassword) {
      showAlert("Error", "Passwords do not match.");
      return;
    }
    try {
      const response = await axios.post("http://192.168.25.183:4000/register", {
        username: email.split('@')[0], // Simple username from email
        email: email,
        password,
      });
      const { userId, username: userName, token } = response.data;

      await storeUserData({ userId, username: userName, token });

      showAlert("Success", "Account created successfully!");
      setTimeout(() => {
        setAlertVisible(false);
        navigation.replace("Homes", { userId, username: userName });
      }, 1500);
    } catch (error) {
      showAlert("Error", error.response?.data.message || "Something went wrong");
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFFFFF" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#000000" barStyle="light-content" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}
      >
        <View style={styles.logoContainer}>
          <View style={styles.logoWrapper}>
            <MaterialCommunityIcons name="triangle" size={30} color="#FFFFFF" style={styles.logoIcon} />
          </View>
        </View>
        
        <View style={styles.formContainer}>
          <View style={styles.tabContainer}>
            <TouchableOpacity 
              style={[styles.tab, !isSignup && styles.activeTab]}
              onPress={() => setIsSignup(false)}
            >
              <Text style={[styles.tabText, !isSignup && styles.activeTabText]}>Login</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tab, isSignup && styles.activeTab]}
              onPress={() => setIsSignup(true)}
            >
              <Text style={[styles.tabText, isSignup && styles.activeTabText]}>Signup</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.formWrapper}>
            <View style={styles.inputContainer}>
              <MaterialCommunityIcons name="email-outline" size={20} color="#AAAAAA" style={styles.inputIcon} />
              <TextInput
                placeholder="Email"
                placeholderTextColor="#888888"
                value={email}
                onChangeText={setEmail}
                style={styles.input}
                textColor="#FFFFFF"  // Explicitly set text color
                theme={{ colors: { text: '#FFFFFF', primary: '#FFFFFF', placeholder: '#888888' } }}
                underlineColor="transparent"
                activeUnderlineColor="transparent"
              />
            </View>
            
            <View style={styles.inputContainer}>
              <MaterialCommunityIcons name="lock-outline" size={20} color="#AAAAAA" style={styles.inputIcon} />
              <TextInput
                placeholder="Password"
                placeholderTextColor="#888888"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!passwordVisible}
                style={styles.input}
                textColor="#FFFFFF"  // Explicitly set text color
                theme={{ colors: { text: '#FFFFFF', primary: '#FFFFFF', placeholder: '#888888' } }}
                underlineColor="transparent"
                activeUnderlineColor="transparent"
                right={<TextInput.Icon icon={passwordVisible ? "eye-off" : "eye"} color="#AAAAAA" iconColor="#AAAAAA" onPress={() => setPasswordVisible(!passwordVisible)} />}
              />
            </View>
            
            {isSignup && (
              <View style={styles.inputContainer}>
                <MaterialCommunityIcons name="lock-outline" size={20} color="#AAAAAA" style={styles.inputIcon} />
                <TextInput
                  placeholder="Confirm Password"
                  placeholderTextColor="#888888"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!passwordVisible}
                  style={styles.input}
                  textColor="#FFFFFF"  // Explicitly set text color
                  theme={{ colors: { text: '#FFFFFF', primary: '#FFFFFF', placeholder: '#888888' } }}
                  underlineColor="transparent"
                  activeUnderlineColor="transparent"
                />
              </View>
            )}
            
            {!isSignup && (
              <TouchableOpacity style={styles.forgotContainer}>
                <Text style={styles.forgotText}>Forgot Password?</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity 
              style={styles.actionButton} 
              onPress={isSignup ? handleRegister : handleSignIn}
            >
              <Text style={styles.actionButtonText}>
                {isSignup ? "Create Account" : "Login"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
      
      <CustomAlert 
        visible={alertVisible}
        title={alertTitle}
        message={alertMessage}
        onDismiss={() => setAlertVisible(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000000",
  },
  keyboardAvoidingView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  logoWrapper: {
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1A1A1A",
    borderRadius: 25,
  },
  logoIcon: {
    transform: [{ rotate: '180deg' }],
  },
  formContainer: {
    width: "100%",
    maxWidth: 350,
  },
  tabContainer: {
    flexDirection: "row",
    marginBottom: 30,
    borderBottomWidth: 1,
    borderBottomColor: "#222222",
  },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginRight: 20,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: "#FFFFFF",
  },
  tabText: {
    color: "#888888",
    fontSize: 16,
  },
  activeTabText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  formWrapper: {
    backgroundColor: "#0D0D0D",
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 20,
    width: "100%",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#222222",
    paddingBottom: 5,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    backgroundColor: "transparent",
    color: "#FFFFFF",
    fontSize: 16,
    height: 40,
  },
  forgotContainer: {
    alignSelf: "flex-end",
    marginBottom: 30,
    marginTop: 10,
  },
  forgotText: {
    color: "#AAAAAA",
    fontSize: 14,
  },
  actionButton: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  actionButtonText: {
    color: "#000000",
    fontSize: 16,
    fontWeight: "600",
  },
  // Custom Alert Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  alertContainer: {
    width: "80%",
    backgroundColor: "#1A1A1A",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#333333",
  },
  alertTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#FFFFFF",
  },
  alertMessage: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
    color: "#DDDDDD",
  },
  alertButton: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 5,
  },
  alertButtonText: {
    color: "#000000",
    fontWeight: "600",
  },
});

export default AuthScreen;