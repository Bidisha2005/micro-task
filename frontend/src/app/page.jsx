import Link from 'next/link';
import Navbar from '@/components/common/Navbar';
import {
    Briefcase,
    Users,
    Shield,
    Zap,
    Clock,
    DollarSign,
    ArrowRight,
    CheckCircle
} from 'lucide-react';

export default function HomePage() {
    const features = [
        {
            icon: Clock,
            title: 'Short-Term Tasks',
            description: 'Fixed-scope tasks lasting 1-3 days. Quick turnaround, clear expectations.'
        },
        {
            icon: Shield,
            title: 'Verified Companies',
            description: 'All companies go through verification. Work with trusted employers.'
        },
        {
            icon: DollarSign,
            title: 'Fixed Payments',
            description: 'Know exactly what you\'ll earn before starting. No surprises.'
        },
        {
            icon: Zap,
            title: 'Fast Matching',
            description: 'Apply to tasks instantly. Companies review and assign quickly.'
        }
    ];

    const stats = [
        { value: '10K+', label: 'Active Workers' },
        { value: '2.5K+', label: 'Companies' },
        { value: '50K+', label: 'Tasks Completed' },
        { value: '$2M+', label: 'Paid to Workers' }
    ];

    return (
        <div className="min-h-screen">
            <Navbar />

            {/* Hero Section */}
            <section className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 text-white">
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative">
                    <div className="text-center max-w-3xl mx-auto">
                        <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                            Micro-Contract Work
                            <span className="block text-primary-200">Made Simple</span>
                        </h1>
                        <p className="text-xl text-primary-100 mb-8">
                            Connect skilled workers with short-term tasks. Post jobs, apply,
                            complete work, and get paid — all in one platform.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link href="/register" className="inline-flex items-center justify-center gap-2 bg-white text-primary-700 px-8 py-4 rounded-xl font-semibold hover:bg-primary-50 transition-all shadow-lg hover:shadow-xl">
                                Get Started Free
                                <ArrowRight className="w-5 h-5" />
                            </Link>
                        
                        </div>
                    </div>
                </div>

                {/* Wave divider */}
                <div className="absolute bottom-0 left-0 right-0">
                    <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="rgb(248, 250, 252)" />
                    </svg>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-12 bg-slate-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {stats.map((stat, index) => (
                            <div key={index} className="text-center">
                                <p className="text-3xl md:text-4xl font-bold text-primary-600">{stat.value}</p>
                                <p className="text-slate-600 mt-1">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
                            Why Choose MicroTask?
                        </h2>
                        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                            Built for the modern gig economy. Fast, reliable, and transparent.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {features.map((feature, index) => {
                            const Icon = feature.icon;
                            return (
                                <div key={index} className="card group hover:-translate-y-1">
                                    <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary-200 transition-colors">
                                        <Icon className="w-6 h-6 text-primary-600" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-slate-800 mb-2">{feature.title}</h3>
                                    <p className="text-slate-600">{feature.description}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section className="py-20 bg-slate-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
                            How It Works
                        </h2>
                    </div>

                    <div className="grid md:grid-cols-2 gap-16">
                        {/* For Workers */}
                        <div>
                            <div className="flex items-center gap-3 mb-8">
                                <div className="w-10 h-10 bg-secondary-100 rounded-full flex items-center justify-center">
                                    <Briefcase className="w-5 h-5 text-secondary-600" />
                                </div>
                                <h3 className="text-2xl font-bold text-slate-800">For Workers</h3>
                            </div>
                            <div className="space-y-6">
                                {[
                                    'Create your profile and add skills',
                                    'Browse available short-term tasks',
                                    'Apply with a quick proposal',
                                    'Complete work and get paid'
                                ].map((step, index) => (
                                    <div key={index} className="flex items-start gap-4">
                                        <div className="w-8 h-8 bg-secondary-500 text-white rounded-full flex items-center justify-center flex-shrink-0 font-semibold">
                                            {index + 1}
                                        </div>
                                        <p className="text-slate-700 text-lg pt-1">{step}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* For Companies */}
                        <div>
                            <div className="flex items-center gap-3 mb-8">
                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                    <Users className="w-5 h-5 text-blue-600" />
                                </div>
                                <h3 className="text-2xl font-bold text-slate-800">For Companies</h3>
                            </div>
                            <div className="space-y-6">
                                {[
                                    'Register and verify your company',
                                    'Post short-term tasks (1-3 days)',
                                    'Review applications and assign',
                                    'Approve work and confirm payment'
                                ].map((step, index) => (
                                    <div key={index} className="flex items-start gap-4">
                                        <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center flex-shrink-0 font-semibold">
                                            {index + 1}
                                        </div>
                                        <p className="text-slate-700 text-lg pt-1">{step}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-gradient-to-br from-slate-800 to-slate-900 text-white">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold mb-6">
                        Ready to Get Started?
                    </h2>
                    <p className="text-xl text-slate-300 mb-8">
                        Join thousands of workers and companies already using MicroTask.
                    </p>
                    <Link href="/register" className="inline-flex items-center gap-2 bg-primary-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-primary-700 transition-all">
                        Create Free Account
                        <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-slate-900 text-slate-400 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                                <Briefcase className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-white font-bold">MicroTask</span>
                        </div>
                        <p className="text-sm">© 2024 MicroTask. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
