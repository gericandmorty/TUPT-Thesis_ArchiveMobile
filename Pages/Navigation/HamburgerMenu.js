import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  Platform,
  ScrollView,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API_BASE_URL from '../../api';

const { width, height } = Dimensions.get('window');

const HamburgerMenu = ({ isVisible, onClose, navigation }) => {
  const slideAnim = React.useRef(new Animated.Value(-width)).current;
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  
  // Premium Animation States
  const profileAnim = React.useRef(new Animated.Value(0)).current;
  const itemAnims = React.useRef([
      new Animated.Value(0), // HOME
      new Animated.Value(0), // ANALYSIS WORKSPACE
      new Animated.Value(0), // SUBMIT THESIS
      new Animated.Value(0)  // MY SUBMISSIONS
  ]).current;

  const [user, setUser] = useState(null);

  // Load user data from AsyncStorage when menu becomes visible
  useEffect(() => {
    if (isVisible) {
      loadUserData();
    }
  }, [isVisible]);

  const loadUserData = async () => {
    try {
      const userDataStr = await AsyncStorage.getItem('userData');
      const token = await AsyncStorage.getItem('userToken');
      
      if (userDataStr) {
        const cached = JSON.parse(userDataStr);
        setUser(cached);

        // Fetch latest profile from API to keep data fresh (like the web profile page does)
        if (token && cached._id) {
          try {
            const res = await fetch(`${API_BASE_URL}/user/profile?userId=${cached._id}`, {
              headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
              const data = await res.json();
              if (data.success && data.data?.user) {
                // Save full user object — exactly like web does
                setUser(data.data.user);
                await AsyncStorage.setItem('userData', JSON.stringify(data.data.user));
              }
            }
          } catch (fetchErr) {
            // Silently fail — cached data is still shown
            console.log('Could not refresh profile from API:', fetchErr.message);
          }
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  React.useEffect(() => {
    if (isVisible) {
      // Step 1: Slide menu and fade overlay
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Step 2: Entrance animation for profile
        Animated.timing(profileAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }).start();

        // Step 3: Staggered entrance for menu items
        const itemAnimations = itemAnims.map((anim, index) => 
          Animated.timing(anim, {
            toValue: 1,
            duration: 300,
            delay: index * 60,
            useNativeDriver: true,
          })
        );
        Animated.parallel(itemAnimations).start();
      });
    } else {
      // Step 4: Out animation
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -width,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Reset all entrance animations for next opening
        profileAnim.setValue(0);
        itemAnims.forEach(anim => anim.setValue(0));
      });
    }
  }, [isVisible]);

  // Updated navigation routes matching the screenshot
  const menuItems = [
    { icon: 'home', label: 'HOME', screen: 'Home' },
    { icon: 'document-text', label: 'ANALYSIS WORKSPACE', screen: 'AnalysisWorkspace' },
    { icon: 'cloud-upload', label: 'SUBMIT THESIS', screen: 'SubmitThesis' },
    { icon: 'folder', label: 'MY SUBMISSIONS', screen: 'MySubmissions' },
  ];

  const handleMenuItemPress = (screen) => {
    onClose();
    // Navigate to the specified screen. Need to ensure these exist in App.js
    if (navigation && screen) {
       navigation.navigate(screen);
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('userData');
      await AsyncStorage.removeItem('userToken');
      setUser(null);
      onClose();
      // Reset navigation stack to Login screen
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Overlay */}
      <Animated.View 
        style={[
          styles.overlay,
          { opacity: fadeAnim }
        ]}
      >
        <TouchableOpacity 
          style={StyleSheet.absoluteFill}
          onPress={onClose}
          activeOpacity={1}
        />
      </Animated.View>
      
      {/* Menu Side Panel */}
      <Animated.View 
        style={[
          styles.menuContainer,
          { transform: [{ translateX: slideAnim }] }
        ]}
      >
        <LinearGradient
          colors={['#7f0000', '#450a0a']} // Deep dark continuous red
          style={styles.menuGradient}
        >
          {/* Top Profile Section */}
          <Animated.View style={[
            styles.headerSection,
            {
              opacity: profileAnim,
              transform: [{
                translateY: profileAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0]
                })
              }]
            }
          ]}>
            <TouchableOpacity 
              style={styles.userSection}
              onPress={() => {
                onClose();
                navigation.navigate('Profile');
              }}
              activeOpacity={0.8}
            >
              <View style={styles.userAvatarContainer}>
                {/* Profile photo or user icon */}
                {user?.profilePhoto ? (
                  <Image
                    source={{ uri: user.profilePhoto.startsWith('http') ? user.profilePhoto : `${API_BASE_URL}${user.profilePhoto}` }}
                    style={styles.userAvatar}
                  />
                ) : (
                  <LinearGradient
                    colors={['#111827', '#1f2937']}
                    style={styles.userAvatar}
                  >
                    <Ionicons name="person" size={48} color="white" />
                  </LinearGradient>
                )}
                {/* Red Edit Floating Action Button on Bottom Right */}
                <View style={styles.editIconContainer}>
                  <Ionicons name="create-outline" size={14} color="white" />
                </View>
              </View>
              
              <Text style={styles.userName}>
                {user?.name || 'Geric'} {/* Use real name from Auth state or fallback to image name */}
              </Text>

              <View style={styles.userIdBadge}>
                <Text style={styles.userIdText}>
                  {user?.idNumber || 'TUPT-11-1111'}
                </Text>
              </View>
              
              <Text style={styles.portalSubtitle}>
                UNIVERSITY ARCHIVE PORTAL
              </Text>
            </TouchableOpacity>
          </Animated.View>

          {/* List of Navigation Actions */}
          <ScrollView 
            style={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContentContainer}
          >
            <View style={styles.menuItemsBlock}>
              {menuItems.map((item, index) => (
                <Animated.View 
                  key={index}
                  style={{
                    opacity: itemAnims[index],
                    transform: [{
                      translateX: itemAnims[index].interpolate({
                        inputRange: [0, 1],
                        outputRange: [-20, 0]
                      })
                    }]
                  }}
                >
                  <TouchableOpacity
                    style={styles.menuItemBtn}
                    onPress={() => handleMenuItemPress(item.screen)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.menuItemLeft}>
                      <View style={styles.menuIconContainer}>
                        <Ionicons name={item.icon} size={22} color="#fca5a5" />
                      </View>
                      <Text style={styles.menuItemLabel}>{item.label}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#f87171" style={styles.chevronIcon} />
                  </TouchableOpacity>
                </Animated.View>
              ))}
            </View>
          </ScrollView>

          {/* Bottom Logout Section */}
          <View style={styles.bottomSection}>
            <TouchableOpacity 
              style={styles.logoutButton}
              onPress={user ? handleLogout : () => { onClose(); navigation.navigate('Login'); }}
              activeOpacity={0.8}
            >
               <Ionicons name={user ? "log-out-outline" : "log-in-outline"} size={22} color="white" style={{ marginRight: 10 }} />
               <Text style={styles.logoutText}>{user ? "LOGOUT" : "LOGIN"}</Text>
            </TouchableOpacity>
            
            <View style={styles.portalBrandingFooter}>
                 {/* subtle bottom divider */}
                 <View style={styles.footerDivider} />
                 <Text style={styles.portalFooterText}>TUPT THESIS ARCHIVE</Text>
            </View>
          </View>

        </LinearGradient>
      </Animated.View>
    </>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    zIndex: 999,
  },
  menuContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: width * 0.82, // Standard sidebar width
    height: '100%',
    zIndex: 1000,
  },
  menuGradient: {
    flex: 1,
  },
  headerSection: {
    paddingTop: Platform.OS === 'ios' ? 70 : 60,
    paddingBottom: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  userSection: {
    alignItems: 'center',
    width: '100%',
  },
  userAvatarContainer: {
    marginBottom: 16,
    position: 'relative',
    padding: 2,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: 24, // Slight squircle shape per screenshot
  },
  userAvatar: {
    width: 90,
    height: 90,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1f2937', 
  },
  editIconContainer: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    backgroundColor: '#b91c1c', // deep red
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#7f0000', // matches bg to blend
  },
  userName: {
    fontSize: 28,
    fontWeight: '900',
    color: '#fff',
    marginBottom: 12,
  },
  userIdBadge: {
    backgroundColor: 'rgba(127, 29, 29, 0.6)', // transparent dark red inner pill
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  userIdText: {
    fontSize: 12,
    color: '#fca5a5',
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  portalSubtitle: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '900',
    letterSpacing: 2,
  },
  scrollContent: {
    flex: 1,
  },
  scrollContentContainer: {
    flexGrow: 1,
  },
  menuItemsBlock: {
    paddingTop: 10,
  },
  menuItemBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 24,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(127, 29, 29, 0.4)', // Darker translucent red box
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  menuItemLabel: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '900',
    letterSpacing: 1,
  },
  chevronIcon: {
    opacity: 0.5,
  },
  bottomSection: {
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 30,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(127, 29, 29, 0.4)',
    paddingVertical: 18,
    paddingHorizontal: 24,
    width: '100%',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(153, 27, 27, 0.5)',
    marginBottom: 24,
  },
  logoutText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 2,
  },
  portalBrandingFooter: {
      alignItems: 'center',
      width: '100%'
  },
  footerDivider: {
      width: 40,
      height: 2,
      backgroundColor: 'rgba(255,255,255,0.1)',
      marginBottom: 16,
      borderRadius: 1
  },
  portalFooterText: {
      fontSize: 10,
      color: 'rgba(255,255,255,0.3)',
      fontWeight: '900',
      letterSpacing: 4,
  }
});

export default HamburgerMenu;