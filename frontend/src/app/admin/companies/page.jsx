'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/common/Sidebar';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import { CheckCircle, XCircle, Building2, Shield } from 'lucide-react';

export default function CompaniesPage() {
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });
    const [statusFilter, setStatusFilter] = useState('');

    useEffect(() => {
        fetchCompanies();
    }, [pagination.page, statusFilter]);

    const fetchCompanies = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                page: pagination.page,
                limit: pagination.limit,
                ...(statusFilter && { verificationStatus: statusFilter })
            });

            const response = await api.get(`/admin/companies?${params}`);
            if (response.data.success) {
                setCompanies(response.data.data);
                setPagination(prev => ({ ...prev, ...response.data.pagination }));
            }
        } catch (error) {
            console.error('Failed to fetch companies:', error);
            toast.error('Failed to fetch companies');
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async (companyId, status) => {
        try {
            const response = await api.put(`/admin/companies/${companyId}/verify`, {
                verificationStatus: status
            });
            if (response.data.success) {
                toast.success(`Company ${status}`);
                fetchCompanies();
            }
        } catch (error) {
            toast.error('Failed to update verification status');
        }
    };

    const getVerificationBadge = (status) => {
        const styles = {
            pending: 'badge-warning',
            approved: 'badge-success',
            rejected: 'badge-danger'
        };
        return styles[status] || 'badge-neutral';
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <Sidebar role="admin" />

            <div className="ml-64 p-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-800">Company Management</h1>
                    <p className="text-slate-600 mt-1">Verify and manage companies</p>
                </div>

                {/* Filters */}
                <div className="card mb-6">
                    <div className="flex flex-wrap gap-4 items-center">
                        <div className="flex items-center gap-2">
                            <Shield className="w-5 h-5 text-yellow-500" />
                            <span className="text-sm text-slate-600">
                                {companies.filter(c => c.verificationStatus === 'pending').length} pending verification
                            </span>
                        </div>
                        <div className="flex-1"></div>
                        <select
                            className="input w-auto"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                        </select>
                    </div>
                </div>

                {/* Companies Grid */}
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="w-12 h-12 spinner"></div>
                    </div>
                ) : companies.length === 0 ? (
                    <div className="card text-center py-12">
                        <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                        <p className="text-slate-500">No companies found</p>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {companies.map((company) => (
                            <div key={company._id} className="card">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                                            {company.logo ? (
                                                <img
                                                    src={company.logo}
                                                    alt={company.companyName}
                                                    className="w-full h-full object-cover rounded-xl"
                                                />
                                            ) : (
                                                <Building2 className="w-6 h-6 text-blue-600" />
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-slate-800">{company.companyName}</h3>
                                            <p className="text-sm text-slate-500">{company.domain || 'No domain'}</p>
                                        </div>
                                    </div>
                                    <span className={`badge ${getVerificationBadge(company.verificationStatus)}`}>
                                        {company.verificationStatus}
                                    </span>
                                </div>

                                <div className="space-y-2 mb-4">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500">Owner</span>
                                        <span className="text-slate-700">{company.userId?.name}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500">Email</span>
                                        <span className="text-slate-700">{company.userId?.email}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500">Rating</span>
                                        <span className="text-slate-700">
                                            {company.rating > 0 ? `${company.rating.toFixed(1)} ⭐` : 'No ratings'}
                                        </span>
                                    </div>
                                </div>

                                {company.verificationStatus === 'pending' && (
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleVerify(company._id, 'approved')}
                                            className="btn-success flex-1 text-sm py-2"
                                        >
                                            <CheckCircle className="w-4 h-4 mr-1" />
                                            Approve
                                        </button>
                                        <button
                                            onClick={() => handleVerify(company._id, 'rejected')}
                                            className="btn-danger flex-1 text-sm py-2"
                                        >
                                            <XCircle className="w-4 h-4 mr-1" />
                                            Reject
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {pagination.pages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-8">
                        <button
                            onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                            disabled={pagination.page === 1}
                            className="btn-secondary disabled:opacity-50"
                        >
                            Previous
                        </button>
                        <span className="text-slate-600">
                            Page {pagination.page} of {pagination.pages}
                        </span>
                        <button
                            onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                            disabled={pagination.page >= pagination.pages}
                            className="btn-secondary disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
