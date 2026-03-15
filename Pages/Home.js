import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  Animated,
  Platform,
  Alert,
  ActivityIndicator,
  Linking
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import CustomHeader from './Navigation/CustomHeader';
import HamburgerMenu from './Navigation/HamburgerMenu';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API_BASE_URL from '../api';

const { width, height } = Dimensions.get('window');

const HomeScreen = () => {
    const navigation = useNavigation();
    const isFocused = useIsFocused();
    const [isMenuVisible, setIsMenuVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [user, setUser] = useState(null);
    const fadeAnim = useState(new Animated.Value(0))[0];

    // Data States
    const [thesisCount, setThesisCount] = useState(0);
    const [recentTheses, setRecentTheses] = useState([]);
    const [deptCounts, setDeptCounts] = useState([]);
    const [aiHistory, setAiHistory] = useState([]);
    const [loadingAi, setLoadingAi] = useState(false);

    // Selected AI Modal
    const [selectedAiItem, setSelectedAiItem] = useState(null);

    // Load Data whenever screen comes into focus
    useEffect(() => {
        if (isFocused) {
            loadDashboardData();
        }
    }, [isFocused]);

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
        }).start();
    }, []);

    const loadDashboardData = async () => {
        try {
            const userDataStr = await AsyncStorage.getItem('userData');
            const token = await AsyncStorage.getItem('userToken');
            
            if (userDataStr) {
                setUser(JSON.parse(userDataStr));
            }

            // Load Recent offline
            const recentStr = await AsyncStorage.getItem('recent_theses');
            if (recentStr) {
                setRecentTheses(JSON.parse(recentStr));
            } else {
                setRecentTheses([]);
            }

            if (token) {
                // Fetch Thesis Count
                fetch(`${API_BASE_URL}/thesis/count`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
                .then(res => res.json())
                .then(data => { if (data.count !== undefined) setThesisCount(data.count) })
                .catch(err => console.log('Error fetching thesis count', err));

                // Fetch Department Counts
                fetch(`${API_BASE_URL}/thesis/department-counts`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
                .then(res => res.json())
                .then(data => { if (Array.isArray(data)) setDeptCounts(data) })
                .catch(err => console.log('Error fetching dept counts', err));

                // Fetch AI History
                setLoadingAi(true);
                fetch(`${API_BASE_URL}/user/ai-history`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
                .then(res => res.json())
                .then(data => {
                    if (data.data) {
                        setAiHistory(data.data);
                    }
                })
                .catch(err => console.log('Error fetching AI history', err))
                .finally(() => setLoadingAi(false));
            }
        } catch (error) {
            console.error('Error loading dashboard data:', error);
        }
    };

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 17) return 'Good Afternoon';
        return 'Good Evening';
    };

    const handleSearch = () => {
        if (searchQuery.trim()) {
            navigation.navigate('SmartSearch', { initialQuery: searchQuery.trim() });
            setSearchQuery('');
        }
    };

    const clearRecentViews = async () => {
        Alert.alert(
            "Clear Recent Views",
            "Are you sure you want to clear your local viewing history?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Clear All", onPress: async () => {
                        await AsyncStorage.removeItem('recent_theses');
                        setRecentTheses([]);
                    }, style: 'destructive'
                }
            ]
        );
    };

    const confirmDeleteAiHistory = async (id) => {
        Alert.alert(
            "Delete Recommendation?",
            "Are you sure you want to permanently delete this AI title recommendation?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete", style: "destructive", onPress: async () => {
                        try {
                            const token = await AsyncStorage.getItem('userToken');
                            const res = await fetch(`${API_BASE_URL}/user/ai-history/${id}`, {
                                method: 'DELETE',
                                headers: { 'Authorization': `Bearer ${token}` }
                            });
                            if (res.ok) {
                                setAiHistory(prev => prev.filter(item => item._id !== id));
                            } else {
                                Alert.alert("Error", "Failed to delete history item");
                            }
                        } catch (err) {
                            Alert.alert("Error", "An network error occurred");
                        }
                    }
                }
            ]
        );
    };

    const confirmClearAllAiHistory = async () => {
        Alert.alert(
            "Clear All History?",
            "Are you sure you want to permanently clear all your AI title recommendations?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Clear All", style: "destructive", onPress: async () => {
                        try {
                            const token = await AsyncStorage.getItem('userToken');
                            const res = await fetch(`${API_BASE_URL}/user/ai-history`, {
                                method: 'DELETE',
                                headers: { 'Authorization': `Bearer ${token}` }
                            });
                            if (res.ok) {
                                setAiHistory([]);
                            } else {
                                Alert.alert("Error", "Failed to clear history");
                            }
                        } catch (err) {
                            Alert.alert("Error", "A network error occurred");
                        }
                    }
                }
            ]
        );
    };

    // Helper to extract bold parts
    const renderRecommendationText = (text) => {
        const lines = text.split('\n');
        return lines.map((line, lineIdx) => {
           const processedLine = line.replace(/^\s*\*\s/, '• ').replace(/^\s*-\s/, '• ');
           const parts = processedLine.split(/(\*\*.*?\*\*)/g);
           
           return (
               <Text key={lineIdx} style={styles.modalBodyText}>
                   {parts.map((part, i) => {
                       if (part.startsWith('**') && part.endsWith('**')) {
                          return <Text key={i} style={styles.modalBoldText}>{part.slice(2, -2)}</Text>;
                       }
                       return <Text key={i}>{part}</Text>;
                   })}
                   {'\n'}
               </Text>
           );
        });
    };

    return (
        <LinearGradient
            colors={['#7f0000', '#240000']}
            style={styles.container}
        >
            <CustomHeader
                onMenuPress={() => setIsMenuVisible(true)}
                onSearch={handleSearch}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
            />
            {/* Hamburger Menu */}
            <HamburgerMenu isVisible={isMenuVisible} onClose={() => setIsMenuVisible(false)} navigation={navigation} />

            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                bounces={false}
                contentContainerStyle={{ flexGrow: 1, paddingBottom: 60 }}
            >
                <Animated.View style={{ opacity: fadeAnim, flex: 1 }}>

                    <View style={styles.mainContent}>
                        
                        {/* Welcome Header */}
                        <View style={styles.welcomeSection}>
                            <Text style={styles.greetingHeader}>{getGreeting()}</Text>
                            <Text style={styles.welcomeTitle}>Welcome back, {user?.name || 'Researcher'}</Text>
                            <Text style={styles.welcomeSub}>Manage your research and explore the thesis collection.</Text>
                        </View>

                        {/* Top Stats ScrollView */}
                        <ScrollView 
                            horizontal 
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.statsScrollContainer}
                            style={styles.statsScrollArea}
                        >
                            {/* Archive Size */}
                            <View style={styles.statCard}>
                                <View style={styles.statInfo}>
                                    <Text style={styles.statLabelTop}>ARCHIVE SIZE</Text>
                                    <Text style={styles.statValue}>{thesisCount.toLocaleString()}</Text>
                                    <Text style={[styles.statLabelBottom, { color: '#ef4444' }]}>THESES INDEXED</Text>
                                </View>
                                <View style={[styles.statIconBox, { backgroundColor: '#fef2f2', borderColor: '#fee2e2' }]}>
                                    <Ionicons name="search" size={24} color="#f87171" />
                                </View>
                            </View>

                            {/* AI History Count */}
                            <View style={styles.statCard}>
                                <View style={styles.statInfo}>
                                    <Text style={styles.statLabelTop}>AI HISTORY</Text>
                                    <Text style={styles.statValue}>{aiHistory.length}</Text>
                                    <Text style={[styles.statLabelBottom, { color: '#a855f7' }]}>RECOMMENDATIONS</Text>
                                </View>
                                <View style={[styles.statIconBox, { backgroundColor: '#faf5ff', borderColor: '#f3e8ff' }]}>
                                    <Ionicons name="hardware-chip" size={24} color="#c084fc" />
                                </View>
                            </View>

                            {/* Recent Activity Count */}
                            <View style={styles.statCard}>
                                <View style={styles.statInfo}>
                                    <Text style={styles.statLabelTop}>RECENTLY VIEWED</Text>
                                    <Text style={styles.statValue}>{recentTheses.length}</Text>
                                    <Text style={[styles.statLabelBottom, { color: '#f97316' }]}>ACTIVE ITEMS</Text>
                                </View>
                                <View style={[styles.statIconBox, { backgroundColor: '#fff7ed', borderColor: '#ffedd5' }]}>
                                    <Ionicons name="time" size={24} color="#fb923c" />
                                </View>
                            </View>
                        </ScrollView>

                        {/* AI Recommendation Log Area */}
                        <View style={styles.sectionContainer}>
                            <View style={styles.sectionHeader}>
                                <View style={styles.sectionTitleRow}>
                                    <View style={styles.titleDividerRed} />
                                    <Text style={styles.sectionTitleText}>AI RECOMMENDATION LOG</Text>
                                </View>
                                
                                <View style={styles.sectionHeaderActions}>
                                   {aiHistory.length > 0 && (
                                       <TouchableOpacity style={styles.clearHistoryBtn} onPress={confirmClearAllAiHistory}>
                                           <Text style={styles.clearHistoryText}>CLEAR HISTORY</Text>
                                       </TouchableOpacity>
                                   )}
                                   <View style={styles.aiBadge}>
                                       <Ionicons name="hardware-chip" size={12} color="#93c5fd" />
                                       <Text style={styles.aiBadgeText}>AI POWERED</Text>
                                   </View>
                                </View>
                            </View>

                            <View style={styles.cardBlock}>
                                {loadingAi ? (
                                    <View style={styles.emptyState}>
                                        <ActivityIndicator size="small" color="#9ca3af" />
                                        <Text style={styles.emptyText}>Loading AI history...</Text>
                                    </View>
                                ) : aiHistory.length > 0 ? (
                                    <View>
                                        {aiHistory.slice(0, 5).map((item, index) => (
                                            <TouchableOpacity 
                                                key={item._id} 
                                                style={[styles.historyItemRow, index !== aiHistory.slice(0, 5).length -1 && styles.borderBottom]}
                                                onPress={() => setSelectedAiItem(item)}
                                            >
                                                <View style={styles.historyItemBox}>
                                                    <View style={styles.historyIconBox}>
                                                        <Ionicons name="hardware-chip" size={16} color="#9ca3af" />
                                                    </View>
                                                    <View style={styles.historyTextFlex}>
                                                        <Text style={styles.historyItemTitle} numberOfLines={1}>
                                                            {item.prompt}
                                                        </Text>
                                                        <Text style={styles.historyItemDate}>
                                                            {new Date(item.createdAt).toLocaleDateString()}
                                                        </Text>
                                                    </View>
                                                </View>
                                                <TouchableOpacity 
                                                    style={styles.deleteIconBtn}
                                                    onPress={() => confirmDeleteAiHistory(item._id)}
                                                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                                >
                                                    <Ionicons name="trash" size={16} color="#d1d5db" />
                                                </TouchableOpacity>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                ) : (
                                    <View style={styles.emptyState}>
                                        <View style={styles.emptyIconCircle}>
                                            <Ionicons name="hardware-chip" size={32} color="#bfdbfe" />
                                        </View>
                                        <Text style={styles.emptyText}>No AI title recommendations found.</Text>
                                    </View>
                                )}
                            </View>
                        </View>

                        {/* Secondary Grid (Recent + Stats) */}
                        <View style={styles.secondaryGrid}>
                             
                             {/* Recent Views */}
                             <View style={styles.gridColumn}>
                                  <View style={styles.sectionHeader}>
                                       <View style={styles.sectionTitleRow}>
                                            <View style={[styles.titleDividerRed, { backgroundColor: '#f97316' }]} />
                                            <Text style={styles.sectionTitleText}>RECENT VIEWS</Text>
                                       </View>
                                       {recentTheses.length > 0 && (
                                           <TouchableOpacity style={styles.clearHistoryBtnOrange} onPress={clearRecentViews}>
                                               <Text style={styles.clearHistoryTextOrange}>CLEAR ALL</Text>
                                           </TouchableOpacity>
                                       )}
                                  </View>

                                  <View style={styles.cardBlock}>
                                      {recentTheses.length > 0 ? (
                                          recentTheses.slice(0, 3).map((thesis, idx) => (
                                              <TouchableOpacity 
                                                   key={thesis.id || idx}
                                                   style={styles.recentItemView}
                                                   onPress={() => navigation.navigate('ThesisDetail', { id: thesis.id })}
                                              >
                                                   <Text style={styles.recentItemYear}>{thesis.year || 'No Year'}</Text>
                                                   <Text style={styles.recentItemTitle} numberOfLines={2}>{thesis.title}</Text>
                                              </TouchableOpacity>
                                          ))
                                      ) : (
                                          <View style={styles.emptyStateMinimal}>
                                               <Text style={styles.emptyTextSub}>No history found</Text>
                                          </View>
                                      )}
                                  </View>
                             </View>

                             {/* Archive Stats */}
                             <View style={styles.gridColumn}>
                                  <View style={styles.sectionHeader}>
                                       <View style={styles.sectionTitleRow}>
                                            <View style={[styles.titleDividerRed, { backgroundColor: '#fecaca' }]} />
                                            <Text style={styles.sectionTitleText}>ARCHIVE STATS</Text>
                                       </View>
                                  </View>

                                  <View style={styles.cardBlock}>
                                       {deptCounts.slice(0, 5).map((dept, idx) => (
                                           <TouchableOpacity 
                                               key={dept.category + idx}
                                               style={[styles.deptRow, idx !== deptCounts.slice(0, 5).length - 1 && styles.borderBottom]}
                                               onPress={() => {
                                                    // Route to smart search with category filter applied
                                                    navigation.navigate('SmartSearch', { selectedDepartment: dept.category });
                                               }}
                                           >
                                                <Text style={styles.deptName}>{dept.category}</Text>
                                                <Text style={styles.deptCount}>{dept.count}</Text>
                                           </TouchableOpacity>
                                       ))}
                                  </View>
                             </View>

                        </View>

                    </View>
                </Animated.View>
            </ScrollView>

            {/* Selected AI Modal */}
            {selectedAiItem && (
                <View style={[StyleSheet.absoluteFill, styles.modalOverlay]}>
                     <View style={styles.modalContent}>
                          <TouchableOpacity 
                              style={styles.modalCloseBtn}
                              onPress={() => setSelectedAiItem(null)}
                          >
                              <Ionicons name="close" size={24} color="#9ca3af" />
                          </TouchableOpacity>

                          <View style={styles.modalHeaderRow}>
                               <View style={styles.modalIconBox}>
                                   <Ionicons name="hardware-chip" size={32} color="#ef4444" />
                               </View>
                               <View style={styles.modalHeaderTextFlex}>
                                   <Text style={styles.modalTitle}>AI Title Recommendation</Text>
                                   <Text style={styles.modalSubtitle}>TAILORED TO: "{selectedAiItem.prompt}"</Text>
                               </View>
                          </View>

                          <View style={styles.modalScrollBodyArea}>
                              <ScrollView contentContainerStyle={{ padding: 20 }}>
                                  {renderRecommendationText(selectedAiItem.recommendation)}
                              </ScrollView>
                          </View>

                     </View>
                </View>
            )}

        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    mainContent: {
        flex: 1,
        paddingTop: 30,
        zIndex: 1,
    },
    welcomeSection: {
        paddingHorizontal: 24,
        marginBottom: 32,
    },
    greetingHeader: {
        fontSize: 10,
        color: '#fecaca',
        fontWeight: '900',
        letterSpacing: 2,
        textTransform: 'uppercase',
        marginBottom: 8,
    },
    welcomeTitle: {
        fontSize: 32,
        fontWeight: '900',
        color: '#fff',
        letterSpacing: -0.5,
    },
    welcomeSub: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.7)',
        fontWeight: '500',
        marginTop: 6,
    },

    // Top Stats Scroller
    statsScrollArea: {
        marginBottom: 40,
    },
    statsScrollContainer: {
        paddingHorizontal: 24,
        gap: 16,
        paddingVertical: 10,
    },
    statCard: {
        backgroundColor: '#fff',
        borderRadius: 32,
        padding: 24,
        width: width * 0.75, // wide enough to peek the next
        minHeight: 140,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 16 },
            android: { elevation: 6 }
        }),
    },
    statInfo: {
        flex: 1,
    },
    statLabelTop: {
        fontSize: 10,
        color: '#9ca3af',
        fontWeight: '900',
        textTransform: 'uppercase',
        letterSpacing: 1.5,
        marginBottom: 4,
    },
    statValue: {
        fontSize: 36,
        fontWeight: '900',
        color: '#111827',
        lineHeight: 40,
    },
    statLabelBottom: {
        fontSize: 10,
        fontWeight: '900',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginTop: 10,
    },
    statIconBox: {
        width: 56,
        height: 56,
        borderRadius: 16,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },

    // Sections Framework
    sectionContainer: {
        paddingHorizontal: 24,
        marginBottom: 48,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
        flexWrap: 'wrap',
        gap: 10,
    },
    sectionTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    titleDividerRed: {
        width: 6,
        height: 20,
        backgroundColor: '#fecaca',
        borderRadius: 4,
    },
    sectionTitleText: {
        fontSize: 12,
        fontWeight: '900',
        color: '#fff',
        letterSpacing: 1.5,
    },
    sectionHeaderActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        flexWrap: 'wrap',
    },
    clearHistoryBtn: {
        backgroundColor: 'rgba(127, 29, 29, 0.4)',
        borderWidth: 1,
        borderColor: '#7f1d1d',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    clearHistoryText: {
        fontSize: 9,
        fontWeight: '900',
        color: '#fca5a5',
        letterSpacing: 1.5,
    },
    clearHistoryBtnOrange: {
        backgroundColor: 'rgba(194, 65, 12, 0.4)', 
        borderWidth: 1,
        borderColor: '#7c2d12',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    clearHistoryTextOrange: {
        fontSize: 9,
        fontWeight: '900',
        color: '#fdba74',
        letterSpacing: 1.5,
    },
    aiBadge: {
        backgroundColor: 'rgba(30, 58, 138, 0.5)',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#1e40af',
    },
    aiBadgeText: {
        fontSize: 9,
        fontWeight: '900',
        color: '#93c5fd',
        letterSpacing: 1.5,
    },
    cardBlock: {
        backgroundColor: '#fff',
        borderRadius: 32,
        borderWidth: 1,
        borderColor: '#f3f4f6',
        overflow: 'hidden',
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10 },
            android: { elevation: 2 }
        }),
    },

    // AI History List Items
    historyItemRow: {
        padding: 24,
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
    },
    borderBottom: {
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
    },
    historyItemBox: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        marginRight: 16,
    },
    historyIconBox: {
        width: 32,
        height: 32,
        borderRadius: 8,
        backgroundColor: '#f3f4f6',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    historyTextFlex: {
        flex: 1,
    },
    historyItemTitle: {
        fontSize: 14,
        fontWeight: '900',
        color: '#111827',
        marginBottom: 4,
    },
    historyItemDate: {
        fontSize: 10,
        color: '#9ca3af',
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 1.5,
    },
    deleteIconBtn: {
        paddingTop: 4,
    },
    emptyState: {
        padding: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyIconCircle: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#eff6ff',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    emptyText: {
        fontSize: 14,
        color: '#9ca3af',
        fontWeight: '500',
        marginTop: 8,
    },

    // Secondary Grid Items
    secondaryGrid: {
        paddingHorizontal: 24,
        gap: 40,
        paddingBottom: 40,
    },
    gridColumn: {
        flex: 1,
    },
    recentItemView: {
        padding: 24,
    },
    recentItemYear: {
        fontSize: 9,
        fontWeight: '900',
        color: '#ef4444',
        textTransform: 'uppercase',
        letterSpacing: 2,
        marginBottom: 8,
    },
    recentItemTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#111827',
        lineHeight: 20,
    },
    emptyStateMinimal: {
        paddingVertical: 32,
        alignItems: 'center',
    },
    emptyTextSub: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#9ca3af',
    },

    deptRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 24,
        paddingVertical: 18,
    },
    deptName: {
        fontSize: 10,
        fontWeight: '900',
        color: '#6b7280',
        textTransform: 'uppercase',
        letterSpacing: 1.5,
    },
    deptCount: {
        fontSize: 16,
        fontWeight: '900',
        color: '#111827',
    },

    // Modal Overlays
    modalOverlay: {
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        zIndex: 100,
    },
    modalContent: {
        backgroundColor: '#fff',
        width: '100%',
        maxHeight: '85%',
        borderRadius: 32,
        paddingTop: 32,
        paddingBottom: 24,
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.25, shadowRadius: 20 },
            android: { elevation: 10 }
        }),
    },
    modalCloseBtn: {
        position: 'absolute',
        top: 20,
        right: 20,
        width: 36,
        height: 36,
        backgroundColor: '#f3f4f6',
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
    },
    modalHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 24,
        marginBottom: 24,
    },
    modalIconBox: {
        width: 56,
        height: 56,
        borderRadius: 16,
        backgroundColor: '#fef2f2',
        borderWidth: 1,
        borderColor: '#fee2e2',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    modalHeaderTextFlex: {
        flex: 1,
        paddingRight: 20, // Make room for close btn
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: '900',
        color: '#111827',
        lineHeight: 26,
        marginBottom: 4,
    },
    modalSubtitle: {
        fontSize: 10,
        color: '#6b7280',
        fontWeight: '900',
        letterSpacing: 1.5,
    },
    modalScrollBodyArea: {
        flexShrink: 1,
        marginHorizontal: 24,
        backgroundColor: '#f9fafb',
        borderWidth: 1,
        borderColor: '#f3f4f6',
        borderRadius: 24,
    },
    modalBodyText: {
        fontSize: 15,
        color: '#374151',
        lineHeight: 26,
    },
    modalBoldText: {
        fontWeight: '900',
        color: '#111827',
    }
});

export default HomeScreen;