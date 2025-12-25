'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/common/Sidebar';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import { Search, Filter, UserX, UserCheck, Shield } from 'lucide-react';

export default function UsersPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });
    const [filters, setFilters] = useState({ role: '', status: '', search: '' });

    useEffect(() => {
        fetchUsers();
    }, [pagination.page, filters]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                page: pagination.page,
                limit: pagination.limit,
                ...(filters.role && { role: filters.role }),
                ...(filters.status && { status: filters.status }),
                ...(filters.search && { search: filters.search })
            });

            const response = await api.get(`/admin/users?${params}`);
            if (response.data.success) {
                setUsers(response.data.data);
                setPagination(prev => ({ ...prev, ...response.data.pagination }));
            }
        } catch (error) {
            console.error('Failed to fetch users:', error);
            toast.error('Failed to fetch users');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (userId, newStatus) => {
        try {
            const response = await api.put(`/admin/users/${userId}/status`, { status: newStatus });
            if (response.data.success) {
                toast.success(`User ${newStatus === 'active' ? 'unblocked' : 'blocked'} successfully`);
                fetchUsers();
            }
        } catch (error) {
            toast.error('Failed to update user status');
        }
    };

    const handleRoleChange = async (userId, newRole) => {
        try {
            const response = await api.put(`/admin/users/${userId}/role`, { role: newRole });
            if (response.data.success) {
                toast.success('Role updated successfully');
                fetchUsers();
            }
        } catch (error) {
            toast.error('Failed to update role');
        }
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <Sidebar role="admin" />

            <div className="ml-64 p-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-800">User Management</h1>
                    <p className="text-slate-600 mt-1">Manage all platform users</p>
                </div>

                {/* Filters */}
                <div className="card mb-6">
                    <div className="flex flex-wrap gap-4">
                        <div className="flex-1 min-w-[200px]">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search users..."
                                    className="input pl-10"
                                    value={filters.search}
                                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                                    onKeyDown={(e) => e.key === 'Enter' && fetchUsers()}
                                />
                            </div>
                        </div>
                        <select
                            className="input w-auto"
                            value={filters.role}
                            onChange={(e) => setFilters(prev => ({ ...prev, role: e.target.value }))}
                        >
                            <option value="">All Roles</option>
                            <option value="admin">Admin</option>
                            <option value="company">Company</option>
                            <option value="worker">Worker</option>
                        </select>
                        <select
                            className="input w-auto"
                            value={filters.status}
                            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                        >
                            <option value="">All Status</option>
                            <option value="active">Active</option>
                            <option value="blocked">Blocked</option>
                        </select>
                    </div>
                </div>

                {/* Users Table */}
                <div className="card p-0 overflow-hidden">
                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>User</th>
                                    <th>Role</th>
                                    <th>Status</th>
                                    <th>Joined</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={5} className="text-center py-8">
                                            <div className="w-8 h-8 spinner mx-auto"></div>
                                        </td>
                                    </tr>
                                ) : users.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="text-center py-8 text-slate-500">
                                            No users found
                                        </td>
                                    </tr>
                                ) : (
                                    users.map((user) => (
                                        <tr key={user._id}>
                                            <td>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                                                        <span className="text-primary-600 font-semibold">
                                                            {user.name?.charAt(0)?.toUpperCase() || 'U'}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-slate-800">{user.name}</p>
                                                        <p className="text-sm text-slate-500">{user.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <select
                                                    value={user.role}
                                                    onChange={(e) => handleRoleChange(user._id, e.target.value)}
                                                    className="text-sm border border-slate-200 rounded px-2 py-1"
                                                >
                                                    <option value="admin">Admin</option>
                                                    <option value="company">Company</option>
                                                    <option value="worker">Worker</option>
                                                </select>
                                            </td>
                                            <td>
                                                <span className={`badge ${user.status === 'active' ? 'badge-success' : 'badge-danger'}`}>
                                                    <span className={`status-dot ${user.status === 'active' ? 'status-active' : 'status-blocked'}`}></span>
                                                    {user.status}
                                                </span>
                                            </td>
                                            <td className="text-slate-600">
                                                {new Date(user.createdAt).toLocaleDateString()}
                                            </td>
                                            <td>
                                                {user.status === 'active' ? (
                                                    <button
                                                        onClick={() => handleStatusChange(user._id, 'blocked')}
                                                        className="flex items-center gap-1 text-red-600 hover:text-red-700"
                                                    >
                                                        <UserX className="w-4 h-4" />
                                                        Block
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => handleStatusChange(user._id, 'active')}
                                                        className="flex items-center gap-1 text-green-600 hover:text-green-700"
                                                    >
                                                        <UserCheck className="w-4 h-4" />
                                                        Unblock
                                                    </button>
                                                )}
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
                                Showing {(pagination.page - 1) * pagination.limit + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
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
        </div>
    );
}
