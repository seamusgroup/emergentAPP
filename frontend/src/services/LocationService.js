import * as Location from 'expo-location';
import { Alert } from 'react-native';

class LocationService {
  constructor() {
    this.currentLocation = null;
    this.watcherId = null;
  }

  async requestPermissions() {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Location permission is required for attendance tracking. Please enable it in settings.',
          [{ text: 'OK' }]
        );
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error requesting location permissions:', error);
      return false;
    }
  }

  async getCurrentLocation() {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) return null;

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        timeout: 10000,
        maximumAge: 5000,
      });

      this.currentLocation = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy,
        timestamp: location.timestamp,
      };

      return this.currentLocation;
    } catch (error) {
      console.error('Error getting current location:', error);
      Alert.alert(
        'Location Error',
        'Unable to get your current location. Please check your GPS settings.',
        [{ text: 'OK' }]
      );
      return null;
    }
  }

  async startLocationTracking(callback) {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) return null;

      this.watcherId = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 10000, // Update every 10 seconds
          distanceInterval: 10, // Update every 10 meters
        },
        (location) => {
          this.currentLocation = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            accuracy: location.coords.accuracy,
            timestamp: location.timestamp,
          };
          if (callback) callback(this.currentLocation);
        }
      );

      return this.watcherId;
    } catch (error) {
      console.error('Error starting location tracking:', error);
      return null;
    }
  }

  stopLocationTracking() {
    if (this.watcherId) {
      this.watcherId.remove();
      this.watcherId = null;
    }
  }

  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  }

  isWithinGeofence(currentLat, currentLon, officeLat, officeLon, radiusMeters = 100) {
    const distance = this.calculateDistance(currentLat, currentLon, officeLat, officeLon);
    return distance <= radiusMeters;
  }

  async reverseGeocode(latitude, longitude) {
    try {
      const result = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });
      
      if (result.length > 0) {
        const location = result[0];
        return {
          address: `${location.street || ''} ${location.name || ''}`.trim(),
          city: location.city,
          region: location.region,
          country: location.country,
          postalCode: location.postalCode,
        };
      }
      return null;
    } catch (error) {
      console.error('Error reverse geocoding:', error);
      return null;
    }
  }
}

export default new LocationService();