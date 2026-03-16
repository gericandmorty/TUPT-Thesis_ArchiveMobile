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

const ForgotScreen = () => {
  const navigation = useNavigation();
  const [formData, setFormData] = useState({
    idNumber: '',
    birthdate: '',
    newPassword: '',
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
          
          // Get local date components to avoid timezone offset issues
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          const formattedDate = `${year}-${month}-${day}`;
          
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

  const handleResetPassword = async () => {
    const { idNumber, birthdate, newPassword, confirmPassword } = formData;

    if (!idNumber || !birthdate || !newPassword || !confirmPassword) {
      toast.show('Please fill in all fields', 'error');
      return;
    }

    if (!validateIDNumber(idNumber)) {
      toast.show('Please enter a valid ID number in format: TUPT-XX-XXXX', 'error');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.show('Passwords do not match', 'error');
      return;
    }

    if (newPassword.length < 6) {
      toast.show('Password must be at least 6 characters long', 'error');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          idNumber: idNumber,
          birthdate: birthdate,
          newPassword: newPassword
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.show(data.message || 'Password reset successful!', 'success');
        setTimeout(() => {
          navigation.navigate('Login');
        }, 1500);
      } else {
        toast.show(data.message || 'Reset failed. Please check your details.', 'error');
      }
    } catch (error) {
      console.error('Reset error:', error);
      toast.show('Cannot connect to server. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setFormData({
      idNumber: '',
      birthdate: '',
      newPassword: '',
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
             <Text style={styles.headerTitle}>RESET PASSWORD</Text>
             <View style={styles.divider} />

             {/* Form Group */}
             <View style={styles.formGroup}>
                
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
                      <Text style={{ fontSize: 15, fontWeight: 'bold', color: formData.birthdate ? '#111827' : '#9ca3af' }}>
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

                {/* Password Grid */}
                <View style={styles.passwordGrid}>
                    <View style={styles.flexHalf}>
                        <Text style={styles.label}>New Password:</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="••••••••"
                            placeholderTextColor="#9ca3af"
                            value={formData.newPassword}
                            onChangeText={(v) => handleInputChange('newPassword', v)}
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
                        onPress={handleResetPassword}
                        disabled={isLoading}
                        activeOpacity={0.8}
                    >
                        {isLoading ? (
                           <ActivityIndicator size="small" color="#fff" />
                        ) : (
                           <Text style={styles.submitBtnText}>Reset</Text>
                        )}
                    </TouchableOpacity>
                </View>

             </View>

             {/* Footer Links */}
             <View style={styles.footer}>
                 <View style={styles.footerTextRow}>
                     <Text style={styles.footerTextNormal}>Remembered your password? </Text>
                     <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                         <Text style={styles.footerLinkBold}>Back to Login</Text>
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
      gap: 20,
  },
  inputContainer: {
      gap: 8,
  },
  passwordGrid: {
      flexDirection: 'row',
      gap: 12,
      justifyContent: 'space-between',
  },
  flexHalf: {
      flex: 1,
      gap: 8,
  },
  label: {
      fontSize: 13,
      fontWeight: 'bold',
      color: '#4b5563',
      marginLeft: 4,
  },
  input: {
      width: '100%',
      height: 56,
      backgroundColor: '#f9fafb',
      borderWidth: 1,
      borderColor: '#e5e7eb',
      paddingHorizontal: 16,
      borderRadius: 16,
      fontSize: 15,
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

export default ForgotScreen;
