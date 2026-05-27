import React from 'react';
import { Alert } from '../common/Alert';
import { INPUT_BASE, inputStyle, FieldLabel } from './SharedStyles';
import type { UserResponse } from '../../types/user-service/response/UserResponse';

interface ProfilePasswordFormProps {
    user: UserResponse | null;
    pwMsg: { type: 'success' | 'error' | 'info'; text: string } | null;
    pwData: {
        oldPassword: string;
        newPassword: string;
        confirm: string;
    };
    setPwData: React.Dispatch<React.SetStateAction<any>>;
    pwLoading: boolean;
    handlePwSave: (e: React.FormEvent) => void;
}

export const ProfilePasswordForm: React.FC<ProfilePasswordFormProps> = ({
    user,
    pwMsg,
    pwData,
    setPwData,
    pwLoading,
    handlePwSave
}) => {
    return (
        <>
            <h2
                className="text-2xl font-semibold mb-6"
                style={{ fontFamily: 'Playfair Display, serif', color: 'var(--color-on-surface)' }}
            >
                Đổi mật khẩu
            </h2>

            {!user?.hasPassword && (
                <div className="mb-5">
                    <Alert type="info" message="Tài khoản của bạn đăng nhập qua Google. Vui lòng thiết lập mật khẩu lần đầu." />
                </div>
            )}

            {pwMsg && (
                <div className="mb-5">
                    <Alert type={pwMsg.type} message={pwMsg.text} />
                </div>
            )}

            <form onSubmit={handlePwSave} className="flex flex-col gap-5 max-w-md">
                {user?.hasPassword && (
                    <div>
                        <FieldLabel>Mật khẩu hiện tại</FieldLabel>
                        <input
                            type="password"
                            className={INPUT_BASE}
                            style={inputStyle}
                            placeholder="••••••••"
                            value={pwData.oldPassword}
                            onChange={(e) => setPwData((p: any) => ({ ...p, oldPassword: e.target.value }))}
                            onFocus={(e) => {
                                (e.currentTarget as HTMLElement).style.borderLeftWidth = '4px';
                                (e.currentTarget as HTMLElement).style.borderLeftColor = '#F4600C';
                            }}
                            onBlur={(e) => {
                                (e.currentTarget as HTMLElement).style.borderLeftWidth = '1px';
                            }}
                            required
                        />
                    </div>
                )}

                <div>
                    <FieldLabel>Mật khẩu mới</FieldLabel>
                    <input
                        type="password"
                        className={INPUT_BASE}
                        style={inputStyle}
                        placeholder="Ít nhất 8 ký tự"
                        value={pwData.newPassword}
                        onChange={(e) => setPwData((p: any) => ({ ...p, newPassword: e.target.value }))}
                        onFocus={(e) => {
                            (e.currentTarget as HTMLElement).style.borderLeftWidth = '4px';
                            (e.currentTarget as HTMLElement).style.borderLeftColor = '#F4600C';
                        }}
                        onBlur={(e) => {
                            (e.currentTarget as HTMLElement).style.borderLeftWidth = '1px';
                        }}
                        required
                    />
                </div>

                <div>
                    <FieldLabel>Xác nhận mật khẩu mới</FieldLabel>
                    <input
                        type="password"
                        className={INPUT_BASE}
                        style={inputStyle}
                        placeholder="Nhập lại mật khẩu mới"
                        value={pwData.confirm}
                        onChange={(e) => setPwData((p: any) => ({ ...p, confirm: e.target.value }))}
                        onFocus={(e) => {
                            (e.currentTarget as HTMLElement).style.borderLeftWidth = '4px';
                            (e.currentTarget as HTMLElement).style.borderLeftColor = '#F4600C';
                        }}
                        onBlur={(e) => {
                            (e.currentTarget as HTMLElement).style.borderLeftWidth = '1px';
                        }}
                        required
                    />
                </div>

                <button
                    type="submit"
                    disabled={pwLoading}
                    className="px-10 py-3 rounded-xl font-bold text-sm transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed self-start"
                    style={{
                        backgroundColor: 'var(--color-primary)',
                        color:           'var(--color-on-primary)',
                        boxShadow:       '0 8px 20px rgba(92,64,51,0.15)',
                    }}
                >
                    {pwLoading ? 'Đang đổi...' : 'Đổi mật khẩu'}
                </button>
            </form>
        </>
    );
};
