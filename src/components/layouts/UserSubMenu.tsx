import React from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';

interface UserSubMenuProps {
    user: any;
    onLogout: () => void;
    onClose: () => void;
}

export const UserSubMenu: React.FC<UserSubMenuProps> = ({ user, onLogout, onClose }) => {
    const initials = user?.fullName
        ? user.fullName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
        : 'NT';

    return (
        <div 
            className="absolute right-0 top-12 mt-2 w-64 bg-surface-container-lowest rounded-xl shadow-[0_8px_30px_rgba(92,64,51,0.15)] border border-surface-variant overflow-hidden flex flex-col z-50 animate-fade-in-up"
            onClick={(e) => e.stopPropagation()}
        >
            {/* User Info Header */}
            <div className="p-4 border-b border-surface-variant flex items-center gap-3 bg-surface-container-low">
                {user?.avatarUrl ? (
                    <img 
                        src={user.avatarUrl} 
                        alt={user.fullName} 
                        className="h-12 w-12 rounded-full object-cover shadow-inner" 
                    />
                ) : (
                    <div className="h-12 w-12 rounded-full bg-gradient-to-tr from-[#F4600C] to-[#FFB347] flex items-center justify-center text-on-primary font-body-md text-base font-bold shadow-inner">
                        {initials}
                    </div>
                )}
                <div className="flex flex-col text-left">
                    <span className="font-semibold text-sm text-on-surface leading-tight">
                        {user?.fullName || 'Nguyễn Thành'}
                    </span>
                    <span className="text-xs text-on-surface-variant truncate max-w-[150px]">
                        {user?.email || 'thanh.nguyen@email.com'}
                    </span>
                </div>
            </div>

            {/* Menu Links */}
            <div className="py-2 flex flex-col">
                <Link 
                    to={ROUTES.PROFILE}
                    onClick={onClose}
                    className="px-4 py-2.5 flex items-center gap-3 hover:bg-surface-container-high transition-colors text-on-surface text-sm font-medium text-left"
                >
                    <span className="material-symbols-outlined text-[20px] text-on-surface-variant">person</span>
                    Thông tin cá nhân
                </Link>
                
                <Link
                    to={ROUTES.MY_BOOKINGS}
                    onClick={onClose}
                    className="px-4 py-2.5 flex items-center gap-3 hover:bg-surface-container-high transition-colors text-on-surface text-sm font-medium text-left"
                >
                    <span className="material-symbols-outlined text-[20px] text-on-surface-variant">confirmation_number</span>
                    Vé của tôi
                </Link>

                <button 
                    onClick={() => {
                        onClose();
                        alert('Chức năng "Tuyến yêu thích" đang được phát triển!');
                    }}
                    className="px-4 py-2.5 flex items-center gap-3 hover:bg-surface-container-high transition-colors text-on-surface text-sm font-medium text-left bg-transparent border-none cursor-pointer"
                >
                    <span className="material-symbols-outlined text-[20px] text-on-surface-variant">favorite</span>
                    Tuyến yêu thích
                </button>

                <button 
                    onClick={() => {
                        onClose();
                        alert('Chức năng "Mã giảm giá" đang được phát triển!');
                    }}
                    className="px-4 py-2.5 flex items-center gap-3 hover:bg-surface-container-high transition-colors text-on-surface text-sm font-medium text-left bg-transparent border-none cursor-pointer"
                >
                    <span className="material-symbols-outlined text-[20px] text-on-surface-variant">loyalty</span>
                    Mã giảm giá
                </button>
            </div>

            {/* Logout Footer */}
            <div className="border-t border-surface-variant py-2">
                <button 
                    onClick={() => {
                        onClose();
                        onLogout();
                    }}
                    className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-error-container transition-colors text-[#F4600C] text-sm font-semibold text-left bg-transparent border-none cursor-pointer"
                >
                    <span className="material-symbols-outlined text-[20px]">logout</span>
                    Đăng xuất
                </button>
            </div>
        </div>
    );
};
