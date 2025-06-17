const express = require('express');
const router = express.Router();
const Company = require('../models/Company');
const User = require('../models/User');
const Attendance = require('../models/Attendance');
const { authenticateToken, requireRole } = require('../middleware/auth');

// GET SYSTEM STATISTICS - Super Admin only
router.get('/statistics', authenticateToken, requireRole(['super_admin']), async (req, res) => {
  try {
    const totalCompanies = await Company.countDocuments({});
    const activeCompanies = await Company.countDocuments({ isActive: true });
    const totalUsers = await User.countDocuments({ isActive: true });
    
    const revenue = await Company.aggregate([
      { $match: { isActive: true, subscriptionStatus: 'active' } },
      {
        $group: {
          _id: null,
          totalRevenue: {
            $sum: {
              $switch: {
                branches: [
                  { case: { $eq: ['$subscriptionPlan', 'basic'] }, then: 29.99 },
                  { case: { $eq: ['$subscriptionPlan', 'standard'] }, then: 79.99 },
                  { case: { $eq: ['$subscriptionPlan', 'premium'] }, then: 149.99 },
                  { case: { $eq: ['$subscriptionPlan', 'enterprise'] }, then: 299.99 },
                  { case: { $eq: ['$subscriptionPlan', 'unlimited'] }, then: 499.99 }
                ],
                default: 0
              }
            }
          }
        }
      }
    ]);
    
    const totalRevenue = revenue.length > 0 ? revenue[0].totalRevenue : 0;
    
    res.status(200).json({
      statistics: {
        totalCompanies,
        activeCompanies,
        totalUsers,
        totalRevenue: totalRevenue.toFixed(2)
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// GET ALL USERS - Super Admin only
router.get('/users', authenticateToken, requireRole(['super_admin']), async (req, res) => {
  try {
    const users = await User.find({})
      .populate('companyId', 'name')
      .select('-password')
      .sort({ createdAt: -1 });
    
    res.status(200).json({ users });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

module.exports = router;