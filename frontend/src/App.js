import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "./components/ui/toaster";

// Components
import Login from "./components/auth/Login";
import EmployeeDashboard from "./components/employee/EmployeeDashboard";
import ManagerDashboard from "./components/manager/ManagerDashboard";
import SuperAdminDashboard from "./components/superadmin/SuperAdminDashboard";
import EmployeeAttendance from "./components/employee/EmployeeAttendance";
import ManagerEmployees from "./components/manager/ManagerEmployees";
import ManagerAttendance from "./components/manager/ManagerAttendance";
import ManagerReports from "./components/manager/ManagerReports";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Navigate to="/login" replace />} />
          
          {/* Employee Routes */}
          <Route path="/employee" element={<EmployeeDashboard />} />
          <Route path="/employee/attendance" element={<EmployeeAttendance />} />
          
          {/* Manager Routes */}
          <Route path="/manager" element={<ManagerDashboard />} />
          <Route path="/manager/employees" element={<ManagerEmployees />} />
          <Route path="/manager/attendance" element={<ManagerAttendance />} />
          <Route path="/manager/reports" element={<ManagerReports />} />
          
          {/* Super Admin Routes */}
          <Route path="/super-admin" element={<SuperAdminDashboard />} />
        </Routes>
      </BrowserRouter>
      <Toaster />
    </div>
  );
}

export default App;