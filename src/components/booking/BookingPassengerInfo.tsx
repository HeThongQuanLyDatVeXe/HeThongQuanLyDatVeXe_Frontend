import React from 'react';

const InputField = ({ label, required, value, onChange, error, type = 'text', placeholder, disabled, span2 }: any) => (
    <div className={`space-y-2 ${span2 ? 'md:col-span-2' : ''}`}>
        <label className="text-xs font-bold text-on-surface-variant block uppercase tracking-wider">
            {label} {required && <span className="text-primary">*</span>}
        </label>
        <input type={type} value={value} onChange={onChange} disabled={disabled}
            className={`w-full bg-surface border rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none ${error ? 'border-red-400' : 'border-outline-variant'} ${disabled ? 'bg-surface-container-low text-on-surface-variant cursor-not-allowed' : ''}`}
            placeholder={placeholder} />
        {error && <p className="text-xs text-red-500 font-semibold mt-1">{error}</p>}
    </div>
);

interface BookingPassengerInfoProps {
    fullName: string;
    setFullName: (val: string) => void;
    phone: string;
    setPhone: (val: string) => void;
    email: string;
    setEmail: (val: string) => void;
    notes: string;
    setNotes: (val: string) => void;
    errors: any;
    isAuthenticated: boolean;
    user: any;
}

export const BookingPassengerInfo: React.FC<BookingPassengerInfoProps> = ({
    fullName, setFullName, phone, setPhone, email, setEmail, notes, setNotes, errors, isAuthenticated, user
}) => {
    return (
        <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-8 shadow-[0_8px_20px_rgba(92,64,51,0.05)]">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center text-sm font-bold">1</div>
                <h2 className="text-xl font-bold text-on-surface" style={{ fontFamily: 'Playfair Display, serif' }}>Thông tin hành khách</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField label="Họ và tên" required value={fullName} onChange={(e: any) => setFullName(e.target.value)} error={errors.fullName} placeholder="Nhập họ và tên đầy đủ" disabled={isAuthenticated && !!user?.fullName} />
                <InputField label="Số điện thoại" required type="tel" value={phone} onChange={(e: any) => setPhone(e.target.value)} error={errors.phone} placeholder="0987654321" disabled={isAuthenticated && !!user?.phoneNumber} />
                <InputField label="Email" type="email" value={email} onChange={(e: any) => setEmail(e.target.value)} error={errors.email} placeholder="Nhận thông tin vé qua email" disabled={isAuthenticated && !!user?.email} span2 />
                <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-bold text-on-surface-variant block uppercase tracking-wider">Ghi chú</label>
                    <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full bg-surface border border-outline-variant rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none resize-none h-24" placeholder="Điểm đón cụ thể, yêu cầu đặc biệt..." />
                </div>
            </div>
        </section>
    );
};
