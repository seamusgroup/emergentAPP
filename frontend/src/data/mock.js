// Mock data for Employee Attendance System

export const SUBSCRIPTION_PACKAGES = [
  { id: 'basic', name: 'Basic', maxUsers: 5, price: 29.99 },
  { id: 'standard', name: 'Standard', maxUsers: 15, price: 79.99 },
  { id: 'premium', name: 'Premium', maxUsers: 30, price: 149.99 },
  { id: 'enterprise', name: 'Enterprise', maxUsers: 50, price: 299.99 },
  { id: 'unlimited', name: 'Unlimited', maxUsers: 999, price: 499.99 }
];

export const COMPANIES = [
  {
    id: 'comp1',
    name: 'Tech Solutions Inc.',
    email: 'admin@techsolutions.com',
    package: 'standard',
    activeUsers: 12,
    status: 'active',
    createdAt: '2024-01-15',
    settings: {
      gpsRequired: true,
      geofencing: true,
      photoRequired: false,
      breakTracking: true,
      overtimeCalc: true
    }
  },
  {
    id: 'comp2',
    name: 'Marketing Pro LLC',
    email: 'admin@marketingpro.com',
    package: 'basic',
    activeUsers: 4,
    status: 'active',
    createdAt: '2024-02-20',
    settings: {
      gpsRequired: false,
      geofencing: false,
      photoRequired: true,
      breakTracking: false,
      overtimeCalc: true
    }
  }
];

export const EMPLOYEES = [
  {
    id: 'emp1',
    companyId: 'comp1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@techsolutions.com',
    role: 'employee',
    department: 'Engineering',
    shift: 'morning',
    status: 'active',
    joinDate: '2024-01-20',
    biometricsEnabled: true,
    twoFactorEnabled: false
  },
  {
    id: 'emp2',
    companyId: 'comp1',
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane.smith@techsolutions.com',
    role: 'manager',
    department: 'Engineering',
    shift: 'morning',
    status: 'active',
    joinDate: '2024-01-25',
    biometricsEnabled: true,
    twoFactorEnabled: true
  },
  {
    id: 'emp3',
    companyId: 'comp2',
    firstName: 'Mike',
    lastName: 'Johnson',
    email: 'mike@marketingpro.com',
    role: 'employee',
    department: 'Marketing',
    shift: 'flexible',
    status: 'active',
    joinDate: '2024-03-01',
    biometricsEnabled: false,
    twoFactorEnabled: false
  }
];

export const ATTENDANCE_RECORDS = [
  {
    id: 'att1',
    employeeId: 'emp1',
    companyId: 'comp1',
    date: '2024-06-15',
    checkIn: '09:00:00',
    checkOut: '17:30:00',
    breakStart: '12:00:00',
    breakEnd: '13:00:00',
    gpsCheckIn: { lat: 40.7128, lng: -74.0060 },
    gpsCheckOut: { lat: 40.7128, lng: -74.0060 },
    photoCheckIn: null,
    photoCheckOut: null,
    hoursWorked: 7.5,
    overtimeHours: 0,
    status: 'completed',
    syncStatus: 'synced'
  },
  {
    id: 'att2',
    employeeId: 'emp1',
    companyId: 'comp1',
    date: '2024-06-14',
    checkIn: '08:45:00',
    checkOut: '18:00:00',
    breakStart: '12:30:00',
    breakEnd: '13:30:00',
    gpsCheckIn: { lat: 40.7128, lng: -74.0060 },
    gpsCheckOut: { lat: 40.7128, lng: -74.0060 },
    photoCheckIn: null,
    photoCheckOut: null,
    hoursWorked: 8.25,
    overtimeHours: 0.25,
    status: 'completed',
    syncStatus: 'synced'
  },
  {
    id: 'att3',
    employeeId: 'emp2',
    companyId: 'comp1',
    date: '2024-06-15',
    checkIn: '08:30:00',
    checkOut: null,
    breakStart: null,
    breakEnd: null,
    gpsCheckIn: { lat: 40.7128, lng: -74.0060 },
    gpsCheckOut: null,
    photoCheckIn: null,
    photoCheckOut: null,
    hoursWorked: 0,
    overtimeHours: 0,
    status: 'active',
    syncStatus: 'pending'
  }
];

export const SHIFTS = [
  {
    id: 'shift1',
    companyId: 'comp1',
    name: 'Morning Shift',
    startTime: '09:00',
    endTime: '17:00',
    breakDuration: 60,
    isActive: true
  },
  {
    id: 'shift2',
    companyId: 'comp1',
    name: 'Evening Shift',
    startTime: '14:00',
    endTime: '22:00',
    breakDuration: 60,
    isActive: true
  },
  {
    id: 'shift3',
    companyId: 'comp1',
    name: 'Flexible',
    startTime: '00:00',
    endTime: '23:59',
    breakDuration: 60,
    isActive: true
  }
];

export const CURRENT_USER = {
  id: 'emp1',
  role: 'employee', // 'super_admin', 'manager', 'employee'
  companyId: 'comp1',
  isOnline: true
};

// Utility functions
export const getCurrentAttendance = (employeeId) => {
  const today = new Date().toISOString().split('T')[0];
  return ATTENDANCE_RECORDS.find(
    record => record.employeeId === employeeId && record.date === today
  );
};

export const getEmployeesByCompany = (companyId) => {
  return EMPLOYEES.filter(emp => emp.companyId === companyId);
};

export const getAttendanceByEmployee = (employeeId, startDate, endDate) => {
  return ATTENDANCE_RECORDS.filter(
    record => record.employeeId === employeeId &&
    record.date >= startDate &&
    record.date <= endDate
  );
};

export const calculateTotalHours = (records) => {
  return records.reduce((total, record) => total + record.hoursWorked, 0);
};

export const calculateOvertimeHours = (records) => {
  return records.reduce((total, record) => total + record.overtimeHours, 0);
};