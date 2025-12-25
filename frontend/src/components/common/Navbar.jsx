'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
    Home,
    Briefcase,
    Users,
    LogOut,
    Menu,
    X,
    User
} from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
    const { user, logout, isAuthenticated } = useAuth();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const getDashboardLink = () => {
        if (!user) return '/';
        switch (user.role) {
            case 'admin':
                return '/admin/dashboard';
            case 'company':
                return '/company/dashboard';
            case 'worker':
                return '/worker/dashboard';
            default:
                return '/';
        }
    };

    return (
        <nav className="bg-white shadow-sm border-b border-slate-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
                                <Briefcase className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
                                MicroTask
                            </span>
                        </Link>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center gap-6">
                        <Link href="/" className="text-slate-600 hover:text-primary-600 transition-colors">
                            Home
                        </Link>
                        

                        {isAuthenticated ? (
                            <div className="flex items-center gap-4">
                                <Link
                                    href={getDashboardLink()}
                                    className="text-slate-600 hover:text-primary-600 transition-colors"
                                >
                                    Dashboard
                                </Link>
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-full">
                                    <User className="w-4 h-4 text-slate-500" />
                                    <span className="text-sm font-medium text-slate-700">{user?.name}</span>
                                    <span className="text-xs px-2 py-0.5 bg-primary-100 text-primary-700 rounded-full capitalize">
                                        {user?.role}
                                    </span>
                                </div>
                                <button
                                    onClick={logout}
                                    className="flex items-center gap-1 text-slate-600 hover:text-red-600 transition-colors"
                                >
                                    <LogOut className="w-4 h-4" />
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3">
                                <Link href="/login" className="btn-secondary">
                                    Login
                                </Link>
                                <Link href="/register" className="btn-primary">
                                    Get Started
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden flex items-center">
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="text-slate-600 hover:text-slate-900"
                        >
                            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden py-4 border-t border-slate-200">
                        <div className="flex flex-col gap-3">
                            <Link href="/" className="px-4 py-2 text-slate-600 hover:bg-slate-50 rounded-lg">
                                Home
                            </Link>
                          

                            {isAuthenticated ? (
                                <>
                                    <Link href={getDashboardLink()} className="px-4 py-2 text-slate-600 hover:bg-slate-50 rounded-lg">
                                        Dashboard
                                    </Link>
                                    <button
                                        onClick={logout}
                                        className="px-4 py-2 text-left text-red-600 hover:bg-red-50 rounded-lg"
                                    >
                                        Logout
                                    </button>
                                </>
                            ) : (
                                <div className="flex flex-col gap-2 px-4">
                                    <Link href="/login" className="btn-secondary text-center">
                                        Login
                                    </Link>
                                    <Link href="/register" className="btn-primary text-center">
                                        Get Started
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
}
