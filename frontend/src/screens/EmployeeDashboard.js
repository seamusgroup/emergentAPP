import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  Dimensions,
  Text,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Button,
  Chip,
  FAB,
  Portal,
  Modal,
  useTheme,
  ActivityIndicator,
} from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

// Services
import LocationService from '../services/LocationService';
import CameraService from '../services/CameraService';
import BiometricService from '../services/BiometricService';
import StorageService from '../services/StorageService';
import NotificationService from '../services/NotificationService';

// Mock data
import { getCurrentAttendance, CURRENT_USER, COMPANIES } from '../data/mockData';

const EmployeeDashboard = ({ navigation }) => {
  const theme = useTheme();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [attendance, setAttendance] = useState(null);
  const [location, setLocation] = useState(null);
  const [isOnline, setIsOnline] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [pendingAction, setPendingAction] = useState(null);
  
  const company = COMPANIES.find(c => c.id === CURRENT_USER.companyId);
  const settings = company?.settings || {};

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    initializeData();
    requestPermissions();

    return () => clearInterval(timer);
  }, []);

  const initializeData = async () => {
    const currentAttendance = getCurrentAttendance(CURRENT_USER.id);
    setAttendance(currentAttendance);
    
    // Load offline data
    const offlineAttendance = await StorageService.getOfflineAttendance();
    if (offlineAttendance.length > 0) {
      setIsOnline(false);
      await NotificationService.notifyOfflineDataPending(offlineAttendance.length);
    }
  };

  const requestPermissions = async () => {
    if (settings.gpsRequired) {
      const location = await LocationService.getCurrentLocation();
      setLocation(location);
    }
  };

  const handleClockAction = async (action) => {
    setActionLoading(true);

    try {
      // Check location if required
      let currentLocation = null;
      if (settings.gpsRequired) {
        currentLocation = await LocationService.getCurrentLocation();
        if (!currentLocation) {
          Alert.alert('Location Required', 'Unable to get your location. Please enable GPS and try again.');
          setActionLoading(false);
          return;
        }

        // Check geofencing if enabled
        if (settings.geofencing) {
          const isWithinGeofence = LocationService.isWithinGeofence(
            currentLocation.latitude,
            currentLocation.longitude,
            40.7128, // Office coordinates (mock)
            -74.0060,
            100 // 100 meter radius
          );

          if (!isWithinGeofence) {
            Alert.alert(
              'Location Restricted',
              'You must be within the designated work area to clock in/out.',
              [{ text: 'OK' }]
            );
            await NotificationService.notifyGeofenceViolation();
            setActionLoading(false);
            return;
          }
        }
      }

      // Check photo requirement
      if (settings.photoRequired) {
        setPendingAction(action);
        setShowCameraModal(true);
        setActionLoading(false);
        return; // Will continue in handlePhotoCapture
      }

      await performClockAction(action, currentLocation, null);
    } catch (error) {
      Alert.alert('Error', 'Failed to perform attendance action. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handlePhotoCapture = async () => {
    try {
      const photo = await CameraService.takePicture();
      if (photo) {
        setCapturedPhoto(photo);
        setShowCameraModal(false);
        // Continue with the clock action
        const currentLocation = settings.gpsRequired ? await LocationService.getCurrentLocation() : null;
        await performClockAction(pendingAction, currentLocation, photo);
        setPendingAction(null);
      }
    } catch (error) {
      Alert.alert('Camera Error', 'Failed to capture photo. Please try again.');
    }
  };

  const performClockAction = async (action, location, photo) => {
    const now = new Date();
    const timeString = now.toTimeString().split(' ')[0];
    
    const attendanceData = {
      id: `att_${Date.now()}`,
      employeeId: CURRENT_USER.id,
      companyId: CURRENT_USER.companyId,
      date: now.toISOString().split('T')[0],
      location: location,
      photo: photo ? CameraService.getBase64String(photo) : null,
      timestamp: now.toISOString(),
      syncStatus: isOnline ? 'synced' : 'pending'
    };

    if (action === 'clockIn') {
      const newAttendance = {
        ...attendanceData,
        checkIn: timeString,
        checkOut: null,
        status: 'active',
      };
      setAttendance(newAttendance);
      
      if (!isOnline) {
        await StorageService.saveOfflineAttendance(newAttendance);
      }
      
      await NotificationService.sendLocalNotification(
        'Clocked In Successfully',
        `You clocked in at ${timeString}`
      );
      
    } else if (action === 'clockOut') {
      const updatedAttendance = {
        ...attendance,
        checkOut: timeString,
        status: 'completed',
        hoursWorked: calculateHoursWorked(attendance.checkIn, timeString),
        syncStatus: isOnline ? 'synced' : 'pending'
      };
      setAttendance(updatedAttendance);
      
      if (!isOnline) {
        await StorageService.saveOfflineAttendance(updatedAttendance);
      }
      
      await NotificationService.sendLocalNotification(
        'Clocked Out Successfully',
        `You clocked out at ${timeString}`
      );
      
    } else if (action === 'breakStart') {
      const updatedAttendance = {
        ...attendance,
        breakStart: timeString,
        status: 'on_break'
      };
      setAttendance(updatedAttendance);
      
    } else if (action === 'breakEnd') {
      const updatedAttendance = {
        ...attendance,
        breakEnd: timeString,
        status: 'active'
      };
      setAttendance(updatedAttendance);
    }
  };

  const calculateHoursWorked = (checkIn, checkOut) => {
    const start = new Date(`2000-01-01T${checkIn}`);
    const end = new Date(`2000-01-01T${checkOut}`);
    const diffMs = end.getTime() - start.getTime();
    return Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return '#10B981';
      case 'on_break': return '#F59E0B';
      case 'completed': return '#3B82F6';
      default: return '#6B7280';
    }
  };

  const getNextAction = () => {
    if (!attendance) return 'clockIn';
    if (attendance.status === 'active' && settings.breakTracking) {
      return attendance.breakStart ? 'breakEnd' : 'breakStart';
    }
    if (attendance.status === 'on_break') return 'breakEnd';
    if (attendance.checkIn && !attendance.checkOut) return 'clockOut';
    return null;
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await initializeData();
    setRefreshing(false);
  };

  const nextAction = getNextAction();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <LinearGradient
          colors={['#4F46E5', '#7C3AED']}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <View style={styles.headerTop}>
              <Title style={styles.headerTitle}>Clock In/Out</Title>
              <TouchableOpacity onPress={() => navigation.navigate('EmployeeAttendance')}>
                <MaterialIcons name="history" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            
            {/* Current Time */}
            <View style={styles.timeContainer}>
              <Text style={styles.timeText}>
                {currentTime.toLocaleTimeString()}
              </Text>
              <Text style={styles.dateText}>
                {currentTime.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </Text>
            </View>
          </View>
        </LinearGradient>

        {/* Status Cards */}
        <View style={styles.content}>
          {/* Offline Alert */}
          {!isOnline && (
            <Card style={[styles.alertCard, { backgroundColor: '#FEF3C7' }]}>
              <Card.Content style={styles.alertContent}>
                <MaterialIcons name="wifi-off" size={20} color="#D97706" />
                <Paragraph style={styles.alertText}>
                  You're offline. Attendance will sync when connected.
                </Paragraph>
              </Card.Content>
            </Card>
          )}

          {/* Current Status */}
          {attendance && (
            <Card style={styles.statusCard}>
              <Card.Content>
                <View style={styles.statusHeader}>
                  <View style={styles.statusIndicator}>
                    <View style={[styles.statusDot, { backgroundColor: getStatusColor(attendance.status) }]} />
                    <Title style={styles.statusTitle}>Current Status</Title>
                  </View>
                  <Chip mode="outlined" textStyle={{ color: getStatusColor(attendance.status) }}>
                    {attendance.status.replace('_', ' ').toUpperCase()}
                  </Chip>
                </View>
                
                <View style={styles.statusGrid}>
                  <View style={styles.statusItem}>
                    <Text style={styles.statusLabel}>Check In</Text>
                    <Text style={styles.statusValue}>{attendance.checkIn || 'Not clocked in'}</Text>
                  </View>
                  <View style={styles.statusItem}>
                    <Text style={styles.statusLabel}>Check Out</Text>
                    <Text style={styles.statusValue}>{attendance.checkOut || 'Not clocked out'}</Text>
                  </View>
                  {settings.breakTracking && (
                    <>
                      <View style={styles.statusItem}>
                        <Text style={styles.statusLabel}>Break Start</Text>
                        <Text style={styles.statusValue}>{attendance.breakStart || 'No break'}</Text>
                      </View>
                      <View style={styles.statusItem}>
                        <Text style={styles.statusLabel}>Break End</Text>
                        <Text style={styles.statusValue}>{attendance.breakEnd || 'No break'}</Text>
                      </View>
                    </>
                  )}
                </View>
              </Card.Content>
            </Card>
          )}

          {/* Location Info */}
          {settings.gpsRequired && (
            <Card style={styles.locationCard}>
              <Card.Content>
                <View style={styles.locationHeader}>
                  <MaterialIcons name="location-on" size={24} color="#4F46E5" />
                  <Title style={styles.locationTitle}>Location</Title>
                </View>
                {location ? (
                  <View style={styles.locationInfo}>
                    <View style={styles.locationStatus}>
                      <MaterialIcons name="check-circle" size={16} color="#10B981" />
                      <Text style={styles.locationText}>Location detected</Text>
                    </View>
                    <Text style={styles.locationCoords}>
                      {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                    </Text>
                    <Text style={styles.locationAccuracy}>
                      Accuracy: ±{location.accuracy?.toFixed(0)}m
                    </Text>
                  </View>
                ) : (
                  <View style={styles.locationStatus}>
                    <ActivityIndicator size="small" color="#4F46E5" />
                    <Text style={styles.locationText}>Getting location...</Text>
                  </View>
                )}
              </Card.Content>
            </Card>
          )}

          {/* Today's Summary */}
          {attendance && (
            <Card style={styles.summaryCard}>
              <Card.Content>
                <Title style={styles.summaryTitle}>Today's Summary</Title>
                <View style={styles.summaryGrid}>
                  <View style={styles.summaryItem}>
                    <Text style={styles.summaryValue}>{attendance.hoursWorked || 0}h</Text>
                    <Text style={styles.summaryLabel}>Hours Worked</Text>
                  </View>
                  <View style={styles.summaryItem}>
                    <Text style={styles.summaryValue}>{attendance.overtimeHours || 0}h</Text>
                    <Text style={styles.summaryLabel}>Overtime</Text>
                  </View>
                  <View style={styles.summaryItem}>
                    <Text style={styles.summaryValue}>
                      {attendance.syncStatus === 'synced' ? '✓' : '⏳'}
                    </Text>
                    <Text style={styles.summaryLabel}>
                      {attendance.syncStatus === 'synced' ? 'Synced' : 'Pending'}
                    </Text>
                  </View>
                </View>
              </Card.Content>
            </Card>
          )}
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      {nextAction && (
        <FAB
          style={[styles.fab, { backgroundColor: getActionColor(nextAction) }]}
          icon={getActionIcon(nextAction)}
          label={getActionLabel(nextAction)}
          onPress={() => handleClockAction(nextAction)}
          loading={actionLoading}
          disabled={actionLoading}
        />
      )}

      {/* Camera Modal */}
      <Portal>
        <Modal
          visible={showCameraModal}
          onDismiss={() => setShowCameraModal(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <Card>
            <Card.Content style={styles.modalContent}>
              <Title style={styles.modalTitle}>Photo Required</Title>
              <Paragraph style={styles.modalText}>
                Please take a photo for attendance verification
              </Paragraph>
              <View style={styles.modalButtons}>
                <Button
                  mode="outlined"
                  onPress={() => setShowCameraModal(false)}
                  style={styles.modalButton}
                >
                  Cancel
                </Button>
                <Button
                  mode="contained"
                  onPress={handlePhotoCapture}
                  style={styles.modalButton}
                  icon="camera"
                >
                  Take Photo
                </Button>
              </View>
            </Card.Content>
          </Card>
        </Modal>
      </Portal>
    </SafeAreaView>
  );
};

const getActionColor = (action) => {
  switch (action) {
    case 'clockIn': return '#10B981';
    case 'clockOut': return '#EF4444';
    case 'breakStart': return '#F59E0B';
    case 'breakEnd': return '#10B981';
    default: return '#6B7280';
  }
};

const getActionIcon = (action) => {
  switch (action) {
    case 'clockIn': return 'play';
    case 'clockOut': return 'stop';
    case 'breakStart': return 'coffee';
    case 'breakEnd': return 'play';
    default: return 'clock';
  }
};

const getActionLabel = (action) => {
  switch (action) {
    case 'clockIn': return 'Clock In';
    case 'clockOut': return 'Clock Out';
    case 'breakStart': return 'Start Break';
    case 'breakEnd': return 'End Break';
    default: return 'Action';
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingBottom: 20,
  },
  headerContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  timeContainer: {
    alignItems: 'center',
  },
  timeText: {
    color: '#FFFFFF',
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  dateText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 16,
  },
  content: {
    padding: 20,
    paddingBottom: 100,
  },
  alertCard: {
    marginBottom: 16,
    borderRadius: 12,
  },
  alertContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  alertText: {
    marginLeft: 12,
    color: '#D97706',
    flex: 1,
  },
  statusCard: {
    marginBottom: 16,
    borderRadius: 12,
    elevation: 2,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statusItem: {
    width: '48%',
    marginBottom: 12,
  },
  statusLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  statusValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  locationCard: {
    marginBottom: 16,
    borderRadius: 12,
    elevation: 2,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  locationTitle: {
    marginLeft: 8,
    fontSize: 18,
    fontWeight: 'bold',
  },
  locationInfo: {
    marginLeft: 32,
  },
  locationStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#1F2937',
  },
  locationCoords: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  locationAccuracy: {
    fontSize: 12,
    color: '#6B7280',
  },
  summaryCard: {
    borderRadius: 12,
    elevation: 2,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4F46E5',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  modalContainer: {
    padding: 20,
  },
  modalContent: {
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  modalText: {
    textAlign: 'center',
    marginBottom: 20,
    color: '#6B7280',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 8,
  },
});

export default EmployeeDashboard;