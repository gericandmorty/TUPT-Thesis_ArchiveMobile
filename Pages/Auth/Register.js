import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
import API_BASE_URL from '../../api';
import { useToast } from '../../utils/ToastContext';

const RegisterScreen = () => {
  const navigation = useNavigation();
  const [formData, setFormData] = useState({
    fullName: '',
    idNumber: '',
    birthdate: '',
    password: '',
    confirmPassword: '',
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const handleInputChange = (field, value) => {
    if (field === 'idNumber') {
      let formattedValue = value.toUpperCase();
      
      if (formattedValue.length < formData.idNumber.length) {
          setFormData(prev => ({ ...prev, [field]: formattedValue }));
          return;
      }
      
      let clean = formattedValue.replace(/[^A-Z0-9]/g, '');
      if (clean.length > 0 && !clean.startsWith('TUPT')) {
          clean = 'TUPT' + clean;
      }
      
      let result = clean;
      if (clean.length > 4) {
          result = clean.slice(0, 4) + '-' + clean.slice(4);
      }
      if (result.length > 7) {
          result = result.slice(0, 7) + '-' + result.slice(7, 11);
      }
      
      setFormData(prev => ({ ...prev, [field]: result.slice(0, 12) }));
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDateChange = (event, date) => {
      setShowDatePicker(Platform.OS === 'ios');
      if (date) {
          setSelectedDate(date);
          if (Platform.OS !== 'ios') {
              setShowDatePicker(false);
          }
          const formattedDate = date.toISOString().split('T')[0];
          setFormData(prev => ({ ...prev, birthdate: formattedDate }));
      } else {
          setShowDatePicker(false);
      }
  };

  const showDatepicker = () => {
      setShowDatePicker(true);
  };

  const validateIDNumber = (idNumber) => {
    const idRegex = /^TUPT-\d{2}-\d{4}$/;
    return idRegex.test(idNumber);
  };

  const handleRegister = async () => {
    const { fullName, idNumber, birthdate, password, confirmPassword } = formData;

    if (!fullName || !idNumber || !birthdate || !password || !confirmPassword) {
      toast.show('Please fill in all fields', 'error');
      return;
    }

    if (!validateIDNumber(idNumber)) {
      toast.show('Please enter a valid ID number in format: TUPT-XX-XXXX', 'error');
      return;
    }

    if (password !== confirmPassword) {
      toast.show('Passwords do not match', 'error');
      return;
    }

    if (password.length < 6) {
      toast.show('Password must be at least 6 characters long', 'error');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: fullName,
          idNumber: idNumber,
          birthdate: birthdate,
          password: password
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.show(data.message || 'Account created successfully!', 'success');
        setTimeout(() => {
          navigation.navigate('Login');
        }, 1500);
      } else {
        toast.show(data.message || 'Registration failed', 'error');
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.show('Cannot connect to server. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setFormData({
      fullName: '',
      idNumber: '',
      birthdate: '',
      password: '',
      confirmPassword: '',
    });
  };

  return (
    <View style={styles.container}>
      {/* Spacer to emulate the top spacing of Web */}
      <View style={{ height: Platform.OS === 'ios' ? 60 : 40 }} />
      
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Main Card replicating web shadow-2xl border-gray-200 */}
          <View style={styles.card}>
              
             {/* Header text + Line divider */}
             <Text style={styles.headerTitle}>CREATE ACCOUNT</Text>
             <View style={styles.divider} />

             {/* Form Group */}
             <View style={styles.formGroup}>
                
                {/* Full Name */}
                <View style={styles.inputContainer}>
                   <Text style={styles.label}>Name:</Text>
                   <TextInput
                      style={styles.input}
                      placeholder="Full Name"
                      placeholderTextColor="#9ca3af"
                      value={formData.fullName}
                      onChangeText={(v) => handleInputChange('fullName', v)}
                   />
                </View>

                {/* ID Number */}
                <View style={styles.inputContainer}>
                   <Text style={styles.label}>ID Number:</Text>
                   <TextInput
                      style={styles.input}
                      placeholder="TUPT-XX-XXXX"
                      placeholderTextColor="#9ca3af"
                      value={formData.idNumber}
                      onChangeText={(v) => handleInputChange('idNumber', v)}
                      autoCapitalize="characters"
                      keyboardType="default"
                      maxLength={12}
                   />
                </View>

                {/* Birthdate picker */}
                <View style={styles.inputContainer}>
                   <Text style={styles.label}>Birthdate:</Text>
                   <TouchableOpacity onPress={showDatepicker} style={[styles.input, { justifyContent: 'center' }]} activeOpacity={0.7}>
                      <Text style={{ fontSize: 14, fontWeight: 'bold', color: formData.birthdate ? '#111827' : '#9ca3af' }}>
                          {formData.birthdate || 'YYYY-MM-DD'}
                      </Text>
                   </TouchableOpacity>
                   {showDatePicker && (
                       <DateTimePicker
                           value={selectedDate}
                           mode="date"
                           display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                           onChange={handleDateChange}
                           maximumDate={new Date()}
                       />
                   )}
                </View>

                {/* Password Grid matching Web sm:grid-cols-2 */}
                <View style={styles.passwordGrid}>
                    <View style={styles.flexHalf}>
                        <Text style={styles.label}>Password:</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="••••••••"
                            placeholderTextColor="#9ca3af"
                            value={formData.password}
                            onChangeText={(v) => handleInputChange('password', v)}
                            secureTextEntry={true}
                        />
                    </View>
                    <View style={styles.flexHalf}>
                        <Text style={styles.label}>Repeat Password:</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="••••••••"
                            placeholderTextColor="#9ca3af"
                            value={formData.confirmPassword}
                            onChangeText={(v) => handleInputChange('confirmPassword', v)}
                            secureTextEntry={true}
                        />
                    </View>
                </View>

                {/* Action Buttons */}
                <View style={styles.buttonRow}>
                    <TouchableOpacity 
                        style={styles.clearBtn}
                        onPress={handleClear}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.clearBtnText}>Clear</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={[styles.submitBtn, isLoading && styles.disabledBtn]}
                        onPress={handleRegister}
                        disabled={isLoading}
                        activeOpacity={0.8}
                    >
                        {isLoading ? (
                           <ActivityIndicator size="small" color="#fff" />
                        ) : (
                           <Text style={styles.submitBtnText}>Register</Text>
                        )}
                    </TouchableOpacity>
                </View>

             </View>

             {/* Footer Links */}
             <View style={styles.footer}>
                 <View style={styles.footerTextRow}>
                     <Text style={styles.footerTextNormal}>Already have an account? </Text>
                     <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                         <Text style={styles.footerLinkBold}>Sign in here</Text>
                     </TouchableOpacity>
                 </View>
             </View>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
      flex: 1,
      backgroundColor: 'transparent',
  },
  keyboardView: {
      flex: 1,
  },
  scrollContainer: {
      flexGrow: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 24,
      paddingBottom: 40,
  },
  card: {
      backgroundColor: '#fff',
      width: '100%',
      maxWidth: 500,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: '#e5e7eb',
      padding: 24,
      paddingTop: 32,
      ...Platform.select({
          ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 20 },
          android: { elevation: 15 }
      }),
  },
  headerTitle: {
      color: '#111827',
      fontSize: 14,
      fontWeight: 'bold',
      marginBottom: 8,
      textTransform: 'uppercase',
      letterSpacing: 1.5,
  },
  divider: {
      height: 1,
      backgroundColor: '#e5e7eb',
      width: '100%',
      marginBottom: 24,
  },
  formGroup: {
      gap: 16,
  },
  inputContainer: {
      gap: 4,
  },
  passwordGrid: {
      flexDirection: 'row',
      gap: 12,
      justifyContent: 'space-between',
  },
  flexHalf: {
      flex: 1,
      gap: 4,
  },
  label: {
      fontSize: 13,
      fontWeight: 'bold',
      color: '#4b5563',
  },
  input: {
      width: '100%',
      height: 48,
      backgroundColor: '#f9fafb',
      borderWidth: 1,
      borderColor: '#e5e7eb',
      paddingHorizontal: 16,
      borderRadius: 12,
      fontSize: 14,
      color: '#111827',
      fontWeight: 'bold',
  },
  buttonRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 8,
      marginBottom: 8,
  },
  clearBtn: {
      backgroundColor: '#fff',
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderWidth: 2,
      borderColor: '#e5e7eb',
      borderRadius: 8,
  },
  clearBtnText: {
      color: '#6b7280',
      fontSize: 11,
      fontWeight: 'bold',
  },
  submitBtn: {
      backgroundColor: '#8b0000',
      paddingHorizontal: 32,
      paddingVertical: 10,
      borderRadius: 8,
      minWidth: 100,
      alignItems: 'center',
      ...Platform.select({
          ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8 },
          android: { elevation: 5 }
      })
  },
  submitBtnText: {
      color: '#fff',
      fontSize: 11,
      fontWeight: '900',
      textTransform: 'none',
  },
  disabledBtn: {
      opacity: 0.7,
  },
  footer: {
      borderTopWidth: 1,
      borderTopColor: '#e5e7eb',
      paddingTop: 24,
      marginTop: 16,
      alignItems: 'center',
  },
  footerTextRow: {
      flexDirection: 'row',
  },
  footerTextNormal: {
      color: '#4b5563',
      fontSize: 13,
      fontWeight: '500',
  },
  footerLinkBold: {
      color: '#b91c1c',
      fontSize: 13,
      fontWeight: '900',
      textDecorationLine: 'underline',
  }
});

export default RegisterScreen;