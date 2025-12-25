'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/common/Sidebar';
import api from '@/lib/axios';
import { TrendingUp, Users, Briefcase, DollarSign, BarChart3 } from 'lucide-react';

export default function AnalyticsPage() {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const response = await api.get('/admin/analytics');
                if (response.data.success) setAnalytics(response.data.data);
            } catch (error) {
                console.error('Failed to fetch analytics:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50">
                <Sidebar role="admin" />
                <div className="ml-64 p-8 flex items-center justify-center h-screen">
                    <div className="w-12 h-12 spinner"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <Sidebar role="admin" />
            <div className="ml-64 p-8">
                <h1 className="text-3xl font-bold text-slate-800 mb-2">Analytics Dashboard</h1>
                <p className="text-slate-600 mb-8">Platform performance metrics</p>

                <div className="grid md:grid-cols-4 gap-4 mb-8">
                    <div className="card">
                        <p className="text-slate-500 text-sm">Total Users</p>
                        <p className="text-3xl font-bold text-slate-800">{analytics?.users?.total || 0}</p>
                    </div>
                    <div className="card">
                        <p className="text-slate-500 text-sm">Workers</p>
                        <p className="text-3xl font-bold text-green-600">{analytics?.users?.workers || 0}</p>
                    </div>
                    <div className="card">
                        <p className="text-slate-500 text-sm">Companies</p>
                        <p className="text-3xl font-bold text-blue-600">{analytics?.users?.companies || 0}</p>
                    </div>
                    <div className="card">
                        <p className="text-slate-500 text-sm">Active Users</p>
                        <p className="text-3xl font-bold text-primary-600">{analytics?.users?.active || 0}</p>
                    </div>
                </div>

                <div className="grid md:grid-cols-4 gap-4 mb-8">
                    <div className="card">
                        <p className="text-slate-500 text-sm">Total Tasks</p>
                        <p className="text-3xl font-bold text-slate-800">{analytics?.tasks?.total || 0}</p>
                    </div>
                    <div className="card">
                        <p className="text-slate-500 text-sm">Open Tasks</p>
                        <p className="text-3xl font-bold text-green-600">{analytics?.tasks?.open || 0}</p>
                    </div>
                    <div className="card">
                        <p className="text-slate-500 text-sm">Completed</p>
                        <p className="text-3xl font-bold text-blue-600">{analytics?.tasks?.completed || 0}</p>
                    </div>
                    <div className="card">
                        <p className="text-slate-500 text-sm">Completion Rate</p>
                        <p className="text-3xl font-bold text-primary-600">{analytics?.tasks?.completionRate || 0}%</p>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                    <div className="card bg-gradient-to-br from-primary-500 to-primary-700 text-white">
                        <p className="text-primary-100 text-sm">Total Revenue</p>
                        <p className="text-4xl font-bold">${(analytics?.revenue?.total || 0).toLocaleString()}</p>
                    </div>
                    <div className="card bg-gradient-to-br from-secondary-500 to-secondary-700 text-white">
                        <p className="text-secondary-100 text-sm">Platform Commission</p>
                        <p className="text-4xl font-bold">${(analytics?.revenue?.commission || 0).toLocaleString()}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
