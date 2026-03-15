import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    Platform, Dimensions, ActivityIndicator, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as DocumentPicker from 'expo-document-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomHeader from '../../Navigation/CustomHeader';
import HamburgerMenu from '../../Navigation/HamburgerMenu';
import API_BASE_URL from '../../../api';

const { width } = Dimensions.get('window');

const AnalysisWorkspace = () => {
    const navigation = useNavigation();
    const [isMenuVisible, setIsMenuVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Upload & analysis
    const [selectedFile, setSelectedFile] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState(null);
    const [expandedCategories, setExpandedCategories] = useState({});
    const [drafts, setDrafts] = useState([]);

    useEffect(() => { fetchDrafts(); }, []);

    const fetchDrafts = async () => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            if (!token) return;
            const res = await fetch(`${API_BASE_URL}/user/analysis-drafts`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) setDrafts(data.data || []);
        } catch (e) { console.error('Fetch drafts error:', e); }
    };

    const pickDocument = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: [
                    'application/pdf',
                    'application/msword',
                    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                    'text/plain'
                ],
                copyToCacheDirectory: true,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                const file = result.assets[0];
                setSelectedFile(file);
                setAnalysisResult(null);
            }
        } catch (err) {
            Alert.alert('Error', 'Could not pick file');
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) return Alert.alert('No File', 'Please select a file first');
        setIsAnalyzing(true);
        try {
            const token = await AsyncStorage.getItem('userToken');
            const formData = new FormData();
            formData.append('thesis', {
                uri: selectedFile.uri,
                name: selectedFile.name,
                type: selectedFile.mimeType || 'application/pdf',
            });

            const response = await fetch(`${API_BASE_URL}/user/analyze`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData,
            });
            const data = await response.json();
            if (response.ok) {
                setAnalysisResult({
                    overallScore: data.overallScore,
                    totalIssues: data.totalIssues || (data.recommendations || []).length,
                    statistics: data.statistics || {},
                    categories: data.categories || [],
                    pagesText: data.pagesText || [],
                });
                Alert.alert('Success', 'Analysis complete!');
            } else {
                Alert.alert('Error', data.error || data.message || 'Analysis failed');
            }
        } catch (err) {
            console.error('Upload error:', err);
            Alert.alert('Error', 'Could not analyze file (server error)');
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleResumeDraft = (draft) => {
        setSelectedFile({ name: draft.fileName, uri: null });
        setAnalysisResult({
            ...draft.originalResults,
            pagesText: draft.localPagesText,
        });
    };

    const resetAnalysis = () => {
        setSelectedFile(null);
        setAnalysisResult(null);
        setExpandedCategories({});
    };

    const toggleCategory = (idx) => {
        setExpandedCategories(prev => ({ ...prev, [idx]: !prev[idx] }));
    };

    const getScoreColor = (score) => {
        if (score >= 90) return '#22c55e';
        if (score >= 70) return '#f59e0b';
        return '#ef4444';
    };

    const getSeverityColor = (sev) => {
        if (sev === 'high') return '#ef4444';
        if (sev === 'medium') return '#f59e0b';
        return '#3b82f6';
    };

    const handleSearch = () => {
        if (searchQuery.trim()) {
            navigation.navigate('SmartSearch', { initialQuery: searchQuery.trim() });
            setSearchQuery('');
        }
    };

    // ---- RENDER ----

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

                {/* If no results yet, show upload UI */}
                {!analysisResult ? (
                    <>
                        {/* Hero */}
                        <View style={styles.heroSection}>
                            <Text style={styles.heroTag}>ANALYSIS</Text>
                            <Text style={styles.heroTitle}>Analysis Workspace</Text>
                            <Text style={styles.heroDesc}>Upload a thesis (PDF, DOCX, TXT) for AI-powered analysis.</Text>
                        </View>

                        {/* Upload Card */}
                        <TouchableOpacity
                            style={[styles.uploadCard, selectedFile && styles.uploadCardSelected]}
                            onPress={pickDocument}
                            disabled={isAnalyzing}
                            activeOpacity={0.8}
                        >
                            <View style={styles.uploadIconBox}>
                                {isAnalyzing ? (
                                    <ActivityIndicator color="#7f0000" />
                                ) : selectedFile ? (
                                    <Ionicons name="document-text" size={32} color="#22c55e" />
                                ) : (
                                    <Ionicons name="cloud-upload" size={32} color="#7f0000" />
                                )}
                            </View>
                            <Text style={styles.uploadTitle}>
                                {isAnalyzing ? 'Analyzing...' : selectedFile ? selectedFile.name : 'Tap to Select File'}
                            </Text>
                            <Text style={styles.uploadSub}>
                                {isAnalyzing ? 'Processing your document' : selectedFile ? `${((selectedFile.size || 0) / (1024 * 1024)).toFixed(2)} MB` : 'PDF, DOC, DOCX, TXT • Max 50MB'}
                            </Text>
                        </TouchableOpacity>

                        {selectedFile && !isAnalyzing && (
                            <View style={styles.actionRow}>
                                <TouchableOpacity style={styles.clearBtn} onPress={resetAnalysis}>
                                    <Ionicons name="close-circle" size={18} color="#f87171" />
                                    <Text style={styles.clearBtnText}>Clear</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.analyzeBtn} onPress={handleUpload}>
                                    <Ionicons name="analytics" size={18} color="#fff" />
                                    <Text style={styles.analyzeBtnText}>Analyze</Text>
                                </TouchableOpacity>
                            </View>
                        )}

                        {/* Recent Drafts */}
                        {drafts.length > 0 && (
                            <View style={styles.draftsSection}>
                                <Text style={styles.draftsSectionTitle}>SAVED DRAFTS</Text>
                                {drafts.map((draft, idx) => (
                                    <TouchableOpacity
                                        key={draft._id || idx}
                                        style={styles.draftCard}
                                        onPress={() => handleResumeDraft(draft)}
                                        activeOpacity={0.7}
                                    >
                                        <Ionicons name="document-attach" size={20} color="#7f0000" />
                                        <View style={{ flex: 1, marginLeft: 12 }}>
                                            <Text style={styles.draftName} numberOfLines={1}>{draft.fileName}</Text>
                                            <Text style={styles.draftDate}>
                                                {new Date(draft.updatedAt).toLocaleDateString()} • {(draft.appliedIssueIds || []).length} fixes applied
                                            </Text>
                                        </View>
                                        <Text style={styles.draftResume}>RESUME</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}
                    </>
                ) : (
                    /* Analysis Results View */
                    <>
                        {/* Score Card */}
                        <View style={styles.scoreCard}>
                            <View style={[styles.scoreBadge, { borderColor: getScoreColor(analysisResult.overallScore) }]}>
                                <Text style={[styles.scoreNum, { color: getScoreColor(analysisResult.overallScore) }]}>
                                    {analysisResult.overallScore}
                                </Text>
                                <Text style={styles.scoreLabel}>/100</Text>
                            </View>
                            <View style={{ flex: 1, marginLeft: 16 }}>
                                <Text style={styles.scoreTitle}>Overall Assessment</Text>
                                <Text style={styles.scoreSub}>
                                    {analysisResult.overallScore >= 90 ? 'Exceptional' :
                                        analysisResult.overallScore >= 70 ? 'Acceptable' : 'Needs Revision'}
                                </Text>
                            </View>
                            <TouchableOpacity onPress={resetAnalysis}>
                                <Ionicons name="close" size={22} color="rgba(255,255,255,0.5)" />
                            </TouchableOpacity>
                        </View>

                        {/* Stats Row */}
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
                            <View style={styles.statsRow}>
                                {[
                                    { label: 'Words', val: analysisResult.statistics?.wordCount || 0 },
                                    { label: 'Sentences', val: analysisResult.statistics?.sentenceCount || 0 },
                                    { label: 'Paragraphs', val: analysisResult.statistics?.paragraphCount || 0 },
                                    { label: 'Readability', val: analysisResult.statistics?.readabilityIndex || 0 },
                                ].map((s, i) => (
                                    <View key={i} style={styles.statPill}>
                                        <Text style={styles.statPillVal}>{s.val.toLocaleString()}</Text>
                                        <Text style={styles.statPillLabel}>{s.label}</Text>
                                    </View>
                                ))}
                            </View>
                        </ScrollView>

                        {/* Categories & Issues */}
                        <Text style={styles.feedbackTitle}>FEEDBACK</Text>
                        {(analysisResult.categories || []).map((cat, idx) => (
                            <View key={idx} style={styles.catBlock}>
                                <TouchableOpacity
                                    style={styles.catHeader}
                                    onPress={() => toggleCategory(idx)}
                                    activeOpacity={0.7}
                                >
                                    <View style={[styles.catDot, { backgroundColor: cat.color || '#7f0000' }]} />
                                    <Text style={styles.catName}>{cat.name}</Text>
                                    <View style={styles.catBadge}>
                                        <Text style={styles.catBadgeText}>{cat.issues?.length || 0}</Text>
                                    </View>
                                    <Ionicons
                                        name={expandedCategories[idx] ? 'chevron-up' : 'chevron-down'}
                                        size={16} color="rgba(255,255,255,0.4)"
                                    />
                                </TouchableOpacity>

                                {expandedCategories[idx] && cat.issues?.map((issue, iIdx) => (
                                    <View key={iIdx} style={styles.issueCard}>
                                        <View style={[styles.issueSeverityBar, { backgroundColor: getSeverityColor(issue.severity) }]} />
                                        <View style={styles.issueBody}>
                                            <View style={styles.issueTop}>
                                                <Text style={styles.issueTitle} numberOfLines={2}>{issue.title}</Text>
                                                <View style={[styles.severityPill, { backgroundColor: getSeverityColor(issue.severity) + '20', borderColor: getSeverityColor(issue.severity) }]}>
                                                    <Text style={[styles.severityPillText, { color: getSeverityColor(issue.severity) }]}>
                                                        {issue.severity}
                                                    </Text>
                                                </View>
                                            </View>
                                            <Text style={styles.issueDesc} numberOfLines={3}>{issue.description}</Text>

                                            <View style={styles.suggestionBox}>
                                                <Ionicons name="bulb" size={14} color="#f59e0b" />
                                                <Text style={styles.suggestionText} numberOfLines={4}>
                                                    "{issue.suggestion}"
                                                </Text>
                                            </View>

                                            {issue.pages && issue.pages.length > 0 && (
                                                <View style={styles.pagesRow}>
                                                    {issue.pages.map(p => (
                                                        <View key={p} style={styles.pagePill}>
                                                            <Text style={styles.pagePillText}>p.{p}</Text>
                                                        </View>
                                                    ))}
                                                </View>
                                            )}
                                        </View>
                                    </View>
                                ))}
                            </View>
                        ))}
                    </>
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

    // Hero
    heroSection: { marginBottom: 24 },
    heroTag: { fontSize: 10, fontWeight: '900', color: '#fecaca', letterSpacing: 2, marginBottom: 8 },
    heroTitle: { fontSize: 28, fontWeight: '900', color: '#fff', marginBottom: 8 },
    heroDesc: { fontSize: 13, color: 'rgba(255,255,255,0.7)', lineHeight: 20 },

    // Upload
    uploadCard: {
        backgroundColor: '#fff', borderRadius: 24, padding: 32, alignItems: 'center',
        marginBottom: 16,
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.15, shadowRadius: 12 },
            android: { elevation: 6 }
        }),
        borderWidth: 2, borderColor: '#f3f4f6', borderStyle: 'dashed',
    },
    uploadCardSelected: { borderColor: '#22c55e', borderStyle: 'solid' },
    uploadIconBox: { width: 64, height: 64, borderRadius: 20, backgroundColor: '#fef2f2', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
    uploadTitle: { fontSize: 14, fontWeight: '900', color: '#111827', marginBottom: 4, textAlign: 'center' },
    uploadSub: { fontSize: 11, color: '#6b7280', textAlign: 'center' },

    actionRow: { flexDirection: 'row', gap: 12, marginBottom: 28 },
    clearBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 16, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
    clearBtnText: { color: '#fca5a5', fontWeight: '900', fontSize: 12, letterSpacing: 1 },
    analyzeBtn: { flex: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 16, backgroundColor: '#7f0000', borderRadius: 16 },
    analyzeBtnText: { color: '#fff', fontWeight: '900', fontSize: 12, letterSpacing: 1 },

    // Drafts
    draftsSection: { marginTop: 8, marginBottom: 20 },
    draftsSectionTitle: { fontSize: 10, fontWeight: '900', color: 'rgba(255,255,255,0.5)', letterSpacing: 2, marginBottom: 12 },
    draftCard: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 16, padding: 16, marginBottom: 10,
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)',
    },
    draftName: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
    draftDate: { color: 'rgba(255,255,255,0.4)', fontSize: 10, marginTop: 2 },
    draftResume: { color: '#fca5a5', fontWeight: '900', fontSize: 9, letterSpacing: 2 },

    // Score Card
    scoreCard: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 24, padding: 20, marginBottom: 20,
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    },
    scoreBadge: { width: 64, height: 64, borderRadius: 16, borderWidth: 3, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.05)' },
    scoreNum: { fontSize: 22, fontWeight: '900' },
    scoreLabel: { fontSize: 10, color: 'rgba(255,255,255,0.4)', fontWeight: 'bold' },
    scoreTitle: { fontSize: 16, fontWeight: '900', color: '#fff', textTransform: 'uppercase' },
    scoreSub: { fontSize: 10, color: '#fca5a5', fontWeight: 'bold', letterSpacing: 1, marginTop: 2 },

    // Stats
    statsRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 0 },
    statPill: { backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 16, paddingVertical: 14, paddingHorizontal: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', alignItems: 'center', minWidth: 90 },
    statPillVal: { fontSize: 18, fontWeight: '900', color: '#fff', marginBottom: 2 },
    statPillLabel: { fontSize: 9, fontWeight: 'bold', color: 'rgba(255,255,255,0.4)', letterSpacing: 1, textTransform: 'uppercase' },

    // Categories
    feedbackTitle: { fontSize: 11, fontWeight: '900', color: 'rgba(255,255,255,0.5)', letterSpacing: 2, marginBottom: 16, textAlign: 'center' },
    catBlock: { marginBottom: 16, borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
    catHeader: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 20, backgroundColor: 'rgba(255,255,255,0.05)', gap: 10 },
    catDot: { width: 10, height: 10, borderRadius: 5 },
    catName: { flex: 1, color: '#fff', fontWeight: '900', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 },
    catBadge: { backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
    catBadgeText: { color: 'rgba(255,255,255,0.6)', fontWeight: '900', fontSize: 10 },

    // Issues
    issueCard: { backgroundColor: '#fff', marginHorizontal: 12, marginVertical: 8, borderRadius: 20, flexDirection: 'row', overflow: 'hidden',
        ...Platform.select({ ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6 }, android: { elevation: 2 } }),
    },
    issueSeverityBar: { width: 5 },
    issueBody: { flex: 1, padding: 16 },
    issueTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 },
    issueTitle: { flex: 1, fontSize: 12, fontWeight: '900', color: '#111827', textTransform: 'uppercase', marginRight: 8 },
    severityPill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, borderWidth: 1 },
    severityPillText: { fontSize: 8, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1 },
    issueDesc: { fontSize: 11, color: '#6b7280', lineHeight: 16, marginBottom: 10 },
    suggestionBox: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, backgroundColor: '#fffbeb', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#fef3c7', marginBottom: 10 },
    suggestionText: { flex: 1, fontSize: 11, color: '#92400e', fontStyle: 'italic', lineHeight: 16 },
    pagesRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
    pagePill: { backgroundColor: '#f3f4f6', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
    pagePillText: { fontSize: 9, fontWeight: '900', color: '#6b7280', letterSpacing: 1 },
});

export default AnalysisWorkspace;
