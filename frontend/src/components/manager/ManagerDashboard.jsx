import React, { useState } from 'react';
import Layout from '../common/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import {
  Users,
  Clock,
  TrendingUp,
  MapPin,
  Camera,
  Settings,
  Calendar,
  AlertTriangle
} from 'lucide-react';
import { EMPLOYEES, ATTENDANCE_RECORDS, CURRENT_USER, COMPANIES } from '../../data/mock';

const ManagerDashboard = () => {
  const company = COMPANIES.find(c => c.id === CURRENT_USER.companyId);
  const employees = EMPLOYEES.filter(emp => emp.companyId === CURRENT_USER.companyId);
  const todayRecords = ATTENDANCE_RECORDS.filter(record => 
    record.companyId === CURRENT_USER.companyId && 
    record.date === new Date().toISOString().split('T')[0]
  );

  const stats = {
    totalEmployees: employees.length,
    presentToday: todayRecords.filter(r => r.checkIn).length,
    onBreak: todayRecords.filter(r => r.status === 'on_break').length,
    pendingSync: todayRecords.filter(r => r.syncStatus === 'pending').length
  };

  const toggleSetting = (setting) => {
    // Mock toggle functionality
    console.log(`Toggling ${setting}`);
  };

  return (
    <Layout title="Manager Dashboard">
      <div className="space-y-6">
        {/* Company Info */}
        <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">{company?.name}</h2>
                <p className="opacity-90">Package: {company?.package}</p>
              </div>
              <Badge variant="secondary" className="bg-white/20 text-white">
                {company?.activeUsers}/{company?.package === 'basic' ? 5 : company?.package === 'standard' ? 15 : company?.package === 'premium' ? 30 : company?.package === 'enterprise' ? 50 : 999} Users
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-100 rounded-full">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-600">{stats.totalEmployees}</p>
                  <p className="text-sm text-gray-600">Total Employees</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-green-100 rounded-full">
                  <Clock className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">{stats.presentToday}</p>
                  <p className="text-sm text-gray-600">Present Today</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-yellow-100 rounded-full">
                  <TrendingUp className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-yellow-600">{stats.onBreak}</p>
                  <p className="text-sm text-gray-600">On Break</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-red-100 rounded-full">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-red-600">{stats.pendingSync}</p>
                  <p className="text-sm text-gray-600">Pending Sync</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Attendance Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="h-5 w-5" />
              <span>Attendance Settings</span>
            </CardTitle>
            <CardDescription>
              Configure attendance requirements for your employees
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium">GPS Tracking</p>
                    <p className="text-sm text-gray-600">Require location for check-in</p>
                  </div>
                </div>
                <Button
                  variant={company?.settings.gpsRequired ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleSetting('gpsRequired')}
                >
                  {company?.settings.gpsRequired ? 'ON' : 'OFF'}
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Camera className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="font-medium">Photo Verification</p>
                    <p className="text-sm text-gray-600">Require photo on check-in</p>
                  </div>
                </div>
                <Button
                  variant={company?.settings.photoRequired ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleSetting('photoRequired')}
                >
                  {company?.settings.photoRequired ? 'ON' : 'OFF'}
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Clock className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium">Break Tracking</p>
                    <p className="text-sm text-gray-600">Enable break time tracking</p>
                  </div>
                </div>
                <Button
                  variant={company?.settings.breakTracking ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleSetting('breakTracking')}
                >
                  {company?.settings.breakTracking ? 'ON' : 'OFF'}
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <TrendingUp className="h-5 w-5 text-orange-600" />
                  <div>
                    <p className="font-medium">Overtime Calculation</p>
                    <p className="text-sm text-gray-600">Auto calculate overtime hours</p>
                  </div>
                </div>
                <Button
                  variant={company?.settings.overtimeCalc ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleSetting('overtimeCalc')}
                >
                  {company?.settings.overtimeCalc ? 'ON' : 'OFF'}
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-indigo-600" />
                  <div>
                    <p className="font-medium">Geofencing</p>
                    <p className="text-sm text-gray-600">Restrict check-in locations</p>
                  </div>
                </div>
                <Button
                  variant={company?.settings.geofencing ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleSetting('geofencing')}
                >
                  {company?.settings.geofencing ? 'ON' : 'OFF'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest employee check-ins and check-outs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {todayRecords.slice(0, 5).map((record) => {
                const employee = employees.find(emp => emp.id === record.employeeId);
                return (
                  <div key={record.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {employee?.firstName[0]}{employee?.lastName[0]}
                      </div>
                      <div>
                        <p className="font-medium">{employee?.firstName} {employee?.lastName}</p>
                        <p className="text-sm text-gray-600">{employee?.department}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        {record.checkOut ? `${record.checkIn} - ${record.checkOut}` : `In at ${record.checkIn}`}
                      </p>
                      <Badge variant={record.status === 'completed' ? 'default' : record.status === 'active' ? 'secondary' : 'outline'}>
                        {record.status}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default ManagerDashboard;