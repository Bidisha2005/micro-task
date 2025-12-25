'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/common/Sidebar';
import api from '@/lib/axios';
import { DollarSign, Clock, CheckCircle, TrendingUp } from 'lucide-react';

export default function WorkerEarnings() {
    const [earnings, setEarnings] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEarnings = async () => {
            try {
                const response = await api.get('/worker/earnings');
                if (response.data.success) setEarnings(response.data.data);
            } catch (error) {
                console.error('Failed to fetch earnings:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchEarnings();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50">
                <Sidebar role="worker" />
                <div className="ml-64 p-8 flex justify-center py-12"><div className="w-12 h-12 spinner"></div></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <Sidebar role="worker" />
            <div className="ml-64 p-8">
                <h1 className="text-3xl font-bold text-slate-800 mb-2">Earnings</h1>
                <p className="text-slate-600 mb-8">Track your income and payments</p>

                <div className="grid md:grid-cols-4 gap-4 mb-8">
                    <div className="card bg-gradient-to-br from-primary-500 to-primary-700 text-white">
                        <div className="flex items-center gap-3">
                            <DollarSign className="w-8 h-8 opacity-80" />
                            <div>
                                <p className="text-3xl font-bold">${earnings?.totalEarnings || 0}</p>
                                <p className="text-primary-100 text-sm">Total Earnings</p>
                            </div>
                        </div>
                    </div>
                    <div className="card">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                <CheckCircle className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-800">${earnings?.totalEarned || 0}</p>
                                <p className="text-sm text-slate-500">Confirmed</p>
                            </div>
                        </div>
                    </div>
                    <div className="card">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                                <Clock className="w-5 h-5 text-yellow-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-800">${earnings?.totalPending || 0}</p>
                                <p className="text-sm text-slate-500">Pending</p>
                            </div>
                        </div>
                    </div>
                    <div className="card">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <TrendingUp className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-800">{earnings?.completedTasks || 0}</p>
                                <p className="text-sm text-slate-500">Tasks Done</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <h2 className="font-semibold mb-4">Payment History</h2>
                    {!earnings?.payments || earnings.payments.length === 0 ? (
                        <p className="text-slate-500 text-center py-8">No payment history yet</p>
                    ) : (
                        <div className="space-y-3">
                            {earnings.payments.map((payment) => (
                                <div key={payment._id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                                    <div>
                                        <p className="font-medium">{payment.taskId?.title || 'Task'}</p>
                                        <p className="text-sm text-slate-500">
                                            {payment.confirmedAt
                                                ? `Confirmed: ${new Date(payment.confirmedAt).toLocaleDateString()}`
                                                : `Created: ${new Date(payment.createdAt).toLocaleDateString()}`}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-lg">${payment.workerPayout}</p>
                                        <span className={`badge ${payment.status === 'confirmed' ? 'badge-success' : 'badge-warning'}`}>
                                            {payment.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
