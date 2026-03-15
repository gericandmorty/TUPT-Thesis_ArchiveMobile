import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Animated,
  Platform,
  Dimensions,
  Modal,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API_BASE_URL from '../../api';

const { width } = Dimensions.get('window');

// Filter Modal Component
const FilterModal = ({ 
  visible, onClose, onApply, onClear,
  selectedYear, onYearChange,
  selectedCategory, onCategoryChange,
  selectedType, onTypeChange,
  availableYears, availableCategories
}) => {
  const types = ['all', 'Thesis', 'CAPSTONE', 'Dissertation'];

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={modalStyles.modalOverlay}>
        <View style={modalStyles.modalContainer}>
          <View style={modalStyles.modalHeader}>
            <Text style={modalStyles.modalTitle}>Refine Search</Text>
            <TouchableOpacity onPress={onClose} style={modalStyles.closeBtn}>
              <Ionicons name="close" size={24} color="#1f2937" />
            </TouchableOpacity>
          </View>

          <ScrollView 
            style={modalStyles.modalContent}
            contentContainerStyle={{ paddingBottom: Platform.OS === 'ios' ? 100 : 40 }}
            showsVerticalScrollIndicator={false}
          >
            {/* Year Filter */}
            <Text style={modalStyles.filterLabel}>Academic Year</Text>
            <View style={modalStyles.pickerContainer}>
              <Picker
                selectedValue={selectedYear}
                onValueChange={(val) => onYearChange(val)}
                style={modalStyles.picker}
                itemStyle={{ color: '#1f2937' }}
              >
                {availableYears.map(y => (
                    <Picker.Item key={y} label={y === 'all' ? 'All Years' : y} value={y} />
                ))}
              </Picker>
            </View>

            {/* Category Filter */}
            <Text style={modalStyles.filterLabel}>Department</Text>
            <View style={modalStyles.pickerContainer}>
              <Picker
                selectedValue={selectedCategory}
                onValueChange={(val) => onCategoryChange(val)}
                style={modalStyles.picker}
                itemStyle={{ color: '#1f2937' }}
              >
                {availableCategories.map(c => (
                    <Picker.Item key={c} label={c === 'all' ? 'All Departments' : c} value={c} />
                ))}
              </Picker>
            </View>

            {/* Type Filter */}
            <Text style={modalStyles.filterLabel}>Research Type</Text>
            <View style={modalStyles.pickerContainer}>
              <Picker
                selectedValue={selectedType}
                onValueChange={(val) => onTypeChange(val)}
                style={modalStyles.picker}
                itemStyle={{ color: '#1f2937' }}
              >
                {types.map(t => (
                    <Picker.Item key={t} label={t === 'all' ? 'All Types' : t} value={t} />
                ))}
              </Picker>
            </View>
          </ScrollView>

          <View style={modalStyles.modalFooter}>
            <TouchableOpacity style={modalStyles.clearBtn} onPress={onClear}>
              <Text style={modalStyles.clearBtnText}>Clear All</Text>
            </TouchableOpacity>
            <TouchableOpacity style={modalStyles.applyBtn} onPress={onApply}>
              <Text style={modalStyles.applyBtnText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const SearchResultScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  
  const initialParams = route.params || {};
  const { query } = initialParams;
  
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filter States
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [selectedYear, setSelectedYear] = useState(initialParams.year || 'all');
  const [selectedCategory, setSelectedCategory] = useState(initialParams.category || 'all');
  const [selectedType, setSelectedType] = useState(initialParams.type || 'all');

  const [availableYears, setAvailableYears] = useState(['all']);
  const [availableCategories, setAvailableCategories] = useState(['all']);

  // AI Feature States
  const [aiRecommendation, setAiRecommendation] = useState(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    fetchFilters();
  }, []);

  const fetchFilters = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const headers = { 'Authorization': `Bearer ${token}` };

      const [yearsRes, catsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/thesis/years`, { headers }),
        fetch(`${API_BASE_URL}/thesis/categories`, { headers })
      ]);

      if (yearsRes.ok) {
        const years = await yearsRes.json();
        setAvailableYears(['all', ...years]);
      }
      if (catsRes.ok) {
        const cats = await catsRes.json();
        setAvailableCategories(['all', ...cats]);
      }
    } catch (err) {
      console.error('Error fetching filters:', err);
    }
  };

  useEffect(() => {
    fetchSearchResults();
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [query, selectedYear, selectedCategory, selectedType]);

  const fetchSearchResults = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = await AsyncStorage.getItem('userToken');
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      
      const params = new URLSearchParams();
      if (query) params.append('query', query);
      if (selectedYear && selectedYear !== 'all') params.append('year', selectedYear);
      if (selectedCategory && selectedCategory !== 'all') params.append('category', selectedCategory);
      if (selectedType && selectedType !== 'all') params.append('type', selectedType);

      // Fetch all if no query and no filters (optional, but good for "Browse")
      const response = await fetch(`${API_BASE_URL}/thesis/search?${params.toString()}`, {
          headers
      });
      
      const data = await response.json();
      
      if (response.ok) {
          setResults(data);
      } else {
          setError(data.message || 'Error occurred during search');
      }
    } catch (err) {
      console.error('Search error:', err);
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    setIsFilterVisible(false);
    // fetchSearchResults is triggered by dependency array in useEffect
  };

  const clearFilters = () => {
    setSelectedYear('all');
    setSelectedCategory('all');
    setSelectedType('all');
    setIsFilterVisible(false);
  };

  const handleRecommendByAi = async () => {
    if (!query) return;
    
    setIsLoadingAi(true);
    setAiRecommendation(null);

    try {
      const token = await AsyncStorage.getItem('userToken');
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      
      const response = await fetch(`${API_BASE_URL}/thesis/recommendations`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          prompt: `I am looking for theses related to "${query}". Based on this query, please recommend a better or more specific thesis title. Your response MUST include three distinct sections formatted exactly like this:\n\nFunctional Requirements:\n[Your text here]\n\nConclusion:\n[Your text here]\n\nRecommendations:\n[Your text here]`
        })
      });

      const data = await response.json();
      
      if (response.ok) {
          setAiRecommendation(data.recommendation);
          
          if (token) {
              fetch(`${API_BASE_URL}/user/ai-history`, {
                  method: 'POST',
                  headers,
                  body: JSON.stringify({ prompt: query, recommendation: data.recommendation })
              }).catch(e => console.log('Silently failed to save AI history'));
          }
      } else {
          alert('Failed to get recommendation');
      }
    } catch (error) {
      console.error('AI Recommendation error:', error);
      alert('Network error while getting AI recommendation.');
    } finally {
      setIsLoadingAi(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header Area */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#1f2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Search Results</Text>
        <TouchableOpacity style={styles.filterTrigger} onPress={() => setIsFilterVisible(true)}>
          <Ionicons name="options" size={22} color="#1f2937" />
        </TouchableOpacity>
      </View>

      <FilterModal 
        visible={isFilterVisible}
        onClose={() => setIsFilterVisible(false)}
        selectedYear={selectedYear}
        onYearChange={setSelectedYear}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        selectedType={selectedType}
        onTypeChange={setSelectedType}
        onApply={applyFilters}
        onClear={clearFilters}
        availableYears={availableYears}
        availableCategories={availableCategories}
      />

      <LinearGradient colors={['#7f0000', '#240000']} style={styles.gradientBackground}>
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <Animated.View style={{ opacity: fadeAnim }}>
            
            {/* Active Filters / Query Info */}
            <View style={styles.infoContainer}>
                <View style={styles.infoTopRow}>
                    {query && (
                        <View style={styles.queryTag}>
                            <Text style={styles.queryTagText}>Search: "{query}"</Text>
                        </View>
                    )}
                    <TouchableOpacity style={styles.pageFilterBtn} onPress={() => setIsFilterVisible(true)}>
                        <Ionicons name="filter" size={16} color="#fff" />
                        <Text style={styles.pageFilterBtnText}>Filters</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.filterRow}>
                    {selectedYear !== 'all' && (
                        <View style={styles.filterBadge}>
                            <Text style={styles.filterBadgeText}>Year: {selectedYear}</Text>
                        </View>
                    )}
                    {selectedCategory !== 'all' && (
                        <View style={styles.filterBadge}>
                            <Text style={styles.filterBadgeText}>Dept: {selectedCategory}</Text>
                        </View>
                    )}
                    {selectedType !== 'all' && (
                        <View style={styles.filterBadge}>
                            <Text style={styles.filterBadgeText}>Type: {selectedType}</Text>
                        </View>
                    )}
                </View>
            </View>

            {/* AI Panel - Only if query exists */}
            {query && !isLoading && (
              <View style={styles.aiPanel}>
                <View style={styles.aiHeader}>
                  <View style={styles.aiIconContainer}>
                    <Ionicons name="hardware-chip" size={22} color="#7f0000" />
                  </View>
                  <View style={styles.aiHeaderTextContainer}>
                     <Text style={styles.aiTitle}>AI Title Recommendation</Text>
                     <Text style={styles.aiSubtitle}>Get a professional thesis title tailored to your search</Text>
                  </View>
                </View>
                
                {aiRecommendation ? (
                    <View style={styles.aiResultContainer}>
                        <Text style={styles.aiResultText}>{aiRecommendation}</Text>
                    </View>
                ) : (
                    <TouchableOpacity 
                        style={styles.aiButton}
                        onPress={handleRecommendByAi}
                        disabled={isLoadingAi}
                    >
                        {isLoadingAi ? (
                            <ActivityIndicator size="small" color="#fff" style={{ marginRight: 8 }} />
                        ) : (
                            <Ionicons name="sparkles" size={18} color="#fff" style={{ marginRight: 8 }} />
                        )}
                        <Text style={styles.aiButtonText}>
                            {isLoadingAi ? 'Generating Idea...' : 'Recommend by AI'}
                        </Text>
                    </TouchableOpacity>
                )}
              </View>
            )}

            {/* Error Message */}
            {error && (
              <View style={styles.errorContainer}>
                 <Ionicons name="alert-circle" size={24} color="#fecaca" />
                 <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {/* Loading Indicator */}
            {isLoading ? (
               <View style={styles.loadingContainer}>
                   <ActivityIndicator size="large" color="#fff" />
                   <Text style={styles.loadingText}>Searching archive...</Text>
               </View>
            ) : (
               // Results List
               <View style={styles.resultsContainer}>
                 {results.length > 0 ? (
                    results.map((thesis) => (
                        <TouchableOpacity 
                            key={thesis.id} 
                            style={styles.thesisCard}
                            onPress={() => navigation.navigate('ThesisDetail', { thesisId: thesis.id })}
                            activeOpacity={0.8}
                        >
                            <View style={styles.thesisCardHeader}>
                               <View style={styles.yearBadge}>
                                  <Text style={styles.yearText}>
                                      {thesis.year_range && thesis.year_range.toLowerCase() !== 'unknown' ? thesis.year_range : 'N/A'}
                                  </Text>
                               </View>
                               <Ionicons name="school-outline" size={18} color="#9ca3af" />
                            </View>
                            <Text style={styles.thesisTitle} numberOfLines={2}>{thesis.title}</Text>
                            <Text style={styles.thesisAbstract} numberOfLines={3}>{thesis.abstract}</Text>
                            <View style={styles.thesisFooter}>
                                <Ionicons name="document-text-outline" size={14} color="#9ca3af" />
                                <Text style={styles.thesisId}>{thesis.id}</Text>
                            </View>
                        </TouchableOpacity>
                    ))
                 ) : (
                    <View style={styles.emptyContainer}>
                       <View style={styles.emptyIconContainer}>
                           <Ionicons name="document-outline" size={48} color="rgba(255,255,255,0.3)" />
                       </View>
                       <Text style={styles.emptyTitle}>No results found</Text>
                       <Text style={styles.emptySubtitle}>Try adjusting your search query or filters.</Text>
                    </View>
                 )}
               </View>
            )}

          </Animated.View>
        </ScrollView>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: 15,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  backButton: { padding: 5, marginLeft: -5 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#1f2937' },
  filterTrigger: { padding: 5, marginRight: -5 },
  gradientBackground: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingVertical: 20 },
  infoContainer: { marginBottom: 20 },
  infoTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  pageFilterBtn: { 
      flexDirection: 'row', 
      alignItems: 'center', 
      backgroundColor: 'rgba(255,255,255,0.15)', 
      paddingHorizontal: 10, 
      paddingVertical: 6, 
      borderRadius: 8,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.2)'
  },
  pageFilterBtnText: { color: '#fff', fontSize: 12, fontWeight: 'bold', marginLeft: 4 },
  queryTag: {
      backgroundColor: 'rgba(255,255,255,0.12)',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.2)',
  },
  queryTagText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  filterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  filterBadge: {
      backgroundColor: 'rgba(127, 0, 0, 0.4)',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.2)',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
  },
  filterBadgeText: { color: '#fecaca', fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase' },
  aiPanel: {
      backgroundColor: '#fff',
      borderRadius: 20,
      padding: 20,
      marginBottom: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 5,
  },
  aiHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  aiIconContainer: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#fef2f2', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  aiHeaderTextContainer: { flex: 1 },
  aiTitle: { fontSize: 16, fontWeight: 'bold', color: '#1f2937', marginBottom: 2 },
  aiSubtitle: { fontSize: 12, color: '#6b7280' },
  aiButton: { flexDirection: 'row', backgroundColor: '#7f0000', borderRadius: 12, paddingVertical: 12, alignItems: 'center', justifyContent: 'center' },
  aiButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  aiResultContainer: { backgroundColor: '#f9fafb', padding: 15, borderRadius: 12, borderWidth: 1, borderColor: '#f3f4f6' },
  aiResultText: { fontSize: 14, color: '#374151', lineHeight: 22 },
  errorContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(254, 226, 226, 0.1)', padding: 15, borderRadius: 12, marginBottom: 20, borderWidth: 1, borderColor: 'rgba(254, 202, 202, 0.2)' },
  errorText: { color: '#fecaca', marginLeft: 10, flex: 1 },
  loadingContainer: { alignItems: 'center', paddingVertical: 60 },
  loadingText: { marginTop: 15, color: 'rgba(255,255,255,0.7)', fontWeight: '600' },
  resultsContainer: { gap: 15 },
  thesisCard: {
      backgroundColor: '#fff',
      borderRadius: 16,
      padding: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 6,
      elevation: 3,
  },
  thesisCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  yearBadge: { backgroundColor: '#fef2f2', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: '#fecaca' },
  yearText: { color: '#7f0000', fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' },
  thesisTitle: { fontSize: 16, fontWeight: 'black', color: '#1f2937', marginBottom: 8, lineHeight: 22 },
  thesisAbstract: { fontSize: 13, color: '#4b5563', lineHeight: 18, marginBottom: 15 },
  thesisFooter: { flexDirection: 'row', alignItems: 'center' },
  thesisId: { fontSize: 11, fontWeight: 'bold', color: '#9ca3af', marginLeft: 6, textTransform: 'uppercase', letterSpacing: 1 },
  emptyContainer: { alignItems: 'center', paddingVertical: 80 },
  emptyIconContainer: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.05)', alignItems: 'center', justifyContent: 'center', marginBottom: 15 },
  emptyTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff', marginBottom: 8 },
  emptySubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.6)', textAlign: 'center' }
});

const modalStyles = StyleSheet.create({
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
    modalContainer: { 
        backgroundColor: '#fff', 
        borderTopLeftRadius: 30, 
        borderTopRightRadius: 30, 
        minHeight: Platform.OS === 'ios' ? 500 : 400,
        maxHeight: '92%' 
    },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 25, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
    modalTitle: { fontSize: 20, fontWeight: '999', color: '#1f2937' },
    closeBtn: { padding: 5 },
    modalContent: { paddingHorizontal: 25 },
    filterLabel: { fontSize: 13, fontWeight: '800', color: '#6b7280', marginBottom: 12, marginTop: 10, textTransform: 'uppercase', letterSpacing: 1.5 },
    pickerContainer: { 
        backgroundColor: '#f9fafb', 
        borderRadius: 12, 
        borderWidth: 1, 
        borderColor: '#e5e7eb', 
        marginBottom: 25, 
        overflow: Platform.OS === 'ios' ? 'visible' : 'hidden',
        minHeight: Platform.OS === 'ios' ? 200 : 58,
        justifyContent: 'center',
    },
    picker: { 
        height: Platform.OS === 'ios' ? 200 : 58, 
        width: '100%',
        color: '#111827',
    },
    modalFooter: { 
        flexDirection: 'row', 
        paddingHorizontal: 25, 
        gap: 12, 
        paddingTop: 15, 
        paddingBottom: Platform.OS === 'ios' ? 45 : 25,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#f3f4f6',
    },
    clearBtn: { flex: 1, paddingVertical: 15, alignItems: 'center', justifyContent: 'center', borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb' },
    clearBtnText: { color: '#6b7280', fontWeight: 'bold' },
    applyBtn: { flex: 2, backgroundColor: '#7f0000', paddingVertical: 15, alignItems: 'center', justifyContent: 'center', borderRadius: 12 },
    applyBtnText: { color: '#fff', fontWeight: 'bold' },
});

export default SearchResultScreen;
