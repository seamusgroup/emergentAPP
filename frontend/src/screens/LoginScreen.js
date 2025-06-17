import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
} from 'react-native';
import {
  TextInput,
  Button,
  Card,
  Title,
  Paragraph,
  Chip,
  Divider,
  useTheme,
} from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

// Services
import BiometricService from '../services/BiometricService';
import StorageService from '../services/StorageService';

// Mock data
import { EMPLOYEES } from '../data/mockData';

const { width, height } = Dimensions.get('window');

const LoginScreen = ({ navigation }) => {
  const theme = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [biometricLoading, setBiometricLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);

  useEffect(() => {
    checkBiometricAvailability();
    loadSavedCredentials();
  }, []);

  const checkBiometricAvailability = async () => {
    const availability = await BiometricService.isAvailable();
    setBiometricAvailable(availability.canUseBiometrics);
  };

  const loadSavedCredentials = async () => {
    const savedSession = await StorageService.getUserSession();
    if (savedSession && savedSession.email) {
      setEmail(savedSession.email);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    setLoading(true);

    try {
      // Mock authentication
      const user = EMPLOYEES.find(emp => emp.email.toLowerCase() === email.toLowerCase());
      
      if (user && password === 'demo123') {
        // Save user session
        await StorageService.saveUserSession({
          id: user.id,
          email: user.email,
          role: user.role,
          companyId: user.companyId,
          firstName: user.firstName,
          lastName: user.lastName,
        });

        // Navigate based on role
        if (user.role === 'employee') {
          navigation.replace('EmployeeDashboard');
        } else if (user.role === 'manager') {
          navigation.replace('ManagerDashboard');
        }
      } else if (email.toLowerCase() === 'superadmin@system.com' && password === 'admin123') {
        await StorageService.saveUserSession({
          id: 'super_admin',
          email: 'superadmin@system.com',
          role: 'super_admin',
          firstName: 'Super',
          lastName: 'Admin',
        });
        navigation.replace('SuperAdminDashboard');
      } else {
        Alert.alert('Error', 'Invalid email or password');
      }
    } catch (error) {
      Alert.alert('Error', 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBiometricLogin = async () => {
    setBiometricLoading(true);

    try {
      const result = await BiometricService.authenticateForLogin();
      
      if (result.success) {
        // For demo, use the last saved session or default employee
        const savedSession = await StorageService.getUserSession();
        if (savedSession) {
          if (savedSession.role === 'employee') {
            navigation.replace('EmployeeDashboard');
          } else if (savedSession.role === 'manager') {
            navigation.replace('ManagerDashboard');
          } else {
            navigation.replace('SuperAdminDashboard');
          }
        } else {
          // Default to employee dashboard for demo
          navigation.replace('EmployeeDashboard');
        }
      } else {
        Alert.alert('Authentication Failed', 'Biometric authentication was not successful');
      }
    } catch (error) {
      Alert.alert('Error', 'Biometric authentication failed');
    } finally {
      setBiometricLoading(false);
    }
  };

  const demoUsers = [
    { email: 'john.doe@techsolutions.com', role: 'Employee', password: 'demo123' },
    { email: 'jane.smith@techsolutions.com', role: 'Manager', password: 'demo123' },
    { email: 'superadmin@system.com', role: 'Super Admin', password: 'admin123' }
  ];

  return (
    <LinearGradient
      colors={['#4F46E5', '#7C3AED', '#3B82F6']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
          >
            {/* Logo and Title */}
            <View style={styles.logoContainer}>
              <View style={styles.logoIcon}>
                <MaterialIcons name="access-time" size={48} color="#FFFFFF" />
              </View>
              <Title style={styles.logoTitle}>AttendanceApp</Title>
              <Paragraph style={styles.logoSubtitle}>
                Employee Attendance Management System
              </Paragraph>
            </View>

            {/* Demo Users Info */}
            <Card style={[styles.demoCard, { backgroundColor: 'rgba(255, 255, 255, 0.1)' }]}>
              <Card.Content>
                <Title style={styles.demoTitle}>Demo Users</Title>
                {demoUsers.map((user, index) => (
                  <View key={index} style={styles.demoUserRow}>
                    <Text style={styles.demoUserEmail}>{user.email}</Text>
                    <Chip
                      mode="outlined"
                      textStyle={styles.chipText}
                      style={styles.chip}
                    >
                      {user.role}
                    </Chip>
                  </View>
                ))}
              </Card.Content>
            </Card>

            {/* Login Form */}
            <Card style={styles.loginCard}>
              <Card.Content style={styles.loginContent}>
                <Title style={styles.loginTitle}>Sign In</Title>
                <Paragraph style={styles.loginSubtitle}>
                  Enter your credentials to continue
                </Paragraph>

                <View style={styles.formContainer}>
                  <TextInput
                    label="Email Address"
                    value={email}
                    onChangeText={setEmail}
                    mode="outlined"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    style={styles.input}
                    left={<TextInput.Icon icon="email" />}
                  />

                  <TextInput
                    label="Password"
                    value={password}
                    onChangeText={setPassword}
                    mode="outlined"
                    secureTextEntry={!showPassword}
                    style={styles.input}
                    left={<TextInput.Icon icon="lock" />}
                    right={
                      <TextInput.Icon
                        icon={showPassword ? "eye-off" : "eye"}
                        onPress={() => setShowPassword(!showPassword)}
                      />
                    }
                  />

                  <Button
                    mode="contained"
                    onPress={handleLogin}
                    loading={loading}
                    disabled={loading || biometricLoading}
                    style={styles.loginButton}
                    labelStyle={styles.loginButtonText}
                  >
                    Sign In
                  </Button>

                  {biometricAvailable && (
                    <>
                      <View style={styles.dividerContainer}>
                        <Divider style={styles.divider} />
                        <Text style={styles.dividerText}>OR</Text>
                        <Divider style={styles.divider} />
                      </View>

                      <Button
                        mode="outlined"
                        onPress={handleBiometricLogin}
                        loading={biometricLoading}
                        disabled={loading || biometricLoading}
                        style={styles.biometricButton}
                        icon="fingerprint"
                        labelStyle={styles.biometricButtonText}
                      >
                        Use Biometric Authentication
                      </Button>
                    </>
                  )}
                </View>
              </Card.Content>
            </Card>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
    minHeight: height * 0.9,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logoIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  logoSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  demoCard: {
    marginBottom: 20,
    borderRadius: 16,
    elevation: 4,
  },
  demoTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    marginBottom: 12,
  },
  demoUserRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  demoUserEmail: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 12,
    flex: 1,
  },
  chip: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  chipText: {
    color: '#FFFFFF',
    fontSize: 10,
  },
  loginCard: {
    borderRadius: 24,
    elevation: 8,
    backgroundColor: '#FFFFFF',
  },
  loginContent: {
    padding: 24,
  },
  loginTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#1F2937',
  },
  loginSubtitle: {
    textAlign: 'center',
    marginBottom: 32,
    color: '#6B7280',
    fontSize: 16,
  },
  formContainer: {
    width: '100%',
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#F9FAFB',
  },
  loginButton: {
    marginTop: 8,
    marginBottom: 16,
    borderRadius: 12,
    paddingVertical: 8,
    backgroundColor: '#4F46E5',
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dividerText: {
    marginHorizontal: 16,
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '500',
  },
  biometricButton: {
    borderRadius: 12,
    paddingVertical: 8,
    borderColor: '#4F46E5',
    borderWidth: 2,
  },
  biometricButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4F46E5',
  },
});

export default LoginScreen;