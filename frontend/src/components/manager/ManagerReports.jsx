import React, { useState } from 'react';
import Layout from '../common/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Calendar } from '../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { 
  Calendar as CalendarIcon,
  Download,
  BarChart3,
  TrendingUp,
  Users,
  Clock,
  FileText,
  PieChart
} from 'lucide-react';
import { EMPLOYEES, ATTENDANCE_RECORDS, CURRENT_USER } from '../../data/mock';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';

const ManagerReports = () => {
  const [dateRange, setDateRange] = useState({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date())
  });

  const employees = EMPLOYEES.filter(emp => emp.companyId === CURRENT_USER.companyId);
  const attendanceRecords = ATTENDANCE_RECORDS.filter(record => 
    record.companyId === CURRENT_USER.companyId &&
    record.date >= format(dateRange.from, 'yyyy-MM-dd') &&
    record.date <= format(dateRange.to, 'yyyy-MM-dd')
  );

  const generateSummaryReport = () => {
    const totalWorkDays = attendanceRecords.length;
    const totalHours = attendanceRecords.reduce((sum, r) => sum + (r.hoursWorked || 0), 0);
    const totalOvertime = attendanceRecords.reduce((sum, r) => sum + (r.overtimeHours || 0), 0);
    const averageHours = totalWorkDays > 0 ? (totalHours / totalWorkDays).toFixed(1) : 0;
    
    const employeeStats = employees.map(emp => {
      const empRecords = attendanceRecords.filter(r => r.employeeId === emp.id);
      const empHours = empRecords.reduce((sum, r) => sum + (r.hoursWorked || 0), 0);
      const empOvertime = empRecords.reduce((sum, r) => sum + (r.overtimeHours || 0), 0);
      
      return {
        employee: emp,
        totalDays: empRecords.length,
        totalHours: empHours,
        overtimeHours: empOvertime,
        averageHours: empRecords.length > 0 ? (empHours / empRecords.length).toFixed(1) : 0
      };
    });

    return {
      totalWorkDays,
      totalHours,
      totalOvertime,
      averageHours,
      employeeStats
    };
  };

  const generateDepartmentReport = () => {
    const departments = [...new Set(employees.map(emp => emp.department))];
    
    return departments.map(dept => {
      const deptEmployees = employees.filter(emp => emp.department === dept);
      const deptRecords = attendanceRecords.filter(r => 
        deptEmployees.some(emp => emp.id === r.employeeId)
      );
      
      const totalHours = deptRecords.reduce((sum, r) => sum + (r.hoursWorked || 0), 0);
      const totalOvertime = deptRecords.reduce((sum, r) => sum + (r.overtimeHours || 0), 0);
      
      return {
        department: dept,
        employeeCount: deptEmployees.length,
        totalHours,
        totalOvertime,
        averageHours: deptRecords.length > 0 ? (totalHours / deptRecords.length).toFixed(1) : 0
      };
    });
  };

  const summaryReport = generateSummaryReport();
  const departmentReport = generateDepartmentReport();

  const exportReport = (type, format) => {
    console.log(`Exporting ${type} report as ${format}`);
  };

  return (
    <Layout title="Reports & Analytics">
      <div className="space-y-6">
        {/* Date Range Selector */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span>Report Period</span>
            </CardTitle>
            <CardDescription>Select the date range for your reports</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">From:</span>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-[140px] justify-start text-left">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(dateRange.from, 'MMM dd')}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dateRange.from}
                      onSelect={(date) => setDateRange(prev => ({ ...prev, from: date }))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">To:</span>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-[140px] justify-start text-left">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(dateRange.to, 'MMM dd')}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dateRange.to}
                      onSelect={(date) => setDateRange(prev => ({ ...prev, to: date }))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="flex gap-2 ml-auto">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setDateRange({
                    from: subDays(new Date(), 7),
                    to: new Date()
                  })}
                >
                  Last 7 Days
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setDateRange({
                    from: startOfMonth(new Date()),
                    to: endOfMonth(new Date())
                  })}
                >
                  This Month
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reports Tabs */}
        <Tabs defaultValue="summary" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="summary">Summary Report</TabsTrigger>
            <TabsTrigger value="employee">Employee Report</TabsTrigger>
            <TabsTrigger value="department">Department Report</TabsTrigger>
          </TabsList>

          {/* Summary Report */}
          <TabsContent value="summary" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Attendance Summary</CardTitle>
                    <CardDescription>
                      Overview for {format(dateRange.from, 'MMM dd')} - {format(dateRange.to, 'MMM dd, yyyy')}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => exportReport('summary', 'pdf')}>
                      <Download className="h-4 w-4 mr-2" />
                      PDF
                    </Button>
                    <Button variant="outline" onClick={() => exportReport('summary', 'excel')}>
                      <Download className="h-4 w-4 mr-2" />
                      Excel
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="text-center p-6 bg-blue-50 rounded-lg">
                    <Clock className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <p className="text-3xl font-bold text-blue-600">{summaryReport.totalHours}</p>
                    <p className="text-sm text-gray-600">Total Hours</p>
                  </div>
                  
                  <div className="text-center p-6 bg-green-50 rounded-lg">
                    <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <p className="text-3xl font-bold text-green-600">{summaryReport.averageHours}</p>
                    <p className="text-sm text-gray-600">Avg Hours/Day</p>
                  </div>
                  
                  <div className="text-center p-6 bg-orange-50 rounded-lg">
                    <BarChart3 className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                    <p className="text-3xl font-bold text-orange-600">{summaryReport.totalOvertime}</p>
                    <p className="text-sm text-gray-600">Overtime Hours</p>
                  </div>
                  
                  <div className="text-center p-6 bg-purple-50 rounded-lg">
                    <Users className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                    <p className="text-3xl font-bold text-purple-600">{employees.length}</p>
                    <p className="text-sm text-gray-600">Total Employees</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Employee Report */}
          <TabsContent value="employee" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Employee Performance</CardTitle>
                    <CardDescription>Individual employee attendance metrics</CardDescription>
                  </div>
                  <Button variant="outline" onClick={() => exportReport('employee', 'excel')}>
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {summaryReport.employeeStats.map((stat) => (
                    <div key={stat.employee.id} className="p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                            {stat.employee.firstName[0]}{stat.employee.lastName[0]}
                          </div>
                          <div>
                            <h3 className="font-semibold">{stat.employee.firstName} {stat.employee.lastName}</h3>
                            <p className="text-sm text-gray-600">{stat.employee.department}</p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-4 gap-6 text-center">
                          <div>
                            <p className="text-lg font-bold text-blue-600">{stat.totalDays}</p>
                            <p className="text-xs text-gray-600">Days</p>
                          </div>
                          <div>
                            <p className="text-lg font-bold text-green-600">{stat.totalHours}h</p>
                            <p className="text-xs text-gray-600">Total</p>
                          </div>
                          <div>
                            <p className="text-lg font-bold text-orange-600">{stat.overtimeHours}h</p>
                            <p className="text-xs text-gray-600">Overtime</p>
                          </div>
                          <div>
                            <p className="text-lg font-bold text-purple-600">{stat.averageHours}h</p>
                            <p className="text-xs text-gray-600">Avg/Day</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Department Report */}
          <TabsContent value="department" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Department Analysis</CardTitle>
                    <CardDescription>Attendance metrics by department</CardDescription>
                  </div>
                  <Button variant="outline" onClick={() => exportReport('department', 'pdf')}>
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {departmentReport.map((dept) => (
                    <Card key={dept.department} className="bg-gradient-to-br from-gray-50 to-gray-100">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg">{dept.department}</CardTitle>
                        <Badge variant="outline">{dept.employeeCount} employees</Badge>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Total Hours:</span>
                            <span className="font-semibold">{dept.totalHours}h</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Overtime:</span>
                            <span className="font-semibold text-orange-600">{dept.totalOvertime}h</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Avg Hours/Day:</span>
                            <span className="font-semibold text-blue-600">{dept.averageHours}h</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default ManagerReports;