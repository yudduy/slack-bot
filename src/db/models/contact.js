const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  name: {
    type: String,
    required: false
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true,
    validate: {
      validator: function(v) {
        // Validate phone format (XXX)XXX-XXXX
        return /^\(\d{3}\)\d{3}-\d{4}$/.test(v);
      },
      message: props => `${props.value} is not a valid phone number format. Required format: (XXX)XXX-XXXX`
    }
  },
  slackTeamId: {
    type: String,
    required: true
  },
  channel: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['new', 'contacted', 'replied', 'completed'],
    default: 'new'
  },
  notes: {
    type: String
  },
  callScheduled: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
contactSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Create an index for efficient querying
contactSchema.index({ slackTeamId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('Contact', contactSchema);