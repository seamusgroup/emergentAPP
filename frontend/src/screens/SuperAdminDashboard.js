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
import { COMPANIES, SUBSCRIPTION_PACKAGES } from '../data/mockData';

const SuperAdminDashboard = ({ navigation }) => {
  const theme = useTheme();
  const [companies, setCompanies] = useState(COMPANIES);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCompany, setNewCompany] = useState({
    name: '',
    email: '',
    package: 'basic'
  });

  const filteredCompanies = companies.filter(company => 
    company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    company.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddCompany = () => {
    const company = {
      id: `comp${Date.now()}`,
      ...newCompany,
      activeUsers: 0,
      status: 'active',
      createdAt: new Date().toISOString().split('T')[0],
      settings: {
        gpsRequired: false,
        geofencing: false,
        photoRequired: false,
        breakTracking: true,
        overtimeCalc: true
      }
    };
    
    setCompanies([...companies, company]);
    setNewCompany({ name: '', email: '', package: 'basic' });
    setShowAddModal(false);
  };

  const calculateStats = () => {
    const totalCompanies = companies.length;
    const activeCompanies = companies.filter(c => c.status === 'active').length;
    const totalUsers = companies.reduce((sum, c) => sum + c.activeUsers, 0);
    const totalRevenue = companies.reduce((sum, c) => {
      const pkg = SUBSCRIPTION_PACKAGES.find(p => p.id === c.package);
      return sum + (pkg?.price || 0);
    }, 0);

    return {
      totalCompanies,
      activeCompanies,
      totalUsers,
      totalRevenue: totalRevenue.toFixed(2)
    };
  };

  const onRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const stats = calculateStats();

  return (
    <SafeAreaView style={styles.container}>
      <Appbar.Header style={{ backgroundColor: theme.colors.primary }}>
        <Appbar.Content title="Super Admin Dashboard" titleStyle={{ color: '#FFFFFF' }} />
        <Appbar.Action icon="logout" onPress={() => navigation.replace('Login')} iconColor="#FFFFFF" />
      </Appbar.Header>

      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Overview Stats */}
        <View style={styles.statsGrid}>
          <Card style={[styles.statCard, { backgroundColor: '#EBF4FF' }]}>
            <Card.Content style={styles.statContent}>
              <MaterialIcons name="business" size={32} color="#3B82F6" />
              <View style={styles.statText}>
                <Text style={[styles.statValue, { color: '#3B82F6' }]}>{stats.totalCompanies}</Text>
                <Text style={styles.statLabel}>Total Companies</Text>
              </View>
            </Card.Content>
          </Card>

          <Card style={[styles.statCard, { backgroundColor: '#F0FDF4' }]}>
            <Card.Content style={styles.statContent}>
              <MaterialIcons name="trending-up" size={32} color="#10B981" />
              <View style={styles.statText}>
                <Text style={[styles.statValue, { color: '#10B981' }]}>{stats.activeCompanies}</Text>
                <Text style={styles.statLabel}>Active Companies</Text>
              </View>
            </Card.Content>
          </Card>

          <Card style={[styles.statCard, { backgroundColor: '#F3E8FF' }]}>
            <Card.Content style={styles.statContent}>
              <MaterialIcons name="people" size={32} color="#7C3AED" />
              <View style={styles.statText}>
                <Text style={[styles.statValue, { color: '#7C3AED' }]}>{stats.totalUsers}</Text>
                <Text style={styles.statLabel}>Total Users</Text>
              </View>
            </Card.Content>
          </Card>

          <Card style={[styles.statCard, { backgroundColor: '#FEF3C7' }]}>
            <Card.Content style={styles.statContent}>
              <MaterialIcons name="attach-money" size={32} color="#F59E0B" />
              <View style={styles.statText}>
                <Text style={[styles.statValue, { color: '#F59E0B' }]}>${stats.totalRevenue}</Text>
                <Text style={styles.statLabel}>Monthly Revenue</Text>
              </View>
            </Card.Content>
          </Card>
        </View>

        {/* Subscription Packages */}
        <Card style={styles.packagesCard}>
          <Card.Content>
            <Title style={styles.sectionTitle}>Subscription Packages</Title>
            <Paragraph style={styles.sectionSubtitle}>
              Available subscription plans and their features
            </Paragraph>
            
            <View style={styles.packagesList}>
              {SUBSCRIPTION_PACKAGES.map((pkg) => {
                const companiesOnPlan = companies.filter(c => c.package === pkg.id).length;
                return (
                  <Card key={pkg.id} style={styles.packageCard}>
                    <Card.Content style={styles.packageContent}>
                      <Title style={styles.packageName}>{pkg.name}</Title>
                      <Text style={styles.packagePrice}>${pkg.price}</Text>
                      <Text style={styles.packageUsers}>Up to {pkg.maxUsers} users</Text>
                      <Chip mode="outlined" style={styles.packageChip}>
                        {companiesOnPlan} companies
                      </Chip>
                    </Card.Content>
                  </Card>
                );
              })}
            </View>
          </Card.Content>
        </Card>

        {/* Search */}
        <View style={styles.searchContainer}>
          <Searchbar
            placeholder="Search companies..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchBar}
          />
        </View>

        {/* Company Management */}
        <Card style={styles.companiesCard}>
          <Card.Content>
            <Title style={styles.sectionTitle}>Company Management</Title>
            <Paragraph style={styles.sectionSubtitle}>
              Manage registered companies and their subscriptions
            </Paragraph>
          </Card.Content>
        </Card>

        <View style={styles.companiesList}>
          {filteredCompanies.map((company) => {
            const pkg = SUBSCRIPTION_PACKAGES.find(p => p.id === company.package);
            return (
              <Card key={company.id} style={styles.companyCard}>
                <Card.Content>
                  <View style={styles.companyHeader}>
                    <View style={styles.companyInfo}>
                      <View style={styles.companyLogo}>
                        <Text style={styles.logoText}>
                          {company.name.split(' ').map(n => n[0]).join('')}
                        </Text>
                      </View>
                      <View style={styles.companyDetails}>
                        <Title style={styles.companyName}>{company.name}</Title>
                        <Text style={styles.companyEmail}>{company.email}</Text>
                        <View style={styles.companyChips}>
                          <Chip
                            mode={company.status === 'active' ? 'flat' : 'outlined'}
                            textStyle={{ fontSize: 10 }}
                            style={styles.statusChip}
                          >
                            {company.status.toUpperCase()}
                          </Chip>
                          <Chip mode="outlined" textStyle={{ fontSize: 10 }} style={styles.planChip}>
                            {pkg?.name || 'Unknown'} Plan
                          </Chip>
                        </View>
                      </View>
                    </View>
                  </View>
                  
                  <View style={styles.companyStats}>
                    <View style={styles.statItem}>
                      <Text style={styles.statItemLabel}>Users</Text>
                      <Text style={styles.statItemValue}>{company.activeUsers}/{pkg?.maxUsers || 0}</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={styles.statItemLabel}>Revenue</Text>
                      <Text style={[styles.statItemValue, { color: '#10B981' }]}>${pkg?.price || 0}/mo</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={styles.statItemLabel}>Since</Text>
                      <Text style={styles.statItemValue}>
                        {new Date(company.createdAt).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.companyActions}>
                    <Button mode="outlined" icon="edit" style={styles.actionButton} compact>
                      Edit
                    </Button>
                    <Button mode="outlined" icon="settings" style={styles.actionButton} compact>
                      Settings
                    </Button>
                  </View>
                </Card.Content>
              </Card>
            );
          })}
          
          {filteredCompanies.length === 0 && (
            <Card style={styles.emptyCard}>
              <Card.Content style={styles.emptyContent}>
                <MaterialIcons name="business" size={48} color="#9CA3AF" />
                <Title style={styles.emptyTitle}>No companies found</Title>
                <Paragraph style={styles.emptyText}>
                  {searchQuery ? 'Try adjusting your search criteria.' : 'Get started by adding your first company.'}
                </Paragraph>
                {!searchQuery && (
                  <Button
                    mode="contained"
                    icon="plus"
                    onPress={() => setShowAddModal(true)}
                    style={styles.emptyButton}
                  >
                    Add Company
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
              <Title style={styles.modalTitle}>Add New Company</Title>
              
              <TextInput
                label="Company Name"
                value={newCompany.name}
                onChangeText={(text) => setNewCompany({...newCompany, name: text})}
                style={styles.input}
                mode="outlined"
              />
              
              <TextInput
                label="Admin Email"
                value={newCompany.email}
                onChangeText={(text) => setNewCompany({...newCompany, email: text})}
                style={styles.input}
                mode="outlined"
                keyboardType="email-address"
                autoCapitalize="none"
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
                  onPress={handleAddCompany}
                  style={styles.modalButton}
                >
                  Add Company
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
  scrollView: {
    flex: 1,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
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
  packagesCard: {
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
  packagesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  packageCard: {
    flex: 1,
    minWidth: '30%',
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
  },
  packageContent: {
    alignItems: 'center',
    padding: 12,
  },
  packageName: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  packagePrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4F46E5',
    marginBottom: 4,
  },
  packageUsers: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
  },
  packageChip: {
    height: 24,
  },
  searchContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  searchBar: {
    elevation: 2,
  },
  companiesCard: {
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
    elevation: 2,
  },
  companiesList: {
    paddingHorizontal: 16,
    paddingBottom: 80,
  },
  companyCard: {
    marginBottom: 12,
    borderRadius: 12,
    elevation: 2,
  },
  companyHeader: {
    marginBottom: 16,
  },
  companyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  companyLogo: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  logoText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  companyDetails: {
    flex: 1,
  },
  companyName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  companyEmail: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
  },
  companyChips: {
    flexDirection: 'row',
    gap: 8,
  },
  statusChip: {
    height: 24,
  },
  planChip: {
    height: 24,
  },
  companyStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  statItem: {
    alignItems: 'center',
  },
  statItemLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  statItemValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  companyActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    borderRadius: 8,
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

export default SuperAdminDashboard;