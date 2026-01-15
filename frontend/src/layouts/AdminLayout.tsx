import React, { useMemo } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';

import { useAuth } from '@/contexts/AuthContext';

type NavItem = {
    to: string;
    label: string;
    icon: string;
    isActive?: (pathname: string) => boolean;
};

const AdminLayout: React.FC = () => {
    const { user, logout } = useAuth();
    const location = useLocation();

    const displayName = user?.name ?? 'Admin';
    const initials = useMemo(() => {
        return displayName
            .split(' ')
            .filter(Boolean)
            .slice(0, 2)
            .map((p) => p[0]?.toUpperCase())
            .join('');
    }, [displayName]);

    const navItems: NavItem[] = [
        {
            to: '/admin/dashboard',
            label: 'Dashboard',
            icon: '▦',
            isActive: (p) => p.startsWith('/admin/dashboard') || p === '/admin',
        },
        {
            to: '/admin/users',
            label: 'Users',
            icon: '👤',
            isActive: (p) => p.startsWith('/admin/users'),
        },
        {
            to: '/admin/stats',
            label: 'System Stats',
            icon: '📈',
            isActive: (p) => p.startsWith('/admin/stats'),
        },
        {
            to: '/admin/feedback',
            label: 'Feedback',
            icon: '📝',
            isActive: (p) => p.startsWith('/admin/feedback'),
        },
    ];

    const pathname = location.pathname;

    return (
        <div className="sd-layout">
            <aside className="sd-sidebar">
                <div className="sd-brand">
                    <div className="sd-brand-mark" aria-hidden="true">
                        AI
                    </div>
                    <div className="sd-brand-text">
                        <div className="sd-brand-name">AI Learning</div>
                        <div className="sd-brand-sub">Admin</div>
                    </div>
                </div>

                <nav className="sd-nav">
                    {navItems.map((item) => {
                        const active = item.isActive ? item.isActive(pathname) : pathname === item.to;
                        return (
                            <Link key={item.to} to={item.to} className={`sd-nav-link ${active ? 'is-active' : ''}`}>
                                <span className="sd-nav-ico" aria-hidden="true">
                                    {item.icon}
                                </span>
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="sd-sidebar-footer">
                    <button className="sd-logout" onClick={logout}>
                        Logout
                    </button>
                </div>
            </aside>

            <main className="sd-main">
                <div className="sd-topbar">
                    <div className="sd-search" role="search">
                        <span className="sd-search-ico" aria-hidden="true">
                            ⌕
                        </span>
                        <input className="sd-search-input" placeholder="Search…" aria-label="Search" />
                    </div>

                    <div className="sd-topbar-right">
                        <button type="button" className="sd-icon-btn" onClick={() => window.location.reload()} aria-label="Refresh">
                            ⟳
                        </button>
                        <div className="sd-user">
                            <div className="sd-avatar" aria-hidden="true">
                                {initials || 'U'}
                            </div>
                            <div className="sd-user-meta">
                                <div className="sd-user-name">{displayName}</div>
                                <div className="sd-user-role">{user?.role ?? 'admin'}</div>
                            </div>
                        </div>
                    </div>
                </div>

                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;
