import React, { useState } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    TextInput, Platform, Alert, ActivityIndicator, Modal, FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomHeader from '../../Navigation/CustomHeader';
import HamburgerMenu from '../../Navigation/HamburgerMenu';
import API_BASE_URL from '../../../api';

const CATEGORIES = [
    'Computer Science',
    'Information Technology',
    'Engineering',
    'Education',
    'Arts & Sciences',
    'Other',
];

const SubmitThesis = () => {
    const navigation = useNavigation();
    const [isMenuVisible, setIsMenuVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showCategoryPicker, setShowCategoryPicker] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        abstract: '',
        author: '',
        year_range: '',
        category: '',
    });

    const updateField = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async () => {
        const { title, abstract, author, year_range, category } = formData;
        if (!title || !abstract || !author || !year_range || !category) {
            return Alert.alert('Incomplete', 'Please fill in all fields before submitting.');
        }

        setIsSubmitting(true);
        try {
            const token = await AsyncStorage.getItem('userToken');
            const res = await fetch(`${API_BASE_URL}/user/theses`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                Alert.alert('Success', 'Thesis submitted for approval!', [
                    { text: 'OK', onPress: () => navigation.navigate('DocumentsHub') }
                ]);
            } else {
                const data = await res.json();
                Alert.alert('Error', data.message || 'Failed to submit thesis');
            }
        } catch (err) {
            Alert.alert('Error', 'Could not connect to server');
        } finally {
            setIsSubmitting(false);
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

            <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Back Button */}
                <TouchableOpacity style={styles.backRow} onPress={() => navigation.navigate('DocumentsHub')}>
                    <Ionicons name="arrow-back" size={16} color="#fca5a5" />
                    <Text style={styles.backText}>Back to Documents</Text>
                </TouchableOpacity>

                {/* Form Card */}
                <View style={styles.formCard}>
                    <View style={styles.formHeader}>
                        <Text style={styles.formTitle}>Submit Thesis</Text>
                        <Text style={styles.formSubtitle}>UPLOAD NEW DOCUMENT</Text>
                    </View>

                    {/* Research Title */}
                    <View style={styles.fieldGroup}>
                        <Text style={styles.fieldLabel}>RESEARCH TITLE</Text>
                        <TextInput
                            style={styles.input}
                            value={formData.title}
                            onChangeText={v => updateField('title', v)}
                            placeholder="Enter full thesis title"
                            placeholderTextColor="#9ca3af"
                        />
                    </View>

                    {/* Author */}
                    <View style={styles.fieldGroup}>
                        <Text style={styles.fieldLabel}>AUTHOR</Text>
                        <TextInput
                            style={styles.input}
                            value={formData.author}
                            onChangeText={v => updateField('author', v)}
                            placeholder="Last Name, First Name"
                            placeholderTextColor="#9ca3af"
                        />
                    </View>

                    {/* Year + Category Row */}
                    <View style={styles.rowGroup}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.fieldLabel}>PUBLICATION YEAR</Text>
                            <TextInput
                                style={styles.input}
                                value={formData.year_range}
                                onChangeText={v => updateField('year_range', v)}
                                placeholder="e.g. 2023-2024"
                                placeholderTextColor="#9ca3af"
                            />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.fieldLabel}>CATEGORY</Text>
                            <TouchableOpacity
                                style={styles.dropdownBtn}
                                onPress={() => setShowCategoryPicker(true)}
                                activeOpacity={0.7}
                            >
                                <Text style={[styles.dropdownBtnText, !formData.category && { color: '#9ca3af' }]}>
                                    {formData.category || 'Select Domain'}
                                </Text>
                                <Ionicons name="chevron-down" size={16} color="#6b7280" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Abstract */}
                    <View style={styles.fieldGroup}>
                        <Text style={styles.fieldLabel}>ABSTRACT</Text>
                        <TextInput
                            style={[styles.input, styles.inputMultiline]}
                            value={formData.abstract}
                            onChangeText={v => updateField('abstract', v)}
                            placeholder="Paste the abstract here..."
                            placeholderTextColor="#9ca3af"
                            multiline
                            numberOfLines={6}
                            textAlignVertical="top"
                        />
                    </View>

                    {/* Buttons */}
                    <View style={styles.formActions}>
                        <TouchableOpacity style={styles.cancelBtn} onPress={() => navigation.navigate('DocumentsHub')}>
                            <Text style={styles.cancelBtnText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.submitBtn, isSubmitting && styles.btnDisabled]}
                            onPress={handleSubmit}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <ActivityIndicator color="#fff" size="small" />
                            ) : (
                                <>
                                    <Ionicons name="cloud-upload" size={18} color="#fff" />
                                    <Text style={styles.submitBtnText}>Submit</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>

            {/* Category Picker Modal */}
            <Modal visible={showCategoryPicker} transparent animationType="fade">
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setShowCategoryPicker(false)}
                >
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Select Category</Text>
                        {CATEGORIES.map((cat) => (
                            <TouchableOpacity
                                key={cat}
                                style={[styles.modalItem, formData.category === cat && styles.modalItemActive]}
                                onPress={() => { updateField('category', cat); setShowCategoryPicker(false); }}
                            >
                                <Text style={[styles.modalItemText, formData.category === cat && styles.modalItemTextActive]}>{cat}</Text>
                                {formData.category === cat && <Ionicons name="checkmark" size={18} color="#7f0000" />}
                            </TouchableOpacity>
                        ))}
                    </View>
                </TouchableOpacity>
            </Modal>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    scroll: { flex: 1 },
    scrollContent: { paddingTop: 20, paddingBottom: 60, paddingHorizontal: 20 },
    backRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 20 },
    backText: { color: '#fca5a5', fontSize: 10, fontWeight: '900', letterSpacing: 2, textTransform: 'uppercase' },

    formCard: {
        backgroundColor: '#fff', borderRadius: 28, padding: 24, overflow: 'hidden',
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 16 },
            android: { elevation: 8 }
        }),
    },
    formHeader: { borderBottomWidth: 1, borderBottomColor: '#f3f4f6', paddingBottom: 16, marginBottom: 24 },
    formTitle: { fontSize: 22, fontWeight: '900', color: '#111827', textTransform: 'uppercase', marginBottom: 4 },
    formSubtitle: { fontSize: 10, fontWeight: '900', color: '#dc2626', letterSpacing: 2 },

    fieldGroup: { marginBottom: 20 },
    fieldLabel: { fontSize: 9, fontWeight: '900', color: '#6b7280', letterSpacing: 2, marginBottom: 8 },
    input: {
        backgroundColor: '#f9fafb', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 16, paddingHorizontal: 20, paddingVertical: 16,
        fontSize: 14, color: '#111827', fontWeight: '500',
    },
    inputMultiline: { minHeight: 140, textAlignVertical: 'top' },

    rowGroup: { flexDirection: 'row', gap: 12, marginBottom: 20 },
    dropdownBtn: {
        backgroundColor: '#f9fafb', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 16,
        paddingHorizontal: 20, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    },
    dropdownBtnText: { fontSize: 14, color: '#111827', fontWeight: '500', flex: 1 },

    formActions: { flexDirection: 'row', gap: 12, paddingTop: 20, borderTopWidth: 1, borderTopColor: '#f3f4f6', marginTop: 12 },
    cancelBtn: { flex: 1, padding: 18, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
    cancelBtnText: { color: '#6b7280', fontWeight: '900', fontSize: 11, letterSpacing: 1, textTransform: 'uppercase' },
    submitBtn: {
        flex: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
        backgroundColor: '#7f0000', borderRadius: 16, padding: 18,
    },
    submitBtnText: { color: '#fff', fontWeight: '900', fontSize: 11, letterSpacing: 1, textTransform: 'uppercase' },
    btnDisabled: { opacity: 0.6 },

    // Modal
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 30 },
    modalContent: { backgroundColor: '#fff', borderRadius: 24, padding: 20, width: '100%', maxWidth: 340 },
    modalTitle: { fontSize: 14, fontWeight: '900', color: '#111827', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16, textAlign: 'center' },
    modalItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, paddingHorizontal: 16, borderRadius: 12, marginBottom: 4 },
    modalItemActive: { backgroundColor: '#fef2f2' },
    modalItemText: { fontSize: 14, color: '#374151', fontWeight: '500' },
    modalItemTextActive: { color: '#7f0000', fontWeight: '900' },
});

export default SubmitThesis;
