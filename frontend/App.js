import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  TextInput,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

// Import services
import LocationService from './src/services/LocationService';
import CameraService from './src/services/CameraService';
import BiometricService from './src/services/BiometricService';

const Stack = createStackNavigator();

// Simple Login Screen
const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('john.doe@techsolutions.com');
  const [password, setPassword] = useState('demo123');

  const handleLogin = () => {
    if (email.includes('john.doe') && password === 'demo123') {
      navigation.replace('EmployeeDashboard');
    } else if (email.includes('jane.smith') && password === 'demo123') {
      navigation.replace('ManagerDashboard');
    } else if (email.includes('superadmin') && password === 'admin123') {
      navigation.replace('SuperAdminDashboard');
    } else {
      Alert.alert('Error', 'Invalid credentials');
    }
  };

  const handleBiometricLogin = async () => {
    try {
      const result = await BiometricService.authenticateForLogin();
      if (result.success) {
        navigation.replace('EmployeeDashboard');
      } else {
        Alert.alert('Authentication Failed', 'Biometric authentication failed');
      }
    } catch (error) {
      Alert.alert('Error', 'Biometric authentication not available');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.loginContainer}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>🕐 AttendanceApp</Text>
          <Text style={styles.logoSubtext}>Employee Attendance Management</Text>
        </View>

        <View style={styles.demoCard}>
          <Text style={styles.demoTitle}>Demo Users:</Text>
          <Text style={styles.demoText}>• john.doe@techsolutions.com (Employee)</Text>
          <Text style={styles.demoText}>• jane.smith@techsolutions.com (Manager)</Text>
          <Text style={styles.demoText}>• superadmin@system.com (Super Admin)</Text>
          <Text style={styles.demoText}>Password: demo123 (admin123 for super admin)</Text>
        </View>

        <View style={styles.formContainer}>
          <TextInput
            style={styles.input}
            placeholder="Email Address"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          
          <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
            <Text style={styles.loginButtonText}>Sign In</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.biometricButton} onPress={handleBiometricLogin}>
            <Text style={styles.biometricButtonText}>🔐 Use Biometric Login</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// Simple Employee Dashboard
const EmployeeDashboard = ({ navigation }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isClocked, setIsClocked] = useState(false);
  const [location, setLocation] = useState(null);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleClockInOut = async () => {
    try {
      // Get location
      const loc = await LocationService.getCurrentLocation();
      if (loc) {
        setLocation(loc);
        Alert.alert(
          'Location Captured',
          `Lat: ${loc.latitude.toFixed(6)}, Lng: ${loc.longitude.toFixed(6)}`
        );
      }

      // Take photo
      const photo = await CameraService.takePicture();
      if (photo) {
        Alert.alert('Photo Captured', 'Photo taken for verification');
      }

      setIsClocked(!isClocked);
      Alert.alert(
        'Success',
        `Successfully ${isClocked ? 'clocked out' : 'clocked in'} at ${currentTime.toLocaleTimeString()}`
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to perform action. Please try again.');
    }
  };

  const testBiometrics = async () => {
    try {
      const availability = await BiometricService.isAvailable();
      const result = await BiometricService.authenticateForAttendance();
      Alert.alert(
        'Biometric Test',
        `Available: ${availability.canUseBiometrics}\nAuthentication: ${result.success ? 'Success' : 'Failed'}`
      );
    } catch (error) {
      Alert.alert('Biometric Test', 'Not available on this device');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.replace('Login')} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Employee Dashboard</Text>
      </View>

      <ScrollView contentContainerStyle={styles.dashboardContainer}>
        <View style={styles.timeCard}>
          <Text style={styles.timeText}>{currentTime.toLocaleTimeString()}</Text>
          <Text style={styles.dateText}>{currentTime.toDateString()}</Text>
        </View>

        <View style={styles.statusCard}>
          <Text style={styles.statusTitle}>Current Status</Text>
          <Text style={[styles.statusText, { color: isClocked ? '#10B981' : '#EF4444' }]}>
            {isClocked ? '✅ Clocked In' : '❌ Clocked Out'}
          </Text>
        </View>

        {location && (
          <View style={styles.locationCard}>
            <Text style={styles.cardTitle}>📍 Last Location</Text>
            <Text style={styles.locationText}>
              Lat: {location.latitude.toFixed(6)}
            </Text>
            <Text style={styles.locationText}>
              Lng: {location.longitude.toFixed(6)}
            </Text>
            <Text style={styles.locationText}>
              Accuracy: ±{location.accuracy?.toFixed(0)}m
            </Text>
          </View>
        )}

        <TouchableOpacity style={styles.clockButton} onPress={handleClockInOut}>
          <Text style={styles.clockButtonText}>
            {isClocked ? '🛑 Clock Out' : '▶️ Clock In'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.testButton} onPress={testBiometrics}>
          <Text style={styles.testButtonText}>🔐 Test Biometrics</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

// Simple Manager Dashboard
const ManagerDashboard = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.replace('Login')} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Manager Dashboard</Text>
      </View>

      <ScrollView contentContainerStyle={styles.dashboardContainer}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📊 Company Overview</Text>
          <Text style={styles.cardText}>• Total Employees: 12</Text>
          <Text style={styles.cardText}>• Present Today: 8</Text>
          <Text style={styles.cardText}>• On Break: 2</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>⚙️ Attendance Settings</Text>
          <Text style={styles.cardText}>• GPS Tracking: Enabled</Text>
          <Text style={styles.cardText}>• Photo Verification: Disabled</Text>
          <Text style={styles.cardText}>• Break Tracking: Enabled</Text>
        </View>

        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionButtonText}>👥 Manage Employees</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionButtonText}>📈 View Reports</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

// Simple Super Admin Dashboard
const SuperAdminDashboard = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.replace('Login')} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Super Admin Dashboard</Text>
      </View>

      <ScrollView contentContainerStyle={styles.dashboardContainer}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🏢 System Overview</Text>
          <Text style={styles.cardText}>• Total Companies: 2</Text>
          <Text style={styles.cardText}>• Active Companies: 2</Text>
          <Text style={styles.cardText}>• Total Users: 16</Text>
          <Text style={styles.cardText}>• Monthly Revenue: $109.98</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>📦 Subscription Packages</Text>
          <Text style={styles.cardText}>• Basic: $29.99/month (5 users)</Text>
          <Text style={styles.cardText}>• Standard: $79.99/month (15 users)</Text>
          <Text style={styles.cardText}>• Premium: $149.99/month (30 users)</Text>
        </View>

        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionButtonText}>🏢 Manage Companies</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionButtonText}>📊 System Analytics</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

// Main App Component
export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="EmployeeDashboard" component={EmployeeDashboard} />
          <Stack.Screen name="ManagerDashboard" component={ManagerDashboard} />
          <Stack.Screen name="SuperAdminDashboard" component={SuperAdminDashboard} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    backgroundColor: '#4F46E5',
    padding: 20,
    paddingTop: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  logoutButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 8,
    borderRadius: 6,
  },
  logoutText: {
    color: '#FFFFFF',
    fontSize: 12,
  },
  loginContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4F46E5',
    marginBottom: 8,
  },
  logoSubtext: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  demoCard: {
    backgroundColor: '#EBF4FF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  demoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  demoText: {
    fontSize: 12,
    color: '#4B5563',
    marginBottom: 4,
  },
  formContainer: {
    width: '100%',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  loginButton: {
    backgroundColor: '#4F46E5',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  biometricButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#4F46E5',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  biometricButtonText: {
    color: '#4F46E5',
    fontSize: 16,
    fontWeight: 'bold',
  },
  dashboardContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  timeCard: {
    backgroundColor: '#4F46E5',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  timeText: {
    color: '#FFFFFF',
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  dateText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 16,
  },
  statusCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  statusText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  locationCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  card: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  cardText: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 4,
  },
  locationText: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  clockButton: {
    backgroundColor: '#10B981',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  clockButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  testButton: {
    backgroundColor: '#7C3AED',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  testButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  actionButton: {
    backgroundColor: '#3B82F6',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});