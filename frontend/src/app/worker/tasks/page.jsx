'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/common/Sidebar';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import { Search, DollarSign, Clock, Briefcase, Send, XCircle } from 'lucide-react';

export default function WorkerTasks() {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ search: '', minPayment: '', maxPayment: '', duration: '' });
    const [selectedTask, setSelectedTask] = useState(null);
    const [applying, setApplying] = useState(false);
    const [application, setApplication] = useState({ proposal: '', expectedDeliveryTime: '' });

    useEffect(() => { fetchTasks(); }, []);

    const fetchTasks = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (filters.search) params.append('search', filters.search);
            if (filters.minPayment) params.append('minPayment', filters.minPayment);
            if (filters.maxPayment) params.append('maxPayment', filters.maxPayment);
            if (filters.duration) params.append('duration', filters.duration);

            const response = await api.get(`/worker/tasks?${params}`);
            if (response.data.success) setTasks(response.data.data);
        } catch (error) {
            console.error('Failed to fetch tasks:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApply = async (e) => {
        e.preventDefault();
        if (!selectedTask) return;
        setApplying(true);
        try {
            const response = await api.post(`/worker/tasks/${selectedTask._id}/apply`, application);
            if (response.data.success) {
                toast.success('Application submitted!');
                setSelectedTask(null);
                setApplication({ proposal: '', expectedDeliveryTime: '' });
                fetchTasks();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to apply');
        } finally {
            setApplying(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <Sidebar role="worker" />
            <div className="ml-64 p-8">
                <h1 className="text-3xl font-bold text-slate-800 mb-2">Find Tasks</h1>
                <p className="text-slate-600 mb-8">Browse and apply for available tasks</p>

                <div className="card mb-6">
                    <div className="flex flex-wrap gap-4">
                        <div className="flex-1 min-w-[200px]">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 z-10 pointer-events-none" />
                                <input
                                    type="text"
                                    placeholder="Search tasks..."
                                    className="input pl-10 w-full"
                                    value={filters.search}
                                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                                />
                            </div>
                        </div>
                        <input type="number" placeholder="Min $" className="input w-24" value={filters.minPayment} onChange={(e) => setFilters({ ...filters, minPayment: e.target.value })} />
                        <input type="number" placeholder="Max $" className="input w-24" value={filters.maxPayment} onChange={(e) => setFilters({ ...filters, maxPayment: e.target.value })} />
                        <select className="input w-auto" value={filters.duration} onChange={(e) => setFilters({ ...filters, duration: e.target.value })}>
                            <option value="">Any Duration</option>
                            <option value="1">1 Day</option>
                            <option value="2">2 Days</option>
                            <option value="3">3 Days</option>
                        </select>
                        <button onClick={fetchTasks} className="btn-primary">Search</button>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center py-12"><div className="w-12 h-12 spinner"></div></div>
                ) : tasks.length === 0 ? (
                    <div className="card text-center py-12"><p className="text-slate-500">No tasks found</p></div>
                ) : (
                    <div className="grid md:grid-cols-2 gap-4">
                        {tasks.map((task) => (
                            <div key={task._id} className="card hover:shadow-lg transition-shadow">
                                <div className="flex items-start justify-between mb-3">
                                    <h3 className="font-semibold text-lg">{task.title}</h3>
                                    <span className="text-lg font-bold text-primary-600">${task.paymentAmount}</span>
                                </div>
                                <p className="text-slate-600 text-sm line-clamp-2 mb-3">{task.description}</p>
                                <div className="flex flex-wrap gap-1 mb-3">
                                    {task.requiredSkills?.slice(0, 4).map((skill, i) => (
                                        <span key={i} className="badge badge-info text-xs">{skill}</span>
                                    ))}
                                </div>
                                <div className="flex items-center justify-between text-sm text-slate-500">
                                    <div className="flex items-center gap-3">
                                        <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{task.duration}d</span>
                                        <span>{task.company?.profile?.companyName || 'Company'}</span>
                                    </div>
                                    <button onClick={() => setSelectedTask(task)} className="btn-primary text-sm py-1.5">Apply</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {selectedTask && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-lg">
                        <div className="flex justify-between mb-4">
                            <h2 className="text-xl font-semibold">Apply for Task</h2>
                            <button onClick={() => setSelectedTask(null)}><XCircle className="w-6 h-6 text-slate-400" /></button>
                        </div>
                        <div className="mb-4 p-3 bg-slate-50 rounded-lg">
                            <p className="font-medium">{selectedTask.title}</p>
                            <p className="text-sm text-slate-500">${selectedTask.paymentAmount} • {selectedTask.duration} day(s)</p>
                        </div>
                        <form onSubmit={handleApply} className="space-y-4">
                            <textarea
                                className="input h-24"
                                placeholder="Why are you a good fit for this task?"
                                value={application.proposal}
                                onChange={(e) => setApplication({ ...application, proposal: e.target.value })}
                                required
                            />
                            <input
                                type="text"
                                className="input"
                                placeholder="Expected delivery time (e.g., 2 days)"
                                value={application.expectedDeliveryTime}
                                onChange={(e) => setApplication({ ...application, expectedDeliveryTime: e.target.value })}
                                required
                            />
                            <button type="submit" disabled={applying} className="btn-primary w-full flex items-center justify-center gap-2">
                                {applying ? <div className="w-4 h-4 spinner border-2"></div> : <><Send className="w-4 h-4" /> Submit Application</>}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
