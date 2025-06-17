import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
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
  Searchbar,
  FAB,
  Portal,
  Modal,
  TextInput,
} from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

// Mock data
import { EMPLOYEES, CURRENT_USER } from '../data/mockData';

const ManagerEmployees = ({ navigation }) => {
  const theme = useTheme();
  const [employees, setEmployees] = useState(
    EMPLOYEES.filter(emp => emp.companyId === CURRENT_USER.companyId)
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEmployee, setNewEmployee] = useState({
    firstName: '',
    lastName: '',
    email: '',
    department: '',
    role: 'employee'
  });

  const filteredEmployees = employees.filter(emp => 
    emp.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddEmployee = () => {
    const employee = {
      id: `emp${Date.now()}`,
      companyId: CURRENT_USER.companyId,
      ...newEmployee,
      status: 'active',
      joinDate: new Date().toISOString().split('T')[0],
      biometricsEnabled: false,
      twoFactorEnabled: false
    };
    
    setEmployees([...employees, employee]);
    setNewEmployee({
      firstName: '',
      lastName: '',
      email: '',
      department: '',
      role: 'employee'
    });
    setShowAddModal(false);
  };

  const toggleBiometrics = (employeeId) => {
    setEmployees(employees.map(emp => 
      emp.id === employeeId 
        ? { ...emp, biometricsEnabled: !emp.biometricsEnabled }
        : emp
    ));
  };

  const onRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Appbar.Header style={{ backgroundColor: theme.colors.primary }}>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Employee Management" titleStyle={{ color: '#FFFFFF' }} />
      </Appbar.Header>

      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search employees..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
        />
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.employeesList}>
          {filteredEmployees.map((employee) => (
            <Card key={employee.id} style={styles.employeeCard}>
              <Card.Content>
                <View style={styles.employeeHeader}>
                  <View style={styles.employeeInfo}>
                    <View style={styles.avatar}>
                      <Text style={styles.avatarText}>
                        {employee.firstName[0]}{employee.lastName[0]}
                      </Text>
                    </View>
                    <View style={styles.employeeDetails}>
                      <Title style={styles.employeeName}>
                        {employee.firstName} {employee.lastName}
                      </Title>
                      <Chip
                        mode={employee.role === 'manager' ? 'flat' : 'outlined'}
                        textStyle={{ fontSize: 10 }}
                        style={styles.roleChip}
                      >
                        {employee.role.toUpperCase()}
                      </Chip>
                    </View>
                  </View>
                  <View style={styles.employeeActions}>
                    <Button
                      mode="outlined"
                      icon="edit"
                      onPress={() => {}}
                      style={styles.actionButton}
                      compact
                    >
                      Edit
                    </Button>
                  </View>
                </View>

                <View style={styles.employeeMetadata}>
                  <View style={styles.metadataItem}>
                    <MaterialIcons name="email" size={16} color="#6B7280" />
                    <Text style={styles.metadataText}>{employee.email}</Text>
                  </View>
                  <View style={styles.metadataItem}>
                    <MaterialIcons name="business" size={16} color="#6B7280" />
                    <Text style={styles.metadataText}>{employee.department}</Text>
                  </View>
                  <View style={styles.metadataItem}>
                    <MaterialIcons name="calendar-today" size={16} color="#6B7280" />
                    <Text style={styles.metadataText}>
                      Joined {new Date(employee.joinDate).toLocaleDateString()}
                    </Text>
                  </View>
                </View>

                <View style={styles.employeeSettings}>
                  <View style={styles.settingRow}>
                    <View style={styles.settingInfo}>
                      <MaterialIcons name="fingerprint" size={20} color="#4F46E5" />
                      <Text style={styles.settingLabel}>Biometrics</Text>
                    </View>
                    <Button
                      mode={employee.biometricsEnabled ? 'contained' : 'outlined'}
                      onPress={() => toggleBiometrics(employee.id)}
                      compact
                      style={styles.settingButton}
                    >
                      {employee.biometricsEnabled ? 'ON' : 'OFF'}
                    </Button>
                  </View>
                  
                  <View style={styles.settingRow}>
                    <View style={styles.settingInfo}>
                      <MaterialIcons name="security" size={20} color="#4F46E5" />
                      <Text style={styles.settingLabel}>2FA</Text>
                    </View>
                    <Chip
                      mode={employee.twoFactorEnabled ? 'flat' : 'outlined'}
                      textStyle={{ fontSize: 10 }}
                      style={styles.statusChip}
                    >
                      {employee.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                    </Chip>
                  </View>
                </View>

                <Chip
                  mode={employee.status === 'active' ? 'flat' : 'outlined'}
                  textStyle={{ fontSize: 12 }}
                  style={[styles.statusChip, { alignSelf: 'center', marginTop: 12 }]}
                >
                  {employee.status.toUpperCase()}
                </Chip>
              </Card.Content>
            </Card>
          ))}
          
          {filteredEmployees.length === 0 && (
            <Card style={styles.emptyCard}>
              <Card.Content style={styles.emptyContent}>
                <MaterialIcons name="people" size={48} color="#9CA3AF" />
                <Title style={styles.emptyTitle}>No employees found</Title>
                <Paragraph style={styles.emptyText}>
                  {searchQuery ? 'Try adjusting your search criteria.' : 'Get started by adding your first employee.'}
                </Paragraph>
                {!searchQuery && (
                  <Button
                    mode="contained"
                    icon="plus"
                    onPress={() => setShowAddModal(true)}
                    style={styles.emptyButton}
                  >
                    Add Employee
                  </Button>
                )}
              </Card.Content>
            </Card>
          )}
        </View>
      </ScrollView>

      <FAB
        style={styles.fab}
        icon="plus"
        onPress={() => setShowAddModal(true)}
      />

      <Portal>
        <Modal
          visible={showAddModal}
          onDismiss={() => setShowAddModal(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <Card>
            <Card.Content>
              <Title style={styles.modalTitle}>Add New Employee</Title>
              
              <View style={styles.inputRow}>
                <TextInput
                  label="First Name"
                  value={newEmployee.firstName}
                  onChangeText={(text) => setNewEmployee({...newEmployee, firstName: text})}
                  style={[styles.input, { flex: 1, marginRight: 8 }]}
                  mode="outlined"
                />
                <TextInput
                  label="Last Name"
                  value={newEmployee.lastName}
                  onChangeText={(text) => setNewEmployee({...newEmployee, lastName: text})}
                  style={[styles.input, { flex: 1, marginLeft: 8 }]}
                  mode="outlined"
                />
              </View>
              
              <TextInput
                label="Email"
                value={newEmployee.email}
                onChangeText={(text) => setNewEmployee({...newEmployee, email: text})}
                style={styles.input}
                mode="outlined"
                keyboardType="email-address"
                autoCapitalize="none"
              />
              
              <TextInput
                label="Department"
                value={newEmployee.department}
                onChangeText={(text) => setNewEmployee({...newEmployee, department: text})}
                style={styles.input}
                mode="outlined"
              />
              
              <View style={styles.modalButtons}>
                <Button
                  mode="outlined"
                  onPress={() => setShowAddModal(false)}
                  style={styles.modalButton}
                >
                  Cancel
                </Button>
                <Button
                  mode="contained"
                  onPress={handleAddEmployee}
                  style={styles.modalButton}
                >
                  Add Employee
                </Button>
              </View>
            </Card.Content>
          </Card>
        </Modal>
      </Portal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  searchContainer: {
    padding: 16,
  },
  searchBar: {
    elevation: 2,
  },
  scrollView: {
    flex: 1,
  },
  employeesList: {
    padding: 16,
    paddingBottom: 80,
  },
  employeeCard: {
    marginBottom: 12,
    borderRadius: 12,
    elevation: 2,
  },
  employeeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  employeeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  employeeDetails: {
    flex: 1,
  },
  employeeName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  roleChip: {
    alignSelf: 'flex-start',
    height: 24,
  },
  employeeActions: {
    marginLeft: 12,
  },
  actionButton: {
    borderRadius: 8,
  },
  employeeMetadata: {
    marginBottom: 16,
    gap: 8,
  },
  metadataItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metadataText: {
    marginLeft: 8,
    fontSize: 12,
    color: '#6B7280',
  },
  employeeSettings: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 16,
    gap: 12,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingLabel: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  settingButton: {
    borderRadius: 6,
  },
  statusChip: {
    height: 24,
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
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    textAlign: 'center',
    color: '#6B7280',
    marginBottom: 16,
  },
  emptyButton: {
    borderRadius: 8,
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
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  inputRow: {
    flexDirection: 'row',
  },
  input: {
    marginBottom: 12,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    gap: 12,
  },
  modalButton: {
    flex: 1,
  },
});

export default ManagerEmployees;