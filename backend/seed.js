require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/micro-task')
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.error('MongoDB connection error:', err));

// User Schema (simplified for seeding)
const userSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    password: String,
    role: String,
    status: { type: String, default: 'active' },
    createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// Company Profile Schema
const companyProfileSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    companyName: String,
    verificationStatus: { type: String, default: 'approved' },
    rating: { type: Number, default: 0 }
});

const CompanyProfile = mongoose.model('CompanyProfile', companyProfileSchema);

// Worker Profile Schema  
const workerProfileSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    skills: [String],
    availabilityStatus: { type: String, default: 'available' },
    completedTasks: { type: Number, default: 0 },
    rating: { type: Number, default: 0 }
});

const WorkerProfile = mongoose.model('WorkerProfile', workerProfileSchema);

const seedUsers = async () => {
    try {
        // Clear existing users (optional - comment out if you want to keep existing data)
        await User.deleteMany({});
        await CompanyProfile.deleteMany({});
        await WorkerProfile.deleteMany({});
        console.log('Cleared existing users');

        const salt = await bcrypt.genSalt(10);

        // Create Admin
        const adminPassword = await bcrypt.hash('admin123', salt);
        const admin = await User.create({
            name: 'Admin User',
            email: 'admin@microtask.com',
            password: adminPassword,
            role: 'admin'
        });
        console.log('✅ Admin created: admin@microtask.com / admin123');

        // Create Company User
        const companyPassword = await bcrypt.hash('company123', salt);
        const company = await User.create({
            name: 'Test Company',
            email: 'company@test.com',
            password: companyPassword,
            role: 'company'
        });
        await CompanyProfile.create({
            userId: company._id,
            companyName: 'Test Company Inc.',
            verificationStatus: 'approved'
        });
        console.log('✅ Company created: company@test.com / company123');

        // Create Worker User
        const workerPassword = await bcrypt.hash('worker123', salt);
        const worker = await User.create({
            name: 'Test Worker',
            email: 'worker@test.com',
            password: workerPassword,
            role: 'worker'
        });
        await WorkerProfile.create({
            userId: worker._id,
            skills: ['JavaScript', 'React', 'Node.js'],
            availabilityStatus: 'available'
        });
        console.log('✅ Worker created: worker@test.com / worker123');

        console.log('\n🎉 Seed completed successfully!');
        console.log('\nTest Credentials:');
        console.log('================');
        console.log('Admin:   admin@microtask.com / admin123');
        console.log('Company: company@test.com / company123');
        console.log('Worker:  worker@test.com / worker123');

        process.exit(0);
    } catch (error) {
        console.error('Seed error:', error);
        process.exit(1);
    }
};

seedUsers();
