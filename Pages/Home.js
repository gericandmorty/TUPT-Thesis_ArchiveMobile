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
import Colors from '../utils/Colors';

const { width, height } = Dimensions.get('window');

const HomeScreen = () => {
    const navigation = useNavigation();
    const isFocused = useIsFocused();
    const [isMenuVisible, setIsMenuVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [user, setUser] = useState(null);

    // Animation States
    const welcomeAnim = React.useRef(new Animated.Value(0)).current;
    const statsAnim = React.useRef(new Animated.Value(0)).current;
    const aiLogAnim = React.useRef(new Animated.Value(0)).current;
    const secondaryGridAnim = React.useRef(new Animated.Value(0)).current;

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
            startEntranceAnimations();
        }
    }, [isFocused]);

    const startEntranceAnimations = () => {
        // Reset
        welcomeAnim.setValue(0);
        statsAnim.setValue(0);
        aiLogAnim.setValue(0);
        secondaryGridAnim.setValue(0);

        // Staggered sequence
        Animated.stagger(150, [
            Animated.timing(welcomeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
            Animated.timing(statsAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
            Animated.timing(aiLogAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
            Animated.timing(secondaryGridAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        ]).start();
    };

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
            colors={[Colors.background, Colors.surface, Colors.background]}
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
                <View style={styles.mainContent}>
                    
                    {/* Welcome Header */}
                    <Animated.View style={[
                        styles.welcomeSection,
                        { 
                            opacity: welcomeAnim,
                            transform: [{ translateY: welcomeAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }]
                        }
                    ]}>
                        <Text style={styles.greetingHeader}>{getGreeting()}</Text>
                        <Text style={styles.welcomeTitle}>Welcome back, {user?.name || 'Researcher'}</Text>
                        <Text style={styles.welcomeSub}>Manage your research and explore the thesis collection.</Text>
                    </Animated.View>

                    {/* Top Stats ScrollView */}
                    <Animated.View style={{ 
                        opacity: statsAnim,
                        transform: [{ translateY: statsAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }]
                    }}>
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
                                    <Text style={[styles.statLabelBottom, { color: Colors.primary }]}>THESES INDEXED</Text>
                                </View>
                                <View style={[styles.statIconBox, { backgroundColor: `${Colors.primary}15`, borderColor: `${Colors.primary}30` }]}>
                                    <Ionicons name="search" size={24} color={Colors.primary} />
                                </View>
                            </View>

                            {/* AI History Count */}
                            <View style={styles.statCard}>
                                <View style={styles.statInfo}>
                                    <Text style={styles.statLabelTop}>AI HISTORY</Text>
                                    <Text style={styles.statValue}>{aiHistory.length}</Text>
                                    <Text style={[styles.statLabelBottom, { color: Colors.purple }]}>RECOMMENDATIONS</Text>
                                </View>
                                <View style={[styles.statIconBox, { backgroundColor: `${Colors.purple}15`, borderColor: `${Colors.purple}30` }]}>
                                    <Ionicons name="hardware-chip" size={24} color={Colors.purple} />
                                </View>
                            </View>

                            {/* Recent Activity Count */}
                            <View style={styles.statCard}>
                                <View style={styles.statInfo}>
                                    <Text style={styles.statLabelTop}>RECENTLY VIEWED</Text>
                                    <Text style={styles.statValue}>{recentTheses.length}</Text>
                                    <Text style={[styles.statLabelBottom, { color: Colors.orange }]}>ACTIVE ITEMS</Text>
                                </View>
                                <View style={[styles.statIconBox, { backgroundColor: `${Colors.orange}15`, borderColor: `${Colors.orange}30` }]}>
                                    <Ionicons name="time" size={24} color={Colors.orange} />
                                </View>
                            </View>
                        </ScrollView>
                    </Animated.View>

                    {/* AI Recommendation Log Area */}
                    <Animated.View style={[
                        styles.sectionContainer,
                        { 
                            opacity: aiLogAnim,
                            transform: [{ translateY: aiLogAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }]
                        }
                    ]}>
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
                                                    <Ionicons name="hardware-chip" size={16} color="white" />
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
                                                <Ionicons name="trash" size={16} color="rgba(255,255,255,0.3)" />
                                            </TouchableOpacity>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            ) : (
                                <View style={styles.emptyState}>
                                    <View style={styles.emptyIconCircle}>
                                        <Ionicons name="hardware-chip" size={32} color="rgba(255,255,255,0.2)" />
                                    </View>
                                    <Text style={styles.emptyText}>No AI recommendations found.</Text>
                                </View>
                            )}
                        </View>
                    </Animated.View>

                    {/* Secondary Grid (Recent + Stats) */}
                    <Animated.View style={[
                        styles.secondaryGrid,
                        { 
                            opacity: secondaryGridAnim,
                            transform: [{ translateY: secondaryGridAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }]
                        }
                    ]}>
                         
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
                                               style={[styles.recentItemView, idx !== recentTheses.slice(0, 3).length - 1 && styles.borderBottom]}
                                               onPress={() => navigation.navigate('ThesisDetail', { thesisId: thesis.id })}
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
                                           key={dept.course + idx}
                                           style={[styles.deptRow, idx !== deptCounts.slice(0, 5).length - 1 && styles.borderBottom]}
                                           onPress={() => {
                                                // Route to smart search with course filter applied
                                                navigation.navigate('SearchResult', { course: dept.course });
                                           }}
                                       >
                                            <Text style={styles.deptName}>{dept.course}</Text>
                                            <Text style={styles.deptCount}>{dept.count}</Text>
                                       </TouchableOpacity>
                                   ))}
                              </View>
                         </View>

                    </Animated.View>

                </View>
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
        color: Colors.primary,
        fontWeight: '900',
        letterSpacing: 2,
        textTransform: 'uppercase',
        marginBottom: 8,
    },
    welcomeTitle: {
        fontSize: 32,
        fontWeight: '900',
        color: Colors.foreground,
        letterSpacing: -0.5,
    },
    welcomeSub: {
        fontSize: 14,
        color: Colors.textSecondary,
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
        backgroundColor: Colors.card,
        borderRadius: 24,
        padding: 24,
        width: width * 0.75,
        minHeight: 140,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: Colors.border,
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 16 },
            android: { elevation: 6 }
        }),
    },
    statInfo: {
        flex: 1,
    },
    statLabelTop: {
        fontSize: 10,
        color: Colors.textSecondary,
        fontWeight: '900',
        textTransform: 'uppercase',
        letterSpacing: 1.5,
        marginBottom: 4,
    },
    statValue: {
        fontSize: 36,
        fontWeight: '900',
        color: Colors.foreground,
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
        marginBottom: 40,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
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
        fontSize: 11,
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
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    clearHistoryText: {
        fontSize: 9,
        fontWeight: '900',
        color: '#fff',
        letterSpacing: 1.5,
    },
    clearHistoryBtnOrange: {
        backgroundColor: 'rgba(249, 115, 22, 0.1)', 
        borderWidth: 1,
        borderColor: 'rgba(249, 115, 22, 0.2)',
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
        backgroundColor: 'rgba(30, 58, 138, 0.3)',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(147, 197, 253, 0.2)',
    },
    aiBadgeText: {
        fontSize: 9,
        fontWeight: '900',
        color: '#93c5fd',
        letterSpacing: 1.5,
    },
    cardBlock: {
        backgroundColor: Colors.card,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: Colors.border,
        overflow: 'hidden',
    },

    // List Items
    historyItemRow: {
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    borderBottom: {
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    historyItemBox: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        marginRight: 16,
    },
    historyIconBox: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    historyTextFlex: {
        flex: 1,
    },
    historyItemTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 2,
    },
    historyItemDate: {
        fontSize: 10,
        color: 'rgba(255, 255, 255, 0.5)',
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 1.5,
    },
    deleteIconBtn: {
        padding: 4,
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
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    emptyText: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.5)',
        fontWeight: '500',
        marginTop: 8,
    },

    // Secondary Grid Items
    secondaryGrid: {
        paddingHorizontal: 24,
        gap: 32,
        paddingBottom: 40,
    },
    gridColumn: {
        flex: 1,
    },
    recentItemView: {
        padding: 20,
    },
    recentItemYear: {
        fontSize: 9,
        fontWeight: '900',
        color: Colors.secondary,
        textTransform: 'uppercase',
        letterSpacing: 2,
        marginBottom: 4,
    },
    recentItemTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: Colors.foreground,
        lineHeight: 20,
    },
    emptyStateMinimal: {
        paddingVertical: 32,
        alignItems: 'center',
    },
    emptyTextSub: {
        fontSize: 12,
        fontWeight: 'bold',
        color: 'rgba(255, 255, 255, 0.4)',
    },

    deptRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    deptName: {
        fontSize: 10,
        fontWeight: '900',
        color: 'rgba(255, 255, 255, 0.7)',
        textTransform: 'uppercase',
        letterSpacing: 1.5,
    },
    deptCount: {
        fontSize: 16,
        fontWeight: '900',
        color: '#fff',
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
        backgroundColor: Colors.card,
        width: '100%',
        maxHeight: '85%',
        borderRadius: 32,
        paddingTop: 32,
        paddingBottom: 24,
        borderWidth: 1,
        borderColor: Colors.border,
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 20 }, shadowOpacity: 0.5, shadowRadius: 30 },
            android: { elevation: 20 }
        }),
    },
    modalCloseBtn: {
        position: 'absolute',
        top: 20,
        right: 20,
        width: 36,
        height: 36,
        backgroundColor: 'rgba(255,255,255,0.08)',
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
        backgroundColor: `${Colors.primary}15`,
        borderWidth: 1,
        borderColor: `${Colors.primary}30`,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    modalHeaderTextFlex: {
        flex: 1,
        paddingRight: 20,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: '900',
        color: Colors.foreground,
        lineHeight: 26,
        marginBottom: 4,
    },
    modalSubtitle: {
        fontSize: 10,
        color: Colors.textSecondary,
        fontWeight: '900',
        letterSpacing: 1.5,
    },
    modalScrollBodyArea: {
        flexShrink: 1,
        marginHorizontal: 24,
        backgroundColor: 'rgba(255,255,255,0.04)',
        borderWidth: 1,
        borderColor: Colors.border,
        borderRadius: 24,
    },
    modalBodyText: {
        fontSize: 15,
        color: Colors.textSecondary,
        lineHeight: 26,
    },
    modalBoldText: {
        fontWeight: '900',
        color: Colors.foreground,
    }
});

export default HomeScreen;