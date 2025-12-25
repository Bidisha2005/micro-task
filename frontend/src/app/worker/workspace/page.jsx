'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/common/Sidebar';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import { Briefcase, Clock, Upload, CheckCircle, AlertCircle } from 'lucide-react';

export default function WorkerWorkspace() {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTask, setSelectedTask] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [submission, setSubmission] = useState({ description: '' });

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const response = await api.get('/worker/assigned-tasks');
                if (response.data.success) setTasks(response.data.data);
            } catch (error) {
                console.error('Failed to fetch tasks:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchTasks();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedTask) return;
        setSubmitting(true);
        try {
            const response = await api.post(`/worker/tasks/${selectedTask._id}/submit`, submission);
            if (response.data.success) {
                toast.success('Work submitted!');
                setSelectedTask(null);
                setSubmission({ description: '' });
                // Refresh tasks
                const res = await api.get('/worker/assigned-tasks');
                if (res.data.success) setTasks(res.data.data);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to submit');
        } finally {
            setSubmitting(false);
        }
    };

    const getDaysLeft = (deadline) => {
        const diff = new Date(deadline) - new Date();
        const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
        return days;
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <Sidebar role="worker" />
            <div className="ml-64 p-8">
                <h1 className="text-3xl font-bold text-slate-800 mb-2">My Workspace</h1>
                <p className="text-slate-600 mb-8">Manage your assigned tasks</p>

                {loading ? (
                    <div className="flex justify-center py-12"><div className="w-12 h-12 spinner"></div></div>
                ) : tasks.length === 0 ? (
                    <div className="card text-center py-12">
                        <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                        <p className="text-slate-500 mb-2">No active tasks</p>
                        <a href="/worker/tasks" className="text-primary-600 hover:underline">Find tasks to apply</a>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {tasks.map((task) => {
                            const daysLeft = getDaysLeft(task.deadline);
                            return (
                                <div key={task._id} className="card">
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <h3 className="font-semibold text-lg mb-1">{task.title}</h3>
                                            <p className="text-slate-600 text-sm">{task.description}</p>
                                        </div>
                                        <span className={`badge ${task.status === 'submitted' ? 'badge-info' : 'badge-warning'}`}>
                                            {task.status}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-4 text-sm mb-4">
                                        <span className="font-medium text-primary-600">${task.paymentAmount}</span>
                                        <span className={`flex items-center gap-1 ${daysLeft < 1 ? 'text-red-600' : daysLeft < 2 ? 'text-yellow-600' : 'text-slate-500'}`}>
                                            {daysLeft < 1 ? <AlertCircle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                                            {daysLeft < 1 ? 'Overdue!' : `${daysLeft} day(s) left`}
                                        </span>
                                        <span className="text-slate-500">Deadline: {new Date(task.deadline).toLocaleDateString()}</span>
                                    </div>

                                    {task.status === 'assigned' && (
                                        <button onClick={() => setSelectedTask(task)} className="btn-primary">
                                            <Upload className="w-4 h-4 mr-2" />Submit Work
                                        </button>
                                    )}
                                    {task.status === 'submitted' && (
                                        <div className="flex items-center gap-2 text-blue-600">
                                            <CheckCircle className="w-5 h-5" />
                                            <span>Waiting for company review</span>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {selectedTask && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-lg">
                        <h2 className="text-xl font-semibold mb-4">Submit Work</h2>
                        <div className="mb-4 p-3 bg-slate-50 rounded-lg">
                            <p className="font-medium">{selectedTask.title}</p>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <textarea
                                className="input h-32"
                                placeholder="Describe your completed work, include links to deliverables..."
                                value={submission.description}
                                onChange={(e) => setSubmission({ ...submission, description: e.target.value })}
                                required
                            />
                            <div className="flex gap-3">
                                <button type="button" onClick={() => setSelectedTask(null)} className="btn-secondary flex-1">Cancel</button>
                                <button type="submit" disabled={submitting} className="btn-primary flex-1">
                                    {submitting ? <div className="w-4 h-4 spinner border-2 mx-auto"></div> : 'Submit'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
