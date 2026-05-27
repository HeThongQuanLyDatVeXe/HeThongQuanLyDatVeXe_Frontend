import React from 'react';
import { Alert } from '../common/Alert';

interface ProfileDeleteAccountProps {
    deleteMsg: { type: 'success' | 'error' | 'info'; text: string } | null;
    showConfirmDelete: boolean;
    setShowConfirmDelete: (show: boolean) => void;
    deleteLoading: boolean;
    handleDeleteAccount: () => void;
}

export const ProfileDeleteAccount: React.FC<ProfileDeleteAccountProps> = ({
    deleteMsg,
    showConfirmDelete,
    setShowConfirmDelete,
    deleteLoading,
    handleDeleteAccount
}) => {
    return (
        <div
            className="rounded-xl p-8 relative overflow-hidden"
            style={{
                backgroundColor: 'var(--color-surface-container-lowest)',
                border:          '1px solid var(--color-error-container)',
                boxShadow:       '0 8px 20px rgba(186,26,26,0.08)',
            }}
        >
            <div className="flex items-center gap-3 mb-6">
                <div
                    className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                    style={{ backgroundColor: 'var(--color-error-container)', color: 'var(--color-error)' }}
                >
                    <span className="material-symbols-outlined">person_remove</span>
                </div>
                <h2
                    className="text-2xl font-semibold"
                    style={{ fontFamily: 'Playfair Display, serif', color: 'var(--color-error)' }}
                >
                    Xóa tài khoản
                </h2>
            </div>

            <div className="space-y-6">
                <div className="p-4 rounded-lg bg-red-50 text-red-800 text-sm border border-red-100">
                    <p className="font-semibold mb-2 flex items-center gap-1"><span className="material-symbols-outlined text-[18px]">warning</span>Cảnh báo:</p>
                    <ul className="list-disc list-inside space-y-1">
                        <li>Hành động này không thể hoàn tác.</li>
                        <li>Toàn bộ thông tin cá nhân và lịch sử đặt vé sẽ bị xóa.</li>
                        <li>Bạn sẽ không thể khôi phục lại tài khoản này.</li>
                    </ul>
                </div>

                {deleteMsg && (
                    <Alert type={deleteMsg.type} message={deleteMsg.text} />
                )}

                {!showConfirmDelete ? (
                    <button
                        onClick={() => setShowConfirmDelete(true)}
                        className="px-6 py-2.5 rounded-xl font-bold text-sm transition-all hover:bg-red-50 text-red-600 border border-red-200"
                    >
                        Tôi muốn xóa tài khoản
                    </button>
                ) : (
                    <div className="p-5 border border-red-200 rounded-xl space-y-4">
                        <p className="text-sm font-semibold text-on-surface">Bạn có chắc chắn muốn xóa vĩnh viễn tài khoản này không?</p>
                        <div className="flex gap-3">
                            <button
                                onClick={handleDeleteAccount}
                                disabled={deleteLoading}
                                className="px-6 py-2.5 rounded-xl font-bold text-sm transition-all text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
                            >
                                {deleteLoading ? 'Đang xóa...' : 'Xác nhận Xóa'}
                            </button>
                            <button
                                onClick={() => setShowConfirmDelete(false)}
                                disabled={deleteLoading}
                                className="px-6 py-2.5 rounded-xl font-bold text-sm transition-all border border-outline bg-white text-on-surface hover:bg-surface"
                            >
                                Hủy bỏ
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
