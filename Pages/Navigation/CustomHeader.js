// Navigation/CustomHeader.js
import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Animated,
  Alert,
  Linking,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const CustomHeader = ({ onMenuPress, onSearch, searchQuery, onSearchChange }) => {
  const navigation = useNavigation();
  const searchInputRef = React.useRef(null);

  const clearSearch = () => {
    onSearchChange('');
  };

  const handleSearchSubmit = () => {
    navigation.navigate('SearchResult', { query: searchQuery });
  };

  const handleQuickSearch = () => {
    navigation.navigate('SearchResult', { query: searchQuery });
  };

  return (
    <View style={styles.header}>
      <StatusBar backgroundColor="transparent" translucent={true} barStyle="light-content" />
      
      {/* Menu Button */}
      <TouchableOpacity onPress={onMenuPress} style={styles.menuButton}>
        <Ionicons name="menu" size={28} color="white" />
      </TouchableOpacity>

      {/* Static Search Bar */}
      <View style={styles.searchWrapper}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={18} color="rgba(255, 255, 255, 0.7)" style={styles.searchIcon} />
          
          <TextInput
            ref={searchInputRef}
            style={styles.searchInput}
            placeholder="Search research papers..."
            placeholderTextColor="rgba(255, 255, 255, 0.7)"
            value={searchQuery}
            onChangeText={onSearchChange}
            onSubmitEditing={handleSearchSubmit}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
          />

          {searchQuery ? (
            <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
              <Ionicons name="close" size={18} color="white" />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.searchActions}>
        <TouchableOpacity 
          onPress={handleSearchSubmit} 
          style={styles.actionIcon}
        >
          <Ionicons name="search" size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={handleQuickSearch} 
          style={styles.actionIcon}
        >
          <Ionicons name="options" size={24} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    paddingHorizontal: 12,
    paddingTop: StatusBar.currentHeight ? StatusBar.currentHeight + 12 : 40,
    paddingBottom: 12,
  },
  menuButton: {
    padding: 8,
  },
  searchWrapper: {
    flex: 1,
    marginHorizontal: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 42,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  searchIcon: {
    marginRight: 6,
  },
  searchInput: {
    flex: 1,
    color: 'white',
    fontSize: 14,
    paddingVertical: 8,
    includeFontPadding: false,
  },
  clearButton: {
    padding: 4,
  },
  searchActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionIcon: {
    padding: 8,
  },
});

export default CustomHeader;