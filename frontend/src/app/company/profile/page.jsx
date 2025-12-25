'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/common/Sidebar';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import { Building2, Upload, Save } from 'lucide-react';

export default function CompanyProfile() {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({ companyName: '', domain: '', description: '' });
    const [taskCount, setTaskCount] = useState(0);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch profile and tasks in parallel
                const [profileRes, tasksRes] = await Promise.all([
                    api.get('/company/profile'),
                    api.get('/company/tasks')
                ]);

                if (profileRes.data.success) {
                    setProfile(profileRes.data.data);
                    setFormData({
                        companyName: profileRes.data.data.companyName || '',
                        domain: profileRes.data.data.domain || '',
                        description: profileRes.data.data.description || ''
                    });
                }

                if (tasksRes.data.success) {
                    setTaskCount(tasksRes.data.pagination?.total || tasksRes.data.data?.length || 0);
                }
            } catch (error) {
                console.error('Failed to fetch data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const response = await api.put('/company/profile', formData);
            if (response.data.success) {
                toast.success('Profile updated successfully');
                setProfile(response.data.data);
            }
        } catch (error) {
            toast.error('Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50">
                <Sidebar role="company" />
                <div className="ml-64 p-8 flex justify-center py-12"><div className="w-12 h-12 spinner"></div></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <Sidebar role="company" />
            <div className="ml-64 p-8">
                <h1 className="text-3xl font-bold text-slate-800 mb-2">Company Profile</h1>
                <p className="text-slate-600 mb-8">Manage your company information</p>

                <div className="max-w-2xl">
                    <div className="card mb-6">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-20 h-20 bg-blue-100 rounded-xl flex items-center justify-center">
                                <Building2 className="w-10 h-10 text-blue-600" />
                            </div>
                            <div>
                                <p className="font-semibold text-lg">{profile?.companyName}</p>
                                <span className={`badge ${profile?.verificationStatus === 'approved' ? 'badge-success' : profile?.verificationStatus === 'pending' ? 'badge-warning' : 'badge-danger'}`}>
                                    {profile?.verificationStatus}
                                </span>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Company Name</label>
                                <input
                                    type="text"
                                    className="input"
                                    value={formData.companyName}
                                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Domain/Industry</label>
                                <input
                                    type="text"
                                    className="input"
                                    placeholder="e.g., Technology, Healthcare"
                                    value={formData.domain}
                                    onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
                                <textarea
                                    className="input h-24"
                                    placeholder="Tell us about your company..."
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>
                            <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
                                {saving ? <div className="w-4 h-4 spinner border-2"></div> : <Save className="w-4 h-4" />}
                                Save Changes
                            </button>
                        </form>
                    </div>

                    <div className="card">
                        <h2 className="font-semibold mb-4">Company Stats</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-slate-50 rounded-lg">
                                <p className="text-2xl font-bold">{profile?.rating?.toFixed(1) || '0.0'}</p>
                                <p className="text-sm text-slate-500">Rating</p>
                            </div>
                            <div className="p-4 bg-slate-50 rounded-lg">
                                <p className="text-2xl font-bold">{taskCount}</p>
                                <p className="text-sm text-slate-500">Tasks Posted</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
