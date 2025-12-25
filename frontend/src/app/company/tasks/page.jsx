'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/common/Sidebar';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import { Plus, Eye, Edit, XCircle } from 'lucide-react';

export default function CompanyTasks() {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        title: '', description: '', requiredSkills: '', category: '',
        duration: 1, paymentAmount: '', deadline: '', numberOfWorkers: 1
    });

    useEffect(() => { fetchTasks(); }, []);

    const fetchTasks = async () => {
        try {
            const response = await api.get('/company/tasks');
            if (response.data.success) setTasks(response.data.data);
        } catch (error) {
            console.error('Failed to fetch tasks:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                requiredSkills: formData.requiredSkills.split(',').map(s => s.trim()).filter(Boolean),
                paymentAmount: parseFloat(formData.paymentAmount)
            };
            const response = await api.post('/company/tasks', payload);
            if (response.data.success) {
                toast.success('Task created! Pending admin approval.');
                setShowModal(false);
                setFormData({ title: '', description: '', requiredSkills: '', category: '', duration: 1, paymentAmount: '', deadline: '', numberOfWorkers: 1 });
                fetchTasks();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create task');
        }
    };

    const getStatusBadge = (status) => {
        const styles = { draft: 'badge-neutral', pendingApproval: 'badge-warning', open: 'badge-success', assigned: 'badge-info', completed: 'badge-success', rejected: 'badge-danger' };
        return styles[status] || 'badge-neutral';
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <Sidebar role="company" />
            <div className="ml-64 p-8">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800">My Tasks</h1>
                        <p className="text-slate-600">Manage your posted tasks</p>
                    </div>
                    <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
                        <Plus className="w-4 h-4" /> Post New Task
                    </button>
                </div>

                {loading ? (
                    <div className="flex justify-center py-12"><div className="w-12 h-12 spinner"></div></div>
                ) : tasks.length === 0 ? (
                    <div className="card text-center py-12">
                        <p className="text-slate-500 mb-4">No tasks yet. Create your first task!</p>
                        <button onClick={() => setShowModal(true)} className="btn-primary">Post a Task</button>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {tasks.map((task) => (
                            <div key={task._id} className="card flex items-center justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="font-semibold text-lg">{task.title}</h3>
                                        <span className={`badge ${getStatusBadge(task.status)}`}>{task.status}</span>
                                    </div>
                                    <p className="text-slate-600 text-sm line-clamp-1 mb-2">{task.description}</p>
                                    <div className="flex items-center gap-4 text-sm text-slate-500">
                                        <span>${task.paymentAmount}</span>
                                        <span>{task.duration} day(s)</span>
                                        <span>Workers: {task.assignedWorkers?.length || 0}/{task.numberOfWorkers}</span>
                                    </div>
                                </div>
                                <a href={`/company/tasks/${task._id}`} className="btn-secondary text-sm">View Details</a>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between mb-4">
                            <h2 className="text-xl font-semibold">Post New Task</h2>
                            <button onClick={() => setShowModal(false)}><XCircle className="w-6 h-6 text-slate-400" /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <input type="text" placeholder="Task Title" className="input" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
                            <textarea placeholder="Description" className="input h-24" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} required />
                            <input type="text" placeholder="Skills (comma separated)" className="input" value={formData.requiredSkills} onChange={(e) => setFormData({ ...formData, requiredSkills: e.target.value })} />
                            <div className="grid grid-cols-2 gap-4">
                                <input type="number" placeholder="Payment ($)" className="input" value={formData.paymentAmount} onChange={(e) => setFormData({ ...formData, paymentAmount: e.target.value })} required min="1" />
                                <select className="input" value={formData.duration} onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}>
                                    <option value={1}>1 Day</option>
                                    <option value={2}>2 Days</option>
                                    <option value={3}>3 Days</option>
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <input type="date" className="input" value={formData.deadline} onChange={(e) => setFormData({ ...formData, deadline: e.target.value })} required />
                                <input type="number" placeholder="Workers needed" className="input" value={formData.numberOfWorkers} onChange={(e) => setFormData({ ...formData, numberOfWorkers: parseInt(e.target.value) })} min="1" />
                            </div>
                            <button type="submit" className="btn-primary w-full">Create Task</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
