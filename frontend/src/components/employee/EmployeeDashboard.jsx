import React, { useState, useEffect } from 'react';
import Layout from '../common/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { 
  Clock, 
  MapPin, 
  Camera, 
  Play, 
  Square, 
  Coffee,
  CheckCircle,
  AlertCircle,
  Wifi,
  WifiOff
} from 'lucide-react';
import { getCurrentAttendance, CURRENT_USER, COMPANIES } from '../../data/mock';

const EmployeeDashboard = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [attendance, setAttendance] = useState(getCurrentAttendance(CURRENT_USER.id));
  const [location, setLocation] = useState(null);
  const [isOnline, setIsOnline] = useState(true);
  const [showCamera, setShowCamera] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  
  const company = COMPANIES.find(c => c.id === CURRENT_USER.companyId);
  const settings = company?.settings || {};

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Simulate getting GPS location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy
          });
        },
        (error) => {
          console.error('Location error:', error);
        }
      );
    }

    return () => clearInterval(timer);
  }, []);

  const handleClockAction = (action) => {
    const now = new Date();
    const timeString = now.toTimeString().split(' ')[0];
    
    if (action === 'clockIn') {
      setAttendance({
        id: 'new-att',
        employeeId: CURRENT_USER.id,
        companyId: CURRENT_USER.companyId,
        date: now.toISOString().split('T')[0],
        checkIn: timeString,
        checkOut: null,
        gpsCheckIn: location,
        gpsCheckOut: null,
        status: 'active',
        syncStatus: isOnline ? 'synced' : 'pending'
      });
    } else if (action === 'clockOut') {
      setAttendance(prev => ({
        ...prev,
        checkOut: timeString,
        gpsCheckOut: location,
        status: 'completed',
        hoursWorked: 8.5, // Calculate actual hours
        syncStatus: isOnline ? 'synced' : 'pending'
      }));
    } else if (action === 'breakStart') {
      setAttendance(prev => ({
        ...prev,
        breakStart: timeString,
        status: 'on_break'
      }));
    } else if (action === 'breakEnd') {
      setAttendance(prev => ({
        ...prev,
        breakEnd: timeString,
        status: 'active'
      }));
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'on_break': return 'bg-yellow-500';
      case 'completed': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getNextAction = () => {
    if (!attendance) return 'clockIn';
    if (attendance.status === 'active' && settings.breakTracking) {
      return attendance.breakStart ? 'breakEnd' : 'breakStart';
    }
    if (attendance.status === 'on_break') return 'breakEnd';
    if (attendance.checkIn && !attendance.checkOut) return 'clockOut';
    return null;
  };

  const nextAction = getNextAction();

  return (
    <Layout title="Clock In/Out">
      <div className="space-y-6">
        {/* Current Time */}
        <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-6xl font-bold mb-2">
                {currentTime.toLocaleTimeString()}
              </div>
              <div className="text-xl opacity-90">
                {currentTime.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Offline Alert */}
        {!isOnline && (
          <Alert className="border-orange-200 bg-orange-50">
            <WifiOff className="h-4 w-4" />
            <AlertDescription>
              You're currently offline. Your attendance will be synced when you're back online.
            </AlertDescription>
          </Alert>
        )}

        {/* Current Status */}
        {attendance && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${getStatusColor(attendance.status)}`} />
                <span>Current Status</span>
                <Badge variant="outline" className="ml-auto">
                  {attendance.status.replace('_', ' ').toUpperCase()}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Check In</p>
                  <p className="font-semibold">{attendance.checkIn || 'Not clocked in'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Check Out</p>
                  <p className="font-semibold">{attendance.checkOut || 'Not clocked out'}</p>
                </div>
                {settings.breakTracking && (
                  <>
                    <div>
                      <p className="text-sm text-gray-600">Break Start</p>
                      <p className="font-semibold">{attendance.breakStart || 'No break'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Break End</p>
                      <p className="font-semibold">{attendance.breakEnd || 'No break'}</p>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Location Info */}
        {settings.gpsRequired && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="h-5 w-5" />
                <span>Location</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {location ? (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Location detected</span>
                  </div>
                  <p className="text-xs text-gray-600">
                    Lat: {location.lat.toFixed(6)}, Lng: {location.lng.toFixed(6)}
                  </p>
                  <p className="text-xs text-gray-600">
                    Accuracy: ±{location.accuracy}m
                  </p>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <span className="text-sm">Getting location...</span>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {nextAction && (
            <Card className="bg-gradient-to-br from-green-50 to-blue-50 border-green-200">
              <CardContent className="p-6">
                <div className="text-center space-y-4">
                  <div className="flex justify-center">
                    {nextAction === 'clockIn' && <Play className="h-12 w-12 text-green-600" />}
                    {nextAction === 'clockOut' && <Square className="h-12 w-12 text-red-600" />}
                    {nextAction === 'breakStart' && <Coffee className="h-12 w-12 text-yellow-600" />}
                    {nextAction === 'breakEnd' && <Play className="h-12 w-12 text-green-600" />}
                  </div>
                  <Button 
                    onClick={() => handleClockAction(nextAction)}
                    size="lg"
                    className={`w-full ${
                      nextAction === 'clockIn' ? 'bg-green-600 hover:bg-green-700' : 
                      nextAction === 'clockOut' ? 'bg-red-600 hover:bg-red-700' :
                      nextAction === 'breakStart' ? 'bg-yellow-600 hover:bg-yellow-700' :
                      'bg-green-600 hover:bg-green-700'
                    }`}
                  >
                    {nextAction === 'clockIn' && 'Clock In'}
                    {nextAction === 'clockOut' && 'Clock Out'}
                    {nextAction === 'breakStart' && 'Start Break'}
                    {nextAction === 'breakEnd' && 'End Break'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Photo Capture */}
          {settings.photoRequired && (
            <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
              <CardContent className="p-6">
                <div className="text-center space-y-4">
                  <div className="flex justify-center">
                    <Camera className="h-12 w-12 text-purple-600" />
                  </div>
                  <Button 
                    onClick={() => setShowCamera(true)}
                    size="lg"
                    variant="outline"
                    className="w-full border-purple-200 text-purple-600 hover:bg-purple-50"
                  >
                    Take Photo
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Today's Summary */}
        {attendance && (
          <Card>
            <CardHeader>
              <CardTitle>Today's Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-blue-600">
                    {attendance.hoursWorked || 0}h
                  </p>
                  <p className="text-sm text-gray-600">Hours Worked</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">
                    {attendance.overtimeHours || 0}h
                  </p>
                  <p className="text-sm text-gray-600">Overtime</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-purple-600">
                    {attendance.syncStatus === 'synced' ? '✓' : '⏳'}
                  </p>
                  <p className="text-sm text-gray-600">
                    {attendance.syncStatus === 'synced' ? 'Synced' : 'Pending'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default EmployeeDashboard;