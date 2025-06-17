import React, { useState } from 'react';
import Layout from '../common/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Calendar } from '../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { 
  Calendar as CalendarIcon,
  Download,
  Search,
  Filter,
  Clock,
  MapPin,
  Users,
  TrendingUp
} from 'lucide-react';
import { EMPLOYEES, ATTENDANCE_RECORDS, CURRENT_USER } from '../../data/mock';
import { format } from 'date-fns';

const ManagerAttendance = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const employees = EMPLOYEES.filter(emp => emp.companyId === CURRENT_USER.companyId);
  const attendanceRecords = ATTENDANCE_RECORDS.filter(record => 
    record.companyId === CURRENT_USER.companyId
  );

  const todayRecords = attendanceRecords.filter(record => 
    record.date === format(selectedDate, 'yyyy-MM-dd')
  );

  const filteredRecords = todayRecords.filter(record => {
    const employee = employees.find(emp => emp.id === record.employeeId);
    const matchesSearch = employee && (
      employee.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.department.toLowerCase().includes(searchQuery.toLowerCase())
    );
    const matchesStatus = filterStatus === 'all' || record.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'active': return 'bg-blue-100 text-blue-800';
      case 'on_break': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const calculateStats = () => {
    const totalEmployees = employees.length;
    const presentToday = todayRecords.filter(r => r.checkIn).length;
    const totalHours = todayRecords.reduce((sum, r) => sum + (r.hoursWorked || 0), 0);
    const totalOvertime = todayRecords.reduce((sum, r) => sum + (r.overtimeHours || 0), 0);

    return {
      totalEmployees,
      presentToday,
      averageHours: presentToday > 0 ? (totalHours / presentToday).toFixed(1) : 0,
      totalOvertime: totalOvertime.toFixed(1)
    };
  };

  const stats = calculateStats();

  const exportData = (format) => {
    // Mock export functionality
    console.log(`Exporting attendance data as ${format}`);
  };

  return (
    <Layout title="Attendance Tracking">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-100 rounded-full">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-600">{stats.presentToday}/{stats.totalEmployees}</p>
                  <p className="text-sm text-gray-600">Present Today</p>
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
                  <p className="text-2xl font-bold text-green-600">{stats.averageHours}h</p>
                  <p className="text-sm text-gray-600">Avg Hours</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-orange-100 rounded-full">
                  <TrendingUp className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-orange-600">{stats.totalOvertime}h</p>
                  <p className="text-sm text-gray-600">Total Overtime</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-purple-100 rounded-full">
                  <MapPin className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-purple-600">
                    {todayRecords.filter(r => r.gpsCheckIn).length}
                  </p>
                  <p className="text-sm text-gray-600">With GPS</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Actions */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div>
                <CardTitle>Daily Attendance</CardTitle>
                <CardDescription>
                  View and manage employee attendance for {format(selectedDate, 'MMMM dd, yyyy')}
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => exportData('pdf')}>
                  <Download className="h-4 w-4 mr-2" />
                  Export PDF
                </Button>
                <Button variant="outline" onClick={() => exportData('excel')}>
                  <Download className="h-4 w-4 mr-2" />
                  Export Excel
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search employees..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="on_break">On Break</option>
              </select>
              
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(selectedDate, 'MMM dd, yyyy')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Attendance Table */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Check In</TableHead>
                    <TableHead>Check Out</TableHead>
                    <TableHead>Break</TableHead>
                    <TableHead>Hours</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Location</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecords.map((record) => {
                    const employee = employees.find(emp => emp.id === record.employeeId);
                    return (
                      <TableRow key={record.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                              {employee?.firstName[0]}{employee?.lastName[0]}
                            </div>
                            <div>
                              <p className="font-medium">{employee?.firstName} {employee?.lastName}</p>
                              <p className="text-sm text-gray-600">{employee?.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{employee?.department}</TableCell>
                        <TableCell>{record.checkIn || '-'}</TableCell>
                        <TableCell>{record.checkOut || '-'}</TableCell>
                        <TableCell>
                          {record.breakStart && record.breakEnd 
                            ? `${record.breakStart} - ${record.breakEnd}`
                            : record.breakStart 
                            ? `Started at ${record.breakStart}`
                            : '-'
                          }
                        </TableCell>
                        <TableCell>
                          <div>
                            <span className="font-medium">{record.hoursWorked || 0}h</span>
                            {record.overtimeHours > 0 && (
                              <span className="text-orange-600 ml-2">+{record.overtimeHours}h OT</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(record.status)}>
                            {record.status.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {record.gpsCheckIn ? (
                            <div className="flex items-center space-x-1">
                              <MapPin className="h-4 w-4 text-green-600" />
                              <span className="text-sm text-green-600">Verified</span>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">No GPS</span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              
              {filteredRecords.length === 0 && (
                <div className="text-center py-12">
                  <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No attendance records</h3>
                  <p className="text-gray-600">
                    {searchQuery ? 'Try adjusting your search criteria.' : 'No attendance data for the selected date.'}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default ManagerAttendance;