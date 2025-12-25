const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const User = require('../models/User');
const CompanyProfile = require('../models/CompanyProfile');
const WorkerProfile = require('../models/WorkerProfile');
const Task = require('../models/Task');
const Application = require('../models/Application');
const Submission = require('../models/Submission');
const Payment = require('../models/Payment');

// All routes require admin role
router.use(protect, authorize('admin'));

// =====================
// USER MANAGEMENT
// =====================

// @route   GET /api/admin/users
// @desc    Get all users with filters
// @access  Admin
router.get('/users', async (req, res) => {
    try {
        const { role, status, search, page = 1, limit = 10 } = req.query;

        let query = {};
        if (role) query.role = role;
        if (status) query.status = status;
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        const users = await User.find(query)
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 });

        const total = await User.countDocuments(query);

        res.json({
            success: true,
            data: users,
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

// @route   PUT /api/admin/users/:id/status
// @desc    Block/Unblock user
// @access  Admin
router.put('/users/:id/status', async (req, res) => {
    try {
        const { status } = req.body;

        if (!['active', 'blocked'].includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status' });
        }

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @route   PUT /api/admin/users/:id/role
// @desc    Change user role
// @access  Admin
router.put('/users/:id/role', async (req, res) => {
    try {
        const { role } = req.body;

        if (!['admin', 'company', 'worker'].includes(role)) {
            return res.status(400).json({ success: false, message: 'Invalid role' });
        }

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { role },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// =====================
// COMPANY MANAGEMENT
// =====================

// @route   GET /api/admin/companies
// @desc    Get all companies
// @access  Admin
router.get('/companies', async (req, res) => {
    try {
        const { verificationStatus, page = 1, limit = 10 } = req.query;

        let query = {};
        if (verificationStatus) query.verificationStatus = verificationStatus;

        const companies = await CompanyProfile.find(query)
            .populate('userId', 'name email status')
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 });

        const total = await CompanyProfile.countDocuments(query);

        res.json({
            success: true,
            data: companies,
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

// @route   PUT /api/admin/companies/:id/verify
// @desc    Approve/Reject company verification
// @access  Admin
router.put('/companies/:id/verify', async (req, res) => {
    try {
        const { verificationStatus } = req.body;

        if (!['pending', 'approved', 'rejected'].includes(verificationStatus)) {
            return res.status(400).json({ success: false, message: 'Invalid status' });
        }

        const company = await CompanyProfile.findByIdAndUpdate(
            req.params.id,
            { verificationStatus },
            { new: true }
        ).populate('userId', 'name email');

        if (!company) {
            return res.status(404).json({ success: false, message: 'Company not found' });
        }

        res.json({ success: true, data: company });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// =====================
// TASK MODERATION
// =====================

// @route   GET /api/admin/tasks
// @desc    Get all tasks
// @access  Admin
router.get('/tasks', async (req, res) => {
    try {
        const { status, page = 1, limit = 10 } = req.query;

        let query = {};
        if (status) query.status = status;

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

// @route   PUT /api/admin/tasks/:id/approve
// @desc    Approve task
// @access  Admin
router.put('/tasks/:id/approve', async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({ success: false, message: 'Task not found' });
        }

        if (task.status !== 'pendingApproval') {
            return res.status(400).json({ success: false, message: 'Task is not pending approval' });
        }

        task.status = 'open';
        await task.save();

        res.json({ success: true, data: task });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @route   PUT /api/admin/tasks/:id/reject
// @desc    Reject task
// @access  Admin
router.put('/tasks/:id/reject', async (req, res) => {
    try {
        const { reason } = req.body;
        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({ success: false, message: 'Task not found' });
        }

        task.status = 'rejected';
        task.rejectionReason = reason || 'Rejected by admin';
        await task.save();

        res.json({ success: true, data: task });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @route   DELETE /api/admin/tasks/:id
// @desc    Delete task
// @access  Admin
router.delete('/tasks/:id', async (req, res) => {
    try {
        const task = await Task.findByIdAndDelete(req.params.id);

        if (!task) {
            return res.status(404).json({ success: false, message: 'Task not found' });
        }

        // Also delete related applications and submissions
        await Application.deleteMany({ taskId: req.params.id });
        await Submission.deleteMany({ taskId: req.params.id });

        res.json({ success: true, message: 'Task deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// =====================
// ANALYTICS
// =====================

// @route   GET /api/admin/analytics
// @desc    Get platform analytics
// @access  Admin
router.get('/analytics', async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalWorkers = await User.countDocuments({ role: 'worker' });
        const totalCompanies = await User.countDocuments({ role: 'company' });
        const activeUsers = await User.countDocuments({ status: 'active' });
        const blockedUsers = await User.countDocuments({ status: 'blocked' });

        const totalTasks = await Task.countDocuments();
        const openTasks = await Task.countDocuments({ status: 'open' });
        const completedTasks = await Task.countDocuments({ status: 'completed' });
        const pendingApprovalTasks = await Task.countDocuments({ status: 'pendingApproval' });

        const totalApplications = await Application.countDocuments();
        const totalSubmissions = await Submission.countDocuments();

        const payments = await Payment.find({ status: 'confirmed' });
        const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
        const totalCommission = payments.reduce((sum, p) => sum + p.platformFee, 0);

        // Get recent activity
        const recentTasks = await Task.find()
            .populate('companyId', 'name')
            .sort({ createdAt: -1 })
            .limit(5);

        const recentUsers = await User.find()
            .sort({ createdAt: -1 })
            .limit(5);

        res.json({
            success: true,
            data: {
                users: {
                    total: totalUsers,
                    workers: totalWorkers,
                    companies: totalCompanies,
                    active: activeUsers,
                    blocked: blockedUsers
                },
                tasks: {
                    total: totalTasks,
                    open: openTasks,
                    completed: completedTasks,
                    pendingApproval: pendingApprovalTasks,
                    completionRate: totalTasks > 0 ? ((completedTasks / totalTasks) * 100).toFixed(2) : 0
                },
                applications: totalApplications,
                submissions: totalSubmissions,
                revenue: {
                    total: totalRevenue,
                    commission: totalCommission
                },
                recent: {
                    tasks: recentTasks,
                    users: recentUsers
                }
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// =====================
// PAYMENT OVERSIGHT
// =====================

// @route   GET /api/admin/payments
// @desc    Get all payments
// @access  Admin
router.get('/payments', async (req, res) => {
    try {
        const { status, page = 1, limit = 10 } = req.query;

        let query = {};
        if (status) query.status = status;

        const payments = await Payment.find(query)
            .populate('taskId', 'title')
            .populate('workerId', 'name email')
            .populate('companyId', 'name email')
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
