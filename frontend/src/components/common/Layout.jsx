import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  User, 
  Settings, 
  LogOut, 
  Clock, 
  Users, 
  BarChart3, 
  Building, 
  Menu,
  Wifi,
  WifiOff
} from 'lucide-react';
import { CURRENT_USER } from '../../data/mock';

const Layout = ({ children, title }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOnline, setIsOnline] = React.useState(true);
  const [pendingSync, setPendingSync] = React.useState(2);

  const handleLogout = () => {
    navigate('/login');
  };

  const getNavItems = () => {
    switch (CURRENT_USER.role) {
      case 'super_admin':
        return [
          { path: '/super-admin', label: 'Companies', icon: Building },
          { path: '/super-admin/packages', label: 'Packages', icon: BarChart3 },
        ];
      case 'manager':
        return [
          { path: '/manager', label: 'Dashboard', icon: BarChart3 },
          { path: '/manager/employees', label: 'Employees', icon: Users },
          { path: '/manager/attendance', label: 'Attendance', icon: Clock },
          { path: '/manager/reports', label: 'Reports', icon: BarChart3 },
        ];
      case 'employee':
        return [
          { path: '/employee', label: 'Clock In/Out', icon: Clock },
          { path: '/employee/attendance', label: 'My Attendance', icon: BarChart3 },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Clock className="h-8 w-8 text-blue-600" />
                <h1 className="text-2xl font-bold text-gray-900">AttendanceApp</h1>
              </div>
              <Badge variant="outline" className="ml-4">
                {CURRENT_USER.role.replace('_', ' ').toUpperCase()}
              </Badge>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Online Status */}
              <div className="flex items-center space-x-2">
                {isOnline ? (
                  <Wifi className="h-5 w-5 text-green-600" />
                ) : (
                  <WifiOff className="h-5 w-5 text-red-600" />
                )}
                <span className="text-sm text-gray-600">
                  {isOnline ? 'Online' : 'Offline'}
                </span>
                {pendingSync > 0 && (
                  <Badge variant="destructive" className="text-xs">
                    {pendingSync} pending
                  </Badge>
                )}
              </div>
              
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleLogout}
                className="text-red-600 hover:text-red-700"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                    isActive
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-900">{title}</h2>
        </div>
        {children}
      </main>
    </div>
  );
};

export default Layout;