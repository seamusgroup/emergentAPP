const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Company = require('../models/Company');
const { authenticateToken } = require('../middleware/auth');

// Validation middleware
const validateLogin = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

const validateRegister = [
  body('firstName').trim().isLength({ min: 2, max: 50 }).withMessage('First name must be 2-50 characters'),
  body('lastName').trim().isLength({ min: 2, max: 50 }).withMessage('Last name must be 2-50 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('companyId').optional().isMongoId().withMessage('Invalid company ID'),
];

// **LOGIN** - Authenticate user
router.post('/login', validateLogin, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email, isActive: true })
      .populate('companyId', 'name subscriptionStatus settings');

    if (!user) {
      return res.status(401).json({
        error: 'Invalid email or password'
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Invalid email or password'
      });
    }

    // Check if company is active (for non-super admins)
    if (user.role !== 'super_admin' && user.companyId) {
      if (!user.companyId.isActive || user.companyId.subscriptionStatus === 'suspended') {
        return res.status(403).json({
          error: 'Company account is suspended. Please contact support.'
        });
      }

      // Check if trial expired
      if (user.companyId.isTrialExpired()) {
        return res.status(403).json({
          error: 'Company trial has expired. Please upgrade your subscription.'
        });
      }
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        role: user.role,
        companyId: user.companyId?._id || null
      },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '7d' }
    );

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Remove sensitive data
    const userResponse = user.toJSON();
    
    res.status(200).json({
      message: 'Login successful',
      token,
      user: userResponse,
      company: user.companyId || null,
      expiresIn: '7d'
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Login failed',
      details: error.message
    });
  }
});

// **REGISTER** - Create new user (Employee)
router.post('/register', validateRegister, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { firstName, lastName, email, password, companyId, department, position } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        error: 'User with this email already exists'
      });
    }

    let company = null;
    if (companyId) {
      // Verify company exists and has space for new user
      company = await Company.findById(companyId);
      if (!company) {
        return res.status(404).json({
          error: 'Company not found'
        });
      }

      if (!company.canAddUser()) {
        return res.status(400).json({
          error: 'Company has reached maximum user limit for current subscription'
        });
      }
    }

    // Create new user
    const user = new User({
      firstName,
      lastName,
      email,
      password,
      companyId: companyId || null,
      department,
      position,
      role: 'employee'
    });

    // Generate employee ID
    user.generateEmployeeId();

    await user.save();

    // Update company user count
    if (company) {
      await company.updateUserCount();
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        role: user.role,
        companyId: user.companyId
      },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '7d' }
    );

    const userResponse = user.toJSON();

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: userResponse,
      expiresIn: '7d'
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      error: 'Registration failed',
      details: error.message
    });
  }
});

// **VERIFY TOKEN** - Check if token is valid
router.get('/verify', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
      .populate('companyId', 'name subscriptionStatus settings')
      .select('-password');

    if (!user || !user.isActive) {
      return res.status(401).json({
        error: 'User not found or inactive'
      });
    }

    res.status(200).json({
      valid: true,
      user: user.toJSON(),
      company: user.companyId || null
    });

  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({
      error: 'Token verification failed',
      details: error.message
    });
  }
});

// **REFRESH TOKEN** - Get new token
router.post('/refresh', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    
    if (!user || !user.isActive) {
      return res.status(401).json({
        error: 'User not found or inactive'
      });
    }

    // Generate new token
    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        role: user.role,
        companyId: user.companyId
      },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '7d' }
    );

    res.status(200).json({
      message: 'Token refreshed successfully',
      token,
      expiresIn: '7d'
    });

  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({
      error: 'Token refresh failed',
      details: error.message
    });
  }
});

// **LOGOUT** - Logout user (client should delete token)
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    // In a more sophisticated setup, you might blacklist the token
    // For now, we just send a success response as the client will delete the token
    
    res.status(200).json({
      message: 'Logout successful'
    });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      error: 'Logout failed',
      details: error.message
    });
  }
});

// **CHANGE PASSWORD** - Change user password
router.post('/change-password', authenticateToken, [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { currentPassword, newPassword } = req.body;
    const userId = req.user.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        error: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      error: 'Failed to change password',
      details: error.message
    });
  }
});

// **FORGOT PASSWORD** - Send password reset (placeholder)
router.post('/forgot-password', [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email } = req.body;

    const user = await User.findOne({ email, isActive: true });
    
    // Always return success for security (don't reveal if email exists)
    res.status(200).json({
      message: 'If an account with that email exists, you will receive password reset instructions.'
    });

    // TODO: Implement email sending logic
    if (user) {
      console.log(`Password reset requested for: ${email}`);
      // Generate reset token and send email
    }

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      error: 'Failed to process password reset request',
      details: error.message
    });
  }
});

module.exports = router;