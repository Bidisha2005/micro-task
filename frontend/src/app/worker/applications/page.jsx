'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/common/Sidebar';
import api from '@/lib/axios';
import { FileText, Clock, CheckCircle, XCircle } from 'lucide-react';

export default function WorkerApplications() {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');

    useEffect(() => {
        const fetchApplications = async () => {
            try {
                const params = filter ? `?status=${filter}` : '';
                const response = await api.get(`/worker/applications${params}`);
                if (response.data.success) setApplications(response.data.data);
            } catch (error) {
                console.error('Failed to fetch applications:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchApplications();
    }, [filter]);

    const getStatusIcon = (status) => {
        switch (status) {
            case 'accepted': return <CheckCircle className="w-5 h-5 text-green-500" />;
            case 'rejected': return <XCircle className="w-5 h-5 text-red-500" />;
            default: return <Clock className="w-5 h-5 text-yellow-500" />;
        }
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <Sidebar role="worker" />
            <div className="ml-64 p-8">
                <h1 className="text-3xl font-bold text-slate-800 mb-2">My Applications</h1>
                <p className="text-slate-600 mb-8">Track your task applications</p>

                <div className="card mb-6">
                    <select className="input w-auto" value={filter} onChange={(e) => setFilter(e.target.value)}>
                        <option value="">All Applications</option>
                        <option value="applied">Pending</option>
                        <option value="accepted">Accepted</option>
                        <option value="rejected">Rejected</option>
                    </select>
                </div>

                {loading ? (
                    <div className="flex justify-center py-12"><div className="w-12 h-12 spinner"></div></div>
                ) : applications.length === 0 ? (
                    <div className="card text-center py-12">
                        <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                        <p className="text-slate-500">No applications yet</p>
                        <a href="/worker/tasks" className="text-primary-600 hover:underline">Browse tasks</a>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {applications.map((app) => (
                            <div key={app._id} className="card">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            {getStatusIcon(app.status)}
                                            <h3 className="font-semibold text-lg">{app.taskId?.title}</h3>
                                        </div>
                                        <p className="text-slate-600 text-sm mb-2">{app.proposal}</p>
                                        <div className="flex items-center gap-4 text-sm text-slate-500">
                                            <span>${app.taskId?.paymentAmount}</span>
                                            <span>Expected: {app.expectedDeliveryTime}</span>
                                            <span>Applied: {new Date(app.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                    <span className={`badge ${app.status === 'accepted' ? 'badge-success' : app.status === 'rejected' ? 'badge-danger' : 'badge-warning'}`}>
                                        {app.status}
                                    </span>
                                </div>
                                {app.status === 'accepted' && (
                                    <div className="mt-4 pt-4 border-t">
                                        <a href="/worker/workspace" className="btn-primary text-sm">Go to Workspace</a>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
