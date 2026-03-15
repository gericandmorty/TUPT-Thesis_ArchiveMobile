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
        <LinearGradient colors={['#7f0000', '#240000']} style={styles.container}>
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
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchTheses(); }} tintColor="#fca5a5" />}
            >
                {/* Back Button */}
                <TouchableOpacity style={styles.backRow} onPress={() => navigation.navigate('DocumentsHub')}>
                    <Ionicons name="arrow-back" size={16} color="#fca5a5" />
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
                        <ActivityIndicator size="large" color="#fca5a5" />
                    </View>
                ) : theses.length > 0 ? (
                    theses.map((thesis) => (
                        <View key={thesis._id} style={styles.thesisCard}>
                            {/* Category + Status */}
                            <View style={styles.cardTopRow}>
                                <View style={styles.categoryPill}>
                                    <Text style={styles.categoryPillText}>{thesis.category || 'General'}</Text>
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
                                    <Ionicons name="arrow-forward" size={12} color={thesis.isApproved ? '#111827' : '#d1d5db'} />
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
    backText: { color: '#fca5a5', fontSize: 10, fontWeight: '900', letterSpacing: 2, textTransform: 'uppercase' },

    // Header
    headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
    headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    headerBar: { width: 4, height: 40, borderRadius: 2, backgroundColor: '#7f0000' },
    headerTag: { fontSize: 10, fontWeight: '900', color: 'rgba(255,255,255,0.5)', letterSpacing: 2 },
    headerTitle: { fontSize: 22, fontWeight: '900', color: '#fff', textTransform: 'uppercase' },
    countBadge: { backgroundColor: 'rgba(254,242,242,0.9)', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: '#fecaca' },
    countBadgeText: { fontSize: 9, fontWeight: '900', color: '#7f0000', letterSpacing: 1 },

    loadingBox: { paddingVertical: 60, alignItems: 'center' },

    // Cards
    thesisCard: {
        backgroundColor: '#fff', borderRadius: 24, padding: 20, marginBottom: 16,
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10 },
            android: { elevation: 4 }
        }),
    },
    cardTopRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
    categoryPill: { backgroundColor: '#fef2f2', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, borderWidth: 1, borderColor: '#fecaca' },
    categoryPillText: { fontSize: 9, fontWeight: '900', color: '#dc2626', letterSpacing: 1 },
    statusPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, borderWidth: 1 },
    statusApproved: { backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' },
    statusPending: { backgroundColor: '#fffbeb', borderColor: '#fde68a' },
    statusPillText: { fontSize: 8, fontWeight: '900', letterSpacing: 1, textTransform: 'uppercase' },
    statusApprovedText: { color: '#16a34a' },
    statusPendingText: { color: '#d97706' },

    thesisTitle: { fontSize: 16, fontWeight: '900', color: '#111827', textTransform: 'uppercase', lineHeight: 22, marginBottom: 6 },
    thesisAuthor: { fontSize: 10, fontWeight: 'bold', color: '#6b7280', letterSpacing: 1, marginBottom: 16 },

    cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#f3f4f6', paddingTop: 16 },
    docIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#f9fafb', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#f3f4f6' },
    viewBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    viewBtnText: { fontSize: 10, fontWeight: '900', color: '#111827', letterSpacing: 1, textTransform: 'uppercase' },
    viewBtnDisabled: { color: '#d1d5db' },

    // Empty
    emptyCard: {
        backgroundColor: '#fff', borderRadius: 28, padding: 40, alignItems: 'center',
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10 },
            android: { elevation: 4 }
        }),
    },
    emptyIconBox: { width: 64, height: 64, borderRadius: 20, backgroundColor: '#f9fafb', alignItems: 'center', justifyContent: 'center', marginBottom: 16, borderWidth: 1, borderColor: '#f3f4f6' },
    emptyTitle: { fontSize: 16, fontWeight: '900', color: '#111827', textTransform: 'uppercase', marginBottom: 4 },
    emptyDesc: { fontSize: 12, color: '#6b7280', textAlign: 'center' },
});

export default MySubmissions;
