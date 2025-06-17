const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');
const User = require('../models/User');
const Company = require('../models/Company');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');
const moment = require('moment');

// Validation middleware
const validateAttendance = [
  body('employeeId').isMongoId().withMessage('Invalid employee ID'),
  body('date').optional().isISO8601().withMessage('Invalid date format'),
  body('clockIn.location.latitude').optional().isFloat({ min: -90, max: 90 }).withMessage('Invalid latitude'),
  body('clockIn.location.longitude').optional().isFloat({ min: -180, max: 180 }).withMessage('Invalid longitude'),
];

// **CLOCK IN** - Employee clocks in
router.post('/clock-in', authenticateToken, validateAttendance, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { location, photo, method = 'manual', deviceInfo } = req.body;
    const employeeId = req.user.userId;
    const companyId = req.user.companyId;
    
    // Check if already clocked in today
    const today = moment().startOf('day').toDate();
    const existingAttendance = await Attendance.findOne({
      employeeId,
      date: today
    });

    if (existingAttendance && existingAttendance.clockIn.time) {
      return res.status(400).json({
        error: 'Already clocked in today',
        attendance: existingAttendance
      });
    }

    // Get company settings for validation
    const company = await Company.findById(companyId);
    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }

    // Validate GPS requirement
    if (company.settings.attendance.gpsRequired && !location) {
      return res.status(400).json({
        error: 'GPS location is required for clock-in'
      });
    }

    // Validate geofencing
    if (company.settings.attendance.geofencing.enabled && location) {
      const allowedLocations = company.settings.attendance.geofencing.locations;
      const isWithinGeofence = allowedLocations.some(allowedLocation => {
        const distance = calculateDistance(
          location.latitude, location.longitude,
          allowedLocation.latitude, allowedLocation.longitude
        );
        return distance <= (allowedLocation.radius || company.settings.attendance.geofencing.radius);
      });

      if (!isWithinGeofence) {
        return res.status(400).json({
          error: 'You are outside the allowed work area',
          allowedLocations: allowedLocations.map(loc => ({
            name: loc.name,
            radius: loc.radius || company.settings.attendance.geofencing.radius
          }))
        });
      }
    }

    // Validate photo requirement
    if (company.settings.attendance.photoRequired && !photo) {
      return res.status(400).json({
        error: 'Photo verification is required for clock-in'
      });
    }

    let attendance;
    if (existingAttendance) {
      // Update existing record
      existingAttendance.clockIn = {
        time: new Date(),
        location,
        photo,
        method,
        deviceInfo
      };
      existingAttendance.status = 'clocked_in';
      existingAttendance.syncStatus = 'synced';
      existingAttendance.lastSyncAt = new Date();
      attendance = await existingAttendance.save();
    } else {
      // Create new attendance record
      attendance = new Attendance({
        employeeId,
        companyId,
        date: today,
        clockIn: {
          time: new Date(),
          location,
          photo,
          method,
          deviceInfo
        },
        status: 'clocked_in',
        syncStatus: 'synced',
        lastSyncAt: new Date()
      });
      await attendance.save();
    }

    // Populate employee details
    await attendance.populate('employeeId', 'firstName lastName email department');

    res.status(200).json({
      message: 'Successfully clocked in',
      attendance,
      clockInTime: attendance.clockIn.time,
      location: attendance.clockIn.location
    });

  } catch (error) {
    console.error('Clock-in error:', error);
    res.status(500).json({
      error: 'Failed to clock in',
      details: error.message
    });
  }
});

// **CLOCK OUT** - Employee clocks out
router.post('/clock-out', authenticateToken, async (req, res) => {
  try {
    const { location, photo, method = 'manual' } = req.body;
    const employeeId = req.user.userId;
    
    // Find today's attendance record
    const today = moment().startOf('day').toDate();
    const attendance = await Attendance.findOne({
      employeeId,
      date: today
    });

    if (!attendance || !attendance.clockIn.time) {
      return res.status(400).json({
        error: 'No clock-in record found for today'
      });
    }

    if (attendance.clockOut.time) {
      return res.status(400).json({
        error: 'Already clocked out today',
        attendance
      });
    }

    // Update clock out information
    attendance.clockOut = {
      time: new Date(),
      location,
      photo,
      method
    };
    attendance.status = 'clocked_out';
    attendance.syncStatus = 'synced';
    attendance.lastSyncAt = new Date();

    // Calculate hours worked
    attendance.calculateHours();

    // Check for violations
    const company = await Company.findById(attendance.companyId);
    if (company) {
      attendance.checkViolations(company.settings.attendance);
    }

    await attendance.save();
    await attendance.populate('employeeId', 'firstName lastName email department');

    res.status(200).json({
      message: 'Successfully clocked out',
      attendance,
      clockOutTime: attendance.clockOut.time,
      hoursWorked: attendance.hoursWorked,
      overtimeHours: attendance.overtimeHours
    });

  } catch (error) {
    console.error('Clock-out error:', error);
    res.status(500).json({
      error: 'Failed to clock out',
      details: error.message
    });
  }
});

// **START BREAK** - Employee starts break
router.post('/break/start', authenticateToken, async (req, res) => {
  try {
    const { type = 'lunch', location } = req.body;
    const employeeId = req.user.userId;
    
    const today = moment().startOf('day').toDate();
    const attendance = await Attendance.findOne({
      employeeId,
      date: today
    });

    if (!attendance || !attendance.clockIn.time) {
      return res.status(400).json({
        error: 'Must clock in before taking a break'
      });
    }

    if (attendance.status === 'on_break') {
      return res.status(400).json({
        error: 'Already on break'
      });
    }

    // Add break record
    attendance.breaks.push({
      startTime: new Date(),
      type,
      location
    });
    attendance.status = 'on_break';
    attendance.syncStatus = 'synced';
    attendance.lastSyncAt = new Date();

    await attendance.save();

    res.status(200).json({
      message: 'Break started successfully',
      breakStartTime: new Date(),
      status: 'on_break'
    });

  } catch (error) {
    console.error('Start break error:', error);
    res.status(500).json({
      error: 'Failed to start break',
      details: error.message
    });
  }
});

// **END BREAK** - Employee ends break
router.post('/break/end', authenticateToken, async (req, res) => {
  try {
    const employeeId = req.user.userId;
    
    const today = moment().startOf('day').toDate();
    const attendance = await Attendance.findOne({
      employeeId,
      date: today
    });

    if (!attendance || attendance.status !== 'on_break') {
      return res.status(400).json({
        error: 'Not currently on break'
      });
    }

    // Find the active break (without end time)
    const activeBreak = attendance.breaks.find(b => !b.endTime);
    if (!activeBreak) {
      return res.status(400).json({
        error: 'No active break found'
      });
    }

    // End the break
    activeBreak.endTime = new Date();
    activeBreak.duration = Math.round((activeBreak.endTime - activeBreak.startTime) / (1000 * 60)); // minutes

    attendance.status = 'clocked_in';
    attendance.syncStatus = 'synced';
    attendance.lastSyncAt = new Date();

    await attendance.save();

    res.status(200).json({
      message: 'Break ended successfully',
      breakEndTime: activeBreak.endTime,
      breakDuration: activeBreak.duration,
      status: 'clocked_in'
    });

  } catch (error) {
    console.error('End break error:', error);
    res.status(500).json({
      error: 'Failed to end break',
      details: error.message
    });
  }
});

// **BULK SYNC** - Sync offline attendance data
router.post('/sync', authenticateToken, async (req, res) => {
  try {
    const { attendanceRecords } = req.body;
    const employeeId = req.user.userId;
    const companyId = req.user.companyId;

    if (!Array.isArray(attendanceRecords) || attendanceRecords.length === 0) {
      return res.status(400).json({
        error: 'Invalid attendance records provided'
      });
    }

    const syncResults = [];
    const errors = [];

    for (const record of attendanceRecords) {
      try {
        const recordDate = moment(record.date).startOf('day').toDate();
        
        // Check if record already exists
        let existingAttendance = await Attendance.findOne({
          employeeId,
          date: recordDate
        });

        if (existingAttendance) {
          // Update existing record if the incoming data is newer
          if (moment(record.lastModified).isAfter(existingAttendance.updatedAt)) {
            Object.assign(existingAttendance, {
              clockIn: record.clockIn,
              clockOut: record.clockOut,
              breaks: record.breaks,
              status: record.status,
              syncStatus: 'synced',
              lastSyncAt: new Date(),
              isModified: true
            });
            await existingAttendance.save();
            syncResults.push({
              date: record.date,
              action: 'updated',
              id: existingAttendance._id
            });
          } else {
            syncResults.push({
              date: record.date,
              action: 'skipped',
              reason: 'Server data is newer'
            });
          }
        } else {
          // Create new record
          const newAttendance = new Attendance({
            employeeId,
            companyId,
            date: recordDate,
            clockIn: record.clockIn,
            clockOut: record.clockOut,
            breaks: record.breaks || [],
            status: record.status,
            syncStatus: 'synced',
            lastSyncAt: new Date()
          });

          if (newAttendance.clockIn.time && newAttendance.clockOut.time) {
            newAttendance.calculateHours();
          }

          await newAttendance.save();
          syncResults.push({
            date: record.date,
            action: 'created',
            id: newAttendance._id
          });
        }
      } catch (recordError) {
        errors.push({
          date: record.date,
          error: recordError.message
        });
      }
    }

    res.status(200).json({
      message: 'Sync completed',
      syncResults,
      errors,
      totalProcessed: attendanceRecords.length,
      successful: syncResults.length,
      failed: errors.length
    });

  } catch (error) {
    console.error('Sync error:', error);
    res.status(500).json({
      error: 'Failed to sync attendance data',
      details: error.message
    });
  }
});

// **GET ATTENDANCE** - Get attendance records for employee
router.get('/my-attendance', authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate, limit = 30, page = 1 } = req.query;
    const employeeId = req.user.userId;

    const query = { employeeId };
    
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const attendance = await Attendance.find(query)
      .sort({ date: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('employeeId', 'firstName lastName email');

    const total = await Attendance.countDocuments(query);

    res.status(200).json({
      attendance,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        limit: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Get attendance error:', error);
    res.status(500).json({
      error: 'Failed to fetch attendance records',
      details: error.message
    });
  }
});

// **GET TODAY'S ATTENDANCE** - Get current day attendance
router.get('/today', authenticateToken, async (req, res) => {
  try {
    const employeeId = req.user.userId;
    const today = moment().startOf('day').toDate();

    const attendance = await Attendance.findOne({
      employeeId,
      date: today
    }).populate('employeeId', 'firstName lastName email department');

    res.status(200).json({
      attendance: attendance || null,
      hasClockIn: attendance?.clockIn?.time ? true : false,
      hasClockOut: attendance?.clockOut?.time ? true : false,
      currentStatus: attendance?.status || 'not_started'
    });

  } catch (error) {
    console.error('Get today attendance error:', error);
    res.status(500).json({
      error: 'Failed to fetch today\'s attendance',
      details: error.message
    });
  }
});

// **COMPANY ATTENDANCE** - Get all company attendance (Manager/Admin only)
router.get('/company', authenticateToken, requireRole(['manager', 'super_admin']), async (req, res) => {
  try {
    const { startDate, endDate, employeeId, status, limit = 50, page = 1 } = req.query;
    const companyId = req.user.companyId;

    const query = { companyId };
    
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }
    
    if (employeeId) query.employeeId = employeeId;
    if (status) query.status = status;

    const attendance = await Attendance.find(query)
      .sort({ date: -1, 'clockIn.time': -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('employeeId', 'firstName lastName email department');

    const total = await Attendance.countDocuments(query);

    res.status(200).json({
      attendance,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        limit: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Get company attendance error:', error);
    res.status(500).json({
      error: 'Failed to fetch company attendance',
      details: error.message
    });
  }
});

// **ATTENDANCE SUMMARY** - Get attendance analytics
router.get('/summary', authenticateToken, requireRole(['manager', 'super_admin']), async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const companyId = req.user.companyId;

    const start = startDate ? new Date(startDate) : moment().startOf('month').toDate();
    const end = endDate ? new Date(endDate) : moment().endOf('month').toDate();

    const summary = await Attendance.getAttendanceSummary(companyId, start, end);

    // Get additional stats
    const totalAttendanceRecords = await Attendance.countDocuments({
      companyId,
      date: { $gte: start, $lte: end }
    });

    const presentToday = await Attendance.countDocuments({
      companyId,
      date: moment().startOf('day').toDate(),
      'clockIn.time': { $exists: true }
    });

    const currentlyClocked = await Attendance.countDocuments({
      companyId,
      date: moment().startOf('day').toDate(),
      status: { $in: ['clocked_in', 'on_break'] }
    });

    res.status(200).json({
      summary,
      stats: {
        totalRecords: totalAttendanceRecords,
        presentToday,
        currentlyClocked,
        reportPeriod: {
          start,
          end
        }
      }
    });

  } catch (error) {
    console.error('Get attendance summary error:', error);
    res.status(500).json({
      error: 'Failed to fetch attendance summary',
      details: error.message
    });
  }
});

// Utility function to calculate distance between two coordinates
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}

module.exports = router;