import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

class StorageService {
  // Secure storage for sensitive data (tokens, biometric settings)
  async setSecureItem(key, value) {
    try {
      await SecureStore.setItemAsync(key, value);
      return true;
    } catch (error) {
      console.error('Error storing secure item:', error);
      return false;
    }
  }

  async getSecureItem(key) {
    try {
      return await SecureStore.getItemAsync(key);
    } catch (error) {
      console.error('Error retrieving secure item:', error);
      return null;
    }
  }

  async removeSecureItem(key) {
    try {
      await SecureStore.deleteItemAsync(key);
      return true;
    } catch (error) {
      console.error('Error removing secure item:', error);
      return false;
    }
  }

  // Regular storage for app data
  async setItem(key, value) {
    try {
      const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
      await AsyncStorage.setItem(key, stringValue);
      return true;
    } catch (error) {
      console.error('Error storing item:', error);
      return false;
    }
  }

  async getItem(key) {
    try {
      const value = await AsyncStorage.getItem(key);
      if (value === null) return null;
      
      // Try to parse as JSON, if it fails return as string
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    } catch (error) {
      console.error('Error retrieving item:', error);
      return null;
    }
  }

  async removeItem(key) {
    try {
      await AsyncStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Error removing item:', error);
      return false;
    }
  }

  async clear() {
    try {
      await AsyncStorage.clear();
      return true;
    } catch (error) {
      console.error('Error clearing storage:', error);
      return false;
    }
  }

  // User session management
  async saveUserSession(userData) {
    return await this.setSecureItem('user_session', JSON.stringify(userData));
  }

  async getUserSession() {
    const session = await this.getSecureItem('user_session');
    return session ? JSON.parse(session) : null;
  }

  async clearUserSession() {
    return await this.removeSecureItem('user_session');
  }

  // Attendance offline storage
  async saveOfflineAttendance(attendanceData) {
    const existingData = await this.getItem('offline_attendance') || [];
    const updatedData = [...existingData, { ...attendanceData, id: Date.now().toString() }];
    return await this.setItem('offline_attendance', updatedData);
  }

  async getOfflineAttendance() {
    return await this.getItem('offline_attendance') || [];
  }

  async clearOfflineAttendance() {
    return await this.removeItem('offline_attendance');
  }

  async removeOfflineAttendanceItem(id) {
    const existingData = await this.getItem('offline_attendance') || [];
    const updatedData = existingData.filter(item => item.id !== id);
    return await this.setItem('offline_attendance', updatedData);
  }

  // App settings
  async saveAppSettings(settings) {
    return await this.setItem('app_settings', settings);
  }

  async getAppSettings() {
    return await this.getItem('app_settings') || {
      biometricsEnabled: false,
      notificationsEnabled: true,
      locationTrackingEnabled: true,
      theme: 'light',
    };
  }

  // Company settings cache
  async saveCompanySettings(companyId, settings) {
    return await this.setItem(`company_settings_${companyId}`, settings);
  }

  async getCompanySettings(companyId) {
    return await this.getItem(`company_settings_${companyId}`);
  }

  // Employee data cache
  async saveEmployeeData(employeeData) {
    return await this.setItem('employee_data', employeeData);
  }

  async getEmployeeData() {
    return await this.getItem('employee_data');
  }

  // Attendance history cache
  async saveAttendanceHistory(history) {
    return await this.setItem('attendance_history', history);
  }

  async getAttendanceHistory() {
    return await this.getItem('attendance_history') || [];
  }

  async addAttendanceRecord(record) {
    const history = await this.getAttendanceHistory();
    const updatedHistory = [record, ...history].slice(0, 100); // Keep last 100 records
    return await this.saveAttendanceHistory(updatedHistory);
  }
}

export default new StorageService();