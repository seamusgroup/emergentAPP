import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  RefreshControl,
  Dimensions,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Button,
  Chip,
  useTheme,
  Appbar,
} from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

// Services
import StorageService from '../services/StorageService';

// Mock data
import { ATTENDANCE_RECORDS, CURRENT_USER } from '../data/mockData';

const EmployeeAttendance = ({ navigation }) => {
  const theme = useTheme();
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [viewPeriod, setViewPeriod] = useState('month');

  useEffect(() => {
    loadAttendanceHistory();
  }, [viewPeriod]);

  const loadAttendanceHistory = async () => {
    // Filter records by current user and date range
    const userRecords = ATTENDANCE_RECORDS.filter(record => 
      record.employeeId === CURRENT_USER.id
    );

    // Sort by date (newest first)
    const sortedRecords = userRecords.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    setAttendanceHistory(sortedRecords);
  };

  const calculateStats = () => {
    const totalDays = attendanceHistory.length;
    const totalHours = attendanceHistory.reduce((sum, r) => sum + (r.hoursWorked || 0), 0);
    const totalOvertime = attendanceHistory.reduce((sum, r) => sum + (r.overtimeHours || 0), 0);
    const averageHours = totalDays > 0 ? (totalHours / totalDays).toFixed(1) : 0;
    const punctualDays = attendanceHistory.filter(r => r.checkIn <= '09:00:00').length;

    return {
      totalDays,
      totalHours,
      totalOvertime,
      averageHours,
      punctualDays,
      punctualityRate: totalDays > 0 ? Math.round((punctualDays / totalDays) * 100) : 0
    };
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return '#10B981';
      case 'active': return '#3B82F6';
      case 'on_break': return '#F59E0B';
      default: return '#6B7280';
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAttendanceHistory();
    setRefreshing(false);
  };

  const exportData = async () => {
    // Mock export functionality
    console.log('Exporting attendance data...');
  };

  const stats = calculateStats();

  return (
    <SafeAreaView style={styles.container}>
      <Appbar.Header style={{ backgroundColor: theme.colors.primary }}>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="My Attendance" titleStyle={{ color: '#FFFFFF' }} />
        <Appbar.Action icon="download" onPress={exportData} iconColor="#FFFFFF" />
      </Appbar.Header>

      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Period Selector */}
        <Card style={styles.periodCard}>
          <Card.Content>
            <Title style={styles.cardTitle}>Attendance History</Title>
            <Paragraph style={styles.cardSubtitle}>
              View your attendance records and statistics
            </Paragraph>
            <View style={styles.periodButtons}>
              <Button
                mode={viewPeriod === 'week' ? 'contained' : 'outlined'}
                onPress={() => setViewPeriod('week')}
                style={styles.periodButton}
                compact
              >
                Last 7 Days
              </Button>
              <Button
                mode={viewPeriod === 'month' ? 'contained' : 'outlined'}
                onPress={() => setViewPeriod('month')}
                style={styles.periodButton}
                compact
              >
                This Month
              </Button>
            </View>
          </Card.Content>
        </Card>

        {/* Statistics Cards */}
        <View style={styles.statsContainer}>
          <Card style={[styles.statCard, { backgroundColor: '#EBF4FF' }]}>
            <Card.Content style={styles.statContent}>
              <MaterialIcons name="access-time" size={32} color="#3B82F6" />
              <View style={styles.statText}>
                <Text style={[styles.statValue, { color: '#3B82F6' }]}>{stats.totalHours}h</Text>
                <Text style={styles.statLabel}>Total Hours</Text>
              </View>
            </Card.Content>
          </Card>

          <Card style={[styles.statCard, { backgroundColor: '#F0FDF4' }]}>
            <Card.Content style={styles.statContent}>
              <MaterialIcons name="trending-up" size={32} color="#10B981" />
              <View style={styles.statText}>
                <Text style={[styles.statValue, { color: '#10B981' }]}>{stats.averageHours}h</Text>
                <Text style={styles.statLabel}>Avg per Day</Text>
              </View>
            </Card.Content>
          </Card>

          <Card style={[styles.statCard, { backgroundColor: '#FEF3C7' }]}>
            <Card.Content style={styles.statContent}>
              <MaterialIcons name="schedule" size={32} color="#F59E0B" />
              <View style={styles.statText}>
                <Text style={[styles.statValue, { color: '#F59E0B' }]}>{stats.totalOvertime}h</Text>
                <Text style={styles.statLabel}>Overtime</Text>
              </View>
            </Card.Content>
          </Card>

          <Card style={[styles.statCard, { backgroundColor: '#F3E8FF' }]}>
            <Card.Content style={styles.statContent}>
              <MaterialIcons name="star" size={32} color="#7C3AED" />
              <View style={styles.statText}>
                <Text style={[styles.statValue, { color: '#7C3AED' }]}>{stats.punctualityRate}%</Text>
                <Text style={styles.statLabel}>Punctuality</Text>
              </View>
            </Card.Content>
          </Card>
        </View>

        {/* Attendance Records */}
        <Card style={styles.recordsCard}>
          <Card.Content>
            <Title style={styles.recordsTitle}>Daily Records</Title>
            <Paragraph style={styles.recordsSubtitle}>
              Your recent attendance history
            </Paragraph>
          </Card.Content>
        </Card>

        <View style={styles.recordsList}>
          {attendanceHistory.map((record) => (
            <Card key={record.id} style={styles.recordCard}>
              <Card.Content>
                <View style={styles.recordHeader}>
                  <View style={styles.dateContainer}>
                    <Text style={styles.dayText}>{new Date(record.date).getDate()}</Text>
                    <Text style={styles.monthText}>
                      {new Date(record.date).toLocaleDateString('en-US', { month: 'short' })}
                    </Text>
                  </View>
                  
                  <View style={styles.recordDetails}>
                    <View style={styles.timeInfo}>
                      <View style={styles.timeItem}>
                        <Text style={styles.timeLabel}>Check In</Text>
                        <Text style={styles.timeValue}>{record.checkIn || '-'}</Text>
                      </View>
                      <View style={styles.timeItem}>
                        <Text style={styles.timeLabel}>Check Out</Text>
                        <Text style={styles.timeValue}>{record.checkOut || '-'}</Text>
                      </View>
                      {record.breakStart && (
                        <View style={styles.timeItem}>
                          <Text style={styles.timeLabel}>Break</Text>
                          <Text style={styles.timeValue}>
                            {record.breakStart} - {record.breakEnd || 'Active'}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                  
                  <View style={styles.recordSummary}>
                    <Text style={styles.hoursText}>{record.hoursWorked || 0}h</Text>
                    {record.overtimeHours > 0 && (
                      <Text style={styles.overtimeText}>+{record.overtimeHours}h OT</Text>
                    )}
                    <Chip
                      mode="outlined"
                      textStyle={{ color: getStatusColor(record.status), fontSize: 10 }}
                      style={{ 
                        borderColor: getStatusColor(record.status),
                        marginTop: 4,
                        height: 24
                      }}
                    >
                      {record.status}
                    </Chip>
                    
                    <View style={styles.recordIcons}>
                      {record.gpsCheckIn && (
                        <MaterialIcons name="location-on" size={16} color="#10B981" />
                      )}
                      {record.syncStatus === 'pending' && (
                        <MaterialIcons name="sync-problem" size={16} color="#F59E0B" />
                      )}
                    </View>
                  </View>
                </View>
              </Card.Content>
            </Card>
          ))}
          
          {attendanceHistory.length === 0 && (
            <Card style={styles.emptyCard}>
              <Card.Content style={styles.emptyContent}>
                <MaterialIcons name="schedule" size={48} color="#9CA3AF" />
                <Title style={styles.emptyTitle}>No Records Found</Title>
                <Paragraph style={styles.emptyText}>
                  No attendance data found for the selected period.
                </Paragraph>
              </Card.Content>
            </Card>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollView: {
    flex: 1,
  },
  periodCard: {
    margin: 16,
    borderRadius: 12,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  cardSubtitle: {
    color: '#6B7280',
    marginBottom: 16,
  },
  periodButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  periodButton: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    borderRadius: 12,
    elevation: 2,
  },
  statContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  statText: {
    marginLeft: 12,
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  recordsCard: {
    margin: 16,
    marginBottom: 8,
    borderRadius: 12,
    elevation: 2,
  },
  recordsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  recordsSubtitle: {
    color: '#6B7280',
  },
  recordsList: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  recordCard: {
    marginBottom: 12,
    borderRadius: 12,
    elevation: 1,
  },
  recordHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateContainer: {
    alignItems: 'center',
    width: 60,
    marginRight: 16,
  },
  dayText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  monthText: {
    fontSize: 12,
    color: '#6B7280',
    textTransform: 'uppercase',
  },
  recordDetails: {
    flex: 1,
  },
  timeInfo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  timeItem: {
    minWidth: 80,
  },
  timeLabel: {
    fontSize: 10,
    color: '#6B7280',
    marginBottom: 2,
  },
  timeValue: {
    fontSize: 12,
    fontWeight: '500',
    color: '#1F2937',
  },
  recordSummary: {
    alignItems: 'flex-end',
    minWidth: 80,
  },
  hoursText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4F46E5',
  },
  overtimeText: {
    fontSize: 10,
    color: '#F59E0B',
    marginBottom: 4,
  },
  recordIcons: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 4,
  },
  emptyCard: {
    borderRadius: 12,
    elevation: 1,
  },
  emptyContent: {
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    textAlign: 'center',
    color: '#6B7280',
  },
});

export default EmployeeAttendance;