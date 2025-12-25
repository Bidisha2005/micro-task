const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
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
    companyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    platformCommission: {
        type: Number,
        default: 0, // Percentage (0-100)
        min: 0,
        max: 100
    },
    platformFee: {
        type: Number,
        default: 0 // Calculated amount
    },
    workerPayout: {
        type: Number,
        default: 0 // Amount after commission
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'disputed', 'refunded'],
        default: 'pending'
    },
    proof: {
        type: String,
        default: '' // URL to payment proof/screenshot
    },
    transactionId: {
        type: String,
        default: ''
    },
    paymentMethod: {
        type: String,
        default: 'manual'
    },
    // Escrow-ready fields
    escrowStatus: {
        type: String,
        enum: ['none', 'held', 'released', 'refunded'],
        default: 'none'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    confirmedAt: {
        type: Date
    }
});

// Calculate worker payout before saving
paymentSchema.pre('save', function (next) {
    this.platformFee = (this.amount * this.platformCommission) / 100;
    this.workerPayout = this.amount - this.platformFee;
    next();
});

module.exports = mongoose.model('Payment', paymentSchema);
