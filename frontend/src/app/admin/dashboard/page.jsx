'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/common/Sidebar';
import api from '@/lib/axios';
import {
    Users,
    Building2,
    ClipboardList,
    DollarSign,
    TrendingUp,
    CheckCircle,
    Clock,
    AlertCircle
} from 'lucide-react';

export default function AdminDashboard() {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            const response = await api.get('/admin/analytics');
            if (response.data.success) {
                setAnalytics(response.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    const statCards = analytics ? [
        {
            title: 'Total Users',
            value: analytics.users.total,
            icon: Users,
            color: 'bg-blue-500',
            subtext: `${analytics.users.active} active`
        },
        {
            title: 'Companies',
            value: analytics.users.companies,
            icon: Building2,
            color: 'bg-purple-500',
            subtext: 'Registered'
        },
        {
            title: 'Workers',
            value: analytics.users.workers,
            icon: Users,
            color: 'bg-green-500',
            subtext: 'Available'
        },
        {
            title: 'Total Tasks',
            value: analytics.tasks.total,
            icon: ClipboardList,
            color: 'bg-orange-500',
            subtext: `${analytics.tasks.open} open`
        },
        {
            title: 'Completed',
            value: analytics.tasks.completed,
            icon: CheckCircle,
            color: 'bg-emerald-500',
            subtext: `${analytics.tasks.completionRate}% rate`
        },
        {
            title: 'Pending Approval',
            value: analytics.tasks.pendingApproval,
            icon: Clock,
            color: 'bg-yellow-500',
            subtext: 'Tasks waiting'
        },
        {
            title: 'Total Revenue',
            value: `$${analytics.revenue.total.toLocaleString()}`,
            icon: DollarSign,
            color: 'bg-primary-500',
            subtext: 'Confirmed'
        },
        {
            title: 'Commission',
            value: `$${analytics.revenue.commission.toLocaleString()}`,
            icon: TrendingUp,
            color: 'bg-pink-500',
            subtext: 'Platform earnings'
        },
    ] : [];

    return (
        <div className="min-h-screen bg-slate-50">
            <Sidebar role="admin" />

            <div className="ml-64 p-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-800">Admin Dashboard</h1>
                    <p className="text-slate-600 mt-1">Platform overview and analytics</p>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="w-12 h-12 spinner"></div>
                    </div>
                ) : (
                    <>
                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            {statCards.map((stat, index) => {
                                const Icon = stat.icon;
                                return (
                                    <div key={index} className="card">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-slate-500 text-sm">{stat.title}</p>
                                                <p className="text-2xl font-bold text-slate-800 mt-1">{stat.value}</p>
                                                <p className="text-xs text-slate-400 mt-1">{stat.subtext}</p>
                                            </div>
                                            <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center`}>
                                                <Icon className="w-6 h-6 text-white" />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Recent Activity */}
                        <div className="grid lg:grid-cols-2 gap-6">
                            {/* Recent Tasks */}
                            <div className="card">
                                <h2 className="text-lg font-semibold text-slate-800 mb-4">Recent Tasks</h2>
                                <div className="space-y-4">
                                    {analytics?.recent?.tasks?.map((task) => (
                                        <div key={task._id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                            <div>
                                                <p className="font-medium text-slate-800">{task.title}</p>
                                                <p className="text-sm text-slate-500">by {task.companyId?.name || 'Unknown'}</p>
                                            </div>
                                            <span className={`badge ${task.status === 'open' ? 'badge-success' :
                                                    task.status === 'pendingApproval' ? 'badge-warning' :
                                                        task.status === 'completed' ? 'badge-info' :
                                                            'badge-neutral'
                                                }`}>
                                                {task.status}
                                            </span>
                                        </div>
                                    ))}
                                    {(!analytics?.recent?.tasks || analytics.recent.tasks.length === 0) && (
                                        <p className="text-slate-500 text-center py-4">No recent tasks</p>
                                    )}
                                </div>
                            </div>

                            {/* Recent Users */}
                            <div className="card">
                                <h2 className="text-lg font-semibold text-slate-800 mb-4">Recent Users</h2>
                                <div className="space-y-4">
                                    {analytics?.recent?.users?.map((user) => (
                                        <div key={user._id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                                                    <span className="text-primary-600 font-semibold">
                                                        {user.name?.charAt(0)?.toUpperCase() || 'U'}
                                                    </span>
                                                </div>
                                                <div>
                                                    <p className="font-medium text-slate-800">{user.name}</p>
                                                    <p className="text-sm text-slate-500">{user.email}</p>
                                                </div>
                                            </div>
                                            <span className={`badge capitalize ${user.role === 'admin' ? 'badge-danger' :
                                                    user.role === 'company' ? 'badge-info' :
                                                        'badge-success'
                                                }`}>
                                                {user.role}
                                            </span>
                                        </div>
                                    ))}
                                    {(!analytics?.recent?.users || analytics.recent.users.length === 0) && (
                                        <p className="text-slate-500 text-center py-4">No recent users</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
