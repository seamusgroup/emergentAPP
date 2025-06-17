import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { Clock, Fingerprint, Eye, EyeOff } from 'lucide-react';
import { EMPLOYEES, COMPANIES } from '../../data/mock';

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
    companyCode: ''
  });
  const [authMethod, setAuthMethod] = useState('password');

  const handleLogin = (e) => {
    e.preventDefault();
    
    // Mock authentication logic
    const user = EMPLOYEES.find(emp => emp.email === credentials.email);
    if (user) {
      // Simulate successful login
      if (user.role === 'employee') {
        navigate('/employee');
      } else if (user.role === 'manager') {
        navigate('/manager');
      }
    } else if (credentials.email === 'superadmin@system.com') {
      navigate('/super-admin');
    }
  };

  const handleBiometricAuth = () => {
    // Simulate biometric authentication
    setTimeout(() => {
      navigate('/employee');
    }, 1000);
  };

  const demoUsers = [
    { email: 'john.doe@techsolutions.com', role: 'Employee', password: 'demo123' },
    { email: 'jane.smith@techsolutions.com', role: 'Manager', password: 'demo123' },
    { email: 'superadmin@system.com', role: 'Super Admin', password: 'admin123' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo */}
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Clock className="h-12 w-12 text-white" />
            <h1 className="text-4xl font-bold text-white">AttendanceApp</h1>
          </div>
          <p className="text-blue-100">Employee Attendance Management System</p>
        </div>

        {/* Demo Users Info */}
        <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Demo Users</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {demoUsers.map((user, index) => (
              <div key={index} className="flex items-center justify-between text-xs">
                <span>{user.email}</span>
                <Badge variant="secondary" className="text-xs">
                  {user.role}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Login Form */}
        <Card className="bg-white/95 backdrop-blur-sm shadow-2xl">
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>
              Choose your preferred authentication method
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={authMethod} onValueChange={setAuthMethod}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="password">Password</TabsTrigger>
                <TabsTrigger value="biometric">Biometric</TabsTrigger>
              </TabsList>
              
              <TabsContent value="password" className="space-y-4">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={credentials.email}
                      onChange={(e) => setCredentials({...credentials, email: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter your password"
                        value={credentials.password}
                        onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                        required
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  
                  <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                    Sign In
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="biometric" className="space-y-4">
                <div className="text-center space-y-4">
                  <div className="flex items-center justify-center">
                    <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <Fingerprint className="h-12 w-12 text-white" />
                    </div>
                  </div>
                  <p className="text-gray-600">
                    Place your finger on the sensor or use Face ID to authenticate
                  </p>
                  <Button 
                    onClick={handleBiometricAuth}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    <Fingerprint className="h-4 w-4 mr-2" />
                    Authenticate with Biometrics
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;