const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxLength: 100,
    unique: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    trim: true,
    match: [/^\+?[\d\s\-\(\)]+$/, 'Please enter a valid phone number']
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  subscriptionPlan: {
    type: String,
    enum: ['basic', 'standard', 'premium', 'enterprise', 'unlimited'],
    default: 'basic'
  },
  subscriptionStatus: {
    type: String,
    enum: ['active', 'suspended', 'cancelled', 'trial'],
    default: 'trial'
  },
  maxUsers: {
    type: Number,
    default: 5
  },
  currentUsers: {
    type: Number,
    default: 0
  },
  billingCycle: {
    type: String,
    enum: ['monthly', 'yearly'],
    default: 'monthly'
  },
  nextBillingDate: {
    type: Date,
    default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
  },
  settings: {
    attendance: {
      gpsRequired: {
        type: Boolean,
        default: true
      },
      photoRequired: {
        type: Boolean,
        default: false
      },
      biometricRequired: {
        type: Boolean,
        default: false
      },
      geofencing: {
        enabled: {
          type: Boolean,
          default: false
        },
        radius: {
          type: Number,
          default: 100 // meters
        },
        locations: [{
          name: String,
          latitude: Number,
          longitude: Number,
          radius: Number
        }]
      },
      breakTracking: {
        type: Boolean,
        default: true
      },
      overtimeCalculation: {
        type: Boolean,
        default: true
      },
      workingHours: {
        start: {
          type: String,
          default: '09:00'
        },
        end: {
          type: String,
          default: '17:00'
        }
      },
      workingDays: {
        type: [String],
        default: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
      }
    },
    notifications: {
      emailAlerts: {
        type: Boolean,
        default: true
      },
      pushNotifications: {
        type: Boolean,
        default: true
      },
      lateArrival: {
        type: Boolean,
        default: true
      },
      clockOutReminder: {
        type: Boolean,
        default: true
      }
    },
    reports: {
      autoGenerate: {
        type: Boolean,
        default: false
      },
      frequency: {
        type: String,
        enum: ['daily', 'weekly', 'monthly'],
        default: 'weekly'
      },
      recipients: [String]
    }
  },
  branding: {
    logo: String, // Base64 encoded image
    primaryColor: {
      type: String,
      default: '#4F46E5'
    },
    secondaryColor: {
      type: String,
      default: '#7C3AED'
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  trialEndsAt: {
    type: Date,
    default: () => new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 14 days trial
  },
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

// Indexes
companySchema.index({ name: 1 });
companySchema.index({ email: 1 });
companySchema.index({ subscriptionStatus: 1 });

// Methods
companySchema.methods.isTrialExpired = function() {
  return this.subscriptionStatus === 'trial' && new Date() > this.trialEndsAt;
};

companySchema.methods.canAddUser = function() {
  return this.currentUsers < this.maxUsers;
};

companySchema.methods.updateUserCount = async function() {
  const User = mongoose.model('User');
  const count = await User.countDocuments({ companyId: this._id, isActive: true });
  this.currentUsers = count;
  return this.save();
};

// Update subscription limits based on plan
companySchema.methods.updateSubscriptionLimits = function() {
  const limits = {
    basic: 5,
    standard: 15,
    premium: 30,
    enterprise: 50,
    unlimited: 999
  };
  
  this.maxUsers = limits[this.subscriptionPlan] || 5;
};

module.exports = mongoose.model('Company', companySchema);