const express = require('express');
const router = express.Router();
const Company = require('../models/Company');
const User = require('../models/User');
const { authenticateToken, requireRole } = require('../middleware/auth');

// GET ALL COMPANIES - Super Admin only
router.get('/', authenticateToken, requireRole(['super_admin']), async (req, res) => {
  try {
    const companies = await Company.find({}).sort({ createdAt: -1 });
    res.status(200).json({ companies });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch companies' });
  }
});

// CREATE COMPANY - Super Admin only  
router.post('/', authenticateToken, requireRole(['super_admin']), async (req, res) => {
  try {
    const { name, email, subscriptionPlan = 'basic' } = req.body;
    
    const company = new Company({
      name,
      email,
      subscriptionPlan
    });
    
    company.updateSubscriptionLimits();
    await company.save();
    
    res.status(201).json({ message: 'Company created successfully', company });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create company' });
  }
});

// UPDATE COMPANY SETTINGS
router.put('/:id/settings', authenticateToken, async (req, res) => {
  try {
    const companyId = req.params.id;
    const { settings } = req.body;
    
    if (req.user.role !== 'super_admin' && req.user.companyId !== companyId) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const company = await Company.findById(companyId);
    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }
    
    company.settings = { ...company.settings, ...settings };
    await company.save();
    
    res.status(200).json({ message: 'Settings updated', settings: company.settings });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

module.exports = router;