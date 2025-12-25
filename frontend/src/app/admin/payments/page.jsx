'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/common/Sidebar';
import api from '@/lib/axios';
import { CreditCard, DollarSign, Clock, CheckCircle } from 'lucide-react';

export default function PaymentsPage() {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });
    const [statusFilter, setStatusFilter] = useState('');

    useEffect(() => {
        const fetchPayments = async () => {
            try {
                setLoading(true);
                const params = new URLSearchParams({
                    page: pagination.page,
                    limit: pagination.limit,
                    ...(statusFilter && { status: statusFilter })
                });
                const response = await api.get(`/admin/payments?${params}`);
                if (response.data.success) {
                    setPayments(response.data.data);
                    setPagination(prev => ({ ...prev, ...response.data.pagination }));
                }
            } catch (error) {
                console.error('Failed to fetch payments:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchPayments();
    }, [pagination.page, statusFilter]);

    return (
        <div className="min-h-screen bg-slate-50">
            <Sidebar role="admin" />
            <div className="ml-64 p-8">
                <h1 className="text-3xl font-bold text-slate-800 mb-2">Payment Oversight</h1>
                <p className="text-slate-600 mb-6">Monitor all platform payments</p>

                <div className="card mb-6">
                    <select
                        className="input w-auto"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                    </select>
                </div>

                <div className="card p-0 overflow-hidden">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Task</th>
                                <th>Worker</th>
                                <th>Company</th>
                                <th>Amount</th>
                                <th>Commission</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={6} className="text-center py-8"><div className="w-8 h-8 spinner mx-auto"></div></td></tr>
                            ) : payments.length === 0 ? (
                                <tr><td colSpan={6} className="text-center py-8 text-slate-500">No payments found</td></tr>
                            ) : payments.map((payment) => (
                                <tr key={payment._id}>
                                    <td>{payment.taskId?.title || 'N/A'}</td>
                                    <td>{payment.workerId?.name}</td>
                                    <td>{payment.companyId?.name}</td>
                                    <td className="font-medium">${payment.amount}</td>
                                    <td>${payment.platformFee}</td>
                                    <td>
                                        <span className={`badge ${payment.status === 'confirmed' ? 'badge-success' : 'badge-warning'}`}>
                                            {payment.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
