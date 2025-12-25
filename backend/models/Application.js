const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
    taskId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task',
        required: true
    },
    workerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    proposal: {
        type: String,
        required: [true, 'Proposal is required']
    },
    expectedDeliveryTime: {
        type: String,
        required: true
    },
    attachment: {
        type: String,
        default: ''
    },
    status: {
        type: String,
        enum: ['applied', 'accepted', 'rejected'],
        default: 'applied'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Prevent duplicate applications
applicationSchema.index({ taskId: 1, workerId: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema);
