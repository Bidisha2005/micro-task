'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/common/Sidebar';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import { CheckCircle, XCircle, User, FileText } from 'lucide-react';

export default function CompanyApplications() {
    const [tasks, setTasks] = useState([]);
    const [selectedTask, setSelectedTask] = useState(null);
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { fetchTasks(); }, []);

    const fetchTasks = async () => {
        try {
            const response = await api.get('/company/tasks');
            if (response.data.success) {
                setTasks(response.data.data.filter(t => ['open', 'assigned'].includes(t.status)));
            }
        } catch (error) {
            console.error('Failed to fetch tasks:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchApplications = async (taskId) => {
        try {
            const response = await api.get(`/company/tasks/${taskId}/applications`);
            if (response.data.success) {
                setApplications(response.data.data);
                setSelectedTask(tasks.find(t => t._id === taskId));
            }
        } catch (error) {
            toast.error('Failed to fetch applications');
        }
    };

    const handleAccept = async (appId) => {
        try {
            const response = await api.put(`/company/applications/${appId}/accept`);
            if (response.data.success) {
                toast.success('Worker assigned!');
                fetchApplications(selectedTask._id);
                fetchTasks();
            }
        } catch (error) {
            toast.error('Failed to accept application');
        }
    };

    const handleReject = async (appId) => {
        try {
            const response = await api.put(`/company/applications/${appId}/reject`);
            if (response.data.success) {
                toast.success('Application rejected');
                fetchApplications(selectedTask._id);
            }
        } catch (error) {
            toast.error('Failed to reject application');
        }
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <Sidebar role="company" />
            <div className="ml-64 p-8">
                <h1 className="text-3xl font-bold text-slate-800 mb-2">Applications</h1>
                <p className="text-slate-600 mb-8">Review worker applications for your tasks</p>

                <div className="grid lg:grid-cols-3 gap-6">
                    <div className="card">
                        <h2 className="font-semibold mb-4">Select a Task</h2>
                        {loading ? (
                            <div className="py-4 text-center"><div className="w-8 h-8 spinner mx-auto"></div></div>
                        ) : tasks.length === 0 ? (
                            <p className="text-slate-500 text-sm">No open tasks</p>
                        ) : (
                            <div className="space-y-2">
                                {tasks.map((task) => (
                                    <button
                                        key={task._id}
                                        onClick={() => fetchApplications(task._id)}
                                        className={`w-full text-left p-3 rounded-lg transition-colors ${selectedTask?._id === task._id ? 'bg-primary-50 border-primary-200 border' : 'bg-slate-50 hover:bg-slate-100'}`}
                                    >
                                        <p className="font-medium text-sm">{task.title}</p>
                                        <p className="text-xs text-slate-500">${task.paymentAmount}</p>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="lg:col-span-2 card">
                        <h2 className="font-semibold mb-4">
                            {selectedTask ? `Applications for: ${selectedTask.title}` : 'Select a task to view applications'}
                        </h2>
                        {!selectedTask ? (
                            <p className="text-slate-500 text-center py-8">Select a task from the left</p>
                        ) : applications.length === 0 ? (
                            <p className="text-slate-500 text-center py-8">No applications yet</p>
                        ) : (
                            <div className="space-y-4">
                                {applications.map((app) => (
                                    <div key={app._id} className="p-4 bg-slate-50 rounded-lg">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                                                    <User className="w-5 h-5 text-primary-600" />
                                                </div>
                                                <div>
                                                    <p className="font-medium">{app.workerId?.name}</p>
                                                    <p className="text-sm text-slate-500">{app.workerId?.email}</p>
                                                </div>
                                            </div>
                                            <span className={`badge ${app.status === 'applied' ? 'badge-warning' : app.status === 'accepted' ? 'badge-success' : 'badge-danger'}`}>
                                                {app.status}
                                            </span>
                                        </div>
                                        <div className="mb-3">
                                            <p className="text-sm text-slate-600">{app.proposal}</p>
                                            <p className="text-xs text-slate-400 mt-1">Expected: {app.expectedDeliveryTime}</p>
                                        </div>
                                        {app.workerProfile && (
                                            <div className="flex flex-wrap gap-1 mb-3">
                                                {app.workerProfile.skills?.map((skill, i) => (
                                                    <span key={i} className="badge badge-info text-xs">{skill}</span>
                                                ))}
                                            </div>
                                        )}
                                        {app.status === 'applied' && (
                                            <div className="flex gap-2">
                                                <button onClick={() => handleAccept(app._id)} className="btn-success text-sm py-1.5 flex items-center gap-1">
                                                    <CheckCircle className="w-4 h-4" /> Accept
                                                </button>
                                                <button onClick={() => handleReject(app._id)} className="btn-danger text-sm py-1.5 flex items-center gap-1">
                                                    <XCircle className="w-4 h-4" /> Reject
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
