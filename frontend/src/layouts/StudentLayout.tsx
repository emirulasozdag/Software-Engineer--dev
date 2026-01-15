import React, { useEffect, useMemo, useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';

import { useAuth } from '@/contexts/AuthContext';
import { communicationService } from '@/services/api';

type NavItem = {
    to: string;
    label: string;
    icon: string;
    isActive?: (pathname: string) => boolean;
    badgeText?: string;
    badgeAriaLabel?: string;
};

const StudentLayout: React.FC = () => {
    const { user, logout } = useAuth();
    const location = useLocation();

    const [unread, setUnread] = useState<number | null>(null);

    const displayName = user?.name ?? 'Student';
    const initials = useMemo(() => {
        return displayName
            .split(' ')
            .filter(Boolean)
            .slice(0, 2)
            .map((p) => p[0]?.toUpperCase())
            .join('');
    }, [displayName]);

    const refreshUnread = async () => {
        try {
            const msgs = await communicationService.getMessages().catch(() => []);
            const myId = user?.id;
            const unreadCount = myId ? msgs.filter((m: any) => m.receiverId === myId && !m.isRead).length : 0;
            setUnread(unreadCount);
        } catch {
            setUnread(0);
        }
    };

    useEffect(() => {
        refreshUnread();
        // Re-check unread counts as the user navigates.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.pathname, user?.id]);

    const navItems: NavItem[] = [
        {
            to: '/student/dashboard',
            label: 'Dashboard',
            icon: '▦',
            isActive: (p) => p.startsWith('/student/dashboard') || p === '/student',
        },
        {
            to: '/student/learning-plan',
            label: 'Learning Plan',
            icon: '📘',
            isActive: (p) => p.startsWith('/student/learning-plan'),
        },
        {
            to: '/student/messages',
            label: 'Messages',
            icon: '✉',
            isActive: (p) => p.startsWith('/student/messages'),
            badgeText: unread === null ? '…' : String(unread),
            badgeAriaLabel: `Unread messages: ${unread === null ? 'loading' : unread}`,
        },
        {
            to: '/student/progress',
            label: 'My Progress',
            icon: '📈',
            isActive: (p) => p.startsWith('/student/progress'),
        },
        {
            to: '/student/ai-content-delivery',
            label: 'AI Delivery',
            icon: '✦',
            isActive: (p) => p.startsWith('/student/ai-content-delivery'),
        },
        {
            to: '/student/chatbot',
            label: 'Chatbot',
            icon: '🤖',
            isActive: (p) => p.startsWith('/student/chatbot'),
        },
        {
            to: '/student/assignments',
            label: 'Assignments',
            icon: '🗓',
            isActive: (p) => p.startsWith('/student/assignments'),
        },
        {
            to: '/student/content/history',
            label: 'Content History',
            icon: '🗂',
            isActive: (p) => p.startsWith('/student/content/history') || p.startsWith('/student/content/'),
        },
        {
            to: '/student/feedback',
            label: 'Feedback',
            icon: '✎',
            isActive: (p) => p.startsWith('/student/feedback'),
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
                        <div className="sd-brand-sub">Student</div>
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
                                {item.badgeText && (
                                    <span className="sd-badge" aria-label={item.badgeAriaLabel}>
                                        {item.badgeText}
                                    </span>
                                )}
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
                        <button
                            type="button"
                            className="sd-icon-btn"
                            onClick={() => window.location.reload()}
                            aria-label="Refresh"
                        >
                            ⟳
                        </button>
                        <div className="sd-user">
                            <div className="sd-avatar" aria-hidden="true">
                                {initials || 'U'}
                            </div>
                            <div className="sd-user-meta">
                                <div className="sd-user-name">{displayName}</div>
                                <div className="sd-user-role">{user?.role ?? 'student'}</div>
                            </div>
                        </div>
                    </div>
                </div>

                <Outlet />
            </main>
        </div>
    );
};

export default StudentLayout;
