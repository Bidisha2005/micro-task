'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/common/Sidebar';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import { User, Save, Plus, X } from 'lucide-react';

export default function WorkerProfile() {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({ skills: [], bio: '', availabilityStatus: 'available', portfolioLinks: [] });
    const [newSkill, setNewSkill] = useState('');

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await api.get('/worker/profile');
                if (response.data.success) {
                    setProfile(response.data.data);
                    setFormData({
                        skills: response.data.data.skills || [],
                        bio: response.data.data.bio || '',
                        availabilityStatus: response.data.data.availabilityStatus || 'available',
                        portfolioLinks: response.data.data.portfolioLinks || []
                    });
                }
            } catch (error) {
                console.error('Failed to fetch profile:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const saveSkills = async (updatedSkills) => {
        try {
            const response = await api.put('/worker/profile', { ...formData, skills: updatedSkills });
            if (response.data.success) {
                setProfile(response.data.data);
            }
        } catch (error) {
            toast.error('Failed to update skills');
        }
    };

    const addSkill = async () => {
        if (newSkill && !formData.skills.includes(newSkill)) {
            const updatedSkills = [...formData.skills, newSkill];
            setFormData({ ...formData, skills: updatedSkills });
            setNewSkill('');
            await saveSkills(updatedSkills);
            toast.success('Skill added!');
        }
    };

    const removeSkill = async (skill) => {
        const updatedSkills = formData.skills.filter(s => s !== skill);
        setFormData({ ...formData, skills: updatedSkills });
        await saveSkills(updatedSkills);
        toast.success('Skill removed!');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const response = await api.put('/worker/profile', formData);
            if (response.data.success) {
                toast.success('Profile updated!');
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
                <Sidebar role="worker" />
                <div className="ml-64 p-8 flex justify-center py-12"><div className="w-12 h-12 spinner"></div></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <Sidebar role="worker" />
            <div className="ml-64 p-8">
                <h1 className="text-3xl font-bold text-slate-800 mb-2">My Profile</h1>
                <p className="text-slate-600 mb-8">Manage your profile and skills</p>

                <div className="max-w-2xl">
                    <div className="card mb-6">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                                <User className="w-10 h-10 text-green-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{profile?.rating?.toFixed(1) || '0.0'} ⭐</p>
                                <p className="text-slate-500">{profile?.completedTasks || 0} tasks completed</p>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Skills</label>
                                <div className="flex flex-wrap gap-2 mb-2">
                                    {formData.skills.map((skill, i) => (
                                        <span key={i} className="badge badge-info flex items-center gap-1.5 pr-1">
                                            {skill}
                                            <button
                                                type="button"
                                                onClick={() => removeSkill(skill)}
                                                className="w-4 h-4 flex items-center justify-center rounded-full bg-blue-200 hover:bg-red-400 hover:text-white transition-colors"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        className="input flex-1"
                                        placeholder="Add a skill..."
                                        value={newSkill}
                                        onChange={(e) => setNewSkill(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                                    />
                                    <button type="button" onClick={addSkill} className="btn-secondary">
                                        <Plus className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Bio</label>
                                <textarea
                                    className="input h-24"
                                    placeholder="Tell companies about yourself..."
                                    value={formData.bio}
                                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Availability</label>
                                <select
                                    className="input"
                                    value={formData.availabilityStatus}
                                    onChange={(e) => setFormData({ ...formData, availabilityStatus: e.target.value })}
                                >
                                    <option value="available">Available</option>
                                    <option value="busy">Busy</option>
                                    <option value="unavailable">Unavailable</option>
                                </select>
                            </div>

                            <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
                                {saving ? <div className="w-4 h-4 spinner border-2"></div> : <Save className="w-4 h-4" />}
                                Save Profile
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
