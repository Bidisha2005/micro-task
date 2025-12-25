'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/common/Sidebar';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import { CreditCard, CheckCircle, Upload } from 'lucide-react';

export default function CompanyPayments() {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPayments = async () => {
            try {
                const response = await api.get('/company/payments');
                if (response.data.success) setPayments(response.data.data);
            } catch (error) {
                console.error('Failed to fetch payments:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchPayments();
    }, []);

    const handleConfirm = async (paymentId) => {
        try {
            const response = await api.put(`/company/payments/${paymentId}/confirm`);
            if (response.data.success) {
                toast.success('Payment confirmed!');
                setPayments(payments.map(p => p._id === paymentId ? { ...p, status: 'confirmed' } : p));
            }
        } catch (error) {
            toast.error('Failed to confirm payment');
        }
    };

    const pendingTotal = payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0);
    const confirmedTotal = payments.filter(p => p.status === 'confirmed').reduce((sum, p) => sum + p.amount, 0);

    return (
        <div className="min-h-screen bg-slate-50">
            <Sidebar role="company" />
            <div className="ml-64 p-8">
                <h1 className="text-3xl font-bold text-slate-800 mb-2">Payments</h1>
                <p className="text-slate-600 mb-8">Manage task payments</p>

                <div className="grid md:grid-cols-2 gap-4 mb-8">
                    <div className="card">
                        <p className="text-slate-500 text-sm">Pending Payments</p>
                        <p className="text-3xl font-bold text-yellow-600">${pendingTotal.toLocaleString()}</p>
                    </div>
                    <div className="card">
                        <p className="text-slate-500 text-sm">Confirmed Payments</p>
                        <p className="text-3xl font-bold text-green-600">${confirmedTotal.toLocaleString()}</p>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center py-12"><div className="w-12 h-12 spinner"></div></div>
                ) : payments.length === 0 ? (
                    <div className="card text-center py-12"><p className="text-slate-500">No payments yet</p></div>
                ) : (
                    <div className="card p-0 overflow-hidden">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Task</th>
                                    <th>Worker</th>
                                    <th>Amount</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {payments.map((payment) => (
                                    <tr key={payment._id}>
                                        <td>{payment.taskId?.title || 'N/A'}</td>
                                        <td>{payment.workerId?.name}</td>
                                        <td className="font-medium">${payment.amount}</td>
                                        <td>
                                            <span className={`badge ${payment.status === 'confirmed' ? 'badge-success' : 'badge-warning'}`}>
                                                {payment.status}
                                            </span>
                                        </td>
                                        <td>
                                            {payment.status === 'pending' && (
                                                <button onClick={() => handleConfirm(payment._id)} className="btn-success text-sm py-1.5 flex items-center gap-1">
                                                    <CheckCircle className="w-4 h-4" /> Confirm
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
