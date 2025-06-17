const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to authenticate JWT token
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        error: 'Access token required'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    
    // Verify user still exists and is active
    const user = await User.findById(decoded.userId).select('-password');
    if (!user || !user.isActive) {
      return res.status(401).json({
        error: 'User not found or inactive'
      });
    }

    // Attach user info to request
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
      companyId: decoded.companyId,
      userDoc: user
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Invalid token'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Token expired'
      });
    }

    return res.status(500).json({
      error: 'Authentication failed',
      details: error.message
    });
  }
};

// Middleware to check user roles
const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Insufficient permissions',
        required: allowedRoles,
        current: req.user.role
      });
    }

    next();
  };
};

// Middleware to check if user belongs to the same company
const requireSameCompany = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      error: 'Authentication required'
    });
  }

  // Super admins can access any company data
  if (req.user.role === 'super_admin') {
    return next();
  }

  // Check if the requested company matches user's company
  const requestedCompanyId = req.params.companyId || req.body.companyId || req.query.companyId;
  
  if (requestedCompanyId && requestedCompanyId !== req.user.companyId?.toString()) {
    return res.status(403).json({
      error: 'Access denied to other company data'
    });
  }

  next();
};

// Middleware to check if user can manage employees
const canManageEmployees = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      error: 'Authentication required'
    });
  }

  const allowedRoles = ['manager', 'super_admin'];
  if (!allowedRoles.includes(req.user.role)) {
    return res.status(403).json({
      error: 'Only managers and admins can manage employees'
    });
  }

  next();
};

// Middleware to check if user can access employee data
const canAccessEmployeeData = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required'
      });
    }

    const targetEmployeeId = req.params.employeeId || req.body.employeeId || req.query.employeeId;
    
    // Users can always access their own data
    if (targetEmployeeId === req.user.userId) {
      return next();
    }

    // Super admins can access any employee data
    if (req.user.role === 'super_admin') {
      return next();
    }

    // Managers can access employees in their company
    if (req.user.role === 'manager') {
      const targetUser = await User.findById(targetEmployeeId);
      if (targetUser && targetUser.companyId?.toString() === req.user.companyId?.toString()) {
        return next();
      }
    }

    return res.status(403).json({
      error: 'Access denied to employee data'
    });

  } catch (error) {
    console.error('Employee access check error:', error);
    return res.status(500).json({
      error: 'Failed to verify access permissions'
    });
  }
};

// Middleware to validate company subscription limits
const checkSubscriptionLimits = async (req, res, next) => {
  try {
    if (!req.user || req.user.role === 'super_admin') {
      return next();
    }

    const Company = require('../models/Company');
    const company = await Company.findById(req.user.companyId);
    
    if (!company) {
      return res.status(404).json({
        error: 'Company not found'
      });
    }

    // Check if trial expired
    if (company.isTrialExpired()) {
      return res.status(403).json({
        error: 'Company trial has expired. Please upgrade your subscription.',
        trialEndsAt: company.trialEndsAt
      });
    }

    // Check subscription status
    if (company.subscriptionStatus === 'suspended') {
      return res.status(403).json({
        error: 'Company subscription is suspended. Please contact billing.',
        subscriptionStatus: company.subscriptionStatus
      });
    }

    // Attach company info to request
    req.company = company;
    next();

  } catch (error) {
    console.error('Subscription check error:', error);
    return res.status(500).json({
      error: 'Failed to verify subscription status'
    });
  }
};

module.exports = {
  authenticateToken,
  requireRole,
  requireSameCompany,
  canManageEmployees,
  canAccessEmployeeData,
  checkSubscriptionLimits
};