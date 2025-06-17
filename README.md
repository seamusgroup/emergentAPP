# AttendanceApp - Employee Attendance Management System

A comprehensive cross-platform employee attendance management system with GPS tracking, photo verification, and real-time synchronization.

## 🚀 Features

### 📱 **Cross-Platform Support**
- **iOS Native App** - Built with React Native + Expo
- **Android Native App** - Built with React Native + Expo
- **Web Application** - React Native Web support
- **Real-time Sync** - Offline-first with automatic synchronization

### 🔐 **Multi-Role System**
- **Super Admin** - Manage companies and subscriptions
- **Manager** - Manage employees and view reports
- **Employee** - Clock in/out with location and photo verification

### 📍 **Advanced Location Features**
- **GPS Tracking** - Real-time location capture
- **Geofencing** - Restrict clock-in to specific areas
- **Distance Calculation** - Automatic location validation
- **Offline Support** - Works without internet connection

### 📸 **Photo Verification**
- **Camera Integration** - Take photos during clock-in/out
- **Base64 Storage** - Efficient image storage
- **Optional Feature** - Configurable by company settings

### 🔒 **Security & Authentication**
- **JWT Authentication** - Secure token-based auth
- **Biometric Support** - Face ID, Touch ID, Fingerprint
- **Role-based Access** - Granular permission system
- **Data Encryption** - Secure data transmission

## 🛠️ **Technology Stack**

### **Frontend (Mobile & Web)**
- **React Native** - Cross-platform mobile development
- **Expo** - Development and build platform
- **React Navigation** - Native navigation
- **AsyncStorage** - Local data persistence
- **React Native Paper** - Material Design components

### **Backend (API Server)**
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB
- **JWT** - JSON Web Tokens for authentication
- **Bcrypt** - Password hashing

### **Native Features**
- **expo-location** - GPS and location services
- **expo-camera** - Camera and photo capture
- **expo-local-authentication** - Biometric authentication
- **expo-notifications** - Push notifications
- **expo-secure-store** - Secure credential storage

## 📦 **Installation & Setup**

### **Prerequisites**
- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (for iOS development)
- Android Studio (for Android development)

### **Backend Setup**
```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env with your configuration
nano .env

# Start MongoDB (if running locally)
mongod

# Start the backend server
npm run dev
```

### **Frontend Setup**
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start Expo development server
expo start

# Choose your platform:
# - Press 'i' for iOS simulator
# - Press 'a' for Android emulator
# - Scan QR code with Expo Go app on your phone
```

### **Environment Configuration**

**Backend (.env):**
```env
MONGO_URL=mongodb://localhost:27017/attendance_app
JWT_SECRET=your-super-secret-jwt-key
PORT=8001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

**Frontend (.env):**
```env
REACT_APP_BACKEND_URL=http://localhost:8001
```

## 🎮 **Demo Users**

### **Login Credentials**
- **Employee**: `john.doe@techsolutions.com` / `demo123`
- **Manager**: `jane.smith@techsolutions.com` / `demo123`
- **Super Admin**: `superadmin@system.com` / `admin123`

## 📱 **How to Test Native Features**

### **1. GPS Location Tracking**
1. Login as an employee
2. Press "Clock In" button
3. Allow location permissions when prompted
4. View captured GPS coordinates

### **2. Camera Photo Verification**
1. Enable photo requirement in company settings
2. Press "Clock In" button
3. Take a photo when prompted
4. Photo is stored as base64 in database

### **3. Biometric Authentication**
1. Enable biometrics in device settings
2. Use "Biometric Login" on login screen
3. Authenticate with Face ID/Touch ID/Fingerprint

### **4. Offline Functionality**
1. Disconnect from internet
2. Clock in/out normally
3. Data is stored locally
4. Automatically syncs when connection restored

## 🔄 **Data Synchronization**

### **How Sync Works**
1. **Offline First** - All actions work without internet
2. **Local Storage** - Data saved in AsyncStorage/SecureStore
3. **Auto Sync** - Automatically syncs when online
4. **Conflict Resolution** - Server timestamp wins conflicts
5. **Batch Upload** - Multiple records synced together

### **Sync Endpoints**
- `POST /api/attendance/sync` - Bulk sync attendance records
- `GET /api/attendance/my-attendance` - Get server attendance data
- `POST /api/attendance/clock-in` - Real-time clock in
- `POST /api/attendance/clock-out` - Real-time clock out

## 🏗️ **Architecture Overview**

```
┌─────────────────────┐    ┌─────────────────────┐    ┌─────────────────────┐
│                     │    │                     │    │                     │
│   React Native      │◄──►│    Node.js API      │◄──►│     MongoDB         │
│   (iOS/Android)     │    │    (Express)        │    │    (Database)       │
│                     │    │                     │    │                     │
└─────────────────────┘    └─────────────────────┘    └─────────────────────┘
          │                           │                           │
          │                           │                           │
          ▼                           ▼                           ▼
┌─────────────────────┐    ┌─────────────────────┐    ┌─────────────────────┐
│                     │    │                     │    │                     │
│   Local Storage     │    │   JWT Auth          │    │   Data Models       │
│   (AsyncStorage)    │    │   Role-based ACL    │    │   Indexes           │
│   Offline Queue     │    │   Rate Limiting     │    │   Aggregations      │
│                     │    │                     │    │                     │
└─────────────────────┘    └─────────────────────┘    └─────────────────────┘
```

## 🔧 **Configuration Options**

### **Company Settings**
```javascript
{
  attendance: {
    gpsRequired: true,        // Require GPS for clock-in
    photoRequired: false,     // Require photo verification
    geofencing: {
      enabled: true,          // Enable location restrictions
      radius: 100,            // Geofence radius in meters
      locations: [...]        // Allowed locations
    },
    breakTracking: true,      // Enable break time tracking
    overtimeCalculation: true // Auto-calculate overtime
  }
}
```

## 📊 **API Endpoints**

### **Authentication**
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/verify` - Verify JWT token
- `POST /api/auth/refresh` - Refresh JWT token

### **Attendance**
- `POST /api/attendance/clock-in` - Clock in with location/photo
- `POST /api/attendance/clock-out` - Clock out
- `POST /api/attendance/break/start` - Start break
- `POST /api/attendance/break/end` - End break
- `POST /api/attendance/sync` - Bulk sync offline data
- `GET /api/attendance/my-attendance` - Get employee attendance
- `GET /api/attendance/company` - Get company attendance (Manager)

### **Employee Management**
- `GET /api/employees` - List employees
- `POST /api/employees` - Create employee
- `PUT /api/employees/:id` - Update employee
- `DELETE /api/employees/:id` - Delete employee

### **Company Management**
- `GET /api/companies` - List companies (Super Admin)
- `POST /api/companies` - Create company
- `PUT /api/companies/:id` - Update company settings

## 🚀 **Production Deployment**

### **Backend Deployment**
1. Set production environment variables
2. Use MongoDB Atlas or managed MongoDB
3. Deploy to Heroku, AWS, or DigitalOcean
4. Configure HTTPS and domain

### **Mobile App Deployment**
```bash
# Build for iOS
expo build:ios

# Build for Android
expo build:android

# Or use EAS Build (recommended)
eas build --platform ios
eas build --platform android
```

### **Web Deployment**
```bash
# Build web version
expo build:web

# Deploy to Netlify, Vercel, or AWS S3
```

## 🔐 **Security Considerations**

### **Data Protection**
- JWT tokens with expiration
- Password hashing with bcrypt
- Input validation and sanitization
- Rate limiting on API endpoints
- HTTPS enforcement in production

### **Privacy**
- Location data encrypted in transit
- Photos stored as base64 (can be encrypted)
- User data access controls
- GDPR compliance ready

## 📞 **Support & Documentation**

### **Need Help?**
- Check the troubleshooting guide in `/docs/troubleshooting.md`
- Review API documentation in `/docs/api.md`
- Contact support team

### **Contributing**
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**AttendanceApp** - Making employee time tracking simple, secure, and reliable across all platforms! 🚀📱⏰