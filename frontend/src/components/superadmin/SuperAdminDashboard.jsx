import React, { useState } from 'react';
import Layout from '../common/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { 
  Building2, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Users, 
  TrendingUp,
  DollarSign,
  Crown,
  Settings
} from 'lucide-react';
import { COMPANIES, SUBSCRIPTION_PACKAGES } from '../../data/mock';

const SuperAdminDashboard = () => {
  const [companies, setCompanies] = useState(COMPANIES);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
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
    setShowAddDialog(false);
  };

  const handleDeleteCompany = (companyId) => {
    setCompanies(companies.filter(comp => comp.id !== companyId));
  };

  const toggleCompanyStatus = (companyId) => {
    setCompanies(companies.map(comp => 
      comp.id === companyId 
        ? { ...comp, status: comp.status === 'active' ? 'suspended' : 'active' }
        : comp
    ));
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

  const stats = calculateStats();

  return (
    <Layout title="Super Admin Dashboard">
      <div className="space-y-6">
        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-500 rounded-full">
                  <Building2 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-700">{stats.totalCompanies}</p>
                  <p className="text-sm text-blue-600">Total Companies</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-green-500 rounded-full">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-700">{stats.activeCompanies}</p>
                  <p className="text-sm text-green-600">Active Companies</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-purple-500 rounded-full">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-purple-700">{stats.totalUsers}</p>
                  <p className="text-sm text-purple-600">Total Users</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-orange-500 rounded-full">
                  <DollarSign className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-orange-700">${stats.totalRevenue}</p>
                  <p className="text-sm text-orange-600">Monthly Revenue</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Subscription Packages Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Crown className="h-5 w-5" />
              <span>Subscription Packages</span>
            </CardTitle>
            <CardDescription>Available subscription plans and their features</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              {SUBSCRIPTION_PACKAGES.map((pkg) => {
                const companiesOnPlan = companies.filter(c => c.package === pkg.id).length;
                return (
                  <Card key={pkg.id} className="bg-gradient-to-br from-gray-50 to-gray-100">
                    <CardContent className="p-4">
                      <div className="text-center space-y-2">
                        <h3 className="font-semibold">{pkg.name}</h3>
                        <p className="text-2xl font-bold text-blue-600">${pkg.price}</p>
                        <p className="text-sm text-gray-600">Up to {pkg.maxUsers} users</p>
                        <Badge variant="outline">{companiesOnPlan} companies</Badge>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Company Management */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div>
                <CardTitle>Company Management</CardTitle>
                <CardDescription>Manage registered companies and their subscriptions</CardDescription>
              </div>
              <div className="flex gap-4 w-full sm:w-auto">
                <div className="relative flex-1 sm:flex-none">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search companies..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 sm:w-64"
                  />
                </div>
                
                <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                  <DialogTrigger asChild>
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Company
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Add New Company</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="companyName">Company Name</Label>
                        <Input
                          id="companyName"
                          value={newCompany.name}
                          onChange={(e) => setNewCompany({...newCompany, name: e.target.value})}
                          placeholder="Enter company name"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="companyEmail">Admin Email</Label>
                        <Input
                          id="companyEmail"
                          type="email"
                          value={newCompany.email}
                          onChange={(e) => setNewCompany({...newCompany, email: e.target.value})}
                          placeholder="admin@company.com"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="package">Subscription Package</Label>
                        <Select onValueChange={(value) => setNewCompany({...newCompany, package: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select package" />
                          </SelectTrigger>
                          <SelectContent>
                            {SUBSCRIPTION_PACKAGES.map(pkg => (
                              <SelectItem key={pkg.id} value={pkg.id}>
                                {pkg.name} - ${pkg.price}/month ({pkg.maxUsers} users)
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <Button onClick={handleAddCompany} className="w-full">
                        Add Company
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredCompanies.map((company) => {
                const pkg = SUBSCRIPTION_PACKAGES.find(p => p.id === company.package);
                return (
                  <div key={company.id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-semibold">
                          {company.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{company.name}</h3>
                          <p className="text-sm text-gray-600">{company.email}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant={company.status === 'active' ? 'default' : 'destructive'}>
                              {company.status}
                            </Badge>
                            <Badge variant="outline">
                              {pkg?.name || 'Unknown'} Plan
                            </Badge>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right space-y-2">
                        <div className="flex items-center space-x-4">
                          <div>
                            <p className="text-sm text-gray-600">Users</p>
                            <p className="font-semibold">{company.activeUsers}/{pkg?.maxUsers || 0}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Revenue</p>
                            <p className="font-semibold text-green-600">${pkg?.price || 0}/mo</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Since</p>
                            <p className="font-semibold">{new Date(company.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => toggleCompanyStatus(company.id)}
                            className={company.status === 'active' ? 'text-red-600' : 'text-green-600'}
                          >
                            <Settings className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleDeleteCompany(company.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {filteredCompanies.length === 0 && (
                <div className="text-center py-12">
                  <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No companies found</h3>
                  <p className="text-gray-600 mb-4">
                    {searchQuery ? 'Try adjusting your search criteria.' : 'Get started by adding your first company.'}
                  </p>
                  {!searchQuery && (
                    <Button onClick={() => setShowAddDialog(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Company
                    </Button>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default SuperAdminDashboard;