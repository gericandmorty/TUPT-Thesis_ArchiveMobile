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
import Colors from '../../utils/Colors';

const { width, height } = Dimensions.get('window');

const HamburgerMenu = ({ isVisible, onClose, navigation }) => {
  const slideAnim = React.useRef(new Animated.Value(-width)).current;
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const profileAnim = React.useRef(new Animated.Value(0)).current;
  const itemAnims = React.useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;

  const [user, setUser] = useState(null);

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
        if (token && cached._id) {
          try {
            const res = await fetch(`${API_BASE_URL}/user/profile?userId=${cached._id}`, {
              headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
              const data = await res.json();
              if (data.success && data.data?.user) {
                setUser(data.data.user);
                await AsyncStorage.setItem('userData', JSON.stringify(data.data.user));
              }
            }
          } catch (fetchErr) {
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
      Animated.parallel([
        Animated.timing(slideAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      ]).start(() => {
        Animated.timing(profileAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
        const itemAnimations = itemAnims.map((anim, index) =>
          Animated.timing(anim, { toValue: 1, duration: 300, delay: index * 60, useNativeDriver: true })
        );
        Animated.parallel(itemAnimations).start();
      });
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, { toValue: -width, duration: 250, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 0, duration: 250, useNativeDriver: true }),
      ]).start(() => {
        profileAnim.setValue(0);
        itemAnims.forEach(anim => anim.setValue(0));
      });
    }
  }, [isVisible]);

  const menuItems = [
    { icon: 'home', label: 'HOME', screen: 'Home' },
    { icon: 'people', label: 'COLLABORATION', screen: 'Collaboration' },
    { icon: 'document-text', label: 'ANALYSIS WORKSPACE', screen: 'AnalysisWorkspace' },
    { icon: 'cloud-upload', label: 'SUBMIT THESIS', screen: 'SubmitThesis' },
    { icon: 'folder', label: 'MY SUBMISSIONS', screen: 'MySubmissions' },
  ];

  const handleMenuItemPress = (screen) => {
    onClose();
    if (navigation && screen) navigation.navigate(screen);
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('userData');
      await AsyncStorage.removeItem('userToken');
      setUser(null);
      onClose();
      navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Overlay */}
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        <TouchableOpacity style={StyleSheet.absoluteFill} onPress={onClose} activeOpacity={1} />
      </Animated.View>

      {/* Side Panel */}
      <Animated.View style={[styles.menuContainer, { transform: [{ translateX: slideAnim }] }]}>
        <LinearGradient
          colors={[Colors.surface, Colors.background]}
          style={styles.menuGradient}
        >
          {/* Profile Header */}
          <Animated.View style={[
            styles.headerSection,
            {
              opacity: profileAnim,
              transform: [{ translateY: profileAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }]
            }
          ]}>
            <TouchableOpacity
              style={styles.userSection}
              onPress={() => { onClose(); navigation.navigate('Profile'); }}
              activeOpacity={0.8}
            >
              <View style={styles.userAvatarContainer}>
                {user?.profilePhoto ? (
                  <Image
                    source={{ uri: user.profilePhoto.startsWith('http') ? user.profilePhoto : `${API_BASE_URL}${user.profilePhoto}` }}
                    style={styles.userAvatar}
                  />
                ) : (
                  <View style={[styles.userAvatar, styles.avatarPlaceholder]}>
                    <Ionicons name="person" size={44} color={Colors.textDim} />
                  </View>
                )}
                <View style={styles.editIconContainer}>
                  <Ionicons name="create-outline" size={13} color={Colors.background} />
                </View>
              </View>

              <Text style={styles.userName}>{user?.name || 'Researcher'}</Text>

              <View style={styles.userIdBadge}>
                <Text style={styles.userIdText}>{user?.idNumber || 'TUPT-XX-XXXX'}</Text>
              </View>

              <Text style={styles.portalSubtitle}>UNIVERSITY ARCHIVE PORTAL</Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Navigation Items */}
          <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContentContainer}>
            <View style={styles.menuItemsBlock}>
              {menuItems.map((item, index) => (
                <Animated.View
                  key={index}
                  style={{
                    opacity: itemAnims[index],
                    transform: [{ translateX: itemAnims[index].interpolate({ inputRange: [0, 1], outputRange: [-20, 0] }) }]
                  }}
                >
                  <TouchableOpacity
                    style={styles.menuItemBtn}
                    onPress={() => handleMenuItemPress(item.screen)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.menuItemLeft}>
                      <View style={styles.menuIconContainer}>
                        <Ionicons name={item.icon} size={20} color={Colors.primary} />
                      </View>
                      <Text style={styles.menuItemLabel}>{item.label}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color={Colors.textDim} style={styles.chevronIcon} />
                  </TouchableOpacity>
                </Animated.View>
              ))}
            </View>
          </ScrollView>

          {/* Logout */}
          <View style={styles.bottomSection}>
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={user ? handleLogout : () => { onClose(); navigation.navigate('Login'); }}
              activeOpacity={0.8}
            >
              <Ionicons name={user ? 'log-out-outline' : 'log-in-outline'} size={20} color={Colors.foreground} style={{ marginRight: 10 }} />
              <Text style={styles.logoutText}>{user ? 'LOGOUT' : 'LOGIN'}</Text>
            </TouchableOpacity>

            <View style={styles.portalBrandingFooter}>
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
    backgroundColor: 'rgba(0,0,0,0.65)',
    zIndex: 999,
  },
  menuContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: width * 0.82,
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
    borderBottomColor: Colors.border,
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
    borderColor: Colors.primary,
    borderRadius: 24,
  },
  userAvatar: {
    width: 90,
    height: 90,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarPlaceholder: {
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editIconContainer: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    backgroundColor: Colors.primary,
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.surface,
  },
  userName: {
    fontSize: 26,
    fontWeight: '900',
    color: Colors.foreground,
    marginBottom: 10,
  },
  userIdBadge: {
    backgroundColor: `${Colors.primary}15`,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: `${Colors.primary}30`,
  },
  userIdText: {
    fontSize: 11,
    color: Colors.primary,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  portalSubtitle: {
    fontSize: 9,
    color: Colors.textDim,
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
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIconContainer: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: `${Colors.primary}12`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 18,
    borderWidth: 1,
    borderColor: `${Colors.primary}25`,
  },
  menuItemLabel: {
    fontSize: 13,
    color: Colors.foreground,
    fontWeight: '900',
    letterSpacing: 1,
  },
  chevronIcon: {
    opacity: 0.4,
  },
  bottomSection: {
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 30,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    alignItems: 'center',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingVertical: 16,
    paddingHorizontal: 24,
    width: '100%',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 24,
  },
  logoutText: {
    color: Colors.foreground,
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 2,
  },
  portalBrandingFooter: {
    alignItems: 'center',
    width: '100%',
  },
  footerDivider: {
    width: 40,
    height: 2,
    backgroundColor: Colors.border,
    marginBottom: 12,
    borderRadius: 1,
  },
  portalFooterText: {
    fontSize: 9,
    color: Colors.textDim,
    fontWeight: '900',
    letterSpacing: 4,
  },
});

export default HamburgerMenu;