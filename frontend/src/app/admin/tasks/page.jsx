'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/common/Sidebar';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import { Search, CheckCircle, XCircle, Eye, Clock } from 'lucide-react';

export default function TasksPage() {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });
    const [statusFilter, setStatusFilter] = useState('');
    const [selectedTask, setSelectedTask] = useState(null);
    const [rejectReason, setRejectReason] = useState('');
    const [showRejectModal, setShowRejectModal] = useState(false);

    useEffect(() => {
        fetchTasks();
    }, [pagination.page, statusFilter]);

    const fetchTasks = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                page: pagination.page,
                limit: pagination.limit,
                ...(statusFilter && { status: statusFilter })
            });

            const response = await api.get(`/admin/tasks?${params}`);
            if (response.data.success) {
                setTasks(response.data.data);
                setPagination(prev => ({ ...prev, ...response.data.pagination }));
            }
        } catch (error) {
            console.error('Failed to fetch tasks:', error);
            toast.error('Failed to fetch tasks');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (taskId) => {
        try {
            const response = await api.put(`/admin/tasks/${taskId}/approve`);
            if (response.data.success) {
                toast.success('Task approved successfully');
                fetchTasks();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to approve task');
        }
    };

    const handleReject = async () => {
        if (!selectedTask) return;

        try {
            const response = await api.put(`/admin/tasks/${selectedTask._id}/reject`, {
                reason: rejectReason
            });
            if (response.data.success) {
                toast.success('Task rejected');
                setShowRejectModal(false);
                setRejectReason('');
                setSelectedTask(null);
                fetchTasks();
            }
        } catch (error) {
            toast.error('Failed to reject task');
        }
    };

    const handleDelete = async (taskId) => {
        if (!confirm('Are you sure you want to delete this task?')) return;

        try {
            const response = await api.delete(`/admin/tasks/${taskId}`);
            if (response.data.success) {
                toast.success('Task deleted');
                fetchTasks();
            }
        } catch (error) {
            toast.error('Failed to delete task');
        }
    };

    const getStatusBadge = (status) => {
        const styles = {
            draft: 'badge-neutral',
            pendingApproval: 'badge-warning',
            open: 'badge-success',
            assigned: 'badge-info',
            submitted: 'badge-info',
            completed: 'badge-success',
            rejected: 'badge-danger'
        };
        return styles[status] || 'badge-neutral';
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <Sidebar role="admin" />

            <div className="ml-64 p-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-800">Task Moderation</h1>
                    <p className="text-slate-600 mt-1">Approve, reject, or remove tasks</p>
                </div>

                {/* Filters */}
                <div className="card mb-6">
                    <div className="flex flex-wrap gap-4 items-center">
                        <div className="flex items-center gap-2">
                            <Clock className="w-5 h-5 text-yellow-500" />
                            <span className="text-sm text-slate-600">
                                {tasks.filter(t => t.status === 'pendingApproval').length} pending approval
                            </span>
                        </div>
                        <div className="flex-1"></div>
                        <select
                            className="input w-auto"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="">All Status</option>
                            <option value="draft">Draft</option>
                            <option value="pendingApproval">Pending Approval</option>
                            <option value="open">Open</option>
                            <option value="assigned">Assigned</option>
                            <option value="submitted">Submitted</option>
                            <option value="completed">Completed</option>
                            <option value="rejected">Rejected</option>
                        </select>
                    </div>
                </div>

                {/* Tasks Table */}
                <div className="card p-0 overflow-hidden">
                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Task</th>
                                    <th>Company</th>
                                    <th>Payment</th>
                                    <th>Duration</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={6} className="text-center py-8">
                                            <div className="w-8 h-8 spinner mx-auto"></div>
                                        </td>
                                    </tr>
                                ) : tasks.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="text-center py-8 text-slate-500">
                                            No tasks found
                                        </td>
                                    </tr>
                                ) : (
                                    tasks.map((task) => (
                                        <tr key={task._id}>
                                            <td>
                                                <div>
                                                    <p className="font-medium text-slate-800">{task.title}</p>
                                                    <p className="text-sm text-slate-500 line-clamp-1">{task.description}</p>
                                                </div>
                                            </td>
                                            <td className="text-slate-600">{task.companyId?.name || 'Unknown'}</td>
                                            <td className="font-medium text-slate-800">${task.paymentAmount}</td>
                                            <td className="text-slate-600">{task.duration} day(s)</td>
                                            <td>
                                                <span className={`badge ${getStatusBadge(task.status)}`}>
                                                    {task.status}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="flex items-center gap-2">
                                                    {task.status === 'pendingApproval' && (
                                                        <>
                                                            <button
                                                                onClick={() => handleApprove(task._id)}
                                                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                                                                title="Approve"
                                                            >
                                                                <CheckCircle className="w-5 h-5" />
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    setSelectedTask(task);
                                                                    setShowRejectModal(true);
                                                                }}
                                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                                                title="Reject"
                                                            >
                                                                <XCircle className="w-5 h-5" />
                                                            </button>
                                                        </>
                                                    )}
                                                    <button
                                                        onClick={() => setSelectedTask(task)}
                                                        className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                                                        title="View Details"
                                                    >
                                                        <Eye className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {pagination.pages > 1 && (
                        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200">
                            <p className="text-sm text-slate-600">
                                Page {pagination.page} of {pagination.pages}
                            </p>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                                    disabled={pagination.page === 1}
                                    className="btn-secondary disabled:opacity-50"
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                                    disabled={pagination.page >= pagination.pages}
                                    className="btn-secondary disabled:opacity-50"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Reject Modal */}
            {showRejectModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md">
                        <h3 className="text-lg font-semibold text-slate-800 mb-4">Reject Task</h3>
                        <p className="text-slate-600 mb-4">Provide a reason for rejection:</p>
                        <textarea
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            className="input h-24 resize-none"
                            placeholder="Enter rejection reason..."
                        />
                        <div className="flex gap-3 mt-4">
                            <button
                                onClick={() => {
                                    setShowRejectModal(false);
                                    setRejectReason('');
                                    setSelectedTask(null);
                                }}
                                className="btn-secondary flex-1"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleReject}
                                className="btn-danger flex-1"
                            >
                                Reject Task
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Task Detail Modal */}
            {selectedTask && !showRejectModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-semibold text-slate-800">{selectedTask.title}</h3>
                            <button
                                onClick={() => setSelectedTask(null)}
                                className="text-slate-400 hover:text-slate-600"
                            >
                                <XCircle className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <p className="text-sm text-slate-500">Description</p>
                                <p className="text-slate-700">{selectedTask.description}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-slate-500">Payment</p>
                                    <p className="text-slate-700 font-medium">${selectedTask.paymentAmount}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500">Duration</p>
                                    <p className="text-slate-700">{selectedTask.duration} day(s)</p>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500">Deadline</p>
                                    <p className="text-slate-700">{new Date(selectedTask.deadline).toLocaleDateString()}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500">Workers Needed</p>
                                    <p className="text-slate-700">{selectedTask.numberOfWorkers}</p>
                                </div>
                            </div>

                            <div>
                                <p className="text-sm text-slate-500">Required Skills</p>
                                <div className="flex flex-wrap gap-2 mt-1">
                                    {selectedTask.requiredSkills?.map((skill, idx) => (
                                        <span key={idx} className="badge badge-info">{skill}</span>
                                    )) || <span className="text-slate-400">No skills specified</span>}
                                </div>
                            </div>

                            {selectedTask.status === 'pendingApproval' && (
                                <div className="flex gap-3 pt-4">
                                    <button
                                        onClick={() => {
                                            handleApprove(selectedTask._id);
                                            setSelectedTask(null);
                                        }}
                                        className="btn-success flex-1"
                                    >
                                        <CheckCircle className="w-4 h-4 mr-2" />
                                        Approve
                                    </button>
                                    <button
                                        onClick={() => setShowRejectModal(true)}
                                        className="btn-danger flex-1"
                                    >
                                        <XCircle className="w-4 h-4 mr-2" />
                                        Reject
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
