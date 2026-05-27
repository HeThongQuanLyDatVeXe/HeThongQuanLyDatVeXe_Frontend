import React from 'react';
import type { SidebarSection } from '../../hooks/pages/useProfilePage';

interface SidebarItem {
    key: SidebarSection;
    label: string;
    icon: string;
}

interface ProfileSidebarProps {
    items: SidebarItem[];
    activeSection: SidebarSection;
    setActiveSection: (section: SidebarSection) => void;
    onLogout: () => void;
}

export const ProfileSidebar: React.FC<ProfileSidebarProps> = ({ 
    items, 
    activeSection, 
    setActiveSection, 
    onLogout 
}) => {
    return (
        <aside className="flex flex-col gap-2">
            {items.map(({ key, label, icon }) => {
                const isActive = activeSection === key;
                return (
                    <button
                        key={key}
                        onClick={() => setActiveSection(key)}
                        className="flex items-center gap-4 px-6 py-3 rounded-xl text-sm font-medium transition-all text-left"
                        style={
                            isActive
                                ? {
                                      backgroundColor: 'var(--color-primary-container)',
                                      color:           'var(--color-on-primary-container)',
                                  }
                                : {
                                      color: 'var(--color-on-surface-variant)',
                                  }
                        }
                        onMouseEnter={(e) => {
                            if (!isActive)
                                (e.currentTarget as HTMLElement).style.backgroundColor =
                                    'var(--color-surface-container-high)';
                        }}
                        onMouseLeave={(e) => {
                            if (!isActive)
                                (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
                        }}
                    >
                        <span className="material-symbols-outlined text-xl">{icon}</span>
                        <span>{label}</span>
                    </button>
                );
            })}

            {/* Divider */}
            <div
                className="h-px my-1"
                style={{ backgroundColor: 'var(--color-outline-variant)', opacity: 0.4 }}
            />

            {/* Logout */}
            <button
                onClick={onLogout}
                className="flex items-center gap-4 px-6 py-3 rounded-xl text-sm font-medium transition-all text-left"
                style={{ color: 'var(--color-error)' }}
                onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.backgroundColor = '#ba1a1a15';
                }}
                onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
                }}
            >
                <span className="material-symbols-outlined text-xl">logout</span>
                <span>Đăng xuất</span>
            </button>
        </aside>
    );
};
