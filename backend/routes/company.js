const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const CompanyProfile = require('../models/CompanyProfile');
const Task = require('../models/Task');
const Application = require('../models/Application');
const Submission = require('../models/Submission');
const Payment = require('../models/Payment');
const WorkerProfile = require('../models/WorkerProfile');

// Multer config for file uploads
const storage = multer.diskStorage({
    destination: './uploads/company',
    filename: (req, file, cb) => {
        cb(null, `${req.user._id}-${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({ storage });

// All routes require company role
router.use(protect, authorize('company'));

// =====================
// PROFILE MANAGEMENT
// =====================

// @route   GET /api/company/profile
// @desc    Get company profile
// @access  Company
router.get('/profile', async (req, res) => {
    try {
        const profile = await CompanyProfile.findOne({ userId: req.user._id });

        if (!profile) {
            return res.status(404).json({ success: false, message: 'Profile not found' });
        }

        res.json({ success: true, data: profile });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @route   PUT /api/company/profile
// @desc    Update company profile
// @access  Company
router.put('/profile', upload.single('logo'), async (req, res) => {
    try {
        const { companyName, domain, description } = req.body;

        const updateData = {};
        if (companyName) updateData.companyName = companyName;
        if (domain) updateData.domain = domain;
        if (description) updateData.description = description;
        if (req.file) updateData.logo = `/uploads/company/${req.file.filename}`;

        const profile = await CompanyProfile.findOneAndUpdate(
            { userId: req.user._id },
            updateData,
            { new: true }
        );

        if (!profile) {
            return res.status(404).json({ success: false, message: 'Profile not found' });
        }

        res.json({ success: true, data: profile });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// =====================
// TASK MANAGEMENT
// =====================

// @route   POST /api/company/tasks
// @desc    Create a new task
// @access  Company
router.post('/tasks', async (req, res) => {
    try {
        const { title, description, requiredSkills, category, duration, paymentAmount, deadline, numberOfWorkers } = req.body;

        const task = await Task.create({
            companyId: req.user._id,
            title,
            description,
            requiredSkills: requiredSkills || [],
            category,
            duration,
            paymentAmount,
            deadline,
            numberOfWorkers: numberOfWorkers || 1,
            status: 'pendingApproval'
        });

        res.status(201).json({ success: true, data: task });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @route   GET /api/company/tasks
// @desc    Get all tasks by company
// @access  Company
router.get('/tasks', async (req, res) => {
    try {
        const { status, page = 1, limit = 10 } = req.query;

        let query = { companyId: req.user._id };
        if (status) query.status = status;

        const tasks = await Task.find(query)
            .populate('assignedWorkers', 'name email')
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 });

        const total = await Task.countDocuments(query);

        res.json({
            success: true,
            data: tasks,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @route   GET /api/company/tasks/:id
// @desc    Get single task
// @access  Company
router.get('/tasks/:id', async (req, res) => {
    try {
        const task = await Task.findOne({ _id: req.params.id, companyId: req.user._id })
            .populate('assignedWorkers', 'name email');

        if (!task) {
            return res.status(404).json({ success: false, message: 'Task not found' });
        }

        res.json({ success: true, data: task });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @route   PUT /api/company/tasks/:id
// @desc    Update task
// @access  Company
router.put('/tasks/:id', async (req, res) => {
    try {
        const task = await Task.findOne({ _id: req.params.id, companyId: req.user._id });

        if (!task) {
            return res.status(404).json({ success: false, message: 'Task not found' });
        }

        // Only allow updates if task is draft or pending approval
        if (!['draft', 'pendingApproval', 'rejected'].includes(task.status)) {
            return res.status(400).json({ success: false, message: 'Cannot update task in current status' });
        }

        const { title, description, requiredSkills, category, duration, paymentAmount, deadline, numberOfWorkers } = req.body;

        if (title) task.title = title;
        if (description) task.description = description;
        if (requiredSkills) task.requiredSkills = requiredSkills;
        if (category) task.category = category;
        if (duration) task.duration = duration;
        if (paymentAmount) task.paymentAmount = paymentAmount;
        if (deadline) task.deadline = deadline;
        if (numberOfWorkers) task.numberOfWorkers = numberOfWorkers;

        // Resubmit for approval if was rejected
        if (task.status === 'rejected') {
            task.status = 'pendingApproval';
        }

        await task.save();

        res.json({ success: true, data: task });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// =====================
// APPLICATION MANAGEMENT
// =====================

// @route   GET /api/company/tasks/:taskId/applications
// @desc    Get applications for a task
// @access  Company
router.get('/tasks/:taskId/applications', async (req, res) => {
    try {
        const task = await Task.findOne({ _id: req.params.taskId, companyId: req.user._id });

        if (!task) {
            return res.status(404).json({ success: false, message: 'Task not found' });
        }

        const applications = await Application.find({ taskId: req.params.taskId })
            .populate('workerId', 'name email');

        // Get worker profiles for each application
        const applicationsWithProfiles = await Promise.all(
            applications.map(async (app) => {
                const workerProfile = await WorkerProfile.findOne({ userId: app.workerId._id });
                return {
                    ...app.toObject(),
                    workerProfile
                };
            })
        );

        res.json({ success: true, data: applicationsWithProfiles });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @route   PUT /api/company/applications/:id/accept
// @desc    Accept application
// @access  Company
router.put('/applications/:id/accept', async (req, res) => {
    try {
        const application = await Application.findById(req.params.id)
            .populate('taskId');

        if (!application) {
            return res.status(404).json({ success: false, message: 'Application not found' });
        }

        // Verify task belongs to company
        if (application.taskId.companyId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        application.status = 'accepted';
        await application.save();

        // Add worker to task's assigned workers
        const task = await Task.findById(application.taskId._id);
        if (!task.assignedWorkers.includes(application.workerId)) {
            task.assignedWorkers.push(application.workerId);

            // Update task status if workers are assigned
            if (task.assignedWorkers.length > 0 && task.status === 'open') {
                task.status = 'assigned';
            }

            await task.save();
        }

        res.json({ success: true, data: application });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @route   PUT /api/company/applications/:id/reject
// @desc    Reject application
// @access  Company
router.put('/applications/:id/reject', async (req, res) => {
    try {
        const application = await Application.findById(req.params.id)
            .populate('taskId');

        if (!application) {
            return res.status(404).json({ success: false, message: 'Application not found' });
        }

        // Verify task belongs to company
        if (application.taskId.companyId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        application.status = 'rejected';
        await application.save();

        res.json({ success: true, data: application });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// =====================
// SUBMISSION REVIEW
// =====================

// @route   GET /api/company/tasks/:taskId/submissions
// @desc    Get submissions for a task
// @access  Company
router.get('/tasks/:taskId/submissions', async (req, res) => {
    try {
        const task = await Task.findOne({ _id: req.params.taskId, companyId: req.user._id });

        if (!task) {
            return res.status(404).json({ success: false, message: 'Task not found' });
        }

        const submissions = await Submission.find({ taskId: req.params.taskId })
            .populate('workerId', 'name email');

        res.json({ success: true, data: submissions });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @route   PUT /api/company/submissions/:id/review
// @desc    Review submission (accept/reject/revision)
// @access  Company
router.put('/submissions/:id/review', async (req, res) => {
    try {
        const { reviewStatus, reviewNotes } = req.body;

        if (!['accepted', 'rejected', 'revisionRequested'].includes(reviewStatus)) {
            return res.status(400).json({ success: false, message: 'Invalid review status' });
        }

        const submission = await Submission.findById(req.params.id)
            .populate('taskId');

        if (!submission) {
            return res.status(404).json({ success: false, message: 'Submission not found' });
        }

        // Verify task belongs to company
        if (submission.taskId.companyId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        submission.reviewStatus = reviewStatus;
        submission.reviewNotes = reviewNotes || '';

        if (reviewStatus === 'revisionRequested') {
            submission.revisionCount += 1;
        }

        await submission.save();

        // If accepted, mark task as completed
        if (reviewStatus === 'accepted') {
            const task = await Task.findById(submission.taskId._id);
            task.status = 'completed';
            await task.save();

            // Update worker stats
            const workerProfile = await WorkerProfile.findOne({ userId: submission.workerId });
            if (workerProfile) {
                workerProfile.completedTasks += 1;
                await workerProfile.save();
            }

            // Create payment record
            await Payment.create({
                taskId: submission.taskId._id,
                workerId: submission.workerId,
                companyId: req.user._id,
                amount: submission.taskId.paymentAmount,
                status: 'pending'
            });
        }

        res.json({ success: true, data: submission });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// =====================
// PAYMENT CONFIRMATION
// =====================

// @route   PUT /api/company/payments/:id/confirm
// @desc    Confirm payment
// @access  Company
router.put('/payments/:id/confirm', upload.single('proof'), async (req, res) => {
    try {
        const payment = await Payment.findById(req.params.id);

        if (!payment) {
            return res.status(404).json({ success: false, message: 'Payment not found' });
        }

        if (payment.companyId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        payment.status = 'confirmed';
        payment.confirmedAt = Date.now();
        if (req.file) {
            payment.proof = `/uploads/company/${req.file.filename}`;
        }
        if (req.body.transactionId) {
            payment.transactionId = req.body.transactionId;
        }

        await payment.save();

        // Update worker earnings
        const workerProfile = await WorkerProfile.findOne({ userId: payment.workerId });
        if (workerProfile) {
            workerProfile.totalEarnings += payment.workerPayout;
            await workerProfile.save();
        }

        res.json({ success: true, data: payment });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @route   GET /api/company/payments
// @desc    Get company's payments
// @access  Company
router.get('/payments', async (req, res) => {
    try {
        const { status, page = 1, limit = 10 } = req.query;

        let query = { companyId: req.user._id };
        if (status) query.status = status;

        const payments = await Payment.find(query)
            .populate('taskId', 'title')
            .populate('workerId', 'name email')
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 });

        const total = await Payment.countDocuments(query);

        res.json({
            success: true,
            data: payments,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
