const mongoose = require('mongoose');

const workerProfileSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    skills: [{
        type: String,
        trim: true
    }],
    portfolioLinks: [{
        title: String,
        url: String
    }],
    bio: {
        type: String,
        default: ''
    },
    availabilityStatus: {
        type: String,
        enum: ['available', 'busy', 'unavailable'],
        default: 'available'
    },
    completedTasks: {
        type: Number,
        default: 0
    },
    rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    totalRatings: {
        type: Number,
        default: 0
    },
    totalEarnings: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('WorkerProfile', workerProfileSchema);
