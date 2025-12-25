const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    companyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: [true, 'Task title is required'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Task description is required']
    },
    requiredSkills: [{
        type: String,
        trim: true
    }],
    category: {
        type: String,
        default: 'General'
    },
    duration: {
        type: Number,
        required: true,
        min: 1,
        max: 3, // 1-3 days
        default: 1
    },
    paymentAmount: {
        type: Number,
        required: [true, 'Payment amount is required'],
        min: 0
    },
    deadline: {
        type: Date,
        required: [true, 'Deadline is required']
    },
    numberOfWorkers: {
        type: Number,
        default: 1,
        min: 1
    },
    assignedWorkers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    status: {
        type: String,
        enum: [
            'draft',
            'pendingApproval',
            'open',
            'assigned',
            'submitted',
            'completed',
            'rejected'
        ],
        default: 'draft'
    },
    rejectionReason: {
        type: String,
        default: ''
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

// Update the updatedAt field before saving
taskSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Task', taskSchema);
