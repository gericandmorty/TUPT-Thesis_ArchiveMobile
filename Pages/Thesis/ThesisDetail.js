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
  Image,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API_BASE_URL from '../../api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DOC_WIDTH = 600; // Logical width of the document

const ThesisDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { thesisId } = route.params;

  const [thesis, setThesis] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isZoomed, setIsZoomed] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];

  // Calculate scaling to fit screen
  const horizontalPadding = 30;
  const availableWidth = SCREEN_WIDTH - horizontalPadding;
  const fitScale = availableWidth / DOC_WIDTH;
  const currentScale = isZoomed ? 1 : fitScale;

  useEffect(() => {
    fetchThesisDetails();
  }, [thesisId]);

  const fetchThesisDetails = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = await AsyncStorage.getItem('userToken');
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const response = await fetch(`${API_BASE_URL}/thesis/${thesisId}`, { headers });
      const data = await response.json();

      if (response.ok) {
        setThesis(data);
        saveToRecentHistory(data); // Save to history when loaded
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }).start();
      } else {
        setError(data.message || 'Thesis not found');
      }
    } catch (err) {
      console.error('Error fetching thesis:', err);
      setError('Network error getting thesis details');
    } finally {
      setIsLoading(false);
    }
  };

  const saveToRecentHistory = async (thesisData) => {
    try {
      const recentStr = await AsyncStorage.getItem('recent_theses');
      let recentList = recentStr ? JSON.parse(recentStr) : [];
      
      // Create simplified item
      const newItem = {
        id: thesisData.id || thesisData._id,
        title: thesisData.title,
        year: thesisData.year_range || thesisData.year || 'Unknown'
      };

      // Remove existing to avoid duplicates and move to top
      recentList = recentList.filter(item => item.id !== newItem.id);
      recentList.unshift(newItem);

      // Keep only last 10
      recentList = recentList.slice(0, 10);

      await AsyncStorage.setItem('recent_theses', JSON.stringify(recentList));
    } catch (err) {
      console.log('Error saving thesis to history:', err);
    }
  };

  const extractAuthors = (t) => {
    if (!t) return 'Unknown Author';
    if (t.author) return t.author;
    const match = t.abstract?.match(/(?:Researcher|Author|By|Researchers):\s*([^.]+)/i);
    return match ? match[1].trim() : 'Academic Research Group';
  };

  const toggleZoom = () => {
    setIsZoomed(!isZoomed);
  };

  if (isLoading) {
      return (
          <View style={[styles.container, styles.centerAll]}>
             <ActivityIndicator size="large" color="#c7242c" />
          </View>
      )
  }

  if (error || !thesis) {
      return (
          <View style={[styles.container, styles.centerAll]}>
              <Ionicons name="alert-circle" size={48} color="#ef4444" style={{marginBottom: 10}}/>
              <Text style={styles.errorText}>{error || 'Could not load thesis'}</Text>
              <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                  <Text style={styles.backBtnText}>Go Back</Text>
              </TouchableOpacity>
          </View>
      )
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBackBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#1f2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Document Viewer</Text>
        <TouchableOpacity style={styles.zoomToggle} onPress={toggleZoom}>
          <Ionicons name={isZoomed ? "contract" : "expand"} size={22} color="#1f2937" />
        </TouchableOpacity>
      </View>

      <LinearGradient colors={['#f3f4f6', '#e5e7eb']} style={styles.gradientBackground}>
        <ScrollView 
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          maximumZoomScale={2}
          minimumZoomScale={0.5}
          contentContainerStyle={[
            styles.scrollContent, 
            isZoomed && { width: DOC_WIDTH + 40 }
          ]}
        >
          <Animated.View style={{ 
            opacity: fadeAnim, 
            alignItems: 'center',
            transform: [{ scale: currentScale }],
            width: DOC_WIDTH,
          }}>
            
            {/* Skeuomorphic Paper Card */}
            <View style={[styles.paperCard, { width: DOC_WIDTH }]}>
                
                {/* TUP Watermark */}
                <View style={styles.watermarkContainer} pointerEvents="none">
                    <Image 
                       source={require('../../assets/tup-logo.png')} 
                       style={styles.watermarkImage} 
                    />
                </View>

                {/* Staple Mark */}
                <View style={styles.stapleMark} />

                {/* Institutional Letterhead */}
                <View style={styles.letterhead}>
                    <Image source={require('../../assets/tup-logo.png')} style={styles.letterheadLogo} />
                    <Text style={styles.letterheadTitle}>Technological University of the Philippines</Text>
                    <Text style={styles.letterheadSubtitle}>Taguig City Campus</Text>
                    <View style={styles.letterheadDivider} />
                    <Text style={styles.letterheadFooter}>Office of the University Registrar • Digital Research Repository</Text>
                    
                    {/* Archive Stamp */}
                    <View style={styles.archiveStamp}>
                        <Text style={styles.archiveStampText}>ARCHIVED</Text>
                    </View>
                </View>

                {/* Metadata Row */}
                <View style={styles.metadataRow}>
                    <View style={styles.metaCol}>
                        <Text style={styles.metaLabel}>Accession Number</Text>
                        <Text style={styles.metaValue}>{thesis.id}</Text>
                    </View>
                    <View style={[styles.metaCol, {alignItems: 'flex-end'}]}>
                        <Text style={styles.metaLabel}>Certification Date</Text>
                        <Text style={styles.metaValue}>
                            {new Date(thesis.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                        </Text>
                    </View>
                </View>

                {/* Main Title Section */}
                <View style={styles.titleSection}>
                    <Text style={styles.thesisTitleMain}>{thesis.title}</Text>
                    <View style={styles.extractBadgeContainer}>
                        <View style={styles.extractDivider} />
                        <Text style={styles.extractText}>Formal Thesis Extract</Text>
                        <View style={styles.extractDivider} />
                    </View>
                    <View style={styles.categoryBadge}>
                        <Text style={styles.categoryText}>{thesis.category || 'Information Technology Department'}</Text>
                    </View>
                </View>

                {/* Author Section */}
                <View style={styles.authorSection}>
                    <View style={styles.sectionDividerRow}>
                        <Text style={styles.sectionDividerText}>INVESTIGATIVE COUNCIL</Text>
                        <View style={styles.sectionDividerLine} />
                    </View>
                    <Text style={styles.authorText}>{extractAuthors(thesis)}</Text>
                    <Text style={styles.facultyText}>Faculty of Computing and Engineering</Text>
                </View>

                {/* Abstract Section */}
                <View style={styles.abstractSection}>
                    <View style={styles.sectionDividerRow}>
                        <Text style={styles.sectionDividerText}>EXECUTIVE ABSTRACT</Text>
                        <View style={styles.sectionDividerLine} />
                    </View>
                    
                    {thesis.abstract?.split('\n').map((para, i) => (
                        <View key={i} style={styles.paragraphContainer}>
                            {i === 0 && para.length > 0 ? (
                                <Text style={styles.abstractText}>
                                    <Text style={styles.dropCap}>{para.charAt(0)}</Text>
                                    {para.substring(1)}
                                </Text>
                            ) : (
                                <Text style={[styles.abstractText, { marginLeft: 20 }]}>{para}</Text>
                            )}
                        </View>
                    ))}
                </View>

                {/* Footer Security Mark */}
                <View style={styles.securityMark}>
                    <View style={styles.securityDot} />
                    <Text style={styles.securityText}>INSTITUTIONAL SECURITY</Text>
                </View>

            </View>

          </Animated.View>
        </ScrollView>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  centerAll: { justifyContent: 'center', alignItems: 'center', padding: 20 },
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
    zIndex: 10,
  },
  headerBackBtn: { padding: 5, marginLeft: -5 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#1f2937' },
  zoomToggle: { padding: 5, marginRight: -5 },
  gradientBackground: { flex: 1 },
  scrollContent: { paddingVertical: 30, paddingHorizontal: 15, alignItems: 'center' },
  errorText: { color: '#374151', fontSize: 16, fontWeight: 'bold', marginBottom: 20 },
  backBtn: { backgroundColor: '#c7242c', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  backBtnText: { color: '#fff', fontWeight: 'bold' },
  
  // Paper styles
  paperCard: {
      backgroundColor: '#fff',
      // width: DOC_WIDTH is handled in the render
      minHeight: 800,
      borderRadius: 4,
      padding: 30,
      ...Platform.select({
          ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 20 },
          android: { elevation: 15 }
      }),
      position: 'relative',
      overflow: 'hidden'
  },
  watermarkContainer: {
      position: 'absolute',
      top: 0, left: 0, right: 0, bottom: 0,
      justifyContent: 'center',
      alignItems: 'center',
      opacity: 0.04,
      zIndex: 0
  },
  watermarkImage: {
      width: 300,
      height: 300,
      transform: [{ rotate: '-15deg' }]
  },
  stapleMark: {
      position: 'absolute',
      top: 20,
      left: 20,
      width: 30,
      height: 8,
      backgroundColor: 'rgba(209, 213, 219, 0.5)',
      transform: [{ rotate: '-45deg' }],
      borderWidth: 1,
      borderColor: 'rgba(156, 163, 175, 0.3)',
      borderRadius: 2,
      zIndex: 2
  },
  letterhead: {
      alignItems: 'center',
      borderBottomWidth: 3,
      borderBottomColor: '#111827',
      paddingBottom: 20,
      marginBottom: 30,
      position: 'relative',
      zIndex: 1
  },
  letterheadLogo: { width: 60, height: 60, marginBottom: 12, opacity: 0.8 },
  letterheadTitle: { fontSize: 10, fontWeight: '900', color: '#111827', textTransform: 'uppercase', letterSpacing: 1.5, textAlign: 'center' },
  letterheadSubtitle: { fontSize: 9, fontWeight: 'bold', color: '#6b7280', textTransform: 'uppercase', letterSpacing: 1, marginTop: 4 },
  letterheadDivider: { width: 60, height: 2, backgroundColor: '#111827', marginVertical: 12 },
  letterheadFooter: { fontSize: 7, fontWeight: 'bold', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 1, textAlign: 'center' },
  archiveStamp: {
      position: 'absolute',
      right: -10,
      top: 10,
      borderWidth: 2,
      borderColor: '#b91c1c',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
      transform: [{ rotate: '15deg' }],
      opacity: 0.2
  },
  archiveStampText: { color: '#b91c1c', fontSize: 16, fontWeight: '900', letterSpacing: 2 },
  metadataRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 40, zIndex: 1 },
  metaCol: { flex: 1 },
  metaLabel: { fontSize: 8, fontWeight: '900', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 },
  metaValue: { fontSize: 11, fontWeight: 'bold', color: '#111827', borderBottomWidth: 1, borderBottomColor: '#e5e7eb', paddingBottom: 2 },
  titleSection: { alignItems: 'center', marginBottom: 40, zIndex: 1 },
  thesisTitleMain: { fontSize: 24, fontWeight: '900', color: '#111827', textAlign: 'center', textTransform: 'uppercase', lineHeight: 32, marginBottom: 20, fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' },
  extractBadgeContainer: { flexDirection: 'row', alignItems: 'center', width: '100%', marginBottom: 15 },
  extractDivider: { flex: 1, height: 1, backgroundColor: '#e5e7eb' },
  extractText: { fontSize: 9, fontWeight: '900', color: '#9ca3af', paddingHorizontal: 12, textTransform: 'uppercase', letterSpacing: 1.5 },
  categoryBadge: { backgroundColor: '#f9fafb', borderWidth: 1, borderColor: '#f3f4f6', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 8 },
  categoryText: { fontSize: 9, fontWeight: '900', color: '#111827', textTransform: 'uppercase', letterSpacing: 1 },
  sectionDividerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, zIndex: 1 },
  sectionDividerText: { fontSize: 9, fontWeight: '900', color: '#9ca3af', letterSpacing: 2, marginRight: 12 },
  sectionDividerLine: { flex: 1, height: 1, backgroundColor: '#f3f4f6' },
  authorSection: { alignItems: 'center', marginBottom: 40, zIndex: 1 },
  authorText: { fontSize: 18, fontWeight: 'bold', color: '#111827', textAlign: 'center', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', fontStyle: 'italic', marginBottom: 10 },
  facultyText: { fontSize: 8, fontWeight: '900', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 1, fontStyle: 'italic' },
  abstractSection: { marginBottom: 60, zIndex: 1 },
  paragraphContainer: { marginBottom: 15 },
  abstractText: { fontSize: 13, color: '#374151', lineHeight: 24, textAlign: 'justify', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' },
  dropCap: { fontSize: 36, fontWeight: '900', color: '#111827', lineHeight: 36 },
  securityMark: { position: 'absolute', bottom: 20, left: 0, right: 0, alignItems: 'center', opacity: 0.3 },
  securityDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#111827', marginBottom: 4 },
  securityText: { fontSize: 6, fontWeight: '900', color: '#111827', letterSpacing: 2 },
});

export default ThesisDetailScreen;
