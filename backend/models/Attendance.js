const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: () => new Date().setHours(0, 0, 0, 0) // Start of day
  },
  clockIn: {
    time: {
      type: Date,
      default: null
    },
    location: {
      latitude: Number,
      longitude: Number,
      accuracy: Number,
      address: String
    },
    photo: {
      type: String, // Base64 encoded image
      default: null
    },
    method: {
      type: String,
      enum: ['manual', 'biometric', 'qr_code', 'nfc'],
      default: 'manual'
    },
    deviceInfo: {
      platform: String,
      version: String,
      deviceId: String
    }
  },
  clockOut: {
    time: {
      type: Date,
      default: null
    },
    location: {
      latitude: Number,
      longitude: Number,
      accuracy: Number,
      address: String
    },
    photo: {
      type: String, // Base64 encoded image
      default: null
    },
    method: {
      type: String,
      enum: ['manual', 'biometric', 'qr_code', 'nfc'],
      default: 'manual'
    }
  },
  breaks: [{
    startTime: {
      type: Date,
      required: true
    },
    endTime: {
      type: Date,
      default: null
    },
    duration: {
      type: Number, // in minutes
      default: 0
    },
    type: {
      type: String,
      enum: ['lunch', 'coffee', 'personal', 'meeting'],
      default: 'lunch'
    },
    location: {
      latitude: Number,
      longitude: Number
    }
  }],
  shift: {
    scheduledStart: Date,
    scheduledEnd: Date,
    shiftType: {
      type: String,
      enum: ['morning', 'evening', 'night', 'flexible'],
      default: 'morning'
    }
  },
  hoursWorked: {
    type: Number,
    default: 0 // in hours
  },
  regularHours: {
    type: Number,
    default: 0
  },
  overtimeHours: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['not_started', 'clocked_in', 'on_break', 'clocked_out', 'completed'],
    default: 'not_started'
  },
  notes: {
    employee: String,
    manager: String,
    system: String
  },
  approvalStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'auto_approved'],
    default: 'pending'
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  approvedAt: {
    type: Date,
    default: null
  },
  syncStatus: {
    type: String,
    enum: ['synced', 'pending', 'failed'],
    default: 'synced'
  },
  lastSyncAt: {
    type: Date,
    default: Date.now
  },
  isModified: {
    type: Boolean,
    default: false
  },
  violations: [{
    type: {
      type: String,
      enum: ['late_arrival', 'early_departure', 'long_break', 'missing_clock_out', 'location_violation']
    },
    description: String,
    severity: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    },
    detectedAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for performance
attendanceSchema.index({ employeeId: 1, date: -1 });
attendanceSchema.index({ companyId: 1, date: -1 });
attendanceSchema.index({ date: -1, status: 1 });
attendanceSchema.index({ syncStatus: 1 });

// Calculate hours worked
attendanceSchema.methods.calculateHours = function() {
  if (!this.clockIn.time || !this.clockOut.time) {
    return { regularHours: 0, overtimeHours: 0, totalHours: 0 };
  }

  const clockInTime = new Date(this.clockIn.time);
  const clockOutTime = new Date(this.clockOut.time);
  
  // Calculate total time in milliseconds
  let totalMs = clockOutTime.getTime() - clockInTime.getTime();
  
  // Subtract break time
  const totalBreakTime = this.breaks.reduce((total, breakItem) => {
    if (breakItem.endTime) {
      const breakMs = new Date(breakItem.endTime).getTime() - new Date(breakItem.startTime).getTime();
      return total + breakMs;
    }
    return total;
  }, 0);
  
  totalMs -= totalBreakTime;
  
  // Convert to hours
  const totalHours = Math.max(0, totalMs / (1000 * 60 * 60));
  
  // Calculate regular and overtime hours (assuming 8 hours is regular)
  const regularHours = Math.min(totalHours, 8);
  const overtimeHours = Math.max(0, totalHours - 8);
  
  this.hoursWorked = totalHours;
  this.regularHours = regularHours;
  this.overtimeHours = overtimeHours;
  
  return { regularHours, overtimeHours, totalHours };
};

// Check for violations
attendanceSchema.methods.checkViolations = function(companySettings) {
  const violations = [];
  
  if (this.clockIn.time && companySettings.workingHours) {
    const scheduledStart = new Date(this.date);
    const [startHour, startMinute] = companySettings.workingHours.start.split(':');
    scheduledStart.setHours(parseInt(startHour), parseInt(startMinute), 0, 0);
    
    // Check late arrival (more than 15 minutes late)
    if (this.clockIn.time > new Date(scheduledStart.getTime() + 15 * 60 * 1000)) {
      violations.push({
        type: 'late_arrival',
        description: `Arrived ${Math.round((this.clockIn.time - scheduledStart) / (1000 * 60))} minutes late`,
        severity: 'medium'
      });
    }
  }
  
  // Check for missing clock out
  if (this.clockIn.time && !this.clockOut.time && this.status !== 'clocked_in') {
    violations.push({
      type: 'missing_clock_out',
      description: 'Employee forgot to clock out',
      severity: 'high'
    });
  }
  
  // Check long breaks (more than 60 minutes)
  this.breaks.forEach(breakItem => {
    if (breakItem.endTime) {
      const breakDuration = (new Date(breakItem.endTime) - new Date(breakItem.startTime)) / (1000 * 60);
      if (breakDuration > 60) {
        violations.push({
          type: 'long_break',
          description: `Break lasted ${Math.round(breakDuration)} minutes`,
          severity: 'low'
        });
      }
    }
  });
  
  this.violations = violations;
  return violations;
};

// Static method to get attendance summary
attendanceSchema.statics.getAttendanceSummary = async function(companyId, startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        companyId: new mongoose.Types.ObjectId(companyId),
        date: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: '$employeeId',
        totalDays: { $sum: 1 },
        totalHours: { $sum: '$hoursWorked' },
        totalOvertimeHours: { $sum: '$overtimeHours' },
        averageHours: { $avg: '$hoursWorked' },
        lateArrivals: {
          $sum: {
            $cond: [{ $gt: [{ $size: '$violations' }, 0] }, 1, 0]
          }
        }
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'employee'
      }
    },
    {
      $unwind: '$employee'
    }
  ]);
};

module.exports = mongoose.model('Attendance', attendanceSchema);