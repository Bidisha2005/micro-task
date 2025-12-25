const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const WorkerProfile = require('../models/WorkerProfile');
const Task = require('../models/Task');
const Application = require('../models/Application');
const Submission = require('../models/Submission');
const Payment = require('../models/Payment');

// Multer config for file uploads
const storage = multer.diskStorage({
    destination: './uploads/worker',
    filename: (req, file, cb) => {
        cb(null, `${req.user._id}-${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({ storage });

// All routes require worker role
router.use(protect, authorize('worker'));

// =====================
// PROFILE MANAGEMENT
// =====================

// @route   GET /api/worker/profile
// @desc    Get worker profile
// @access  Worker
router.get('/profile', async (req, res) => {
    try {
        const profile = await WorkerProfile.findOne({ userId: req.user._id });

        if (!profile) {
            return res.status(404).json({ success: false, message: 'Profile not found' });
        }

        res.json({ success: true, data: profile });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @route   PUT /api/worker/profile
// @desc    Update worker profile
// @access  Worker
router.put('/profile', async (req, res) => {
    try {
        const { skills, portfolioLinks, bio, availabilityStatus } = req.body;

        const updateData = {};
        if (skills) updateData.skills = skills;
        if (portfolioLinks) updateData.portfolioLinks = portfolioLinks;
        if (bio) updateData.bio = bio;
        if (availabilityStatus) updateData.availabilityStatus = availabilityStatus;

        const profile = await WorkerProfile.findOneAndUpdate(
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
// TASK DISCOVERY
// =====================

// @route   GET /api/worker/tasks
// @desc    Browse available tasks
// @access  Worker
router.get('/tasks', async (req, res) => {
    try {
        const { skill, minPayment, maxPayment, duration, search, page = 1, limit = 10 } = req.query;

        let query = { status: 'open' };

        if (skill) {
            query.requiredSkills = { $in: [skill] };
        }
        if (minPayment || maxPayment) {
            query.paymentAmount = {};
            if (minPayment) query.paymentAmount.$gte = parseFloat(minPayment);
            if (maxPayment) query.paymentAmount.$lte = parseFloat(maxPayment);
        }
        if (duration) {
            query.duration = parseInt(duration);
        }
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        const tasks = await Task.find(query)
            .populate('companyId', 'name email')
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

// @route   GET /api/worker/tasks/:id
// @desc    Get single task details
// @access  Worker
router.get('/tasks/:id', async (req, res) => {
    try {
        const task = await Task.findById(req.params.id)
            .populate('companyId', 'name email');

        if (!task) {
            return res.status(404).json({ success: false, message: 'Task not found' });
        }

        // Check if worker already applied
        const existingApplication = await Application.findOne({
            taskId: req.params.id,
            workerId: req.user._id
        });

        res.json({
            success: true,
            data: task,
            hasApplied: !!existingApplication,
            application: existingApplication
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// =====================
// APPLICATIONS
// =====================

// @route   POST /api/worker/tasks/:taskId/apply
// @desc    Apply for a task
// @access  Worker
router.post('/tasks/:taskId/apply', upload.single('attachment'), async (req, res) => {
    try {
        const { proposal, expectedDeliveryTime } = req.body;

        const task = await Task.findById(req.params.taskId);
        if (!task) {
            return res.status(404).json({ success: false, message: 'Task not found' });
        }

        if (task.status !== 'open') {
            return res.status(400).json({ success: false, message: 'Task is not open for applications' });
        }

        // Check if already applied
        const existingApplication = await Application.findOne({
            taskId: req.params.taskId,
            workerId: req.user._id
        });

        if (existingApplication) {
            return res.status(400).json({ success: false, message: 'You have already applied for this task' });
        }

        const application = await Application.create({
            taskId: req.params.taskId,
            workerId: req.user._id,
            proposal,
            expectedDeliveryTime,
            attachment: req.file ? `/uploads/worker/${req.file.filename}` : ''
        });

        res.status(201).json({ success: true, data: application });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @route   GET /api/worker/applications
// @desc    Get all applications by worker
// @access  Worker
router.get('/applications', async (req, res) => {
    try {
        const { status, page = 1, limit = 10 } = req.query;

        let query = { workerId: req.user._id };
        if (status) query.status = status;

        const applications = await Application.find(query)
            .populate({
                path: 'taskId',
                select: 'title description paymentAmount deadline status',
                populate: { path: 'companyId', select: 'name' }
            })
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 });

        const total = await Application.countDocuments(query);

        res.json({
            success: true,
            data: applications,
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

// =====================
// ASSIGNED TASKS (WORKSPACE)
// =====================

// @route   GET /api/worker/assigned-tasks
// @desc    Get tasks assigned to worker
// @access  Worker
router.get('/assigned-tasks', async (req, res) => {
    try {
        const tasks = await Task.find({
            assignedWorkers: req.user._id,
            status: { $in: ['assigned', 'submitted'] }
        })
            .populate('companyId', 'name email')
            .sort({ deadline: 1 });

        res.json({ success: true, data: tasks });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// =====================
// SUBMISSIONS
// =====================

// @route   POST /api/worker/tasks/:taskId/submit
// @desc    Submit work for a task
// @access  Worker
router.post('/tasks/:taskId/submit', upload.array('files', 5), async (req, res) => {
    try {
        const { description } = req.body;

        const task = await Task.findById(req.params.taskId);
        if (!task) {
            return res.status(404).json({ success: false, message: 'Task not found' });
        }

        // Verify worker is assigned
        if (!task.assignedWorkers.includes(req.user._id)) {
            return res.status(403).json({ success: false, message: 'You are not assigned to this task' });
        }

        const files = req.files ? req.files.map(file => ({
            filename: file.originalname,
            path: `/uploads/worker/${file.filename}`
        })) : [];

        // Check for existing submission
        let submission = await Submission.findOne({
            taskId: req.params.taskId,
            workerId: req.user._id
        });

        if (submission) {
            // Update existing submission
            submission.files = [...submission.files, ...files];
            submission.description = description || submission.description;
            submission.submittedAt = Date.now();
            submission.reviewStatus = 'pending';
            await submission.save();
        } else {
            // Create new submission
            submission = await Submission.create({
                taskId: req.params.taskId,
                workerId: req.user._id,
                files,
                description
            });
        }

        // Update task status
        task.status = 'submitted';
        await task.save();

        res.status(201).json({ success: true, data: submission });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @route   GET /api/worker/submissions
// @desc    Get all submissions by worker
// @access  Worker
router.get('/submissions', async (req, res) => {
    try {
        const { reviewStatus, page = 1, limit = 10 } = req.query;

        let query = { workerId: req.user._id };
        if (reviewStatus) query.reviewStatus = reviewStatus;

        const submissions = await Submission.find(query)
            .populate({
                path: 'taskId',
                select: 'title paymentAmount',
                populate: { path: 'companyId', select: 'name' }
            })
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .sort({ submittedAt: -1 });

        const total = await Submission.countDocuments(query);

        res.json({
            success: true,
            data: submissions,
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

// =====================
// EARNINGS
// =====================

// @route   GET /api/worker/earnings
// @desc    Get worker earnings
// @access  Worker
router.get('/earnings', async (req, res) => {
    try {
        const profile = await WorkerProfile.findOne({ userId: req.user._id });

        const payments = await Payment.find({ workerId: req.user._id })
            .populate('taskId', 'title')
            .sort({ createdAt: -1 });

        const pendingPayments = payments.filter(p => p.status === 'pending');
        const confirmedPayments = payments.filter(p => p.status === 'confirmed');

        const totalPending = pendingPayments.reduce((sum, p) => sum + p.workerPayout, 0);
        const totalEarned = confirmedPayments.reduce((sum, p) => sum + p.workerPayout, 0);

        res.json({
            success: true,
            data: {
                totalEarnings: profile?.totalEarnings || 0,
                totalPending,
                totalEarned,
                completedTasks: profile?.completedTasks || 0,
                payments
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
