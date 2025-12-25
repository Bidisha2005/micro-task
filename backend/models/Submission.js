const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
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
    files: [{
        filename: String,
        path: String,
        uploadedAt: {
            type: Date,
            default: Date.now
        }
    }],
    description: {
        type: String,
        default: ''
    },
    submittedAt: {
        type: Date,
        default: Date.now
    },
    reviewStatus: {
        type: String,
        enum: ['pending', 'revisionRequested', 'accepted', 'rejected'],
        default: 'pending'
    },
    reviewNotes: {
        type: String,
        default: ''
    },
    revisionCount: {
        type: Number,
        default: 0
    }
});

module.exports = mongoose.model('Submission', submissionSchema);
