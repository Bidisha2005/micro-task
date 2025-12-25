'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
    LayoutDashboard,
    Users,
    Building2,
    ClipboardList,
    BarChart3,
    CreditCard,
    Briefcase,
    FileText,
    User,
    Search,
    Wallet,
    LogOut,
    Settings
} from 'lucide-react';

const adminLinks = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/users', label: 'Users', icon: Users },
    { href: '/admin/companies', label: 'Companies', icon: Building2 },
    { href: '/admin/tasks', label: 'Task Moderation', icon: ClipboardList },
    { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
    { href: '/admin/payments', label: 'Payments', icon: CreditCard },
];

const companyLinks = [
    { href: '/company/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/company/profile', label: 'Profile', icon: Building2 },
    { href: '/company/tasks', label: 'My Tasks', icon: Briefcase },
    { href: '/company/applications', label: 'Applications', icon: FileText },
    { href: '/company/payments', label: 'Payments', icon: CreditCard },
];

const workerLinks = [
    { href: '/worker/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/worker/profile', label: 'Profile', icon: User },
    { href: '/worker/tasks', label: 'Find Tasks', icon: Search },
    { href: '/worker/applications', label: 'My Applications', icon: FileText },
    { href: '/worker/workspace', label: 'Workspace', icon: Briefcase },
    { href: '/worker/earnings', label: 'Earnings', icon: Wallet },
];

export default function Sidebar({ role }) {
    const pathname = usePathname();
    const { user, logout } = useAuth();

    const links = role === 'admin'
        ? adminLinks
        : role === 'company'
            ? companyLinks
            : workerLinks;

    const getRoleColor = () => {
        switch (role) {
            case 'admin': return 'from-red-500 to-red-700';
            case 'company': return 'from-blue-500 to-blue-700';
            case 'worker': return 'from-green-500 to-green-700';
            default: return 'from-primary-500 to-primary-700';
        }
    };

    return (
        <div className="fixed left-0 top-0 h-full w-64 bg-white border-r border-slate-200 flex flex-col">
            {/* Logo */}
            <div className="p-6 border-b border-slate-200">
                <Link href="/" className="flex items-center gap-2">
                    <div className={`w-10 h-10 bg-gradient-to-br ${getRoleColor()} rounded-xl flex items-center justify-center`}>
                        <Briefcase className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <span className="text-lg font-bold text-slate-800">MicroTask</span>
                        <p className="text-xs text-slate-500 capitalize">{role} Panel</p>
                    </div>
                </Link>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {links.map((link) => {
                    const Icon = link.icon;
                    const isActive = pathname === link.href;

                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`sidebar-link ${isActive ? 'active' : ''}`}
                        >
                            <Icon className="w-5 h-5" />
                            <span>{link.label}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* User Info & Logout */}
            <div className="p-4 border-t border-slate-200">
                <div className="flex items-center gap-3 mb-4">
                    <div className={`w-10 h-10 bg-gradient-to-br ${getRoleColor()} rounded-full flex items-center justify-center`}>
                        <span className="text-white font-semibold text-sm">
                            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                        </span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-800 truncate">{user?.name}</p>
                        <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                    </div>
                </div>
                <button
                    onClick={logout}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                </button>
            </div>
        </div>
    );
}
