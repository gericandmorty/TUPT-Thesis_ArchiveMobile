import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    Platform, ActivityIndicator, RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomHeader from '../../Navigation/CustomHeader';
import HamburgerMenu from '../../Navigation/HamburgerMenu';
import API_BASE_URL from '../../../api';
import Colors from '../../../utils/Colors';

const MySubmissions = () => {
    const navigation = useNavigation();
    const [isMenuVisible, setIsMenuVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const [theses, setTheses] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => { fetchTheses(); }, []);

    const fetchTheses = async () => {
        setIsLoading(true);
        try {
            const token = await AsyncStorage.getItem('userToken');
            if (!token) { setIsLoading(false); return; }

            const res = await fetch(`${API_BASE_URL}/user/theses`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setTheses(data.data || []);
            }
        } catch (err) {
            console.error('Error fetching theses:', err);
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    };

    const handleSearch = () => {
        if (searchQuery.trim()) {
            navigation.navigate('SmartSearch', { initialQuery: searchQuery.trim() });
            setSearchQuery('');
        }
    };

    return (
        <LinearGradient colors={[Colors.background, Colors.surface, Colors.background]} style={styles.container}>
            <CustomHeader
                onMenuPress={() => setIsMenuVisible(true)}
                onSearch={handleSearch}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
            />
            <HamburgerMenu isVisible={isMenuVisible} onClose={() => setIsMenuVisible(false)} navigation={navigation} />

            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchTheses(); }} tintColor={Colors.primary} />}
            >
                {/* Back Button */}
                <TouchableOpacity style={styles.backRow} onPress={() => navigation.navigate('DocumentsHub')}>
                    <Ionicons name="arrow-back" size={16} color={Colors.primary} />
                    <Text style={styles.backText}>Back to Documents</Text>
                </TouchableOpacity>

                {/* Header */}
                <View style={styles.headerRow}>
                    <View style={styles.headerLeft}>
                        <View style={styles.headerBar} />
                        <View>
                            <Text style={styles.headerTag}>MY SUBMISSIONS</Text>
                            <Text style={styles.headerTitle}>My Research Entries</Text>
                        </View>
                    </View>
                    <View style={styles.countBadge}>
                        <Text style={styles.countBadgeText}>{theses.length} Submissions</Text>
                    </View>
                </View>

                {isLoading ? (
                    <View style={styles.loadingBox}>
                        <ActivityIndicator size="large" color={Colors.primary} />
                    </View>
                ) : theses.length > 0 ? (
                    theses.map((thesis) => (
                        <View key={thesis._id} style={styles.thesisCard}>
                            {/* Category + Status */}
                            <View style={styles.cardTopRow}>
                                <View style={styles.categoryPill}>
                                    <Text style={styles.categoryPillText}>{thesis.course || 'General'}</Text>
                                </View>
                                <View style={[styles.statusPill, thesis.isApproved ? styles.statusApproved : styles.statusPending]}>
                                    <Text style={[styles.statusPillText, thesis.isApproved ? styles.statusApprovedText : styles.statusPendingText]}>
                                        {thesis.isApproved ? 'Approved' : 'Pending Review'}
                                    </Text>
                                </View>
                            </View>

                            {/* Title */}
                            <Text style={styles.thesisTitle} numberOfLines={2}>{thesis.title}</Text>

                            {/* Author + Year */}
                            <Text style={styles.thesisAuthor}>{thesis.author} • {thesis.year_range || 'Unknown Year'}</Text>

                            {/* View Button */}
                            <View style={styles.cardFooter}>
                                <View style={styles.docIcon}>
                                    <Ionicons name="document-text" size={16} color="#9ca3af" />
                                </View>
                                <TouchableOpacity
                                    style={styles.viewBtn}
                                    disabled={!thesis.isApproved}
                                    onPress={() => navigation.navigate('ThesisDetail', { thesisId: thesis._id })}
                                >
                                    <Text style={[styles.viewBtnText, !thesis.isApproved && styles.viewBtnDisabled]}>
                                        {thesis.isApproved ? 'View' : 'Pending'}
                                    </Text>
                                    <Ionicons name="arrow-forward" size={12} color={thesis.isApproved ? Colors.primary : Colors.textDim} />
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))
                ) : (
                    <View style={styles.emptyCard}>
                        <View style={styles.emptyIconBox}>
                            <Ionicons name="bulb" size={32} color="#9ca3af" />
                        </View>
                        <Text style={styles.emptyTitle}>No submissions detected</Text>
                        <Text style={styles.emptyDesc}>Your uploaded documents will appear here.</Text>
                    </View>
                )}
            </ScrollView>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    scroll: { flex: 1 },
    scrollContent: { paddingTop: 20, paddingBottom: 60, paddingHorizontal: 20 },
    backRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 20 },
    backText: { color: Colors.primary, fontSize: 10, fontWeight: '900', letterSpacing: 2, textTransform: 'uppercase' },

    // Header
    headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
    headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    headerBar: { width: 4, height: 40, borderRadius: 2, backgroundColor: Colors.primary },
    headerTag: { fontSize: 10, fontWeight: '900', color: Colors.textSecondary, letterSpacing: 2 },
    headerTitle: { fontSize: 22, fontWeight: '900', color: Colors.foreground, textTransform: 'uppercase' },
    countBadge: { backgroundColor: `${Colors.primary}15`, paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: `${Colors.primary}30` },
    countBadgeText: { fontSize: 9, fontWeight: '900', color: Colors.primary, letterSpacing: 1 },

    loadingBox: { paddingVertical: 60, alignItems: 'center' },

    // Cards
    thesisCard: {
        backgroundColor: Colors.card, borderRadius: 24, padding: 20, marginBottom: 16,
        borderWidth: 1, borderColor: Colors.border,
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 12 },
            android: { elevation: 6 }
        }),
    },
    cardTopRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
    categoryPill: { backgroundColor: `${Colors.primary}15`, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, borderWidth: 1, borderColor: `${Colors.primary}30` },
    categoryPillText: { fontSize: 9, fontWeight: '900', color: Colors.primary, letterSpacing: 1 },
    statusPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, borderWidth: 1 },
    statusApproved: { backgroundColor: 'rgba(34,197,94,0.1)', borderColor: 'rgba(34,197,94,0.3)' },
    statusPending: { backgroundColor: 'rgba(251,191,36,0.1)', borderColor: 'rgba(251,191,36,0.3)' },
    statusPillText: { fontSize: 8, fontWeight: '900', letterSpacing: 1, textTransform: 'uppercase' },
    statusApprovedText: { color: '#4ade80' },
    statusPendingText: { color: '#fbbf24' },

    thesisTitle: { fontSize: 15, fontWeight: '900', color: Colors.foreground, textTransform: 'uppercase', lineHeight: 22, marginBottom: 6 },
    thesisAuthor: { fontSize: 10, fontWeight: 'bold', color: Colors.textSecondary, letterSpacing: 1, marginBottom: 16 },

    cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: Colors.border, paddingTop: 16 },
    docIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.04)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.border },
    viewBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    viewBtnText: { fontSize: 10, fontWeight: '900', color: Colors.primary, letterSpacing: 1, textTransform: 'uppercase' },
    viewBtnDisabled: { color: Colors.textDim },

    // Empty
    emptyCard: {
        backgroundColor: Colors.card, borderRadius: 28, padding: 40, alignItems: 'center',
        borderWidth: 1, borderColor: Colors.border,
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 12 },
            android: { elevation: 6 }
        }),
    },
    emptyIconBox: { width: 64, height: 64, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.04)', alignItems: 'center', justifyContent: 'center', marginBottom: 16, borderWidth: 1, borderColor: Colors.border },
    emptyTitle: { fontSize: 15, fontWeight: '900', color: Colors.foreground, textTransform: 'uppercase', marginBottom: 4 },
    emptyDesc: { fontSize: 12, color: Colors.textSecondary, textAlign: 'center' },
});

export default MySubmissions;
