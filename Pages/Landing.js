import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  ImageBackground,
  Platform,
  SafeAreaView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const features = [
  {
    number: '01',
    badge: 'Smart Search',
    title: 'Find Any Thesis in Seconds',
    desc: 'Our advanced semantic search engine indexes thousands of institutional papers. Search by title, abstract, author, or keywords — results are ranked by relevance in milliseconds.',
    icon: 'search',
    color: '#3B82F6',       
    bgLight: '#eff6ff', 
    borderLight: '#dbeafe',
  },
  {
    number: '02',
    badge: 'AI Assistance',
    title: 'Get AI-Powered Title Ideas',
    desc: 'Stuck on a thesis topic? Use our AI recommendation engine to generate title ideas, structural suggestions, and research directions — all tailored to your department and interests.',
    icon: 'hardware-chip',
    color: '#8B5CF6',       
    bgLight: '#f5f3ff', 
    borderLight: '#ede9fe',
  },
  {
    number: '03',
    badge: 'Advanced Filtering',
    title: 'Narrow Down with Precision',
    desc: 'Filter search results by department, publication year, author, or category. Combine multiple filters to pinpoint exactly the research you need from the entire archive.',
    icon: 'options',
    color: '#F97316',       
    bgLight: '#fff7ed', 
    borderLight: '#ffedd5',
  },
  {
    number: '04',
    badge: 'Document Analysis',
    title: 'Upload & Extract Metadata Instantly',
    desc: 'Upload your thesis PDF and let our system automatically extract the title, authors, abstract, and key metadata. No manual entry needed — everything is processed in seconds.',
    icon: 'cloud-upload',
    color: '#22C55E',       
    bgLight: '#f0fdf4', 
    borderLight: '#dcfce7',
  },
];

const LandingScreen = () => {
  const navigation = useNavigation();

  return (
    <ScrollView 
      style={styles.container}
      showsVerticalScrollIndicator={false}
      bounces={false}
    >
      {/* ════════════════════════════════════════════
          HERO SECTION
      ════════════════════════════════════════════ */}
      <View style={styles.heroSection}>
        <ImageBackground
          source={require('../assets/TupForLanding.jpg')}
          style={styles.heroImage}
          resizeMode="cover"
        >
          <LinearGradient
            colors={['rgba(0,0,0,0.7)', 'rgba(0,0,0,0.4)', 'rgba(139,0,0,0.9)']}
            style={styles.heroGradient}
          >
            <SafeAreaView style={styles.heroContent}>
              <View style={styles.heroTextContainer}>
                <Text style={styles.heroTitle}>
                  THE DIGITAL ARCHIVE OF TUP EXCELLENCE
                </Text>
                <Text style={styles.heroSubtitle}>
                  A centralized repository for future-ready engineers. Store, search, and verify your research with institutional precision.
                </Text>
                
                {/* Hero Actions */}
                <View style={styles.heroActions}>
                  <TouchableOpacity 
                    style={styles.btnHeroPrimary}
                    onPress={() => navigation.navigate('Register')}
                    activeOpacity={0.9}
                  >
                    <Text style={styles.btnHeroPrimaryText}>START YOUR JOURNEY</Text>
                    <Ionicons name="arrow-forward" size={16} color="#8b0000" />
                  </TouchableOpacity>

                  <View style={styles.heroSecondaryActions}>
                     <TouchableOpacity 
                        style={styles.btnHeroSecondary}
                        onPress={() => navigation.navigate('Login')}
                     >
                        <Text style={styles.btnHeroSecondaryText}>SIGN IN</Text>
                     </TouchableOpacity>
                     
                     <View style={styles.actionDivider} />

                     <TouchableOpacity 
                        style={styles.btnHeroSecondary}
                        onPress={() => navigation.navigate('SmartSearch')}
                     >
                        <Ionicons name="search" size={14} color="#fff" style={{marginRight: 4}}/>
                        <Text style={styles.btnHeroSecondaryText}>GUEST SEARCH</Text>
                     </TouchableOpacity>
                  </View>
                </View>

              </View>
            </SafeAreaView>
          </LinearGradient>
        </ImageBackground>
      </View>

      {/* ════════════════════════════════════════════
          FEATURE SECTIONS
      ════════════════════════════════════════════ */}
      <View style={styles.featuresContainer}>
        {features.map((feat, index) => (
          <View key={feat.number} style={styles.featureBlock}>
            
            <View style={styles.featureHeader}>
                <Text style={[styles.featureNumberLabel, {color: feat.color}]}>FEATURE {feat.number}</Text>
                <Text style={styles.featureMainTitle}>{feat.title}</Text>
                <View style={[styles.featureTitleUnderline, { backgroundColor: feat.color }]} />
            </View>

            <View style={[styles.featureCard, { backgroundColor: feat.bgLight, borderColor: feat.borderLight }]}>
                <View style={[styles.featureIconBox, { backgroundColor: `${feat.color}20`, borderColor: `${feat.color}40` }]}>
                    <Ionicons name={feat.icon} size={32} color={feat.color} />
                </View>
                
                <View style={[styles.featureBadge, { borderColor: feat.borderLight }]}>
                   <Text style={[styles.featureBadgeText, { color: feat.color }]}>{feat.badge}</Text>
                </View>

                <Text style={styles.featureDesc}>{feat.desc}</Text>
            </View>

          </View>
        ))}
      </View>

      {/* ════════════════════════════════════════════
          WHY CHOOSE SECTION
      ════════════════════════════════════════════ */}
      <View style={styles.whyChooseSection}>
          <Text style={styles.sectionSubtitleRed}>INNOVATION FIRST</Text>
          <Text style={styles.sectionTitleDark}>WHY CHOOSE TUP THESIS ARCHIVE?</Text>
          <Text style={styles.sectionDescLight}>
              We've built more than just a storage system. It's a high-performance environment designed to protect institutional knowledge while making it accessible for the next generation of researchers.
          </Text>

          <View style={styles.benefitsGrid}>
              {[
                  { title: 'Institutional Trust', desc: 'Secure repository endorsed by TUP-Taguig leadership.', icon: 'shield-checkmark' },
                  { title: 'Modern Tools', desc: 'Next-gen search and analysis interface.', icon: 'rocket' },
                  { title: 'Clean Design', desc: 'A minimalist, flawless student-focused experience.', icon: 'bulb' },
                  { title: 'Verified Quality', desc: 'AI-assisted verification for academic standards.', icon: 'checkmark-circle' },
              ].map((item, i) => (
                  <View key={i} style={styles.benefitCard}>
                      <Ionicons name={item.icon} size={28} color="#ef4444" style={styles.benefitIcon} />
                      <Text style={styles.benefitTitle}>{item.title}</Text>
                      <Text style={styles.benefitDesc}>{item.desc}</Text>
                  </View>
              ))}
          </View>
      </View>

      {/* ════════════════════════════════════════════
          CORE FUNCTIONS SECTION
      ════════════════════════════════════════════ */}
      <LinearGradient
          colors={['#8b0000', '#500000']}
          style={styles.coreFunctionsSection}
      >
          <Text style={styles.sectionSubtitleLight}>CORE FUNCTIONS</Text>
          <Text style={styles.sectionTitleWhite}>WHAT DOES IT DO?</Text>

          <View style={styles.coreFunctionsList}>
            {[
              { icon: 'search', title: 'RAPID SEARCH', desc: 'Search through thousands of institutional papers in milliseconds with our advanced indexing engine.' },
              { icon: 'checkmark-circle', title: 'AI VALIDATION', desc: 'Ensure your research title and abstract meet quality standards before official submission.' },
              { icon: 'document-text', title: 'FULL ARCHIVE', desc: 'Digitally store your approved thesis with metadata to inspire future Technologists.' },
            ].map((item, i) => (
              <View key={i} style={styles.coreFuncItem}>
                  <View style={styles.coreFuncIconBox}>
                      <Ionicons name={item.icon} size={36} color="#fecaca" />
                  </View>
                  <Text style={styles.coreFuncTitle}>{item.title}</Text>
                  <Text style={styles.coreFuncDesc}>{item.desc}</Text>
              </View>
            ))}
          </View>
      </LinearGradient>

      {/* ════════════════════════════════════════════
          HOW IT WORKS SECTION
      ════════════════════════════════════════════ */}
      <View style={styles.howItWorksSection}>
          <Text style={styles.sectionSubtitleRed}>SYSTEM WORKFLOW</Text>
          <Text style={styles.sectionTitleDark}>HOW DOES IT WORK?</Text>

          <View style={styles.workflowGrid}>
            {[
              { step: '01', title: 'REGISTER', desc: 'Securely create your student account using your TUP ID.' },
              { step: '02', title: 'EXPLORE', desc: 'Search previous research to find inspiration for your project.' },
              { step: '03', title: 'ANALYZE', desc: 'Upload your title and abstract for institutional verification.' },
              { step: '04', title: 'ARCHIVE', desc: 'Secure your legacy in the official TUP digital library.' },
            ].map((item, i) => (
              <View key={i} style={styles.workflowCard}>
                  <Text style={styles.workflowStepNum}>{item.step}</Text>
                  <Text style={styles.workflowTitle}>{item.title}</Text>
                  <Text style={styles.workflowDesc}>{item.desc}</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity 
             style={styles.btnFooterPrimary}
             onPress={() => navigation.navigate('Register')}
             activeOpacity={0.9}
          >
             <Text style={styles.btnFooterPrimaryText}>GET STARTED NOW</Text>
          </TouchableOpacity>
      </View>

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  
  // -- Hero --
  heroSection: {
      height: height, // Full screen height
      width: '100%',
  },
  heroImage: {
      width: '100%',
      height: '100%',
  },
  heroGradient: {
      flex: 1,
      justifyContent: 'center',
  },
  heroContent: {
      flex: 1,
      justifyContent: 'center',
      paddingHorizontal: 24,
  },
  heroTextContainer: {
      alignItems: 'center',
  },
  heroTitle: {
      fontSize: 38,
      fontWeight: '900',
      color: '#fff',
      textAlign: 'center',
      lineHeight: 40,
      marginBottom: 20,
      letterSpacing: -1,
  },
  heroSubtitle: {
      fontSize: 16,
      color: 'rgba(255,255,255,0.7)',
      textAlign: 'center',
      lineHeight: 24,
      marginBottom: 40,
      fontWeight: '500',
      paddingHorizontal: 10,
  },
  heroActions: {
      width: '100%',
      alignItems: 'center',
      gap: 24,
  },
  btnHeroPrimary: {
      backgroundColor: '#fff',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 18,
      paddingHorizontal: 32,
      borderRadius: 16,
      width: '100%',
      maxWidth: 320,
      gap: 12,
      ...Platform.select({
          ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20 },
          android: { elevation: 10 }
      }),
  },
  btnHeroPrimaryText: {
      color: '#8b0000',
      fontSize: 14,
      fontWeight: '900',
      letterSpacing: 2,
  },
  heroSecondaryActions: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 16,
  },
  btnHeroSecondary: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 8,
  },
  btnHeroSecondaryText: {
      color: '#fff',
      fontSize: 12,
      fontWeight: 'bold',
      letterSpacing: 1.5,
      textDecorationLine: 'underline',
  },
  actionDivider: {
      width: 1,
      height: 16,
      backgroundColor: 'rgba(255,255,255,0.3)',
  },

  // -- Features --
  featuresContainer: {
      backgroundColor: '#fff',
      paddingVertical: 40,
  },
  featureBlock: {
      paddingHorizontal: 24,
      paddingVertical: 32,
      borderBottomWidth: 1,
      borderBottomColor: '#f3f4f6',
  },
  featureHeader: {
      marginBottom: 24,
  },
  featureNumberLabel: {
      fontSize: 11,
      fontWeight: '900',
      letterSpacing: 3,
      marginBottom: 12,
  },
  featureMainTitle: {
      fontSize: 32,
      fontWeight: '900',
      color: '#111827',
      textTransform: 'uppercase',
      lineHeight: 34,
      letterSpacing: -1,
      marginBottom: 16,
  },
  featureTitleUnderline: {
      height: 4,
      width: 60,
      borderRadius: 2,
  },
  featureCard: {
      borderRadius: 32,
      padding: 24,
      borderWidth: 1,
  },
  featureIconBox: {
      width: 64,
      height: 64,
      borderRadius: 16,
      borderWidth: 1,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 20,
  },
  featureBadge: {
      alignSelf: 'flex-start',
      borderWidth: 1,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
      marginBottom: 16,
  },
  featureBadgeText: {
      fontSize: 10,
      fontWeight: '900',
      letterSpacing: 1.5,
      textTransform: 'uppercase',
  },
  featureDesc: {
      fontSize: 16,
      lineHeight: 24,
      color: '#374151',
      fontWeight: '500',
  },

  // -- Why Choose --
  whyChooseSection: {
      backgroundColor: '#f9fafb',
      paddingTop: 60,
      paddingBottom: 60,
      paddingHorizontal: 24,
  },
  sectionSubtitleRed: {
      color: '#b91c1c',
      fontSize: 11,
      fontWeight: '900',
      letterSpacing: 3,
      marginBottom: 12,
  },
  sectionTitleDark: {
      fontSize: 40,
      fontWeight: '900',
      color: '#111827',
      textTransform: 'uppercase',
      lineHeight: 42,
      letterSpacing: -1,
      marginBottom: 24,
  },
  sectionDescLight: {
      fontSize: 16,
      lineHeight: 24,
      color: '#4b5563',
      fontWeight: '600',
      marginBottom: 40,
  },
  benefitsGrid: {
      gap: 16,
  },
  benefitCard: {
      backgroundColor: '#fff',
      padding: 24,
      borderRadius: 24,
      borderWidth: 1,
      borderColor: '#f3f4f6',
      ...Platform.select({
          ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10 },
          android: { elevation: 2 }
      }),
  },
  benefitIcon: {
      marginBottom: 16,
  },
  benefitTitle: {
      fontSize: 18,
      fontWeight: '900',
      color: '#111827',
      textTransform: 'uppercase',
      marginBottom: 8,
  },
  benefitDesc: {
      fontSize: 14,
      color: '#4b5563',
      fontWeight: '600',
      lineHeight: 20,
  },

  // -- Core Functions --
  coreFunctionsSection: {
      paddingVertical: 60,
      paddingHorizontal: 24,
  },
  sectionSubtitleLight: {
      color: '#fecaca',
      fontSize: 11,
      fontWeight: '900',
      letterSpacing: 3,
      marginBottom: 12,
      textAlign: 'center',
  },
  sectionTitleWhite: {
      fontSize: 38,
      fontWeight: '900',
      color: '#fff',
      textTransform: 'uppercase',
      lineHeight: 40,
      letterSpacing: -1,
      marginBottom: 48,
      textAlign: 'center',
  },
  coreFunctionsList: {
      gap: 40,
  },
  coreFuncItem: {
      alignItems: 'center',
  },
  coreFuncIconBox: {
      width: 80,
      height: 80,
      borderRadius: 24,
      backgroundColor: 'rgba(255,255,255,0.15)',
      borderWidth: 3,
      borderColor: 'rgba(255,255,255,0.1)',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 20,
  },
  coreFuncTitle: {
      fontSize: 20,
      fontWeight: '900',
      color: '#fff',
      textTransform: 'uppercase',
      marginBottom: 12,
  },
  coreFuncDesc: {
      fontSize: 15,
      color: 'rgba(255,255,255,0.8)',
      fontWeight: 'bold',
      lineHeight: 22,
      textAlign: 'center',
  },

  // -- How It Works --
  howItWorksSection: {
      backgroundColor: '#f9fafb',
      paddingVertical: 60,
      paddingHorizontal: 24,
  },
  workflowGrid: {
      gap: 16,
      marginBottom: 48,
  },
  workflowCard: {
      backgroundColor: '#fff',
      padding: 24,
      borderRadius: 24,
      borderWidth: 1,
      borderColor: '#f3f4f6',
      ...Platform.select({
          ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10 },
          android: { elevation: 2 }
      }),
  },
  workflowStepNum: {
      fontSize: 48,
      fontWeight: '900',
      color: '#f3f4f6',
      marginBottom: 16,
      letterSpacing: -2,
  },
  workflowTitle: {
      fontSize: 18,
      fontWeight: '900',
      color: '#111827',
      textTransform: 'uppercase',
      marginBottom: 8,
  },
  workflowDesc: {
      fontSize: 14,
      color: '#6b7280',
      fontWeight: 'bold',
      lineHeight: 20,
  },
  btnFooterPrimary: {
      backgroundColor: '#8b0000',
      paddingVertical: 20,
      borderRadius: 16,
      alignItems: 'center',
      ...Platform.select({
          ios: { shadowColor: '#8b0000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20 },
          android: { elevation: 8 }
      }),
  },
  btnFooterPrimaryText: {
      color: '#fff',
      fontSize: 14,
      fontWeight: '900',
      letterSpacing: 2,
  },
});

export default LandingScreen;