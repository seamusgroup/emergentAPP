import React, { useState } from 'react';
import Layout from '../common/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Calendar } from '../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  TrendingUp, 
  MapPin,
  Download,
  Coffee
} from 'lucide-react';
import { ATTENDANCE_RECORDS, CURRENT_USER } from '../../data/mock';
import { format, startOfMonth, endOfMonth, subDays } from 'date-fns';

const EmployeeAttendance = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewPeriod, setViewPeriod] = useState('month');

  const getDateRange = () => {
    switch (viewPeriod) {
      case 'week':
        return {
          from: subDays(new Date(), 7),
          to: new Date()
        };
      case 'month':
        return {
          from: startOfMonth(new Date()),
          to: endOfMonth(new Date())
        };
      default:
        return {
          from: startOfMonth(new Date()),
          to: endOfMonth(new Date())
        };
    }
  };

  const dateRange = getDateRange();
  const myAttendance = ATTENDANCE_RECORDS.filter(record => 
    record.employeeId === CURRENT_USER.id &&
    record.date >= format(dateRange.from, 'yyyy-MM-dd') &&
    record.date <= format(dateRange.to, 'yyyy-MM-dd')
  );

  const calculateStats = () => {
    const totalDays = myAttendance.length;
    const totalHours = myAttendance.reduce((sum, r) => sum + (r.hoursWorked || 0), 0);
    const totalOvertime = myAttendance.reduce((sum, r) => sum + (r.overtimeHours || 0), 0);
    const averageHours = totalDays > 0 ? (totalHours / totalDays).toFixed(1) : 0;
    const punctualDays = myAttendance.filter(r => r.checkIn <= '09:00:00').length;

    return {
      totalDays,
      totalHours,
      totalOvertime,
      averageHours,
      punctualDays,
      punctualityRate: totalDays > 0 ? Math.round((punctualDays / totalDays) * 100) : 0
    };
  };

  const stats = calculateStats();

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'active': return 'bg-blue-100 text-blue-800';
      case 'on_break': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const exportMyData = () => {
    console.log('Exporting employee attendance data');
  };

  return (
    <Layout title="My Attendance">
      <div className="space-y-6">
        {/* Period Selector */}
        <Card>
          <CardHeader>
            <CardTitle>Attendance History</CardTitle>
            <CardDescription>View your attendance records and statistics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="flex gap-2">
                <Button
                  variant={viewPeriod === 'week' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewPeriod('week')}
                >
                  Last 7 Days
                </Button>
                <Button
                  variant={viewPeriod === 'month' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewPeriod('month')}
                >
                  This Month
                </Button>
              </div>
              
              <Button variant="outline" onClick={exportMyData}>
                <Download className="h-4 w-4 mr-2" />
                Export My Data
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-500 rounded-full">
                  <Clock className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-700">{stats.totalHours}h</p>
                  <p className="text-sm text-blue-600">Total Hours</p>
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
                  <p className="text-2xl font-bold text-green-700">{stats.averageHours}h</p>
                  <p className="text-sm text-green-600">Avg per Day</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-orange-500 rounded-full">
                  <Clock className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-orange-700">{stats.totalOvertime}h</p>
                  <p className="text-sm text-orange-600">Overtime</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-purple-500 rounded-full">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-purple-700">{stats.punctualityRate}%</p>
                  <p className="text-sm text-purple-600">Punctuality</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Attendance Records */}
        <Card>
          <CardHeader>
            <CardTitle>Daily Records</CardTitle>
            <CardDescription>
              Your attendance records for {format(dateRange.from, 'MMM dd')} - {format(dateRange.to, 'MMM dd, yyyy')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {myAttendance.slice().reverse().map((record) => (
                <div key={record.id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="text-center min-w-[60px]">
                        <p className="text-lg font-bold">{new Date(record.date).getDate()}</p>
                        <p className="text-xs text-gray-600 uppercase">
                          {format(new Date(record.date), 'MMM')}
                        </p>
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex items-center space-x-6">
                          <div>
                            <p className="text-sm text-gray-600">Check In</p>
                            <p className="font-semibold">{record.checkIn || '-'}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Check Out</p>
                            <p className="font-semibold">{record.checkOut || '-'}</p>
                          </div>
                          {record.breakStart && (
                            <div>
                              <p className="text-sm text-gray-600">Break</p>
                              <p className="font-semibold flex items-center">
                                <Coffee className="h-3 w-3 mr-1" />
                                {record.breakStart} - {record.breakEnd || 'Active'}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right space-y-2">
                      <div className="flex items-center space-x-4">
                        <div>
                          <p className="text-sm text-gray-600">Hours</p>
                          <p className="font-bold text-lg">{record.hoursWorked || 0}h</p>
                          {record.overtimeHours > 0 && (
                            <p className="text-xs text-orange-600">+{record.overtimeHours}h OT</p>
                          )}
                        </div>
                        
                        <div className="space-y-1">
                          <Badge className={getStatusColor(record.status)}>
                            {record.status.replace('_', ' ')}
                          </Badge>
                          {record.gpsCheckIn && (
                            <div className="flex items-center space-x-1">
                              <MapPin className="h-3 w-3 text-green-600" />
                              <span className="text-xs text-green-600">GPS</span>
                            </div>
                          )}
                          {record.syncStatus === 'pending' && (
                            <Badge variant="outline" className="text-xs">
                              Pending Sync
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {myAttendance.length === 0 && (
                <div className="text-center py-12">
                  <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No attendance records</h3>
                  <p className="text-gray-600">No attendance data found for the selected period.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default EmployeeAttendance;