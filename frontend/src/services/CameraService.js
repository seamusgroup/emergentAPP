import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';

class CameraService {
  async requestPermissions() {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Camera permission is required to take photos for attendance verification.',
          [{ text: 'OK' }]
        );
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error requesting camera permissions:', error);
      return false;
    }
  }

  async takePicture(options = {}) {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) return null;

      const defaultOptions = {
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: true, // Important for storing in database
      };

      const result = await ImagePicker.launchCameraAsync({
        ...defaultOptions,
        ...options,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        return {
          uri: asset.uri,
          base64: asset.base64,
          width: asset.width,
          height: asset.height,
          fileSize: asset.fileSize,
          timestamp: new Date().toISOString(),
        };
      }

      return null;
    } catch (error) {
      console.error('Error taking picture:', error);
      Alert.alert(
        'Camera Error',
        'Unable to take photo. Please try again.',
        [{ text: 'OK' }]
      );
      return null;
    }
  }

  async selectFromGallery(options = {}) {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Gallery access permission is required to select photos.',
          [{ text: 'OK' }]
        );
        return null;
      }

      const defaultOptions = {
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: true,
      };

      const result = await ImagePicker.launchImageLibraryAsync({
        ...defaultOptions,
        ...options,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        return {
          uri: asset.uri,
          base64: asset.base64,
          width: asset.width,
          height: asset.height,
          fileSize: asset.fileSize,
          timestamp: new Date().toISOString(),
        };
      }

      return null;
    } catch (error) {
      console.error('Error selecting from gallery:', error);
      Alert.alert(
        'Gallery Error',
        'Unable to select photo from gallery. Please try again.',
        [{ text: 'OK' }]
      );
      return null;
    }
  }

  async showImagePickerOptions() {
    return new Promise((resolve) => {
      Alert.alert(
        'Select Photo',
        'Choose how you want to add a photo',
        [
          { text: 'Camera', onPress: async () => {
            const result = await this.takePicture();
            resolve(result);
          }},
          { text: 'Gallery', onPress: async () => {
            const result = await this.selectFromGallery();
            resolve(result);
          }},
          { text: 'Cancel', onPress: () => resolve(null), style: 'cancel' }
        ],
        { cancelable: true, onDismiss: () => resolve(null) }
      );
    });
  }

  // Convert image to base64 string for database storage
  getBase64String(imageData) {
    if (imageData && imageData.base64) {
      return `data:image/jpeg;base64,${imageData.base64}`;
    }
    return null;
  }

  // Resize image if needed (for optimization)
  async resizeImage(uri, maxWidth = 800, maxHeight = 800) {
    try {
      // This would typically use a library like expo-image-manipulator
      // For now, we'll return the original URI
      return uri;
    } catch (error) {
      console.error('Error resizing image:', error);
      return uri;
    }
  }
}

export default new CameraService();