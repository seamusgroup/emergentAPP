import * as LocalAuthentication from 'expo-local-authentication';
import { Alert, Platform } from 'react-native';

class BiometricService {
  async isAvailable() {
    try {
      const isSupported = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();
      
      return {
        isSupported,
        isEnrolled,
        supportedTypes,
        canUseBiometrics: isSupported && isEnrolled,
      };
    } catch (error) {
      console.error('Error checking biometric availability:', error);
      return {
        isSupported: false,
        isEnrolled: false,
        supportedTypes: [],
        canUseBiometrics: false,
      };
    }
  }

  async authenticate(options = {}) {
    try {
      const availability = await this.isAvailable();
      
      if (!availability.canUseBiometrics) {
        Alert.alert(
          'Biometric Authentication Unavailable',
          'Please set up biometric authentication in your device settings.',
          [{ text: 'OK' }]
        );
        return { success: false, error: 'Biometrics not available' };
      }

      const defaultOptions = {
        promptMessage: 'Authenticate to access your account',
        cancelLabel: 'Cancel',
        disableDeviceFallback: false,
        fallbackLabel: 'Use Password',
      };

      const result = await LocalAuthentication.authenticateAsync({
        ...defaultOptions,
        ...options,
      });

      if (result.success) {
        return { success: true, authType: result.authType };
      } else {
        return { 
          success: false, 
          error: result.error,
          warning: result.warning 
        };
      }
    } catch (error) {
      console.error('Error during biometric authentication:', error);
      return { success: false, error: error.message };
    }
  }

  async authenticateForAttendance() {
    const biometricTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();
    let promptMessage = 'Verify your identity for attendance';
    
    if (biometricTypes.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
      promptMessage = 'Use Face ID to verify attendance';
    } else if (biometricTypes.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
      promptMessage = 'Use fingerprint to verify attendance';
    }

    return this.authenticate({
      promptMessage,
      cancelLabel: 'Cancel',
      disableDeviceFallback: false,
    });
  }

  async authenticateForLogin() {
    const biometricTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();
    let promptMessage = 'Sign in with biometrics';
    
    if (biometricTypes.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
      promptMessage = 'Sign in with Face ID';
    } else if (biometricTypes.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
      promptMessage = 'Sign in with fingerprint';
    }

    return this.authenticate({
      promptMessage,
      cancelLabel: 'Use Password Instead',
      disableDeviceFallback: true,
    });
  }

  getBiometricTypeString(types) {
    if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
      return Platform.OS === 'ios' ? 'Face ID' : 'Face Recognition';
    } else if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
      return Platform.OS === 'ios' ? 'Touch ID' : 'Fingerprint';
    } else if (types.includes(LocalAuthentication.AuthenticationType.IRIS)) {
      return 'Iris';
    }
    return 'Biometric';
  }

  async showEnrollmentPrompt() {
    Alert.alert(
      'Enable Biometric Authentication',
      'Would you like to enable biometric authentication for faster and more secure access?',
      [
        { text: 'Not Now', style: 'cancel' },
        { 
          text: 'Enable', 
          onPress: () => {
            // This would typically navigate to device settings
            // For now, we'll show an info alert
            Alert.alert(
              'Setup Instructions',
              'Please go to your device Settings > Security > Biometrics to set up fingerprint or face recognition.',
              [{ text: 'OK' }]
            );
          }
        }
      ]
    );
  }
}

export default new BiometricService();