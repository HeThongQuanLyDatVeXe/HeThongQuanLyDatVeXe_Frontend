import React from 'react';

interface PassengerFormProps {
    fullName: string;
    setFullName: (val: string) => void;
    phoneNumber: string;
    setPhoneNumber: (val: string) => void;
    email: string;
    setEmail: (val: string) => void;
    notes: string;
    setNotes: (val: string) => void;
    formErrors: { fullName?: string; phoneNumber?: string };
}

export const PassengerForm: React.FC<PassengerFormProps> = ({
    fullName, setFullName,
    phoneNumber, setPhoneNumber,
    email, setEmail,
    notes, setNotes,
    formErrors
}) => {
    return (
        <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-8 shadow-[0_8px_20px_rgba(92,64,51,0.05)] relative overflow-hidden group">
            <h2 className="text-xl font-bold text-on-surface mb-8 flex items-center gap-3" style={{ fontFamily: 'Playfair Display, serif' }}>
                <span className="material-symbols-outlined text-primary font-bold">person</span>
                Thông tin hành khách
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name Input */}
                <div className="space-y-2">
                    <label className="text-xs font-bold text-on-surface-variant block uppercase tracking-wider">
                        HỌ VÀ TÊN <span className="text-primary">*</span>
                    </label>
                    <input 
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className={`w-full bg-surface border rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none ${
                            formErrors.fullName ? 'border-error' : 'border-outline-variant'
                        }`}
                        placeholder="Nhập họ và tên đầy đủ"
                    />
                    {formErrors.fullName && (
                        <p className="text-xs text-error font-semibold mt-1">{formErrors.fullName}</p>
                    )}
                </div>

                {/* Phone Input */}
                <div className="space-y-2">
                    <label className="text-xs font-bold text-on-surface-variant block uppercase tracking-wider">
                        SỐ ĐIỆN THOẠI <span className="text-primary">*</span>
                    </label>
                    <input 
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className={`w-full bg-surface border rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none ${
                            formErrors.phoneNumber ? 'border-error' : 'border-outline-variant'
                        }`}
                        placeholder="Nhập số điện thoại"
                    />
                    {formErrors.phoneNumber && (
                        <p className="text-xs text-error font-semibold mt-1">{formErrors.phoneNumber}</p>
                    )}
                </div>

                {/* Email Input */}
                <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-bold text-on-surface-variant block uppercase tracking-wider">
                        EMAIL (TÙY CHỌN)
                    </label>
                    <input 
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-surface border border-outline-variant rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none"
                        placeholder="Nhận thông tin vé qua email"
                    />
                </div>

                {/* Notes Input */}
                <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-bold text-on-surface-variant block uppercase tracking-wider">
                        GHI CHÚ (TÙY CHỌN)
                    </label>
                    <textarea 
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="w-full bg-surface border border-outline-variant rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none resize-none h-24"
                        placeholder="Ví dụ: Điểm đón cụ thể, yêu cầu đặc biệt..."
                    />
                </div>
            </div>
        </section>
    );
};
