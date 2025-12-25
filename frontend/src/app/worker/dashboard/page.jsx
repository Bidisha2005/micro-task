'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/common/Sidebar';
import api from '@/lib/axios';
import { Briefcase, DollarSign, Clock, CheckCircle, FileText } from 'lucide-react';

export default function WorkerDashboard() {
    const [stats, setStats] = useState({ profile: null, applications: [], earnings: null });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [profileRes, appsRes, earningsRes] = await Promise.all([
                    api.get('/worker/profile'),
                    api.get('/worker/applications?limit=5'),
                    api.get('/worker/earnings')
                ]);
                setStats({
                    profile: profileRes.data.data,
                    applications: appsRes.data.data || [],
                    earnings: earningsRes.data.data
                });
            } catch (error) {
                console.error('Failed to fetch data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    return (
        <div className="min-h-screen bg-slate-50">
            <Sidebar role="worker" />
            <div className="ml-64 p-8">
                <h1 className="text-3xl font-bold text-slate-800 mb-2">Worker Dashboard</h1>
                <p className="text-slate-600 mb-8">Track your work and earnings</p>

                {loading ? (
                    <div className="flex justify-center py-12"><div className="w-12 h-12 spinner"></div></div>
                ) : (
                    <>
                        <div className="grid md:grid-cols-4 gap-4 mb-8">
                            <div className="card">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                        <CheckCircle className="w-5 h-5 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-slate-800">{stats.profile?.completedTasks || 0}</p>
                                        <p className="text-sm text-slate-500">Completed Tasks</p>
                                    </div>
                                </div>
                            </div>
                            <div className="card">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                        <FileText className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-slate-800">{stats.applications.length}</p>
                                        <p className="text-sm text-slate-500">Applications</p>
                                    </div>
                                </div>
                            </div>
                            <div className="card">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                                        <DollarSign className="w-5 h-5 text-primary-600" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-slate-800">${stats.earnings?.totalEarnings || 0}</p>
                                        <p className="text-sm text-slate-500">Total Earned</p>
                                    </div>
                                </div>
                            </div>
                            <div className="card">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                                        <Clock className="w-5 h-5 text-yellow-600" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-slate-800">${stats.earnings?.totalPending || 0}</p>
                                        <p className="text-sm text-slate-500">Pending</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid lg:grid-cols-2 gap-6">
                            <div className="card">
                                <h2 className="font-semibold mb-4">Your Skills</h2>
                                <div className="flex flex-wrap gap-2">
                                    {stats.profile?.skills?.length > 0 ? (
                                        stats.profile.skills.map((skill, i) => (
                                            <span key={i} className="badge badge-info">{skill}</span>
                                        ))
                                    ) : (
                                        <p className="text-slate-500">No skills added. <a href="/worker/profile" className="text-primary-600">Add skills</a></p>
                                    )}
                                </div>
                            </div>

                            <div className="card">
                                <h2 className="font-semibold mb-4">Recent Applications</h2>
                                {stats.applications.length === 0 ? (
                                    <p className="text-slate-500">No applications yet. <a href="/worker/tasks" className="text-primary-600">Browse tasks</a></p>
                                ) : (
                                    <div className="space-y-3">
                                        {stats.applications.slice(0, 3).map((app) => (
                                            <div key={app._id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                                <div>
                                                    <p className="font-medium text-sm">{app.taskId?.title}</p>
                                                    <p className="text-xs text-slate-500">${app.taskId?.paymentAmount}</p>
                                                </div>
                                                <span className={`badge ${app.status === 'accepted' ? 'badge-success' : app.status === 'applied' ? 'badge-warning' : 'badge-danger'}`}>
                                                    {app.status}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
