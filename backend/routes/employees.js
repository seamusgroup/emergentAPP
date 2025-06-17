const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { authenticateToken, requireRole } = require('../middleware/auth');

// GET EMPLOYEES - Manager or Super Admin
router.get('/', authenticateToken, requireRole(['manager', 'super_admin']), async (req, res) => {
  try {
    const companyId = req.user.companyId;
    const employees = await User.find({ 
      companyId: companyId,
      isActive: true 
    }).select('-password').sort({ createdAt: -1 });
    
    res.status(200).json({ employees });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch employees' });
  }
});

// CREATE EMPLOYEE - Manager or Super Admin
router.post('/', authenticateToken, requireRole(['manager', 'super_admin']), async (req, res) => {
  try {
    const { firstName, lastName, email, department, position } = req.body;
    const companyId = req.user.companyId;
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }
    
    const user = new User({
      firstName,
      lastName,
      email,
      password: 'defaultpass123', // Should be changed by user
      companyId,
      department,
      position,
      role: 'employee'
    });
    
    user.generateEmployeeId();
    await user.save();
    
    res.status(201).json({ message: 'Employee created successfully', user: user.toJSON() });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create employee' });
  }
});

// UPDATE EMPLOYEE
router.put('/:id', authenticateToken, requireRole(['manager', 'super_admin']), async (req, res) => {
  try {
    const employeeId = req.params.id;
    const updates = req.body;
    
    const employee = await User.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    
    // Check if user can update this employee
    if (req.user.role !== 'super_admin' && employee.companyId.toString() !== req.user.companyId) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    Object.assign(employee, updates);
    await employee.save();
    
    res.status(200).json({ message: 'Employee updated successfully', employee: employee.toJSON() });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update employee' });
  }
});

module.exports = router;