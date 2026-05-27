import React from 'react';
import { Alert } from '../common/Alert';
import { INPUT_BASE, inputStyle, inputDisabledStyle, FieldLabel } from './SharedStyles';
import type { UserResponse } from '../../types/user-service/response/UserResponse';
import type { Gender } from '../../types/user-service/enums';

interface ProfileInfoFormProps {
    user: UserResponse | null;
    infoMsg: { type: 'success' | 'error' | 'info'; text: string } | null;
    infoData: {
        fullName: string;
        phoneNumber: string;
        dateOfBirth: string;
        gender: Gender | '';
        avatarUrl: string;
    };
    setInfoData: React.Dispatch<React.SetStateAction<any>>;
    infoLoading: boolean;
    avatarUploading: boolean;
    handleInfoSave: (e: React.FormEvent) => void;
    handleAvatarUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const ProfileInfoForm: React.FC<ProfileInfoFormProps> = ({
    user,
    infoMsg,
    infoData,
    setInfoData,
    infoLoading,
    avatarUploading,
    handleInfoSave,
    handleAvatarUpload
}) => {
    return (
        <>
            <h2
                className="text-2xl font-semibold mb-6"
                style={{ fontFamily: 'Playfair Display, serif', color: 'var(--color-on-surface)' }}
            >
                Thông tin cá nhân
            </h2>

            {infoMsg && (
                <div className="mb-5">
                    <Alert type={infoMsg.type} message={infoMsg.text} />
                </div>
            )}

            <form onSubmit={handleInfoSave} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Full Name */}
                <div>
                    <FieldLabel>Họ và tên</FieldLabel>
                    <input
                        type="text"
                        className={INPUT_BASE}
                        style={inputStyle}
                        placeholder="Nhập họ và tên"
                        value={infoData.fullName}
                        onChange={(e) => setInfoData((p: any) => ({ ...p, fullName: e.target.value }))}
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

                {/* Email (read-only) */}
                <div>
                    <FieldLabel>Email</FieldLabel>
                    <input
                        type="email"
                        className={INPUT_BASE}
                        style={inputDisabledStyle}
                        value={user?.email ?? ''}
                        readOnly
                    />
                </div>

                {/* Phone */}
                <div>
                    <FieldLabel>Số điện thoại</FieldLabel>
                    <input
                        type="tel"
                        className={INPUT_BASE}
                        style={inputStyle}
                        placeholder="0xxx xxx xxx"
                        value={infoData.phoneNumber}
                        onChange={(e) => setInfoData((p: any) => ({ ...p, phoneNumber: e.target.value }))}
                        onFocus={(e) => {
                            (e.currentTarget as HTMLElement).style.borderLeftWidth = '4px';
                            (e.currentTarget as HTMLElement).style.borderLeftColor = '#F4600C';
                        }}
                        onBlur={(e) => {
                            (e.currentTarget as HTMLElement).style.borderLeftWidth = '1px';
                        }}
                    />
                </div>

                {/* Date of birth */}
                <div>
                    <FieldLabel>Ngày sinh</FieldLabel>
                    <div className="relative">
                        <input
                            type="date"
                            className={INPUT_BASE}
                            style={inputStyle}
                            value={infoData.dateOfBirth}
                            onChange={(e) => setInfoData((p: any) => ({ ...p, dateOfBirth: e.target.value }))}
                            onFocus={(e) => {
                                (e.currentTarget as HTMLElement).style.borderLeftWidth = '4px';
                                (e.currentTarget as HTMLElement).style.borderLeftColor = '#F4600C';
                            }}
                            onBlur={(e) => {
                                (e.currentTarget as HTMLElement).style.borderLeftWidth = '1px';
                            }}
                        />
                        <span
                            className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-lg pointer-events-none"
                            style={{ color: 'var(--color-outline)' }}
                        >
                            calendar_month
                        </span>
                    </div>
                </div>

                {/* Gender */}
                <div>
                    <FieldLabel>Giới tính</FieldLabel>
                    <select
                        className={INPUT_BASE + ' appearance-none'}
                        style={inputStyle}
                        value={infoData.gender}
                        onChange={(e) => setInfoData((p: any) => ({ ...p, gender: e.target.value as Gender }))}
                        onFocus={(e) => {
                            (e.currentTarget as HTMLElement).style.borderLeftWidth = '4px';
                            (e.currentTarget as HTMLElement).style.borderLeftColor = '#F4600C';
                        }}
                        onBlur={(e) => {
                            (e.currentTarget as HTMLElement).style.borderLeftWidth = '1px';
                        }}
                    >
                        <option value="">Không chọn</option>
                        <option value="MALE">Nam</option>
                        <option value="FEMALE">Nữ</option>
                        <option value="OTHER">Khác</option>
                    </select>
                </div>

                {/* Avatar Upload */}
                <div>
                    <FieldLabel>Ảnh đại diện (Avatar)</FieldLabel>
                    <div className="flex items-center gap-4">
                        <input
                            type="file"
                            accept="image/*"
                            id="avatar-upload"
                            className="hidden"
                            onChange={handleAvatarUpload}
                        />
                        <label
                            htmlFor="avatar-upload"
                            className="cursor-pointer px-4 py-2.5 rounded-lg text-sm font-medium transition-all"
                            style={{
                                backgroundColor: 'var(--color-secondary-container)',
                                color: 'var(--color-on-secondary-container)',
                                border: '1px solid var(--color-outline-variant)'
                            }}
                        >
                            {avatarUploading ? 'Đang tải...' : 'Chọn file ảnh'}
                        </label>
                        
                        {/* Preview selected image if any */}
                        {infoData.avatarUrl && (
                            <div className="w-10 h-10 rounded-full overflow-hidden border border-slate-200">
                                <img src={infoData.avatarUrl} alt="Avatar preview" className="w-full h-full object-cover" />
                            </div>
                        )}
                    </div>
                </div>

                {/* Submit */}
                <div className="md:col-span-2 flex justify-end pt-2">
                    <button
                        type="submit"
                        disabled={infoLoading}
                        className="px-10 py-3 rounded-xl font-bold text-sm transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
                        style={{
                            backgroundColor: 'var(--color-primary)',
                            color:           'var(--color-on-primary)',
                            boxShadow:       '0 8px 20px rgba(92,64,51,0.15)',
                        }}
                    >
                        {infoLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
                    </button>
                </div>
            </form>
        </>
    );
};
