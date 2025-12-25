const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Task = require('../models/Task');
const CompanyProfile = require('../models/CompanyProfile');

// @route   GET /api/tasks
// @desc    Get all open tasks (public)
// @access  Public
router.get('/', async (req, res) => {
    try {
        const { skill, minPayment, maxPayment, duration, category, search, page = 1, limit = 10 } = req.query;

        let query = { status: 'open' };

        if (skill) {
            query.requiredSkills = { $in: Array.isArray(skill) ? skill : [skill] };
        }
        if (category) {
            query.category = category;
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
            .populate('companyId', 'name')
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 });

        const total = await Task.countDocuments(query);

        // Get company profiles for each task
        const tasksWithCompanyInfo = await Promise.all(
            tasks.map(async (task) => {
                const companyProfile = await CompanyProfile.findOne({ userId: task.companyId._id });
                return {
                    ...task.toObject(),
                    company: {
                        name: task.companyId.name,
                        profile: companyProfile ? {
                            companyName: companyProfile.companyName,
                            logo: companyProfile.logo,
                            rating: companyProfile.rating,
                            verificationStatus: companyProfile.verificationStatus
                        } : null
                    }
                };
            })
        );

        res.json({
            success: true,
            data: tasksWithCompanyInfo,
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

// @route   GET /api/tasks/:id
// @desc    Get single task (public)
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const task = await Task.findById(req.params.id)
            .populate('companyId', 'name email');

        if (!task) {
            return res.status(404).json({ success: false, message: 'Task not found' });
        }

        // Only show open tasks to public
        if (task.status !== 'open') {
            return res.status(403).json({ success: false, message: 'Task is not available' });
        }

        const companyProfile = await CompanyProfile.findOne({ userId: task.companyId._id });

        res.json({
            success: true,
            data: {
                ...task.toObject(),
                company: {
                    name: task.companyId.name,
                    profile: companyProfile ? {
                        companyName: companyProfile.companyName,
                        logo: companyProfile.logo,
                        rating: companyProfile.rating,
                        verificationStatus: companyProfile.verificationStatus
                    } : null
                }
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @route   GET /api/tasks/categories/list
// @desc    Get all task categories
// @access  Public
router.get('/categories/list', async (req, res) => {
    try {
        const categories = await Task.distinct('category');
        res.json({ success: true, data: categories });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @route   GET /api/tasks/skills/list
// @desc    Get all unique skills
// @access  Public
router.get('/skills/list', async (req, res) => {
    try {
        const skills = await Task.distinct('requiredSkills');
        res.json({ success: true, data: skills });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
