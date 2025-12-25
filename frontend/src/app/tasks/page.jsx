'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/common/Navbar';
import api from '@/lib/axios';
import { Search, DollarSign, Clock, Building2 } from 'lucide-react';
import Link from 'next/link';

export default function TasksPage() {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ search: '', minPayment: '', duration: '' });

    useEffect(() => { fetchTasks(); }, []);

    const fetchTasks = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (filters.search) params.append('search', filters.search);
            if (filters.minPayment) params.append('minPayment', filters.minPayment);
            if (filters.duration) params.append('duration', filters.duration);

            const response = await api.get(`/tasks?${params}`);
            if (response.data.success) setTasks(response.data.data);
        } catch (error) {
            console.error('Failed to fetch tasks:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold text-slate-800 mb-2">Browse Tasks</h1>
                <p className="text-slate-600 mb-8">Find short-term tasks that match your skills</p>

                <div className="card mb-6">
                    <div className="flex flex-wrap gap-4">
                        <div className="flex-1 min-w-[200px]">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input type="text" placeholder="Search tasks..." className="input pl-10" value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} />
                            </div>
                        </div>
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
                    <div className="card text-center py-12"><p className="text-slate-500">No tasks available</p></div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {tasks.map((task) => (
                            <div key={task._id} className="card hover:shadow-lg transition-shadow">
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                        <Building2 className="w-4 h-4 text-blue-600" />
                                    </div>
                                    <span className="text-sm text-slate-500">{task.company?.profile?.companyName || 'Company'}</span>
                                </div>
                                <h3 className="font-semibold text-lg mb-2">{task.title}</h3>
                                <p className="text-slate-600 text-sm line-clamp-2 mb-3">{task.description}</p>
                                <div className="flex flex-wrap gap-1 mb-4">
                                    {task.requiredSkills?.slice(0, 3).map((skill, i) => (
                                        <span key={i} className="badge badge-info text-xs">{skill}</span>
                                    ))}
                                </div>
                                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                                    <div className="flex items-center gap-3 text-sm text-slate-500">
                                        <span className="flex items-center gap-1"><DollarSign className="w-4 h-4" />{task.paymentAmount}</span>
                                        <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{task.duration}d</span>
                                    </div>
                                    <Link href="/login" className="text-primary-600 hover:text-primary-700 font-medium text-sm">Apply →</Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
