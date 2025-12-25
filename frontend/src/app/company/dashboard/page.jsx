'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/common/Sidebar';
import api from '@/lib/axios';
import { Briefcase, Users, DollarSign, Clock, CheckCircle } from 'lucide-react';

export default function CompanyDashboard() {
    const [stats, setStats] = useState({ tasks: [], payments: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [tasksRes, paymentsRes] = await Promise.all([
                    api.get('/company/tasks?limit=5'),
                    api.get('/company/payments?limit=5')
                ]);
                setStats({
                    tasks: tasksRes.data.data || [],
                    payments: paymentsRes.data.data || []
                });
            } catch (error) {
                console.error('Failed to fetch data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const openTasks = stats.tasks.filter(t => t.status === 'open').length;
    const completedTasks = stats.tasks.filter(t => t.status === 'completed').length;
    const pendingPayments = stats.payments.filter(p => p.status === 'pending').length;

    return (
        <div className="min-h-screen bg-slate-50">
            <Sidebar role="company" />
            <div className="ml-64 p-8">
                <h1 className="text-3xl font-bold text-slate-800 mb-2">Company Dashboard</h1>
                <p className="text-slate-600 mb-8">Manage your tasks and workers</p>

                {loading ? (
                    <div className="flex justify-center py-12"><div className="w-12 h-12 spinner"></div></div>
                ) : (
                    <>
                        <div className="grid md:grid-cols-4 gap-4 mb-8">
                            <div className="card">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                        <Briefcase className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-slate-800">{stats.tasks.length}</p>
                                        <p className="text-sm text-slate-500">Total Tasks</p>
                                    </div>
                                </div>
                            </div>
                            <div className="card">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                        <Clock className="w-5 h-5 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-slate-800">{openTasks}</p>
                                        <p className="text-sm text-slate-500">Open Tasks</p>
                                    </div>
                                </div>
                            </div>
                            <div className="card">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                        <CheckCircle className="w-5 h-5 text-purple-600" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-slate-800">{completedTasks}</p>
                                        <p className="text-sm text-slate-500">Completed</p>
                                    </div>
                                </div>
                            </div>
                            <div className="card">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                                        <DollarSign className="w-5 h-5 text-yellow-600" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-slate-800">{pendingPayments}</p>
                                        <p className="text-sm text-slate-500">Pending Payments</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="card">
                            <h2 className="text-lg font-semibold mb-4">Recent Tasks</h2>
                            <div className="space-y-3">
                                {stats.tasks.slice(0, 5).map((task) => (
                                    <div key={task._id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                        <div>
                                            <p className="font-medium text-slate-800">{task.title}</p>
                                            <p className="text-sm text-slate-500">${task.paymentAmount}</p>
                                        </div>
                                        <span className={`badge ${task.status === 'open' ? 'badge-success' : task.status === 'completed' ? 'badge-info' : 'badge-warning'}`}>
                                            {task.status}
                                        </span>
                                    </div>
                                ))}
                                {stats.tasks.length === 0 && <p className="text-center text-slate-500">No tasks yet</p>}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
