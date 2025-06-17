import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Button,
  Chip,
  useTheme,
  Appbar,
  Text,
  Switch,
} from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

// Mock data
import { EMPLOYEES, ATTENDANCE_RECORDS, CURRENT_USER, COMPANIES } from '../data/mockData';

const ManagerDashboard = ({ navigation }) => {
  const theme = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [companySettings, setCompanySettings] = useState({});

  const company = COMPANIES.find(c => c.id === CURRENT_USER.companyId);
  const employees = EMPLOYEES.filter(emp => emp.companyId === CURRENT_USER.companyId);
  const todayRecords = ATTENDANCE_RECORDS.filter(record => 
    record.companyId === CURRENT_USER.companyId && 
    record.date === new Date().toISOString().split('T')[0]
  );

  useEffect(() => {
    setCompanySettings(company?.settings || {});
  }, [company]);

  const stats = {
    totalEmployees: employees.length,
    presentToday: todayRecords.filter(r => r.checkIn).length,
    onBreak: todayRecords.filter(r => r.status === 'on_break').length,
    pendingSync: todayRecords.filter(r => r.syncStatus === 'pending').length
  };

  const toggleSetting = (setting) => {
    setCompanySettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate data refresh
    setTimeout(() => setRefreshing(false), 1000);
  };

  const navigateToScreen = (screenName) => {
    navigation.navigate(screenName);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Appbar.Header style={{ backgroundColor: theme.colors.primary }}>
        <Appbar.Content title="Manager Dashboard" titleStyle={{ color: '#FFFFFF' }} />
        <Appbar.Action icon="logout" onPress={() => navigation.replace('Login')} iconColor="#FFFFFF" />
      </Appbar.Header>

      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Company Info */}
        <LinearGradient
          colors={['#4F46E5', '#7C3AED']}
          style={styles.companyCard}
        >
          <View style={styles.companyInfo}>
            <Title style={styles.companyName}>{company?.name}</Title>
            <Paragraph style={styles.companyPackage}>Package: {company?.package}</Paragraph>
          </View>
          <Chip mode="outlined" textStyle={{ color: '#FFFFFF' }} style={styles.usersChip}>
            {company?.activeUsers}/
            {company?.package === 'basic' ? 5 : 
             company?.package === 'standard' ? 15 : 
             company?.package === 'premium' ? 30 : 
             company?.package === 'enterprise' ? 50 : 999} Users
          </Chip>
        </LinearGradient>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <Card style={[styles.statCard, { backgroundColor: '#EBF4FF' }]}>
            <Card.Content style={styles.statContent}>
              <MaterialIcons name="people" size={32} color="#3B82F6" />
              <View style={styles.statText}>
                <Text style={[styles.statValue, { color: '#3B82F6' }]}>{stats.totalEmployees}</Text>
                <Text style={styles.statLabel}>Total Employees</Text>
              </View>
            </Card.Content>
          </Card>

          <Card style={[styles.statCard, { backgroundColor: '#F0FDF4' }]}>
            <Card.Content style={styles.statContent}>
              <MaterialIcons name="check-circle" size={32} color="#10B981" />
              <View style={styles.statText}>
                <Text style={[styles.statValue, { color: '#10B981' }]}>{stats.presentToday}</Text>
                <Text style={styles.statLabel}>Present Today</Text>
              </View>
            </Card.Content>
          </Card>

          <Card style={[styles.statCard, { backgroundColor: '#FEF3C7' }]}>
            <Card.Content style={styles.statContent}>
              <MaterialIcons name="coffee" size={32} color="#F59E0B" />
              <View style={styles.statText}>
                <Text style={[styles.statValue, { color: '#F59E0B' }]}>{stats.onBreak}</Text>
                <Text style={styles.statLabel}>On Break</Text>
              </View>
            </Card.Content>
          </Card>

          <Card style={[styles.statCard, { backgroundColor: '#FEE2E2' }]}>
            <Card.Content style={styles.statContent}>
              <MaterialIcons name="sync-problem" size={32} color="#EF4444" />
              <View style={styles.statText}>
                <Text style={[styles.statValue, { color: '#EF4444' }]}>{stats.pendingSync}</Text>
                <Text style={styles.statLabel}>Pending Sync</Text>
              </View>
            </Card.Content>
          </Card>
        </View>

        {/* Quick Actions */}
        <Card style={styles.actionsCard}>
          <Card.Content>
            <Title style={styles.sectionTitle}>Quick Actions</Title>
            <View style={styles.actionButtons}>
              <Button
                mode="contained"
                icon="people"
                onPress={() => navigateToScreen('ManagerEmployees')}
                style={[styles.actionButton, { backgroundColor: '#3B82F6' }]}
                contentStyle={styles.buttonContent}
              >
                Employees
              </Button>
              <Button
                mode="contained"
                icon="schedule"
                onPress={() => navigateToScreen('ManagerAttendance')}
                style={[styles.actionButton, { backgroundColor: '#10B981' }]}
                contentStyle={styles.buttonContent}
              >
                Attendance
              </Button>
              <Button
                mode="contained"
                icon="bar-chart"
                onPress={() => navigateToScreen('ManagerReports')}
                style={[styles.actionButton, { backgroundColor: '#7C3AED' }]}
                contentStyle={styles.buttonContent}
              >
                Reports
              </Button>
            </View>
          </Card.Content>
        </Card>

        {/* Attendance Settings */}
        <Card style={styles.settingsCard}>
          <Card.Content>
            <Title style={styles.sectionTitle}>Attendance Settings</Title>
            <Paragraph style={styles.sectionSubtitle}>
              Configure attendance requirements for your employees
            </Paragraph>
            
            <View style={styles.settingsList}>
              <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <MaterialIcons name="location-on" size={24} color="#4F46E5" />
                  <View style={styles.settingText}>
                    <Text style={styles.settingTitle}>GPS Tracking</Text>
                    <Text style={styles.settingDescription}>Require location for check-in</Text>
                  </View>
                </View>
                <Switch
                  value={companySettings.gpsRequired}
                  onValueChange={() => toggleSetting('gpsRequired')}
                />
              </View>

              <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <MaterialIcons name="camera-alt" size={24} color="#7C3AED" />
                  <View style={styles.settingText}>
                    <Text style={styles.settingTitle}>Photo Verification</Text>
                    <Text style={styles.settingDescription}>Require photo on check-in</Text>
                  </View>
                </View>
                <Switch
                  value={companySettings.photoRequired}
                  onValueChange={() => toggleSetting('photoRequired')}
                />
              </View>

              <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <MaterialIcons name="coffee" size={24} color="#10B981" />
                  <View style={styles.settingText}>
                    <Text style={styles.settingTitle}>Break Tracking</Text>
                    <Text style={styles.settingDescription}>Enable break time tracking</Text>
                  </View>
                </View>
                <Switch
                  value={companySettings.breakTracking}
                  onValueChange={() => toggleSetting('breakTracking')}
                />
              </View>

              <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <MaterialIcons name="trending-up" size={24} color="#F59E0B" />
                  <View style={styles.settingText}>
                    <Text style={styles.settingTitle}>Overtime Calculation</Text>
                    <Text style={styles.settingDescription}>Auto calculate overtime hours</Text>
                  </View>
                </View>
                <Switch
                  value={companySettings.overtimeCalc}
                  onValueChange={() => toggleSetting('overtimeCalc')}
                />
              </View>

              <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <MaterialIcons name="my-location" size={24} color="#6366F1" />
                  <View style={styles.settingText}>
                    <Text style={styles.settingTitle}>Geofencing</Text>
                    <Text style={styles.settingDescription}>Restrict check-in locations</Text>
                  </View>
                </View>
                <Switch
                  value={companySettings.geofencing}
                  onValueChange={() => toggleSetting('geofencing')}
                />
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Recent Activity */}
        <Card style={styles.activityCard}>
          <Card.Content>
            <Title style={styles.sectionTitle}>Recent Activity</Title>
            <Paragraph style={styles.sectionSubtitle}>
              Latest employee check-ins and check-outs
            </Paragraph>
            
            <View style={styles.activityList}>
              {todayRecords.slice(0, 5).map((record) => {
                const employee = employees.find(emp => emp.id === record.employeeId);
                return (
                  <View key={record.id} style={styles.activityItem}>
                    <View style={styles.activityInfo}>
                      <View style={styles.avatar}>
                        <Text style={styles.avatarText}>
                          {employee?.firstName[0]}{employee?.lastName[0]}
                        </Text>
                      </View>
                      <View style={styles.activityText}>
                        <Text style={styles.employeeName}>
                          {employee?.firstName} {employee?.lastName}
                        </Text>
                        <Text style={styles.department}>{employee?.department}</Text>
                      </View>
                    </View>
                    <View style={styles.activityStatus}>
                      <Text style={styles.timeText}>
                        {record.checkOut ? `${record.checkIn} - ${record.checkOut}` : `In at ${record.checkIn}`}
                      </Text>
                      <Chip
                        mode="outlined"
                        textStyle={{ fontSize: 10 }}
                        style={{ height: 24 }}
                      >
                        {record.status}
                      </Chip>
                    </View>
                  </View>
                );
              })}
            </View>
          </Card.Content>
        </Card>
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
  companyCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    margin: 16,
    padding: 20,
    borderRadius: 16,
    elevation: 4,
  },
  companyInfo: {
    flex: 1,
  },
  companyName: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  companyPackage: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
  },
  usersChip: {
    borderColor: 'rgba(255, 255, 255, 0.3)',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  statsGrid: {
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
    padding: 16,
  },
  statText: {
    marginLeft: 12,
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  actionsCard: {
    margin: 16,
    borderRadius: 12,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  sectionSubtitle: {
    color: '#6B7280',
    marginBottom: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    borderRadius: 8,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  settingsCard: {
    margin: 16,
    borderRadius: 12,
    elevation: 2,
  },
  settingsList: {
    gap: 16,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    marginLeft: 12,
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 12,
    color: '#6B7280',
  },
  activityCard: {
    margin: 16,
    marginBottom: 32,
    borderRadius: 12,
    elevation: 2,
  },
  activityList: {
    gap: 12,
  },
  activityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
  },
  activityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  activityText: {
    flex: 1,
  },
  employeeName: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  department: {
    fontSize: 12,
    color: '#6B7280',
  },
  activityStatus: {
    alignItems: 'flex-end',
  },
  timeText: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
  },
});

export default ManagerDashboard;